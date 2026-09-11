import { render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LiquidGlass,
  type LiquidGlassKind,
} from "@/components/shared/liquid-glass";

const engine = vi.hoisted(() => ({
  targets: [] as HTMLElement[],
  destroy: vi.fn(),
  setOptions: vi.fn(),
}));

vi.mock("@/lib/liquid-glass", () => ({
  LiquidGlassEngine: class {
    constructor(target: HTMLElement) {
      engine.targets.push(target);
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
  vi.clearAllMocks();
});

describe("LiquidGlass", () => {
  const kinds = [
    "navigation",
    "toolbar",
    "control",
    "data",
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
});
