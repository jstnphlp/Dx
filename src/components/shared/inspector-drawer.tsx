"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { LiquidGlass } from "@/components/shared/liquid-glass";
import { cn } from "@/lib/utils";

interface InspectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  renderKey?: string | number;
}

export function InspectorDrawer({
  open,
  onOpenChange,
  title,
  eyebrow,
  children,
  className,
  renderKey,
}: InspectorDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-foreground/8 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex justify-end p-2.5 sm:p-3.5">
          <DialogPrimitive.Popup
            className={cn(
              "h-full w-full max-w-[30rem] transition-[transform,opacity] duration-200 outline-none data-ending-style:translate-x-3 data-ending-style:opacity-0 data-starting-style:translate-x-3 data-starting-style:opacity-0",
              className,
            )}
          >
            <LiquidGlass
              kind="inspector"
              renderKey={renderKey}
              className="h-full overflow-y-auto rounded-[2rem] border border-white/90 shadow-[0_22px_56px_rgba(44,31,25,.13)]"
            >
              <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-foreground/10 bg-background/94 px-5 py-5">
                <div className="min-w-0">
                  {eyebrow ? (
                    <p className="mb-1.5 font-mono text-[0.63rem] font-bold tracking-[0.12em] text-primary uppercase">
                      {eyebrow}
                    </p>
                  ) : null}
                  <DialogPrimitive.Title className="text-base font-semibold tracking-[-0.02em] text-foreground">
                    {title}
                  </DialogPrimitive.Title>
                </div>
                <DialogPrimitive.Close
                  aria-label="Close inspector"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-foreground/12 bg-card/70 text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </header>
              {children}
            </LiquidGlass>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
