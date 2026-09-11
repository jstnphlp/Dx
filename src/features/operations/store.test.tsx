import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { CurrentUser } from "@/features/auth/queries";

import {
  createOperationalSeed,
  OperationalDemoProvider,
  outcomeProgress,
  projectProgress,
  sessionHours,
  useOperationalDemo,
} from "./store";

const user: CurrentUser = {
  id: "user-1",
  email: "test@example.com",
  fullName: "Test Operator",
  role: "staff",
  avatarPath: null,
};

beforeEach(() => window.localStorage.clear());

describe("operational demo model", () => {
  it("replaces Nico with the authenticated member and keeps his R&D work", () => {
    const state = createOperationalSeed(user);
    expect(state.members).toHaveLength(6);
    expect(state.members.some((member) => member.name === "Nico Ramos")).toBe(
      false,
    );
    expect(state.members.find((member) => member.id === user.id)).toMatchObject(
      {
        name: "Test Operator",
        department: "rd",
      },
    );
    expect(
      state.projects[0]?.stages
        .flatMap((stage) => stage.outcomes)
        .find((outcome) => outcome.id === "auth")?.memberIds,
    ).toContain(user.id);
  });

  it("derives outcome, project, and session progress", () => {
    const state = createOperationalSeed(user);
    const project = state.projects[0]!;
    const accepted = project.stages[0]!.outcomes[0]!;
    expect(outcomeProgress(accepted)).toBe(100);
    expect(projectProgress(project)).toBeGreaterThan(0);
    expect(
      sessionHours({
        id: "s",
        memberId: user.id,
        startedAt: "2026-09-11T00:00:00.000Z",
        endedAt: "2026-09-11T02:30:00.000Z",
      }),
    ).toBe(2.5);
  });

  it("persists time state under the authenticated user", async () => {
    function Probe() {
      const { state, toggleTime } = useOperationalDemo();
      const open = state.sessions.some((session) => !session.endedAt);
      return <button onClick={toggleTime}>{open ? "stop" : "start"}</button>;
    }
    render(
      <OperationalDemoProvider user={user}>
        <Probe />
      </OperationalDemoProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "start" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "stop" })).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        window.localStorage.getItem(`dx-operational-demo-v6:${user.id}`),
      ).toContain('"endedAt":null'),
    );
  });

  it("requires criteria for acceptance and feedback for revision", () => {
    function Probe() {
      const demo = useOperationalDemo();
      const outcome = demo.state.projects[0]!.stages[1]!.outcomes[0]!;
      const submitted = outcome.submissions[0]?.state ?? "none";
      return (
        <>
          <span>
            {outcome.status}:{submitted}
          </span>
          <button
            onClick={() =>
              demo.submitOutput("cms", "prototype", "Prototype v4", "Ready")
            }
          >
            submit
          </button>
          <button
            onClick={() =>
              demo.reviewOutput(
                "cms",
                "prototype",
                true,
                "",
                outcome.criteria.map(() => false),
              )
            }
          >
            invalid accept
          </button>
          <button
            onClick={() =>
              demo.reviewOutput(
                "cms",
                "prototype",
                true,
                "Verified",
                outcome.criteria.map(() => true),
              )
            }
          >
            accept
          </button>
        </>
      );
    }
    render(
      <OperationalDemoProvider user={user}>
        <Probe />
      </OperationalDemoProvider>,
    );
    act(() => fireEvent.click(screen.getByRole("button", { name: "submit" })));
    expect(screen.getByText("For review:For review")).toBeInTheDocument();
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "invalid accept" })),
    );
    expect(screen.getByText("For review:For review")).toBeInTheDocument();
    act(() => fireEvent.click(screen.getByRole("button", { name: "accept" })));
    expect(screen.getByText("Accepted:Accepted")).toBeInTheDocument();
  });
});
