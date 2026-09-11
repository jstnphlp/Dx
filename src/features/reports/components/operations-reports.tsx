"use client";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { departments } from "@/features/operations/demo-data";
import {
  projectProgress,
  sessionHours,
  sessionIsInWeek,
  useOperationalDemo,
  type DepartmentId,
  type OutcomeStatus,
} from "@/features/operations/store";

export function OperationsReports() {
  const { state } = useOperationalDemo();
  const outcomes = state.projects.flatMap((project) =>
    project.stages.flatMap((stage) => stage.outcomes),
  );
  const counts = outcomes.reduce<Record<OutcomeStatus, number>>(
    (result, outcome) => ({
      ...result,
      [outcome.status]: result[outcome.status] + 1,
    }),
    {
      Planned: 0,
      "In progress": 0,
      "For review": 0,
      "Needs revision": 0,
      Blocked: 0,
      Accepted: 0,
      Skipped: 0,
    },
  );
  const planned = state.schedule.reduce(
    (sum, block) => sum + block.end - block.start,
    0,
  );
  const worked = state.sessions
    .filter((session) => sessionIsInWeek(session))
    .reduce((sum, session) => sum + sessionHours(session), 0);
  const average = state.projects.length
    ? Math.round(
        state.projects.reduce(
          (sum, project) => sum + projectProgress(project),
          0,
        ) / state.projects.length,
      )
    : 0;

  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar section="Workspace" current="Reports & Analytics" />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="Operating intelligence"
          title="Reports & Analytics"
          description="Project delivery, outcome pipeline, team capacity, and company activity in one view."
          action={
            <span className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[0.58rem] font-bold text-muted-foreground">
              CURRENT WEEK · LOCAL DEMO
            </span>
          }
        />
        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Report summary"
        >
          <Metric
            label="Project progress"
            value={`${average}%`}
            note={`Average across ${state.projects.length} projects`}
          />
          <Metric
            label="Accepted outcomes"
            value={String(counts.Accepted)}
            note={`${outcomes.length} outcomes total`}
          />
          <Metric
            label="Needs review"
            value={String(counts["For review"] + counts["Needs revision"])}
            note={`${counts["For review"]} review · ${counts["Needs revision"]} revision`}
          />
          <Metric
            label="Capacity used"
            value={`${planned ? Math.round((worked / planned) * 100) : 0}%`}
            note={`${formatHours(worked)} / ${planned}h planned`}
          />
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportCard
            title="Project health"
            subtitle="Current progress across all company projects."
          >
            {state.projects.map((project) => (
              <ProgressRow
                key={project.id}
                label={project.title}
                value={projectProgress(project)}
                note={`${project.stages.flatMap((stage) => stage.outcomes).filter((outcome) => outcome.status === "Accepted").length} accepted / ${project.stages.flatMap((stage) => stage.outcomes).length} outcomes · ${project.status}`}
              />
            ))}
          </ReportCard>
          <ReportCard
            title="Outcome pipeline"
            subtitle="Where project outcomes currently sit."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  "Planned",
                  "In progress",
                  "For review",
                  "Needs revision",
                  "Accepted",
                  "Blocked",
                ] as OutcomeStatus[]
              ).map((status) => (
                <div
                  key={status}
                  className="rounded-lg border border-border/75 bg-secondary p-3"
                >
                  <strong className="text-xl">{counts[status]}</strong>
                  <span className="mt-1 block text-[0.65rem] text-muted-foreground">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </ReportCard>
          <ReportCard
            title="Team capacity"
            subtitle="Worked hours against planned commitment."
          >
            {state.members.map((member) => {
              const memberPlan = state.schedule
                .filter((block) => block.memberId === member.id)
                .reduce((sum, block) => sum + block.end - block.start, 0);
              const memberWorked = state.sessions
                .filter(
                  (session) =>
                    session.memberId === member.id && sessionIsInWeek(session),
                )
                .reduce((sum, session) => sum + sessionHours(session), 0);
              return (
                <ProgressRow
                  key={member.id}
                  label={member.name}
                  value={
                    memberPlan
                      ? Math.min(
                          100,
                          Math.round((memberWorked / memberPlan) * 100),
                        )
                      : 0
                  }
                  note={`${formatHours(memberWorked)} / ${memberPlan}h planned`}
                />
              );
            })}
          </ReportCard>
          <ReportCard
            title="Department workload"
            subtitle="Outcomes currently owned by each department."
          >
            {(Object.keys(departments) as DepartmentId[]).map((id) => {
              const owned = outcomes.filter((outcome) =>
                outcome.departments.includes(id),
              );
              const open = owned.filter(
                (outcome) => !["Accepted", "Skipped"].includes(outcome.status),
              );
              return (
                <ProgressRow
                  key={id}
                  label={departments[id].name}
                  value={
                    outcomes.length
                      ? Math.round((owned.length / outcomes.length) * 100)
                      : 0
                  }
                  note={`${open.length} open · ${owned.length} outcomes`}
                />
              );
            })}
          </ReportCard>
        </div>
      </PageContainer>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-xl border border-border/80 bg-card p-5 shadow-[0_5px_18px_rgba(55,39,31,.03)]">
      <p className="font-mono text-[0.56rem] font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <strong className="mt-3 block text-3xl tracking-[-.04em]">{value}</strong>
      <p className="mt-1 text-[0.65rem] text-muted-foreground">{note}</p>
    </article>
  );
}
function ReportCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-5 shadow-[0_5px_18px_rgba(55,39,31,.03)]">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 mb-5 text-xs text-muted-foreground">{subtitle}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function ProgressRow({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <strong>{label}</strong>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <i
          className="block h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-1.5 text-[0.62rem] text-muted-foreground">{note}</p>
    </div>
  );
}
function formatHours(hours: number) {
  return `${Math.round(hours * 10) / 10}h`;
}
