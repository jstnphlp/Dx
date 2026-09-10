"use client";

import type { ReactNode } from "react";

import { LiquidGlass } from "@/components/shared/liquid-glass";

interface WorkspaceToolbarProps {
  section: string;
  current: string;
  actions?: ReactNode;
}

export function WorkspaceToolbar({
  section,
  current,
  actions,
}: WorkspaceToolbarProps) {
  const renderKey = `${section}-${current}`;

  return (
    <div className="pointer-events-none sticky top-0 z-20 hidden h-[4.875rem] items-center justify-between gap-4 px-7 py-3 lg:flex">
      <LiquidGlass
        kind="toolbar"
        renderKey={renderKey}
        className="pointer-events-auto flex h-12 min-w-56 items-center rounded-[1.15rem] border border-white/80 px-4"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{section}</span>
          <span className="text-muted-foreground/55">/</span>
          <strong className="font-semibold text-foreground">{current}</strong>
        </div>
      </LiquidGlass>

      {actions ? (
        <LiquidGlass
          kind="toolbar"
          renderKey={`actions-${renderKey}`}
          className="pointer-events-auto flex h-12 items-center gap-1 rounded-[1.15rem] border border-white/80 p-1"
        >
          {actions}
        </LiquidGlass>
      ) : null}
    </div>
  );
}
