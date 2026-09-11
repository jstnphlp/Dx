import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

describe("Select", () => {
  it("renders a designed popup and reports native-style changes", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Status" value="lead" onChange={onChange}>
        <option value="lead">Lead</option>
        <option value="active">Active</option>
      </Select>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const option = await screen.findByRole("option", { name: "Active" });
    fireEvent.pointerDown(option, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(option, { button: 0, pointerType: "mouse" });
    fireEvent.click(option);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0]?.[0].target.value).toBe("active");
  });

  it("keeps a native hidden value for normal form submission", () => {
    const { container } = render(
      <Select name="status" defaultValue="active" aria-label="Status">
        <option value="lead">Lead</option>
        <option value="active">Active</option>
      </Select>,
    );

    expect(
      container.querySelector<HTMLSelectElement>('select[name="status"]')
        ?.value,
    ).toBe("active");
  });
});
