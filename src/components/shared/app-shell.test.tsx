import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/customers" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    onNavigate,
    ...props
  }: {
    children: ReactNode;
    onNavigate?: () => void;
    href: string;
  }) => (
    <a {...props} onClick={() => onNavigate?.()}>
      {children}
    </a>
  ),
}));

vi.mock("liquid-gooey", () => {
  function Liquid({
    children,
    className,
    role,
    "aria-label": ariaLabel,
  }: {
    children: ReactNode;
    className?: string;
    role?: string;
    "aria-label"?: string;
  }) {
    return (
      <div className={className} role={role} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }

  Liquid.Item = ({ children }: { children: ReactNode }) => children;
  return { Liquid };
});

vi.mock("@/components/shared/liquid-glass", () => ({
  LiquidGlass: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/auth/actions", () => ({
  signOutAction: vi.fn(),
}));

import { AppShell } from "@/components/shared/app-shell";

describe("AppShell", () => {
  it("moves one gooey indicator between customer and profile routes", () => {
    const { container } = render(
      <AppShell
        user={{
          id: "user-1",
          email: "user@example.com",
          fullName: "Test User",
          role: "admin",
          avatarPath: null,
        }}
      >
        <main>Content</main>
      </AppShell>,
    );

    const indicator = container.querySelector<HTMLElement>(
      ".navigation-liquid .glass-capsule",
    );
    expect(indicator).toHaveStyle({ transform: "translateY(284px)" });

    fireEvent.click(
      screen.getAllByRole("link", { name: "Profile settings" })[0],
    );
    expect(indicator).toHaveStyle({ transform: "translateY(372px)" });

    fireEvent.click(screen.getAllByRole("link", { name: "Customers" })[0]);
    expect(indicator).toHaveStyle({ transform: "translateY(284px)" });
  });
});
