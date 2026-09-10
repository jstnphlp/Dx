import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) {
  return (
    <header className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2.5 font-mono text-[0.65rem] font-bold tracking-[0.13em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl sm:leading-[1.08]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
