import { render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LiquidGlass,
  type LiquidGlassKind,
} from "@/components/shared/liquid-glass";

const engine = vi.hoisted(() => ({
  targets: [] as HTMLElement[],
  options: [] as unknown[],
  destroy: vi.fn(),
  setOptions: vi.fn(),
}));

vi.mock("@/lib/liquid-glass", () => ({
  LiquidGlassEngine: class {
    constructor(target: HTMLElement, options: unknown) {
      engine.targets.push(target);
      engine.options.push(options);
    }

    destroy() {
      engine.destroy();
    }

    setOptions() {
      engine.setOptions();
    }
  },
}));

afterEach(() => {
  engine.targets.length = 0;
  engine.options.length = 0;
  vi.clearAllMocks();
});

describe("LiquidGlass", () => {
  const kinds = [
    "navigation",
    "toolbar",
    "control",
    "overlay",
  ] satisfies LiquidGlassKind[];

  it.each(kinds)("keeps %s content outside the optical layer", (kind) => {
    const { container } = render(
      <LiquidGlass kind={kind} contentClassName="content-layout">
        <span>Sharp content</span>
      </LiquidGlass>,
    );

    const root = container.firstElementChild as HTMLElement;
    const optics = root.querySelector<HTMLDivElement>(
      ":scope > .liquid-glass__optics",
    );
    const content = root.querySelector<HTMLDivElement>(
      ":scope > .liquid-glass__content",
    );
    const child = within(root).getByText("Sharp content");

    expect(root).toHaveClass("liquid-glass");
    expect(optics).toHaveAttribute("aria-hidden", "true");
    expect(content).toHaveClass("content-layout");
    expect(content).toContainElement(child);
    expect(optics).not.toContainElement(child);
    expect(engine.targets).toEqual([optics]);
  });

  it("keeps the toolbar material transparent and lightly refractive", () => {
    render(<LiquidGlass kind="toolbar">Toolbar</LiquidGlass>);

    expect(engine.options[0]).toEqual(
      expect.objectContaining({
        depth: 9,
        tint: "rgba(255,252,249,.22)",
      }),
    );
  });

  it("uses the same transparent warm tint for navigation glass", () => {
    render(<LiquidGlass kind="navigation">Navigation</LiquidGlass>);

    expect(engine.options[0]).toEqual(
      expect.objectContaining({
        bezelWidth: 8,
        depth: 7,
        profile: "smooth",
        tint: "rgba(255,252,249,.22)",
      }),
    );
  });
});
