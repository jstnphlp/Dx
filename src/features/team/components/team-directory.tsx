"use client";

import { ArrowRight, Clock3, Radio, UsersRound } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { departments } from "@/features/operations/demo-data";
import {
  sessionHours,
  sessionIsInWeek,
  useOperationalDemo,
} from "@/features/operations/store";

export function TeamDirectory() {
  const { state } = useOperationalDemo();
  const working = state.members.filter((member) => member.working).length;
  const planned = state.schedule.reduce(
    (sum, block) => sum + block.end - block.start,
    0,
  );
  const worked = state.sessions
    .filter((session) => sessionIsInWeek(session))
    .reduce((sum, session) => sum + sessionHours(session), 0);
  const today = (new Date().getDay() + 6) % 7;
  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar section="Workspace" current="Team" />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="People"
          title="Team"
          description="People, availability, current work status, and weekly commitment at a glance."
        />
        <section
          className="grid gap-3 sm:grid-cols-3"
          aria-label="Team summary"
        >
          <Summary
            icon={UsersRound}
            label="Team members"
            value={String(state.members.length)}
          />
          <Summary icon={Radio} label="Working now" value={String(working)} />
          <Summary
            icon={Clock3}
            label="Week total"
            value={`${round(worked)}h / ${planned}h`}
          />
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.members.map((member) => {
            const blocks = state.schedule.filter(
              (block) => block.memberId === member.id,
            );
            const todayBlocks = blocks.filter((block) => block.day === today);
            const weekHours = blocks.reduce(
              (sum, block) => sum + block.end - block.start,
              0,
            );
            const workHours = state.sessions
              .filter(
                (session) =>
                  session.memberId === member.id && sessionIsInWeek(session),
              )
              .reduce((sum, session) => sum + sessionHours(session), 0);
            return (
              <article
                key={member.id}
                className="overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)]"
              >
                <header className="flex items-start justify-between gap-3 border-b border-border bg-muted p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full border border-border bg-card font-mono text-[0.62rem] font-bold">
                      {initials(member.name)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        {member.name}
                      </h2>
                      <p className="mt-1 truncate text-[0.65rem] text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 font-mono text-[0.52rem] font-bold text-muted-foreground">
                    <i
                      className={`size-1.5 rounded-full ${member.working ? "bg-primary" : "bg-muted-foreground/40"}`}
                    />
                    {member.working ? "WORKING NOW" : "TIMED OUT"}
                  </span>
                </header>
                <div className="p-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
                      Today&apos;s plan
                    </p>
                    <strong className="mt-2 block text-xs">
                      {todayBlocks.length
                        ? todayBlocks
                            .map(
                              (block) =>
                                `${formatHour(block.start)}–${formatHour(block.end)}`,
                            )
                            .join(" · ")
                        : "Rest day / no schedule"}
                    </strong>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3">
                    <Metric
                      label="Department"
                      value={departments[member.department].short}
                    />
                    <Metric label="Scheduled week" value={`${weekHours}h`} />
                    <Metric
                      label="Worked week"
                      value={`${round(workHours)}h`}
                    />
                    <Metric
                      label="Availability"
                      value={member.working ? "Available" : "Offline"}
                    />
                  </div>
                </div>
                <Link
                  href={`/schedule?member=${member.id}`}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "w-full justify-between border-t border-border",
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
    <article className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
          {label}
        </p>
        <strong className="mt-1 block text-xl">{value}</strong>
      </div>
    </article>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.5rem] font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <strong className="mt-1 block text-xs">{value}</strong>
    </div>
  );
}
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
function formatHour(hour: number) {
  const value = hour % 24;
  if (value === 0) return "12 AM";
  if (value === 12) return "12 PM";
  return `${value > 12 ? value - 12 : value} ${value >= 12 ? "PM" : "AM"}`;
}
function round(value: number) {
  return Math.round(value * 10) / 10;
}
