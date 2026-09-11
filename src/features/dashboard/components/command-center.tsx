"use client";

import {
  CalendarDays,
  CheckSquare2,
  Clock3,
  FolderKanban,
  Radio,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  sessionHours,
  sessionIsInWeek,
  useOperationalDemo,
  type ActivityType,
} from "@/features/operations/store";

const filters: Array<["all" | ActivityType, string]> = [
  ["all", "All activity"],
  ["time", "Time & attendance"],
  ["project", "Projects"],
  ["outcome", "Outcomes"],
  ["task", "Tasks"],
  ["output", "Outputs & reviews"],
  ["schedule", "Schedule"],
  ["people", "People"],
];
const quickLinks = [
  ["Projects", "/projects", FolderKanban],
  ["Schedule", "/schedule", CalendarDays],
  ["Team", "/team", UsersRound],
  ["Reports", "/reports", CheckSquare2],
] as const;

export function CommandCenter() {
  const { state, currentMember } = useOperationalDemo();
  const [filter, setFilter] = useState<"all" | ActivityType>("all");
  const outcomes = state.projects.flatMap((project) =>
    project.stages.flatMap((stage) =>
      stage.outcomes.map((outcome) => ({ outcome, project, stage })),
    ),
  );
  const working = state.members.filter((member) => member.working);
  const attention = outcomes.filter(({ outcome }) =>
    ["For review", "Needs revision"].includes(outcome.status),
  );
  const myHours = state.sessions
    .filter(
      (session) =>
        session.memberId === currentMember.id && sessionIsInWeek(session),
    )
    .reduce((sum, session) => sum + sessionHours(session), 0);
  const myPlan = state.schedule
    .filter((block) => block.memberId === currentMember.id)
    .reduce((sum, block) => sum + block.end - block.start, 0);
  const activity = useMemo(
    () =>
      state.activity.filter((item) => filter === "all" || item.type === filter),
    [filter, state.activity],
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar section="Workspace" current="Home" />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="Company command center"
          title={`${greeting}, ${currentMember.name.split(" ")[0]}.`}
          description="Here is what is moving across Prometheus right now."
          action={
            <time className="font-mono text-xs font-semibold text-muted-foreground">
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </time>
          }
        />

        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Company summary"
        >
          <Kpi
            label="Working now"
            value={String(working.length)}
            note="members currently active"
            icon={Radio}
          />
          <Kpi
            label="Active projects"
            value={String(
              state.projects.filter((project) => project.status !== "Done")
                .length,
            )}
            note={`${state.projects.length} projects total`}
            icon={FolderKanban}
          />
          <Kpi
            label="Awaiting review"
            value={String(attention.length)}
            note="review and revision signals"
            icon={CheckSquare2}
          />
          <Kpi
            label="My week"
            value={`${Math.round(myHours * 10) / 10}h`}
            note={`${myPlan}h planned commitment`}
            icon={Clock3}
          />
        </section>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_8px_26px_rgba(55,39,31,.035)]">
            <header className="flex flex-col gap-3 border-b border-border/75 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Company activity</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  A local operational log across people, projects, schedules,
                  and delivery.
                </p>
              </div>
              <Select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "all" | ActivityType)
                }
                aria-label="Filter company activity"
                className="h-9 w-full shrink-0 bg-background px-3 text-xs sm:w-48"
              >
                {filters.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </header>
            <div className="divide-y divide-border/70">
              {activity.length ? (
                activity.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[2rem_1fr_auto] gap-3 px-5 py-4"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-secondary font-mono text-xs font-bold text-primary">
                      {activityIcon(item.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs">
                        <strong>{item.actor}</strong> · {item.action}
                      </p>
                      <p className="mt-1 text-[0.68rem] leading-5 text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <time className="font-mono text-[0.52rem] text-muted-foreground">
                      {relativeTime(item.createdAt)}
                    </time>
                  </article>
                ))
              ) : (
                <p className="p-8 text-center text-xs text-muted-foreground">
                  No activity in this category yet.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <SideCard
              title="Working now"
              subtitle={`${working.length} active members`}
            >
              {working.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 border-t border-border/65 py-3 first:border-t-0"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-secondary font-mono text-[0.56rem] font-bold">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">
                      {member.name}
                    </strong>
                    <span className="text-[0.62rem] text-muted-foreground">
                      {member.role}
                    </span>
                  </div>
                  <i className="size-2 rounded-full bg-primary" />
                </div>
              ))}
            </SideCard>
            <SideCard
              title="Needs attention"
              subtitle="Review and delivery signals"
            >
              {attention.length ? (
                attention.slice(0, 5).map(({ outcome, project }) => (
                  <Link
                    key={outcome.id}
                    href={`/projects?project=${project.id}&outcome=${outcome.id}`}
                    className="block border-t border-border/65 py-3 first:border-t-0"
                  >
                    <strong className="block text-xs">{outcome.title}</strong>
                    <span className="mt-1 block text-[0.62rem] text-muted-foreground">
                      {project.title} · {outcome.status}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nothing urgent right now.
                </p>
              )}
            </SideCard>
            <SideCard title="Quick access">
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map(([label, href, Icon]) => (
                  <Link
                    key={href}
                    href={href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "justify-between",
                    })}
                  >
                    {label}
                    <Icon />
                  </Link>
                ))}
              </div>
            </SideCard>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}

function Kpi({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Radio;
}) {
  return (
    <article className="rounded-xl border border-border/80 bg-card p-5 shadow-[0_5px_18px_rgba(55,39,31,.03)]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.56rem] font-bold tracking-[.08em] text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-primary" />
      </div>
      <strong className="mt-3 block text-3xl tracking-[-.04em]">{value}</strong>
      <p className="mt-1 text-[0.65rem] text-muted-foreground">{note}</p>
    </article>
  );
}

function SideCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-4 shadow-[0_5px_18px_rgba(55,39,31,.03)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle ? (
        <p className="mt-1 mb-3 text-[0.65rem] text-muted-foreground">
          {subtitle}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </section>
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
function relativeTime(value: string) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  return minutes < 1
    ? "now"
    : minutes < 60
      ? `${minutes}m`
      : `${Math.floor(minutes / 60)}h`;
}
function activityIcon(type: ActivityType) {
  return {
    time: "●",
    project: "▣",
    outcome: "◇",
    task: "✓",
    output: "▱",
    schedule: "◷",
    people: "◎",
    announcement: "⚑",
  }[type];
}
