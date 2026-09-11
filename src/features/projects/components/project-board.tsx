"use client";

import {
  Check,
  ChevronRight,
  CircleDot,
  FileText,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { InspectorDrawer } from "@/components/shared/inspector-drawer";
import { LiquidGlass } from "@/components/shared/liquid-glass";
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
import { cn } from "@/lib/utils";

import { demoProject, demoStages } from "../demo-data";
import type {
  Outcome,
  OutcomeState,
  ProjectStage,
  ProjectSummary,
} from "../types";

const stateStyles: Record<OutcomeState, string> = {
  Accepted: "border-primary/25 bg-primary/10 text-primary-strong",
  "For review": "border-chart-3/25 bg-chart-3/10 text-chart-3",
  "In progress": "border-chart-4/25 bg-chart-4/10 text-chart-4",
  Blocked: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  Planned: "border-border bg-muted text-muted-foreground",
};

const departmentStyles: Record<string, string> = {
  Creatives: "border-chart-3/20 bg-chart-3/10 text-chart-3",
  "R&D": "border-chart-4/20 bg-chart-4/10 text-chart-4",
  "S&M": "border-chart-5/20 bg-chart-5/10 text-chart-5",
};

type DialogName = "project" | "settings" | "outcome" | null;

function recalculateStage(stage: ProjectStage): ProjectStage {
  if (!stage.outcomes.length) return { ...stage, progress: 0 };
  const accepted = stage.outcomes.filter(
    (outcome) => outcome.state === "Accepted",
  ).length;
  if (accepted === stage.outcomes.length) return { ...stage, progress: 100 };
  return stage;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[0.62rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: ProjectSummary) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    onSubmit({
      name,
      description: String(data.get("description") ?? "").trim(),
      lead: String(data.get("lead") ?? "Rex Jumawid"),
      assistant: String(data.get("assistant") ?? "None"),
      state: "Active",
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">
              Create project
            </p>
            <DialogTitle>New project details</DialogTitle>
            <DialogDescription>
              Create a project shell. Persistence will be wired when the
              projects data model is approved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FormField label="Project name">
              <Input name="name" defaultValue="New Client Platform" />
            </FormField>
            <FormField label="Project description">
              <Textarea
                name="description"
                defaultValue="Build a software solution based on the client's approved scope, expected outcomes, and business objectives."
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project lead">
                <Select name="lead" defaultValue="Rex Jumawid">
                  <option>Rex Jumawid</option>
                  <option>Justin Cruz</option>
                  <option>Bea Santos</option>
                  <option>Marco Reyes</option>
                </Select>
              </FormField>
              <FormField label="Assistant lead">
                <Select name="assistant" defaultValue="Ana Mendoza">
                  <option>None</option>
                  <option>Ana Mendoza</option>
                  <option>Nico Ramos</option>
                  <option>Carlo Lim</option>
                </Select>
              </FormField>
            </div>
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

function SettingsDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectSummary;
  onSubmit: (project: ProjectSummary) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      ...project,
      name: String(data.get("name") ?? project.name).trim() || project.name,
      lead: String(data.get("lead") ?? project.lead),
      assistant: String(data.get("assistant") ?? project.assistant),
      state: String(
        data.get("state") ?? project.state,
      ) as ProjectSummary["state"],
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">
              Project controls
            </p>
            <DialogTitle>Project settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <FormField label="Project name">
              <Input name="name" defaultValue={project.name} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project lead">
                <Select name="lead" defaultValue={project.lead}>
                  <option>Rex Jumawid</option>
                  <option>Justin Cruz</option>
                  <option>Bea Santos</option>
                  <option>Marco Reyes</option>
                </Select>
              </FormField>
              <FormField label="Assistant lead">
                <Select name="assistant" defaultValue={project.assistant}>
                  <option>None</option>
                  <option>Ana Mendoza</option>
                  <option>Nico Ramos</option>
                  <option>Carlo Lim</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Project state">
              <Select name="state" defaultValue={project.state}>
                <option>Active</option>
                <option>Paused</option>
                <option>Completed</option>
              </Select>
            </FormField>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save settings</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeDialog({
  open,
  onOpenChange,
  stages,
  defaultStageId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: ProjectStage[];
  defaultStageId: string;
  onSubmit: (stageId: string, outcome: Outcome) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    onSubmit(String(data.get("stage") ?? defaultStageId), {
      id: `outcome-${Date.now()}`,
      title,
      description:
        String(data.get("description") ?? "").trim() ||
        "Acceptance criteria not yet defined.",
      state: String(data.get("state") ?? "Planned") as OutcomeState,
      department: String(data.get("department") ?? "R&D"),
      member: String(data.get("member") ?? "Unassigned").trim() || "Unassigned",
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">
              Project lead action
            </p>
            <DialogTitle>Define project outcome</DialogTitle>
            <DialogDescription>
              Assign the expected result first. Features and tasks come after
              the outcome exists.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Stage">
                <Select name="stage" defaultValue={defaultStageId}>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.title}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Owning department">
                <Select name="department" defaultValue="Creatives">
                  <option>R&D</option>
                  <option>Creatives</option>
                  <option>S&M</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Outcome">
              <Input
                name="title"
                placeholder="Approved responsive application prototype"
              />
            </FormField>
            <FormField label="Acceptance condition">
              <Textarea
                name="description"
                placeholder="What must be true for this outcome to be accepted?"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Assigned member">
                <Input name="member" placeholder="Bea Santos" />
              </FormField>
              <FormField label="State">
                <Select name="state" defaultValue="Planned">
                  <option>Planned</option>
                  <option>In progress</option>
                  <option>For review</option>
                  <option>Blocked</option>
                  <option>Accepted</option>
                </Select>
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add outcome</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Metadata({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-36 border-r border-foreground/10 pr-5 last:border-r-0">
      <p className="mb-1.5 font-mono text-[0.58rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex min-h-6 items-center gap-2 text-xs font-semibold text-foreground">
        {children}
      </div>
    </div>
  );
}

function OutcomeCard({
  outcome,
  onOpen,
}: {
  outcome: Outcome;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full rounded-xl border border-border/80 bg-card p-3.5 text-left shadow-[0_3px_10px_rgba(55,39,31,0.035)] transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-input hover:shadow-[0_8px_22px_rgba(44,31,25,0.07)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[0.82rem] leading-5 font-semibold tracking-[-0.01em] text-foreground">
          {outcome.title}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-1 font-mono text-[0.52rem] font-bold tracking-[0.04em] uppercase",
            stateStyles[outcome.state],
          )}
        >
          {outcome.state}
        </span>
      </div>
      <p className="mt-2 text-[0.69rem] leading-5 text-muted-foreground">
        {outcome.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className={cn(
            "rounded-full border px-2 py-1 font-mono text-[0.54rem] font-semibold",
            departmentStyles[outcome.department] ??
              "border-border bg-muted text-muted-foreground",
          )}
        >
          {outcome.department}
        </span>
        <span className="rounded-full border border-border bg-muted px-2 py-1 font-mono text-[0.54rem] text-muted-foreground">
          {outcome.member}
        </span>
      </div>
      {outcome.dependency ? (
        <div className="mt-3 border-l-2 border-chart-3 bg-chart-3/10 px-2.5 py-2 text-[0.63rem] leading-4 text-chart-3">
          <strong className="block font-semibold">Dependency</strong>
          {outcome.dependency}
        </div>
      ) : null}
      {outcome.tasks || outcome.features ? (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-2.5">
          <div>
            <p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              Tasks
            </p>
            <p className="mt-1 text-[0.63rem] text-foreground/75">
              {outcome.tasks ?? "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              Features
            </p>
            <p className="mt-1 text-[0.63rem] text-foreground/75">
              {outcome.features ?? "—"}
            </p>
          </div>
        </div>
      ) : null}
      {outcome.output ? (
        <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-2">
          <p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-primary-strong uppercase">
            Current output
          </p>
          <p className="mt-1 text-[0.64rem] font-medium text-foreground/75">
            {outcome.output}
          </p>
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-[0.5rem] text-muted-foreground">
        <span>Updated recently</span>
        <span className="flex items-center gap-0.5 font-sans text-[0.62rem] font-semibold text-primary">
          Inspect <ChevronRight className="size-3" />
        </span>
      </div>
    </button>
  );
}

function StageColumn({
  stage,
  onOpenOutcome,
  onAddOutcome,
}: {
  stage: ProjectStage;
  onOpenOutcome: (id: string) => void;
  onAddOutcome: (stageId: string) => void;
}) {
  return (
    <section className="min-h-[590px] w-[20rem] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,0.025)]">
      <header className="border-b border-border/80 bg-muted px-4 py-3.5">
        <p className="font-mono text-[0.55rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Stage {stage.number}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-[-0.015em] text-foreground">
            {stage.title}
          </h2>
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[0.52rem] text-muted-foreground">
            {stage.outcomes.length} outcomes
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
          <span className="font-mono text-[0.5rem] text-muted-foreground">
            {stage.progress}%
          </span>
        </div>
      </header>
      <div className="flex flex-col gap-2.5 p-2.5">
        {stage.outcomes.map((outcome) => (
          <OutcomeCard
            key={outcome.id}
            outcome={outcome}
            onOpen={() => onOpenOutcome(outcome.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => onAddOutcome(stage.id)}
          className="w-full rounded-xl border border-dashed border-input px-3 py-2.5 text-[0.65rem] font-medium text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-card/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          + Add outcome to stage
        </button>
      </div>
    </section>
  );
}

function InspectorSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-foreground/10 px-5 py-5 last:border-b-0">
      <p className="mb-2.5 font-mono text-[0.58rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </section>
  );
}

export function ProjectBoard() {
  const [project, setProject] = useState<ProjectSummary>(demoProject);
  const [stages, setStages] = useState<ProjectStage[]>(demoStages);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(
    null,
  );
  const [reviewVisible, setReviewVisible] = useState(false);
  const [outcomeStageId, setOutcomeStageId] = useState(demoStages[0]?.id ?? "");
  const [quickOpen, setQuickOpen] = useState(false);
  const outcomes = useMemo(
    () => stages.flatMap((stage) => stage.outcomes),
    [stages],
  );
  const acceptedCount = outcomes.filter(
    (outcome) => outcome.state === "Accepted",
  ).length;
  const selectedOutcome = outcomes.find(
    (outcome) => outcome.id === selectedOutcomeId,
  );

  function addStage() {
    const number = stages.length + 1;
    setStages((current) => [
      ...current,
      {
        id: `stage-${Date.now()}`,
        number: String(number).padStart(2, "0"),
        title: `New Stage ${number}`,
        progress: 0,
        outcomes: [],
      },
    ]);
  }
  function addOutcome(stageId: string, outcome: Outcome) {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? recalculateStage({
              ...stage,
              outcomes: [...stage.outcomes, outcome],
            })
          : stage,
      ),
    );
  }
  function openOutcomeDialog(stageId: string) {
    setOutcomeStageId(stageId);
    setDialog("outcome");
  }
  function acceptSelectedOutcome() {
    if (!selectedOutcomeId) return;
    setStages((current) =>
      current.map((stage) =>
        recalculateStage({
          ...stage,
          outcomes: stage.outcomes.map((outcome) =>
            outcome.id === selectedOutcomeId
              ? { ...outcome, state: "Accepted" }
              : outcome,
          ),
        }),
      ),
    );
    setReviewVisible(false);
  }

  return (
    <div className="relative min-h-svh pb-12">
      <div className="pointer-events-none sticky top-0 z-20 hidden h-[4.875rem] items-center justify-between gap-4 px-7 py-3 lg:flex">
        <LiquidGlass
          kind="toolbar"
          renderKey={project.name}
          className="pointer-events-auto h-12 min-w-56 rounded-[1.15rem] border border-white/80"
          contentClassName="flex h-full items-center px-4"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Projects</span>
            <span className="text-muted-foreground/55">/</span>
            <strong className="font-semibold text-foreground">
              {project.name}
            </strong>
          </div>
        </LiquidGlass>
        <LiquidGlass
          kind="toolbar"
          renderKey={`actions-${project.name}`}
          className="pointer-events-auto h-12 rounded-[1.15rem] border border-white/80"
          contentClassName="flex h-full items-center gap-1 p-1"
        >
          <Button
            variant="ghost"
            size="lg"
            className="rounded-xl bg-transparent text-foreground/80 hover:bg-card/30"
            onClick={() => setDialog("settings")}
          >
            <Settings2 /> Project settings
          </Button>
          <Button
            size="lg"
            className="rounded-xl"
            onClick={() => setDialog("project")}
          >
            <Plus /> New project
          </Button>
        </LiquidGlass>
      </div>

      <header className="border-b border-foreground/10 bg-transparent px-5 pt-8 pb-6 sm:px-7 lg:px-7 lg:pt-7">
        <p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-primary uppercase">
          Project workspace / outcome board
        </p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-[2.45rem] sm:leading-[1.05]">
          {project.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-y-4">
          <Metadata label="Project lead">
            <span className="flex size-6 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[0.5rem] text-muted-foreground">
              {getInitials(project.lead)}
            </span>
            {project.lead}
          </Metadata>
          <Metadata label="Assistant lead">
            <span className="flex size-6 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[0.5rem] text-muted-foreground">
              {getInitials(project.assistant)}
            </span>
            {project.assistant}
          </Metadata>
          <Metadata label="Project state">
            <span className="size-1.5 rounded-full bg-primary ring-3 ring-primary/10" />
            {project.state}
          </Metadata>
          <Metadata label="Outcome progress">
            {acceptedCount} accepted / {outcomes.length} total
          </Metadata>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-7">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Project stages
          </h2>
          <p className="mt-1 text-[0.69rem] text-muted-foreground">
            Each column is a stage. Each card is an outcome the project must
            produce.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openOutcomeDialog(stages[0]?.id ?? "")}
          >
            <Plus /> Outcome
          </Button>
          <Button size="sm" onClick={addStage}>
            <Plus /> Stage
          </Button>
        </div>
      </div>

      <div className="project-board-scroll overflow-x-auto px-5 pb-3 sm:px-7">
        <div className="flex w-max min-w-full items-start gap-3.5 pb-3">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              onOpenOutcome={(id) => {
                setSelectedOutcomeId(id);
                setReviewVisible(false);
              }}
              onAddOutcome={openOutcomeDialog}
            />
          ))}
          <button
            type="button"
            onClick={addStage}
            className="grid min-h-32 w-[20rem] shrink-0 place-items-center rounded-xl border border-dashed border-input bg-card/55 p-5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            + Add another stage
          </button>
        </div>
      </div>
      <p className="px-5 pt-1 font-mono text-[0.54rem] leading-4 tracking-[0.04em] text-muted-foreground uppercase sm:px-7">
        Project → Stage → Outcome → Department → Member → Features / Tasks →
        Output → Lead review
      </p>

      <div className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6">
        <LiquidGlass
          kind="control"
          renderKey={quickOpen ? "open" : "closed"}
          className="rounded-[1.15rem] border border-white/80"
          contentClassName="flex items-center gap-1 p-1.5"
        >
          {quickOpen ? (
            <>
              <button
                type="button"
                onClick={() => {
                  addStage();
                  setQuickOpen(false);
                }}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-card/35"
              >
                + Stage
              </button>
              <button
                type="button"
                onClick={() => {
                  openOutcomeDialog(stages[0]?.id ?? "");
                  setQuickOpen(false);
                }}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-card/35"
              >
                + Outcome
              </button>
            </>
          ) : null}
          <button
            type="button"
            aria-label={
              quickOpen ? "Close quick actions" : "Open quick actions"
            }
            aria-expanded={quickOpen}
            onClick={() => setQuickOpen((value) => !value)}
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_7px_17px_rgba(169,63,28,.16)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {quickOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          </button>
        </LiquidGlass>
      </div>

      <ProjectDialog
        open={dialog === "project"}
        onOpenChange={(open) => setDialog(open ? "project" : null)}
        onSubmit={setProject}
      />
      <SettingsDialog
        open={dialog === "settings"}
        onOpenChange={(open) => setDialog(open ? "settings" : null)}
        project={project}
        onSubmit={setProject}
      />
      <OutcomeDialog
        open={dialog === "outcome"}
        onOpenChange={(open) => setDialog(open ? "outcome" : null)}
        stages={stages}
        defaultStageId={outcomeStageId}
        onSubmit={addOutcome}
      />

      <InspectorDrawer
        open={Boolean(selectedOutcome)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOutcomeId(null);
            setReviewVisible(false);
          }
        }}
        title={selectedOutcome?.title ?? "Outcome details"}
        eyebrow={
          selectedOutcome ? `Outcome / ${selectedOutcome.state}` : "Outcome"
        }
      >
        {selectedOutcome ? (
          <>
            <InspectorSection label="Expected outcome">
              <p className="text-sm leading-6 text-muted-foreground">
                {selectedOutcome.description}
              </p>
            </InspectorSection>
            <InspectorSection label="Ownership">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[0.6rem] font-semibold",
                    departmentStyles[selectedOutcome.department] ??
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {selectedOutcome.department}
                </span>
                <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 font-mono text-[0.6rem] text-muted-foreground">
                  {selectedOutcome.member}
                </span>
              </div>
            </InspectorSection>
            <InspectorSection label="Features defined by assignee">
              <div className="divide-y divide-foreground/8 text-xs text-foreground/75">
                {[
                  "Dashboard shell and responsive layout",
                  "Live KPI data states",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <span>{feature}</span>
                    <Check className="size-3.5 text-primary" />
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span>Client activity timeline</span>
                  <CircleDot className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            </InspectorSection>
            <InspectorSection label="Current output">
              <div className="rounded-xl border border-border bg-card/55 p-3.5">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {selectedOutcome.output ?? "No output submitted"}
                    </p>
                    <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
                      Output preview remains a placeholder until project
                      artifacts are connected.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedOutcome.output}
                >
                  Open output
                </Button>
                <Button size="sm" onClick={() => setReviewVisible(true)}>
                  Compare with outcome
                </Button>
              </div>
            </InspectorSection>
            {reviewVisible ? (
              <InspectorSection label="Lead comparison">
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                  <p className="text-xs leading-5 text-muted-foreground">
                    Verify every acceptance condition before accepting the
                    outcome. Task count alone is not evidence of completion.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Request revision
                  </Button>
                  <Button size="sm" onClick={acceptSelectedOutcome}>
                    Accept outcome
                  </Button>
                </div>
              </InspectorSection>
            ) : null}
          </>
        ) : null}
      </InspectorDrawer>
    </div>
  );
}
