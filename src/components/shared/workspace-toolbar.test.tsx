import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/liquid-glass", () => ({
  LiquidGlassEngine: class {
    destroy() {}
  },
}));

import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";

describe("WorkspaceToolbar", () => {
  it("renders the breadcrumb as a compact glass capsule", () => {
    const { container } = render(
      <WorkspaceToolbar section="Workspace" current="Overview" />,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();

    const capsule = container.querySelector(".liquid-glass");
    expect(capsule).toHaveClass("glass-capsule", "w-fit", "h-12");
    expect(capsule).not.toHaveClass("min-w-56");
    expect(capsule?.querySelector(".liquid-glass__content")).toHaveClass(
      "px-5",
    );
  });
});
