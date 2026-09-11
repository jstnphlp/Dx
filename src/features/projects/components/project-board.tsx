"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { PageContainer } from "@/components/shared/page-container";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { departments } from "@/features/operations/demo-data";
import {
  outcomeProgress,
  projectProgress,
  useOperationalDemo,
  type DepartmentId,
  type OperationalOutcome,
  type OperationalProject,
  type OperationalStage,
  type OutcomeStatus,
  type ProjectStatus,
} from "@/features/operations/store";
import { cn } from "@/lib/utils";

type Tab = "content" | "chat" | "activity";
type DialogState =
  | { kind: "project" }
  | { kind: "stage"; stage?: OperationalStage }
  | { kind: "outcome"; stageId: string }
  | null;

const statusStyles: Record<OutcomeStatus, string> = {
  Accepted: "border-primary/25 bg-primary/10 text-primary-strong",
  "For review": "border-chart-3/25 bg-chart-3/10 text-chart-3",
  "Needs revision": "border-chart-5/25 bg-chart-5/10 text-chart-5",
  "In progress": "border-chart-4/25 bg-chart-4/10 text-chart-4",
  Blocked: "border-chart-3/25 bg-chart-3/10 text-chart-3",
  Planned: "border-border bg-muted text-muted-foreground",
  Skipped: "border-border bg-muted text-muted-foreground",
};

export function ProjectBoard() {
  const operations = useOperationalDemo();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [scope, setScope] = useState<"mine" | "whole">("mine");
  const [dialog, setDialog] = useState<DialogState>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedProject = params.get("project");
    const requestedOutcome = params.get("outcome");
    if (
      requestedProject &&
      operations.state.projects.some((item) => item.id === requestedProject)
    ) {
      const timer = window.setTimeout(() => {
        setProjectId(requestedProject);
        if (requestedOutcome) setOutcomeId(requestedOutcome);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [operations.state.projects]);

  const project = operations.state.projects.find(
    (item) => item.id === projectId,
  );
  const selectedOutcome = project?.stages
    .flatMap((stage) => stage.outcomes)
    .find((item) => item.id === outcomeId);
  const selectedStage = project?.stages.find((stage) =>
    stage.outcomes.some((item) => item.id === outcomeId),
  );
  if (!project)
    return (
      <ProjectLanding
        onOpen={(id) => {
          setProjectId(id);
          setTab("content");
        }}
        onCreate={() => setDialog({ kind: "project" })}
        dialog={dialog}
        setDialog={setDialog}
      />
    );

  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar
        section="Projects"
        current={
          selectedOutcome
            ? `${project.title} / ${selectedOutcome.title}`
            : project.title
        }
        actions={
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              if (selectedOutcome) setOutcomeId(null);
              else setProjectId(null);
            }}
          >
            <ArrowLeft />
            {selectedOutcome ? "Back to Content" : "All projects"}
          </Button>
        }
      />
      <ProjectHeader
        project={project}
        onStatus={(status) => operations.setProjectStatus(project.id, status)}
      />
      <div className="border-b border-foreground/10 px-5 sm:px-7">
        <nav className="flex gap-1" aria-label="Project workspace">
          {(["content", "chat", "activity"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setOutcomeId(null);
              }}
              className={cn(
                "border-b-2 border-transparent px-4 py-3 text-xs font-semibold text-muted-foreground capitalize",
                tab === item && "border-primary text-foreground",
              )}
            >
              {item}
              {item === "chat" && project.messages.length
                ? ` ${project.messages.length}`
                : item === "activity"
                  ? ` ${operations.state.activity.filter((entry) => entry.projectId === project.id).length}`
                  : ""}
            </button>
          ))}
        </nav>
      </div>
      {tab === "content" ? (
        selectedOutcome && selectedStage ? (
          <OutcomeWorkspace
            key={selectedOutcome.id}
            project={project}
            stage={selectedStage}
            outcome={selectedOutcome}
            onBack={() => setOutcomeId(null)}
          />
        ) : (
          <ProjectContent
            project={project}
            scope={scope}
            setScope={setScope}
            onOpenOutcome={setOutcomeId}
            onDialog={setDialog}
          />
        )
      ) : tab === "chat" ? (
        <ProjectChat project={project} />
      ) : (
        <ProjectActivity
          project={project}
          onOpenOutcome={(id) => {
            setTab("content");
            setOutcomeId(id);
          }}
        />
      )}
      <ProjectDialog
        open={dialog?.kind === "project"}
        onOpenChange={(open) => setDialog(open ? { kind: "project" } : null)}
      />
      <StageDialog
        project={project}
        state={dialog?.kind === "stage" ? dialog : null}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <OutcomeDialog
        project={project}
        stageId={dialog?.kind === "outcome" ? dialog.stageId : null}
        onOpenChange={(open) => !open && setDialog(null)}
      />
    </div>
  );
}

function ProjectLanding({
  onOpen,
  onCreate,
  dialog,
  setDialog,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
  dialog: DialogState;
  setDialog: (value: DialogState) => void;
}) {
  const { state } = useOperationalDemo();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<ProjectStatus[]>([]);
  const groups: ProjectStatus[] = ["Planning", "In Progress", "Done"];
  const projects = state.projects.filter((project) =>
    `${project.title} ${project.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar section="Workspace" current="Projects" />
      <div className="px-5 pt-5 sm:px-7 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <label className="flex w-full max-w-[26rem] items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-0 flex-1 border-0 bg-transparent text-xs shadow-none hover:bg-transparent focus-visible:ring-0"
              placeholder="Search projects…"
              aria-label="Search projects"
            />
          </label>
          <Button onClick={onCreate}>
            <Plus /> Add project
          </Button>
        </div>
        <div className="space-y-2">
          {groups.map((group) => {
            const items = projects.filter(
              (project) => project.status === group,
            );
            const closed = collapsed.includes(group);
            return (
              <section key={group}>
                <button
                  type="button"
                  aria-expanded={!closed}
                  onClick={() =>
                    setCollapsed((current) =>
                      current.includes(group)
                        ? current.filter((item) => item !== group)
                        : [...current, group],
                    )
                  }
                  className="flex min-h-11 w-full items-center gap-2 rounded-xl bg-secondary px-4 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "size-3 transition-transform",
                      !closed && "rotate-90",
                    )}
                  />
                  <h2 className="text-xs font-semibold">{group}</h2>
                  <span className="font-mono text-[0.58rem] text-muted-foreground">
                    {items.length}
                  </span>
                </button>
                {!closed ? (
                  <div className="flex gap-3 overflow-x-auto py-2 pl-7">
                    {items.length ? (
                      items.map((project) => (
                        <PortfolioCard
                          key={project.id}
                          project={project}
                          onOpen={() => onOpen(project.id)}
                        />
                      ))
                    ) : (
                      <p className="grid min-h-24 w-full place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                        No {group.toLowerCase()} projects.
                      </p>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
      <ProjectDialog
        open={dialog?.kind === "project"}
        onOpenChange={(open) => setDialog(open ? { kind: "project" } : null)}
      />
    </div>
  );
}

function PortfolioCard({
  project,
  onOpen,
}: {
  project: OperationalProject;
  onOpen: () => void;
}) {
  const progress = projectProgress(project);
  const outcomes = project.stages.flatMap((stage) => stage.outcomes);
  return (
    <article className="flex min-h-[14rem] w-[21rem] shrink-0 flex-col rounded-xl border border-border/80 bg-card p-4 shadow-[0_5px_18px_rgba(55,39,31,.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.52rem] font-bold text-primary uppercase">
            Company project
          </p>
          <h3 className="mt-1.5 text-sm font-semibold">{project.title}</h3>
        </div>
        <Status>{project.status}</Status>
      </div>
      <p className="mt-3 line-clamp-2 text-[0.68rem] leading-5 text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-4 rounded-lg bg-secondary p-3">
        <div className="flex justify-between font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
          <span>Overall progress</span>
          <strong className="text-primary">{progress}%</strong>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
          <i
            className="block h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[0.62rem] text-muted-foreground">
          {outcomes.filter((item) => item.status === "Accepted").length}{" "}
          accepted / {outcomes.length} outcomes · {project.stages.length} stages
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {project.departments.map((id) => (
          <span
            key={id}
            className="rounded-full bg-secondary px-2 py-1 font-mono text-[0.5rem] text-muted-foreground"
          >
            {departments[id].short}
          </span>
        ))}
      </div>
      <Button
        variant="ghost"
        className="mt-auto justify-between border-t border-border/70"
        onClick={onOpen}
      >
        Open workspace <ChevronRight />
      </Button>
    </article>
  );
}

function ProjectHeader({
  project,
  onStatus,
}: {
  project: OperationalProject;
  onStatus: (status: ProjectStatus) => void;
}) {
  const outcomes = project.stages.flatMap((stage) => stage.outcomes);
  return (
    <header className="bg-transparent px-5 pt-7 pb-6 sm:px-7">
      <p className="font-mono text-[0.6rem] font-bold tracking-[.12em] text-primary uppercase">
        Project workspace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
        {project.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Project lead">{project.lead}</Meta>
        <Meta label="Assistant lead">{project.assistant}</Meta>
        <Meta label="State">
          <Select
            aria-label="Project state"
            value={project.status}
            onChange={(event) => onStatus(event.target.value as ProjectStatus)}
            className="h-8 text-xs"
          >
            <option>Planning</option>
            <option>In Progress</option>
            <option>Done</option>
          </Select>
        </Meta>
        <Meta label="Progress">
          {outcomes.filter((item) => item.status === "Accepted").length}{" "}
          accepted / {outcomes.length} outcomes
        </Meta>
      </div>
    </header>
  );
}

function ProjectContent({
  project,
  scope,
  setScope,
  onOpenOutcome,
  onDialog,
}: {
  project: OperationalProject;
  scope: "mine" | "whole";
  setScope: (scope: "mine" | "whole") => void;
  onOpenOutcome: (id: string) => void;
  onDialog: (dialog: DialogState) => void;
}) {
  const { currentMember } = useOperationalDemo();
  const visible = (outcome: OperationalOutcome) =>
    scope === "whole" ||
    outcome.memberIds.includes(currentMember.id) ||
    outcome.participantIds.includes(currentMember.id);
  return (
    <div className="px-5 py-5 sm:px-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Project stages</h2>
          <p className="mt-1 text-[0.68rem] text-muted-foreground">
            {scope === "mine"
              ? "Showing outcomes assigned to or joined by you."
              : "Showing the complete project outcome board."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented value={scope} onChange={setScope} />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onDialog({
                kind: "outcome",
                stageId: project.stages[0]?.id ?? "",
              })
            }
            disabled={!project.stages.length}
          >
            <Plus /> Outcome
          </Button>
          <Button size="sm" onClick={() => onDialog({ kind: "stage" })}>
            <Plus /> Stage
          </Button>
        </div>
      </div>
      <div className="project-board-scroll overflow-x-auto pb-4">
        <div className="flex w-max min-w-full gap-3">
          {project.stages.map((stage, index) => (
            <section
              key={stage.id}
              className="min-h-[32rem] w-[20rem] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary"
            >
              <header className="border-b border-border bg-muted p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
                      Stage {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">{stage.name}</h3>
                  </div>
                  <button
                    type="button"
                    aria-label={`Rename ${stage.name}`}
                    onClick={() => onDialog({ kind: "stage", stage })}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-card"
                  >
                    <Pencil className="size-3" />
                  </button>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                  <i
                    className="block h-full bg-primary"
                    style={{
                      width: `${stage.outcomes.length ? Math.round(stage.outcomes.reduce((sum, item) => sum + outcomeProgress(item), 0) / stage.outcomes.length) : 0}%`,
                    }}
                  />
                </div>
              </header>
              <div className="space-y-2.5 p-2.5">
                {stage.outcomes.filter(visible).map((outcome) => (
                  <OutcomeCard
                    key={outcome.id}
                    outcome={outcome}
                    onOpen={() => onOpenOutcome(outcome.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onDialog({ kind: "outcome", stageId: stage.id })
                  }
                  className="w-full rounded-xl border border-dashed border-input px-3 py-3 text-xs text-muted-foreground hover:bg-card"
                >
                  + Add outcome
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({
  outcome,
  onOpen,
}: {
  outcome: OperationalOutcome;
  onOpen: () => void;
}) {
  const tasks = outcome.features.flatMap((feature) => feature.tasks);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border/80 bg-card p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[0.8rem] leading-5 font-semibold">
          {outcome.title}
        </h3>
        <Status className={statusStyles[outcome.status]}>
          {outcome.status}
        </Status>
      </div>
      <p className="mt-2 line-clamp-2 text-[0.68rem] leading-5 text-muted-foreground">
        {outcome.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {outcome.departments.map((id) => (
          <span
            key={id}
            className="rounded-full bg-secondary px-2 py-1 font-mono text-[0.5rem] text-muted-foreground"
          >
            {departments[id].short}
          </span>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-border/70 pt-2 text-[0.58rem] text-muted-foreground">
        <span>
          {tasks.filter((task) => task.done).length}/{tasks.length} tasks
        </span>
        <span>{outcomeProgress(outcome)}% · Open →</span>
      </div>
    </button>
  );
}

function OutcomeWorkspace({
  project,
  stage,
  outcome,
  onBack,
}: {
  project: OperationalProject;
  stage: OperationalStage;
  outcome: OperationalOutcome;
  onBack: () => void;
}) {
  const actions = useOperationalDemo();
  const [featureOpen, setFeatureOpen] = useState(false);
  const [outputTitle, setOutputTitle] = useState(outcome.outputDraft);
  const [outputNotes, setOutputNotes] = useState(outcome.outputNotes);
  const [checks, setChecks] = useState(outcome.criteria.map(() => false));
  const [feedback, setFeedback] = useState(outcome.feedback);
  const [message, setMessage] = useState("");
  const prerequisite = project.stages
    .flatMap((item) => item.outcomes)
    .find((item) => item.id === outcome.prerequisiteId);
  const tasks = outcome.features.flatMap((feature) => feature.tasks);
  function review(accepted: boolean) {
    const ok = actions.reviewOutput(
      project.id,
      outcome.id,
      accepted,
      feedback,
      checks,
    );
    setMessage(
      ok
        ? accepted
          ? "Output accepted."
          : "Revision requested."
        : accepted
          ? "Verify every acceptance criterion first."
          : "Add revision feedback first.",
    );
  }
  return (
    <PageContainer className="pt-5 lg:pt-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back to Content
        </Button>
        {!outcome.participantIds.includes(actions.currentMember.id) &&
        !outcome.memberIds.includes(actions.currentMember.id) ? (
          <Button
            variant="outline"
            onClick={() => actions.joinOutcome(project.id, outcome.id)}
          >
            <UsersRound /> Join outcome
          </Button>
        ) : null}
      </div>
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.6rem] font-bold tracking-[.1em] text-primary uppercase">
            {stage.name} / Outcome workspace
          </p>
          <Status className={statusStyles[outcome.status]}>
            {outcome.status}
          </Status>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
          {outcome.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          {outcome.description}
        </p>
        <div className="mt-5 rounded-xl border border-border bg-secondary p-4">
          <p className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
            Acceptance criteria
          </p>
          <ul className="mt-2 space-y-2">
            {outcome.criteria.map((criterion) => (
              <li key={criterion} className="flex gap-2 text-xs">
                <Check className="mt-0.5 size-3.5 text-primary" />
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      </header>
      {prerequisite ? (
        <section className="rounded-xl border border-chart-3/20 bg-chart-3/8 p-4">
          <h3 className="text-sm font-semibold">
            Prerequisite: {prerequisite.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Current state: {prerequisite.status}. This outcome remains blocked
            until the dependency is accepted or skipped.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => actions.skipDependency(project.id, outcome.id)}
          >
            Skip dependency
          </Button>
        </section>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-5">
          <section className="rounded-xl border border-border/80 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">My Work Plan</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Break the outcome into features and executable tasks.
                </p>
              </div>
              <Button size="sm" onClick={() => setFeatureOpen(true)}>
                <Plus /> Feature
              </Button>
            </div>
            {featureOpen ? (
              <FeatureComposer
                onCancel={() => setFeatureOpen(false)}
                onSubmit={(name, description) => {
                  actions.addFeature(project.id, outcome.id, name, description);
                  setFeatureOpen(false);
                }}
              />
            ) : null}
            <div className="mt-4 space-y-3">
              {outcome.features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  projectId={project.id}
                  outcomeId={outcome.id}
                  feature={feature}
                />
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border/80 bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  My Outputs & Feedback
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submit evidence that the expected outcome has been achieved.
                </p>
              </div>
              <Status>{outcome.submissions[0]?.state ?? "Draft"}</Status>
            </div>
            <div className="mt-4 grid gap-4">
              <Field label="Output name or link">
                <Input
                  value={outputTitle}
                  onChange={(event) => setOutputTitle(event.target.value)}
                  placeholder="Build URL, pull request, document, or approval"
                />
              </Field>
              <Field label="What changed / submission notes">
                <Textarea
                  value={outputNotes}
                  onChange={(event) => setOutputNotes(event.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    actions.saveOutput(
                      project.id,
                      outcome.id,
                      outputTitle,
                      outputNotes,
                    )
                  }
                >
                  Save draft
                </Button>
                <Button
                  disabled={!outputTitle.trim() || Boolean(prerequisite)}
                  onClick={() =>
                    actions.submitOutput(
                      project.id,
                      outcome.id,
                      outputTitle,
                      outputNotes,
                    )
                  }
                >
                  Submit for review
                </Button>
              </div>
            </div>
            {outcome.submissions.length ? (
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="text-xs font-semibold">Submission history</h4>
                <div className="mt-3 space-y-2">
                  {outcome.submissions.map((submission) => (
                    <article
                      key={submission.id}
                      className="rounded-lg bg-secondary p-3"
                    >
                      <div className="flex justify-between gap-3">
                        <strong className="text-xs">
                          v{submission.version} · {submission.title}
                        </strong>
                        <Status>{submission.state}</Status>
                      </div>
                      <p className="mt-1 text-[0.65rem] text-muted-foreground">
                        {submission.notes || "No notes"}
                      </p>
                      {submission.feedback ? (
                        <p className="mt-2 border-l-2 border-primary pl-2 text-[0.65rem]">
                          {submission.feedback}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            {outcome.submissions[0]?.state === "For review" ? (
              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
                <h4 className="text-sm font-semibold">Lead review</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verify the submitted output against every criterion.
                </p>
                <div className="mt-3 space-y-2">
                  {outcome.criteria.map((criterion, index) => (
                    <label
                      key={criterion}
                      className="flex items-start gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checks[index] ?? false}
                        onChange={(event) =>
                          setChecks((current) =>
                            current.map((value, itemIndex) =>
                              itemIndex === index
                                ? event.target.checked
                                : value,
                            ),
                          )
                        }
                        className="mt-0.5 accent-primary"
                      />
                      {criterion}
                    </label>
                  ))}
                </div>
                <Field label="Review feedback">
                  <Textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                  />
                </Field>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => review(false)}>
                    Needs revision
                  </Button>
                  <Button onClick={() => review(true)}>
                    Accept verified output
                  </Button>
                </div>
                {message ? (
                  <p
                    className="mt-2 text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </main>
        <aside className="space-y-4">
          <RailCard title="Outcome status">
            <div className="text-center">
              <strong className="text-3xl">{outcomeProgress(outcome)}%</strong>
              <p className="text-[0.62rem] text-muted-foreground">
                Work progress
              </p>
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
              <p className="flex justify-between">
                <span>Features</span>
                <strong>{outcome.features.length}</strong>
              </p>
              <p className="flex justify-between">
                <span>Tasks</span>
                <strong>
                  {tasks.filter((task) => task.done).length} / {tasks.length}
                </strong>
              </p>
            </div>
          </RailCard>
          <RailCard title="Ownership">
            <div className="flex flex-wrap gap-1">
              {outcome.departments.map((id) => (
                <Status key={id}>{departments[id].short}</Status>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs">
              {[...outcome.memberIds, ...outcome.participantIds].map((id) => (
                <p key={id}>
                  {actions.state.members.find((member) => member.id === id)
                    ?.name ?? "Unknown member"}
                </p>
              ))}
            </div>
          </RailCard>
          {outcome.feedback ? (
            <RailCard title="Latest feedback">
              <p className="text-xs leading-5 text-muted-foreground">
                {outcome.feedback}
              </p>
            </RailCard>
          ) : null}
        </aside>
      </div>
    </PageContainer>
  );
}

function FeatureComposer({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="mt-4 rounded-xl bg-secondary p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Feature name"
          autoFocus
        />
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short description"
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!name.trim()}
          onClick={() => onSubmit(name, description)}
        >
          Add feature
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({
  projectId,
  outcomeId,
  feature,
}: {
  projectId: string;
  outcomeId: string;
  feature: OperationalOutcome["features"][number];
}) {
  const actions = useOperationalDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [task, setTask] = useState("");
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-secondary">
      <header className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>
        <div className="min-w-0 flex-1">
          <strong className="block text-xs">{feature.name}</strong>
          <span className="text-[0.62rem] text-muted-foreground">
            {feature.description}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Delete ${feature.name}`}
          onClick={() =>
            actions.deleteFeature(projectId, outcomeId, feature.id)
          }
          className="p-2 text-muted-foreground"
        >
          <Trash2 className="size-3" />
        </button>
      </header>
      {!collapsed ? (
        <div className="border-t border-border bg-card p-3">
          <div className="space-y-2">
            {feature.tasks.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    actions.toggleTask(
                      projectId,
                      outcomeId,
                      feature.id,
                      item.id,
                    )
                  }
                  className="accent-primary"
                />
                <span
                  className={cn(
                    "flex-1",
                    item.done && "text-muted-foreground line-through",
                  )}
                >
                  {item.title}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  onClick={() =>
                    actions.deleteTask(
                      projectId,
                      outcomeId,
                      feature.id,
                      item.id,
                    )
                  }
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={task}
              onChange={(event) => setTask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && task.trim()) {
                  actions.addTask(projectId, outcomeId, feature.id, task);
                  setTask("");
                }
              }}
              placeholder="Add a task…"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!task.trim()}
              onClick={() => {
                actions.addTask(projectId, outcomeId, feature.id, task);
                setTask("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ProjectChat({ project }: { project: OperationalProject }) {
  const actions = useOperationalDemo();
  const [text, setText] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [compose, setCompose] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <PageContainer className="pt-5 lg:pt-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex min-h-[34rem] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <header className="border-b border-border p-4">
            <h2 className="text-sm font-semibold">{project.title}</h2>
            <p className="text-[0.62rem] text-muted-foreground">
              Project channel
            </p>
          </header>
          <div className="flex-1 space-y-3 p-4">
            {project.messages.map((message) => (
              <article
                key={message.id}
                className="max-w-2xl rounded-xl bg-secondary p-3"
              >
                <strong className="text-xs">{message.author}</strong>
                <p className="mt-1 text-xs leading-5">{message.text}</p>
                <time className="mt-1 block font-mono text-[0.5rem] text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </article>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (text.trim()) {
                actions.sendProjectMessage(project.id, text);
                setText("");
              }
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Message the project…"
              aria-label="Project message"
            />
            <Button type="submit" disabled={!text.trim()}>
              Send
            </Button>
          </form>
        </section>
        <aside>
          <RailCard title="Announcements">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompose((value) => !value)}
            >
              <Megaphone /> Announce
            </Button>
            {compose ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={announcement}
                  onChange={(event) => setAnnouncement(event.target.value)}
                  placeholder="Post an announcement…"
                />
                <label className="flex gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(event) => setPinned(event.target.checked)}
                  />{" "}
                  Pin announcement
                </label>
                <Button
                  size="sm"
                  disabled={!announcement.trim()}
                  onClick={() => {
                    actions.postAnnouncement(project.id, announcement, pinned);
                    setAnnouncement("");
                    setCompose(false);
                  }}
                >
                  Post
                </Button>
              </div>
            ) : null}
            <div className="mt-3 space-y-2">
              {[...project.announcements]
                .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                .map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg bg-secondary p-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        actions.toggleAnnouncement(project.id, item.id)
                      }
                      className="float-right text-muted-foreground"
                      aria-label={
                        item.pinned ? "Unpin announcement" : "Pin announcement"
                      }
                    >
                      <Pin
                        className={cn(
                          "size-3",
                          item.pinned && "fill-primary text-primary",
                        )}
                      />
                    </button>
                    <strong className="text-[0.65rem]">{item.author}</strong>
                    <p className="mt-1 text-[0.65rem] leading-5">{item.text}</p>
                  </article>
                ))}
            </div>
          </RailCard>
        </aside>
      </div>
    </PageContainer>
  );
}

function ProjectActivity({
  project,
  onOpenOutcome,
}: {
  project: OperationalProject;
  onOpenOutcome: (id: string) => void;
}) {
  const { state } = useOperationalDemo();
  const [filter, setFilter] = useState("all");
  const [member, setMember] = useState("all");
  const entries = state.activity.filter(
    (item) =>
      item.projectId === project.id &&
      (filter === "all" || item.type === filter) &&
      (member === "all" || item.actor === member),
  );
  return (
    <PageContainer className="pt-5 lg:pt-6">
      <header>
        <h2 className="text-2xl font-semibold">My Activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Project decisions and local workflow changes.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {["all", "output", "task", "outcome", "project", "people"].map(
          (item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
              className="capitalize"
            >
              {item}
            </Button>
          ),
        )}
        <Select
          value={member}
          onChange={(event) => setMember(event.target.value)}
          className="h-9 w-48"
        >
          <option value="all">All members</option>
          {state.members.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>
      <section className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {entries.length ? (
          entries.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                <FileText className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <strong>{item.actor}</strong> · {item.action}
                </p>
                <p className="mt-1 text-[0.65rem] text-muted-foreground">
                  {item.detail}
                </p>
              </div>
              {item.outcomeId ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenOutcome(item.outcomeId!)}
                >
                  Open outcome →
                </Button>
              ) : null}
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-xs text-muted-foreground">
            No matching activity.
          </p>
        )}
      </section>
    </PageContainer>
  );
}

function ProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actions = useOperationalDemo();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    const selected = data.getAll("departments") as DepartmentId[];
    actions.createProject({
      title,
      description: String(data.get("description") ?? ""),
      status: String(data.get("status")) as ProjectStatus,
      lead: String(data.get("lead") ?? "Rex Jumawid"),
      departments: selected.length ? selected : ["rd"],
      initialStage:
        String(data.get("stage") ?? "Project setup") || "Project setup",
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Add a local project and its initial ownership.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Project name">
              <Input name="title" required />
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status">
                <Select name="status">
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </Select>
              </Field>
              <Field label="Project lead">
                <Input name="lead" defaultValue="Rex Jumawid" />
              </Field>
            </div>
            <Field label="Initial stage">
              <Input name="stage" defaultValue="Project setup" />
            </Field>
            <DepartmentChecks />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StageDialog({
  project,
  state,
  onOpenChange,
}: {
  project: OperationalProject;
  state: { kind: "stage"; stage?: OperationalStage } | null;
  onOpenChange: (open: boolean) => void;
}) {
  const actions = useOperationalDemo();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    if (!name) return;
    if (state?.stage) actions.renameStage(project.id, state.stage.id, name);
    else actions.addStage(project.id, name);
    onOpenChange(false);
  }
  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {state?.stage ? "Rename project stage" : "Add project stage"}
            </DialogTitle>
          </DialogHeader>
          <Field label="Stage name">
            <Input name="name" defaultValue={state?.stage?.name} required />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {state?.stage ? "Save stage" : "Create stage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeDialog({
  project,
  stageId,
  onOpenChange,
}: {
  project: OperationalProject;
  stageId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const actions = useOperationalDemo();
  const [criteria, setCriteria] = useState([""]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stageId) return;
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const validCriteria = criteria.map((item) => item.trim()).filter(Boolean);
    if (!title || !validCriteria.length) return;
    const selectedDepartments = data.getAll("departments") as DepartmentId[];
    actions.addOutcome(project.id, String(data.get("stage") ?? stageId), {
      title,
      description: String(data.get("description") ?? ""),
      departments: selectedDepartments.length ? selectedDepartments : ["rd"],
      memberIds: data.getAll("members") as string[],
      criteria: validCriteria,
      prerequisiteId: String(data.get("prerequisite") ?? "") || null,
    });
    setCriteria([""]);
    onOpenChange(false);
  }
  const outcomes = project.stages.flatMap((stage) => stage.outcomes);
  return (
    <Dialog open={Boolean(stageId)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create outcome</DialogTitle>
            <DialogDescription>
              Define the expected result, ownership, acceptance criteria, and
              dependency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Stage">
              <Select name="stage" defaultValue={stageId ?? undefined}>
                {project.stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Outcome">
              <Input name="title" required />
            </Field>
            <Field label="Outcome description">
              <Textarea name="description" />
            </Field>
            <DepartmentChecks />
            <Field label="Members">
              <div className="grid grid-cols-2 gap-2">
                {actions.state.members.map((member) => (
                  <label
                    key={member.id}
                    className="flex gap-2 rounded-lg bg-secondary p-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      name="members"
                      value={member.id}
                      defaultChecked={member.id === actions.currentMember.id}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Acceptance criteria">
              <div className="space-y-2">
                {criteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criterion}
                      onChange={(event) =>
                        setCriteria((current) =>
                          current.map((value, itemIndex) =>
                            itemIndex === index ? event.target.value : value,
                          ),
                        )
                      }
                      placeholder={`Criterion ${index + 1}`}
                    />
                    {criteria.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove criterion ${index + 1}`}
                        onClick={() =>
                          setCriteria((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCriteria((current) => [...current, ""])}
              >
                + Add criterion
              </Button>
            </Field>
            <Field label="Prerequisite outcome (optional)">
              <Select name="prerequisite" defaultValue="">
                <option value="">None</option>
                {outcomes.map((outcome) => (
                  <option key={outcome.id} value={outcome.id}>
                    {outcome.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create outcome</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentChecks() {
  return (
    <Field label="Departments">
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(departments) as DepartmentId[]).map((id) => (
          <label
            key={id}
            className="flex gap-2 rounded-lg bg-secondary p-2 text-xs"
          >
            <input
              type="checkbox"
              name="departments"
              value={id}
              defaultChecked={id === "rd"}
            />
            {departments[id].name}
          </label>
        ))}
      </div>
    </Field>
  );
}
function Segmented({
  value,
  onChange,
}: {
  value: "mine" | "whole";
  onChange: (value: "mine" | "whole") => void;
}) {
  return (
    <div
      className="flex rounded-lg bg-secondary p-1"
      aria-label="Content board scope"
    >
      {(
        [
          ["mine", "My Work"],
          ["whole", "Whole Work"],
        ] as const
      ).map(([key, label]) => (
        <Button
          key={key}
          size="sm"
          variant={value === key ? "secondary" : "ghost"}
          onClick={() => onChange(key)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
function Status({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border border-border bg-muted px-2 py-1 font-mono text-[0.52rem] font-bold text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3">
      <p className="font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2 text-xs font-semibold">{children}</div>
    </div>
  );
}
function RailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 space-y-1.5">
      <Label className="font-mono text-[0.56rem] font-bold tracking-[.06em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
