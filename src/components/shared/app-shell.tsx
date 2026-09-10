"use client";

import {
  ChevronUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LiquidGlass } from "@/components/shared/liquid-glass";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  { label: "Projects", href: "/projects", icon: FolderKanban },
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

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center gap-2.5 text-sidebar-foreground"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-white/35 font-mono text-[0.7rem] font-bold tracking-tight text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
        {appConfig.logo.mark}
      </span>
      <span className="min-w-0 leading-tight">
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
}: {
  label: string;
  items: ReadonlyArray<NavigationItem>;
}) {
  const pathname = usePathname();

  return (
    <div>
      <p className="mb-2 px-3 font-mono text-[0.58rem] font-bold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
        {label}
      </p>
      <nav aria-label={`${label} navigation`} className="space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-10 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-sidebar-foreground/65 transition-[background-color,border-color,color,transform] duration-150 hover:bg-white/30 hover:text-sidebar-foreground",
                active &&
                  "border-white/65 bg-white/48 text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.85),0_5px_16px_rgba(63,45,36,.05)]",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 text-sidebar-foreground/48 transition-colors group-hover:text-primary",
                  active && "text-primary",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
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
}: {
  user: CurrentUser;
  showChevron?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/9 font-mono text-[0.65rem] font-semibold text-primary ring-1 ring-primary/12">
        {getInitials(user.fullName)}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium text-sidebar-foreground">
          {user.fullName}
        </span>
        <span className="block truncate text-xs text-sidebar-foreground/55 capitalize">
          {user.role} account
        </span>
      </span>
      {showChevron ? (
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
    <Card className="w-full overflow-hidden border-[#d8cdc4] bg-[#fffdfa] text-popover-foreground shadow-xl shadow-black/10">
      <CardContent className="p-2 sm:p-2">
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
      </CardContent>
    </Card>
  );
}

function SidebarAccount({ user }: { user: CurrentUser }) {
  return (
    <details className="group relative">
      <summary
        aria-label="Open account menu"
        className="list-none rounded-xl p-2 transition-colors hover:bg-white/28 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        <UserSummary user={user} showChevron />
      </summary>
      <div className="absolute right-0 bottom-[calc(100%+0.5rem)] left-0 z-40">
        <AccountCard user={user} />
      </div>
    </details>
  );
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#f4efeb]">
      <div className="app-scene" aria-hidden="true" />

      <div className="relative z-10 lg:grid lg:grid-cols-[15.75rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh p-3 pr-2 lg:flex">
          <LiquidGlass
            kind="navigation"
            renderKey={pathname}
            className="flex h-full w-full flex-col overflow-visible! rounded-[1.9rem] border border-white/80 px-3.5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.93),0_16px_38px_rgba(55,39,31,.075)]"
          >
            <div className="border-b border-[#5c4940]/10 px-1 pb-4">
              <Brand />
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pt-5">
              <NavigationGroup label="Workspace" items={workspaceNavigation} />
              <NavigationGroup label="Personal" items={personalNavigation} />
            </div>

            <div className="border-t border-[#5c4940]/10 pt-3">
              <SidebarAccount user={user} />
            </div>
          </LiquidGlass>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 p-2.5 lg:hidden">
            <LiquidGlass
              kind="toolbar"
              renderKey={`mobile-${pathname}`}
              className="flex h-14 items-center justify-between rounded-2xl border border-white/80 px-3.5"
            >
              <Brand />
              <details className="group relative">
                <summary className="flex size-9 list-none items-center justify-center rounded-xl border border-white/60 bg-white/42 text-sidebar-foreground transition-colors hover:bg-white/60 [&::-webkit-details-marker]:hidden">
                  <span className="sr-only">Open navigation</span>
                  <Menu className="size-4" />
                </summary>
                <div className="absolute top-[calc(100%+0.75rem)] right-0 w-72">
                  <Card className="border-[#d8cdc4] bg-[#fffdfa] p-2 text-popover-foreground shadow-xl shadow-black/10">
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
                  </Card>
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
