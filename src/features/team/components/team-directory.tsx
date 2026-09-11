"use client";

import { ArrowRight, Clock3, Radio, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { buttonVariants } from "@/components/ui/button";
import {
  departments,
  initials,
  members,
  scheduleBlocks,
} from "@/features/operations/demo-data";
import { cn } from "@/lib/utils";

export function TeamDirectory() {
  const [working, setWorking] = useState<Record<string, boolean>>(
    Object.fromEntries(members.map((member) => [member.id, member.working])),
  );
  const workingCount = Object.values(working).filter(Boolean).length;
  const scheduled = scheduleBlocks.reduce(
    (sum, block) => sum + block.duration,
    0,
  );

  return (
    <div className="relative min-h-svh pb-12">
      <WorkspaceToolbar section="Workspace" current="Team" />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="People"
          title="Team"
          description="People, availability, current work status, and weekly commitment at a glance."
          action={
            <Link href="/schedule" className={buttonVariants()}>
              <Clock3 /> Open team schedule
            </Link>
          }
        />

        <section
          className="grid gap-3 sm:grid-cols-3"
          aria-label="Team summary"
        >
          <Summary
            icon={UsersRound}
            label="Team members"
            value={String(members.length)}
          />
          <Summary
            icon={Radio}
            label="Working now"
            value={String(workingCount)}
          />
          <Summary
            icon={Clock3}
            label="Week total"
            value={`58h / ${scheduled}h`}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const blocks = scheduleBlocks.filter(
              (block) => block.person === member.name,
            );
            const weekHours = blocks.reduce(
              (sum, block) => sum + block.duration,
              0,
            );
            const today = blocks.find((block) => block.day === 0);
            const active = working[member.id];
            return (
              <article
                key={member.id}
                className="overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border/80 bg-muted px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card font-mono text-[0.65rem] font-bold text-foreground/70">
                      {initials(member.name)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        {member.name}
                      </h2>
                      <p className="mt-1 truncate text-[0.68rem] text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setWorking((current) => ({
                        ...current,
                        [member.id]: !active,
                      }))
                    }
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.54rem] font-bold uppercase",
                      active
                        ? "border-primary/20 bg-primary/8 text-primary-strong"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1 inline-block size-1.5 rounded-full",
                        active ? "bg-primary" : "bg-muted-foreground/50",
                      )}
                    />
                    {active ? "Working now" : "Timed out"}
                  </button>
                </div>
                <div className="m-3 rounded-xl border border-border/80 bg-card p-3 shadow-[0_3px_10px_rgba(55,39,31,.025)]">
                  <p className="font-mono text-[0.54rem] font-bold tracking-[.08em] text-muted-foreground uppercase">
                    Today&apos;s plan
                  </p>
                  <strong className="mt-2 block text-xs">
                    {today
                      ? `${formatHour(today.start)}–${formatHour(today.start + today.duration)}`
                      : "Rest day / no schedule"}
                  </strong>
                </div>
                <div className="mx-3 grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-[0_3px_10px_rgba(55,39,31,.025)]">
                  <Metric
                    label="Department"
                    value={departments[member.department].short}
                  />
                  <Metric label="Scheduled week" value={`${weekHours}h`} />
                  <Metric
                    label="Worked week"
                    value={
                      active
                        ? `${Math.max(4, weekHours - 5)}h`
                        : `${Math.max(0, weekHours - 9)}h`
                    }
                  />
                  <Metric
                    label="Availability"
                    value={active ? "Available" : "Offline"}
                  />
                </div>
                <Link
                  href="/schedule"
                  className={buttonVariants({
                    variant: "ghost",
                    className:
                      "mt-3 w-full justify-between border-t border-border/80 bg-muted/55",
                  })}
                >
                  View schedule <ArrowRight />
                </Link>
              </article>
            );
          })}
        </section>
      </PageContainer>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-border/80 bg-secondary p-5 shadow-[0_4px_15px_rgba(55,39,31,.025)]">
      <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
          {label}
        </p>
        <strong className="mt-1 block text-xl tracking-tight">{value}</strong>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.5rem] font-bold tracking-[.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <strong className="mt-1.5 block text-xs">{value}</strong>
    </div>
  );
}

function formatHour(hour: number) {
  const value = hour % 24;
  if (value === 0) return "12:00 AM";
  if (value === 12) return "12:00 PM";
  return `${value > 12 ? value - 12 : value}:00 ${value >= 12 ? "PM" : "AM"}`;
}
