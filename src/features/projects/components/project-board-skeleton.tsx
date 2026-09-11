import { LiquidGlass } from "@/components/shared/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";

function OutcomeCardSkeleton({ short = false }: { short?: boolean }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-card p-3.5 shadow-[0_5px_15px_rgba(65,42,30,.035)]">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-2 w-14 rounded-full" />
        <Skeleton className="h-[1.125rem] w-16 rounded-full" tone="soft" />
      </div>
      <Skeleton className={short ? "h-3 w-2/3" : "h-3 w-[88%]"} tone="strong" />
      <Skeleton className={short ? "mt-2 h-2 w-1/2" : "mt-2 h-2 w-3/4"} />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-[1.125rem] w-14 rounded-full" />
        <Skeleton className="h-[1.125rem] w-[4.5rem] rounded-full" />
      </div>
      <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
    </div>
  );
}

function StageSkeleton({ index }: { index: number }) {
  return (
    <section className="min-h-[35rem] w-[20rem] shrink-0 rounded-2xl border border-foreground/10 bg-secondary/90 p-3.5 shadow-[0_4px_14px_rgba(65,42,30,.035)]">
      <div className="flex items-center justify-between px-0.5 pt-1 pb-3">
        <div>
          <Skeleton className="h-2 w-16 rounded-full" />
          <Skeleton className="mt-2 h-3.5 w-36" tone="strong" />
        </div>
        <Skeleton className="h-5 w-9 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-1.5 w-full rounded-full" tone="accent" />
      <div className="space-y-2.5">
        <OutcomeCardSkeleton short={index % 2 === 1} />
        <OutcomeCardSkeleton short={index % 2 === 0} />
        {index < 2 ? <OutcomeCardSkeleton short /> : null}
      </div>
    </section>
  );
}

export function ProjectBoardSkeleton() {
  return (
    <div className="relative min-h-svh pb-12" role="status" aria-live="polite">
      <span className="sr-only">Loading project workspace</span>

      <div className="pointer-events-none sticky top-0 z-20 hidden h-[4.875rem] items-center justify-between gap-4 px-7 py-3 lg:flex">
        <LiquidGlass
          kind="toolbar"
          className="h-12 min-w-56 rounded-[1.15rem] border border-white/80"
          contentClassName="flex h-full items-center gap-3 px-4"
        >
          <Skeleton className="h-3 w-[4.75rem] rounded-full" />
          <span className="text-muted-foreground/40">/</span>
          <Skeleton className="h-3 w-[5.5rem] rounded-full" tone="strong" />
        </LiquidGlass>
        <LiquidGlass
          kind="toolbar"
          className="h-12 rounded-[1.15rem] border border-white/80"
          contentClassName="flex h-full items-center gap-2 px-2"
        >
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" tone="accent" />
        </LiquidGlass>
      </div>

      <header className="border-b border-foreground/10 px-5 pt-8 pb-6 sm:px-7 lg:pt-7">
        <Skeleton className="h-2 w-28 rounded-full" />
        <Skeleton className="mt-3 h-9 w-full max-w-sm" tone="strong" />
        <Skeleton className="mt-3 h-3 w-full max-w-xl" />
        <div className="mt-6 flex flex-wrap gap-8">
          {["lead", "assistant", "state", "progress"].map((item, index) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-2 w-16 rounded-full" />
              <Skeleton
                className={index < 2 ? "h-3 w-28" : "h-3 w-20"}
                tone="strong"
              />
            </div>
          ))}
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-7">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" tone="strong" />
          <Skeleton className="h-2.5 w-72 max-w-full" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" tone="accent" />
        </div>
      </div>

      <div className="project-board-scroll overflow-x-hidden px-5 pb-3 sm:px-7">
        <div className="flex w-max min-w-full items-start gap-3.5 pb-3">
          {[0, 1, 2, 3].map((index) => (
            <StageSkeleton key={index} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
