import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimePicker } from "./time-picker";

describe("TimePicker", () => {
  it("converts its 12-hour controls into a form-compatible value", async () => {
    const { container } = render(
      <TimePicker name="start" defaultValue="14:30" aria-label="Start time" />,
    );
    expect(
      container.querySelector<HTMLInputElement>('input[name="start"]')?.value,
    ).toBe("14:30");

    fireEvent.click(screen.getByRole("combobox", { name: "Start time, hour" }));
    const option = await screen.findByRole("option", { name: "3" });
    fireEvent.pointerDown(option, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(option, { button: 0, pointerType: "mouse" });
    fireEvent.click(option);

    expect(
      container.querySelector<HTMLInputElement>('input[name="start"]')?.value,
    ).toBe("15:30");
  });
});
