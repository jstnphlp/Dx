import type { ReactNode } from "react";

import { appConfig } from "@/config/app";

interface AuthFrameProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFrame({ title, description, children }: AuthFrameProps) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div className="app-scene" aria-hidden="true" />

      <div className="relative z-10 grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)]">
        <section className="flex min-h-svh flex-col p-5 sm:p-8 lg:min-h-0 lg:p-10">
          <header>
            <div className="flex items-center gap-2.5 font-medium">
              <span className="flex size-8 items-center justify-center rounded-xl border border-primary/25 bg-card/75 font-mono text-[0.7rem] font-bold tracking-tight text-primary shadow-xs">
                {appConfig.logo.mark}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight">
                  {appConfig.name}
                </span>
                <span className="block font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Workspace
                </span>
              </span>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-[0_12px_36px_rgba(55,39,31,0.07)] sm:p-8">
              <div className="mb-7">
                <p className="mb-2 font-mono text-[0.65rem] font-bold tracking-[0.13em] text-primary uppercase">
                  Secure access
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-balance">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-pretty text-muted-foreground">
                  {description}
                </p>
              </div>

              {children}
            </div>
          </div>
        </section>

        <aside className="hidden items-end p-10 lg:flex" aria-hidden="true">
          <div className="max-w-lg pb-10">
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.13em] text-primary uppercase">
              Prometheus operations
            </p>
            <p className="mt-3 text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-balance">
              Keep projects, outcomes, and client work in one calm workspace.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Clear ownership, visible progress, and focused review without
              losing the context around the work.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
