"use client";

import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Settings,
  UsersRound,
} from "lucide-react";
import { Liquid } from "liquid-gooey";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { LiquidGlass } from "@/components/shared/liquid-glass";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config/app";
import { signOutAction } from "@/features/auth/actions";
import type { CurrentUser } from "@/features/auth/queries";
import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const workspaceNavigation: ReadonlyArray<NavigationItem> = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Visiwork", href: "/visiwork", icon: PanelsTopLeft },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  { label: "Customers", href: "/customers", icon: UsersRound },
];

const personalNavigation: ReadonlyArray<NavigationItem> = [
  {
    label: "Profile settings",
    href: "/settings/profile",
    icon: Settings,
  },
];

interface AppShellProps {
  user: CurrentUser;
  children: ReactNode;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex min-w-0 items-center text-sidebar-foreground",
        compact ? "justify-center gap-0" : "gap-2.5",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-card/35 font-mono text-[0.7rem] font-bold tracking-tight text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
        {appConfig.logo.mark}
      </span>
      <span
        className={cn(
          "min-w-0 leading-tight transition-[opacity,width] duration-200",
          compact
            ? "hidden w-0 overflow-hidden opacity-0"
            : "w-auto opacity-100",
        )}
      >
        <span className="block truncate text-sm font-semibold tracking-tight">
          {appConfig.name}
        </span>
        <span className="block font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-sidebar-foreground/55 uppercase">
          Workspace
        </span>
      </span>
    </Link>
  );
}

function NavigationGroup({
  label,
  items,
  compact = false,
}: {
  label: string;
  items: ReadonlyArray<NavigationItem>;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [pendingNavigation, setPendingNavigation] = useState<{
    from: string;
    target: string;
  } | null>(null);
  const visualPathname =
    pendingNavigation?.from === pathname ? pendingNavigation.target : pathname;

  const activeIndex = items.findIndex(
    (item) =>
      visualPathname === item.href ||
      (item.href !== "/dashboard" && visualPathname.startsWith(item.href)),
  );

  return (
    <div>
      <p
        className={cn(
          "mb-2 px-3 font-mono text-[0.58rem] font-bold tracking-[0.14em] text-sidebar-foreground/45 uppercase",
          compact && "sr-only",
        )}
      >
        {label}
      </p>
      <Liquid
        blur={7}
        contrast={20}
        fill="var(--gooey-navigation)"
        shadow="inset 0 1px 0 rgba(255,255,255,.82), 0 5px 16px rgba(63,45,36,.06)"
        aria-label={`${label} navigation`}
        className="grid gap-1"
        role="navigation"
      >
        {activeIndex >= 0 ? (
          <Liquid.Item
            effect="move"
            move={{
              springiness: 0.82,
              wobble: 0.08,
              stretch: 0.14,
              trail: 0.24,
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-xl bg-transparent"
              style={{ transform: `translateY(${activeIndex * 44}px)` }}
            />
          </Liquid.Item>
        ) : null}

        {items.map((item) => {
          const active =
            visualPathname === item.href ||
            (item.href !== "/dashboard" &&
              visualPathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onNavigate={() =>
                setPendingNavigation({ from: pathname, target: item.href })
              }
              aria-current={active ? "page" : undefined}
              title={compact ? item.label : undefined}
              className={cn(
                "group relative z-10 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/65 transition-colors duration-150 hover:bg-card/30 hover:text-sidebar-foreground",
                compact && "justify-center px-0",
                active && "text-sidebar-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 text-sidebar-foreground/48 transition-colors group-hover:text-primary",
                  active && "text-primary",
                )}
              />
              <span className={compact ? "sr-only" : undefined}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </Liquid>
    </div>
  );
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UserSummary({
  user,
  showChevron = false,
  compact = false,
}: {
  user: CurrentUser;
  showChevron?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/9 font-mono text-[0.65rem] font-semibold text-primary ring-1 ring-primary/12">
        {getInitials(user.fullName)}
      </span>
      <span
        className={cn("min-w-0 flex-1 leading-tight", compact && "sr-only")}
      >
        <span className="block truncate text-sm font-medium text-sidebar-foreground">
          {user.fullName}
        </span>
        <span className="block truncate text-xs text-sidebar-foreground/55 capitalize">
          {user.role} account
        </span>
      </span>
      {showChevron && !compact ? (
        <ChevronUp className="size-4 shrink-0 text-sidebar-foreground/40 transition-transform group-open:rotate-180" />
      ) : null}
    </div>
  );
}

function AccountLinks() {
  return (
    <div className="mt-1 grid gap-0.5">
      <Link
        href="/settings/profile"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Settings className="size-4 text-muted-foreground" /> Profile settings
      </Link>
      <form action={signOutAction}>
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
          <LogOut className="size-4 text-muted-foreground" /> Sign out
        </button>
      </form>
    </div>
  );
}

function AccountCard({ user }: { user: CurrentUser }) {
  return (
    <LiquidGlass
      kind="overlay"
      className="overlay-glass w-full overflow-hidden rounded-xl shadow-xl shadow-foreground/10"
      contentClassName="p-2 text-popover-foreground"
    >
      <div className="flex items-center gap-3 rounded-lg bg-muted/70 p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
          {getInitials(user.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Badge className="capitalize" variant="secondary">
          {user.role}
        </Badge>
      </div>
      <AccountLinks />
    </LiquidGlass>
  );
}

function SidebarAccount({
  user,
  compact,
}: {
  user: CurrentUser;
  compact: boolean;
}) {
  return (
    <details className="group relative">
      <summary
        aria-label="Open account menu"
        className={cn(
          "list-none rounded-xl p-2 transition-colors hover:bg-card/28 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden",
          compact && "flex justify-center px-0",
        )}
      >
        <UserSummary user={user} showChevron compact={compact} />
      </summary>
      <div
        className={cn(
          "absolute bottom-[calc(100%+0.5rem)] z-40",
          compact ? "left-[calc(100%+0.5rem)] w-72" : "right-0 left-0",
        )}
      >
        <AccountCard user={user} />
      </div>
    </details>
  );
}

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative min-h-svh overflow-x-clip bg-background">
      <div className="app-scene" aria-hidden="true" />

      <div
        className={cn(
          "relative z-10 transition-[grid-template-columns] duration-200 ease-out lg:grid",
          sidebarCollapsed
            ? "lg:grid-cols-[5rem_minmax(0,1fr)]"
            : "lg:grid-cols-[15.75rem_minmax(0,1fr)]",
        )}
      >
        <aside className="sticky top-0 hidden h-svh min-w-0 self-start p-3 pr-2 lg:flex">
          <LiquidGlass
            kind="navigation"
            className="h-full w-full overflow-visible! rounded-[1.9rem] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.93),0_16px_38px_rgba(55,39,31,.075)]"
            contentClassName={cn(
              "flex h-full flex-col py-4 transition-[padding] duration-200",
              sidebarCollapsed ? "px-2" : "px-3.5",
            )}
          >
            <div
              className={cn(
                "flex border-b border-foreground/10 px-1 pb-4",
                sidebarCollapsed
                  ? "flex-col items-center gap-2"
                  : "items-center justify-between gap-2",
              )}
            >
              <Brand compact={sidebarCollapsed} />
              <button
                type="button"
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
                aria-expanded={!sidebarCollapsed}
                onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/55 transition-colors hover:bg-card/35 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pt-5">
              <NavigationGroup
                label="Workspace"
                items={workspaceNavigation}
                compact={sidebarCollapsed}
              />
              <NavigationGroup
                label="Personal"
                items={personalNavigation}
                compact={sidebarCollapsed}
              />
            </div>

            <div className="border-t border-foreground/10 pt-3">
              <SidebarAccount user={user} compact={sidebarCollapsed} />
            </div>
          </LiquidGlass>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 p-2.5 lg:hidden">
            <LiquidGlass
              kind="toolbar"
              className="h-14 rounded-2xl border border-white/80"
              contentClassName="flex h-full items-center justify-between px-3.5"
            >
              <Brand />
              <details className="group relative">
                <summary className="flex size-9 list-none items-center justify-center rounded-xl border border-white/60 bg-card/42 text-sidebar-foreground transition-colors hover:bg-card/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  <span className="sr-only">Open navigation</span>
                  <Menu className="size-4" />
                </summary>
                <div className="absolute top-[calc(100%+0.75rem)] right-0 w-72">
                  <LiquidGlass
                    kind="overlay"
                    className="overlay-glass overflow-hidden rounded-xl shadow-xl shadow-foreground/10"
                    contentClassName="p-2 text-popover-foreground"
                  >
                    <div className="mb-3 px-2 py-1">
                      <UserSummary user={user} />
                    </div>
                    <div className="space-y-4">
                      <NavigationGroup
                        label="Workspace"
                        items={workspaceNavigation}
                      />
                      <NavigationGroup
                        label="Personal"
                        items={personalNavigation}
                      />
                    </div>
                    <AccountLinks />
                  </LiquidGlass>
                </div>
              </details>
            </LiquidGlass>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
