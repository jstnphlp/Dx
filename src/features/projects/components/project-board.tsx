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
import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

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
  Accepted: "border-primary/25 bg-primary/7 text-[#a93f1c]",
  "For review": "border-[#8b5e4a]/25 bg-[#8b5e4a]/7 text-[#7f5543]",
  "In progress": "border-[#456173]/25 bg-[#456173]/7 text-[#456173]",
  Blocked: "border-[#7a6458]/28 bg-[#7a6458]/7 text-[#6f594d]",
  Planned: "border-[#77716e]/18 bg-[#77716e]/7 text-[#77716e]",
};

const departmentStyles: Record<string, string> = {
  Creatives: "border-[#8b5e4a]/20 bg-[#8b5e4a]/6 text-[#815641]",
  "R&D": "border-[#456173]/20 bg-[#456173]/6 text-[#456173]",
  "S&M": "border-[#8b6b25]/20 bg-[#8b6b25]/6 text-[#7b5d20]",
};

type DialogName = "project" | "settings" | "outcome" | null;

function recalculateStage(stage: ProjectStage): ProjectStage {
  if (!stage.outcomes.length) return { ...stage, progress: 0 };
  const accepted = stage.outcomes.filter((outcome) => outcome.state === "Accepted").length;
  if (accepted === stage.outcomes.length) return { ...stage, progress: 100 };
  return stage;
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[0.62rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}

function ProjectDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (project: ProjectSummary) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    onSubmit({ name, description: String(data.get("description") ?? "").trim(), lead: String(data.get("lead") ?? "Rex Jumawid"), assistant: String(data.get("assistant") ?? "None"), state: "Active" });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#d8cdc4] bg-[#fffdfa] sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">Create project</p>
            <DialogTitle>New project details</DialogTitle>
            <DialogDescription>Create a project shell. Persistence will be wired when the projects data model is approved.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FormField label="Project name"><Input name="name" defaultValue="New Client Platform" /></FormField>
            <FormField label="Project description"><Textarea name="description" defaultValue="Build a software solution based on the client's approved scope, expected outcomes, and business objectives." /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project lead"><Select name="lead" defaultValue="Rex Jumawid"><option>Rex Jumawid</option><option>Justin Cruz</option><option>Bea Santos</option><option>Marco Reyes</option></Select></FormField>
              <FormField label="Assistant lead"><Select name="assistant" defaultValue="Ana Mendoza"><option>None</option><option>Ana Mendoza</option><option>Nico Ramos</option><option>Carlo Lim</option></Select></FormField>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Create project</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ open, onOpenChange, project, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; project: ProjectSummary; onSubmit: (project: ProjectSummary) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({ ...project, name: String(data.get("name") ?? project.name).trim() || project.name, lead: String(data.get("lead") ?? project.lead), assistant: String(data.get("assistant") ?? project.assistant), state: String(data.get("state") ?? project.state) as ProjectSummary["state"] });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#d8cdc4] bg-[#fffdfa]">
        <form onSubmit={submit}>
          <DialogHeader><p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">Project controls</p><DialogTitle>Project settings</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <FormField label="Project name"><Input name="name" defaultValue={project.name} /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project lead"><Select name="lead" defaultValue={project.lead}><option>Rex Jumawid</option><option>Justin Cruz</option><option>Bea Santos</option><option>Marco Reyes</option></Select></FormField>
              <FormField label="Assistant lead"><Select name="assistant" defaultValue={project.assistant}><option>None</option><option>Ana Mendoza</option><option>Nico Ramos</option><option>Carlo Lim</option></Select></FormField>
            </div>
            <FormField label="Project state"><Select name="state" defaultValue={project.state}><option>Active</option><option>Paused</option><option>Completed</option></Select></FormField>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save settings</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeDialog({ open, onOpenChange, stages, defaultStageId, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; stages: ProjectStage[]; defaultStageId: string; onSubmit: (stageId: string, outcome: Outcome) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    onSubmit(String(data.get("stage") ?? defaultStageId), { id: `outcome-${Date.now()}`, title, description: String(data.get("description") ?? "").trim() || "Acceptance criteria not yet defined.", state: String(data.get("state") ?? "Planned") as OutcomeState, department: String(data.get("department") ?? "R&D"), member: String(data.get("member") ?? "Unassigned").trim() || "Unassigned" });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#d8cdc4] bg-[#fffdfa] sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader><p className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-primary uppercase">Project lead action</p><DialogTitle>Define project outcome</DialogTitle><DialogDescription>Assign the expected result first. Features and tasks come after the outcome exists.</DialogDescription></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Stage"><Select name="stage" defaultValue={defaultStageId}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.title}</option>)}</Select></FormField>
              <FormField label="Owning department"><Select name="department" defaultValue="Creatives"><option>R&D</option><option>Creatives</option><option>S&M</option></Select></FormField>
            </div>
            <FormField label="Outcome"><Input name="title" placeholder="Approved responsive application prototype" /></FormField>
            <FormField label="Acceptance condition"><Textarea name="description" placeholder="What must be true for this outcome to be accepted?" /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Assigned member"><Input name="member" placeholder="Bea Santos" /></FormField>
              <FormField label="State"><Select name="state" defaultValue="Planned"><option>Planned</option><option>In progress</option><option>For review</option><option>Blocked</option><option>Accepted</option></Select></FormField>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Add outcome</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Metadata({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-36 border-r border-[#5c4139]/12 pr-5 last:border-r-0"><p className="mb-1.5 font-mono text-[0.58rem] font-bold tracking-[0.1em] text-[#62534c]/70 uppercase">{label}</p><div className="flex min-h-6 items-center gap-2 text-xs font-semibold text-[#292321]">{children}</div></div>;
}

function OutcomeCard({ outcome, onOpen }: { outcome: Outcome; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group w-full rounded-xl border border-[#594239]/11 bg-[#fffdfa]/98 p-3.5 text-left shadow-[0_3px_10px_rgba(17,24,39,.035)] transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-[#b9aaa0] hover:shadow-[0_8px_22px_rgba(44,31,25,.07)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <div className="flex items-start justify-between gap-3"><h3 className="text-[0.82rem] leading-5 font-semibold tracking-[-0.01em] text-[#221d1a]">{outcome.title}</h3><span className={cn("shrink-0 rounded-full border px-2 py-1 font-mono text-[0.52rem] font-bold tracking-[0.04em] uppercase", stateStyles[outcome.state])}>{outcome.state}</span></div>
      <p className="mt-2 text-[0.69rem] leading-5 text-[#6b625d]">{outcome.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5"><span className={cn("rounded-full border px-2 py-1 font-mono text-[0.54rem] font-semibold", departmentStyles[outcome.department] ?? "border-border bg-muted text-muted-foreground")}>{outcome.department}</span><span className="rounded-full border border-[#d8cec6] bg-[#f3ece6] px-2 py-1 font-mono text-[0.54rem] text-[#625951]">{outcome.member}</span></div>
      {outcome.dependency ? <div className="mt-3 border-l-2 border-[#7a6458] bg-[#7a6458]/6 px-2.5 py-2 text-[0.63rem] leading-4 text-[#6f594d]"><strong className="block font-semibold">Dependency</strong>{outcome.dependency}</div> : null}
      {outcome.tasks || outcome.features ? <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#594239]/8 pt-2.5"><div><p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-[#817770] uppercase">Tasks</p><p className="mt-1 text-[0.63rem] text-[#514943]">{outcome.tasks ?? "—"}</p></div><div><p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-[#817770] uppercase">Features</p><p className="mt-1 text-[0.63rem] text-[#514943]">{outcome.features ?? "—"}</p></div></div> : null}
      {outcome.output ? <div className="mt-3 rounded-lg border border-primary/14 bg-primary/4 px-2.5 py-2"><p className="font-mono text-[0.5rem] font-bold tracking-[0.08em] text-[#a93f1c] uppercase">Current output</p><p className="mt-1 text-[0.64rem] font-medium text-[#514943]">{outcome.output}</p></div> : null}
      <div className="mt-3 flex items-center justify-between border-t border-[#594239]/8 pt-2.5 font-mono text-[0.5rem] text-[#817770]"><span>Updated recently</span><span className="flex items-center gap-0.5 font-sans text-[0.62rem] font-semibold text-primary">Inspect <ChevronRight className="size-3" /></span></div>
    </button>
  );
}

function StageColumn({ stage, onOpenOutcome, onAddOutcome }: { stage: ProjectStage; onOpenOutcome: (id: string) => void; onAddOutcome: (stageId: string) => void }) {
  return (
    <section className="min-h-[590px] w-[20rem] shrink-0 overflow-hidden rounded-xl border border-[#6f5b50]/14 bg-[#efe8e2]/97 shadow-[0_4px_15px_rgba(55,39,31,.025)]">
      <header className="border-b border-[#6f5b50]/11 bg-[#f4eee9]/98 px-4 py-3.5"><p className="font-mono text-[0.55rem] font-bold tracking-[0.1em] text-[#817770] uppercase">Stage {stage.number}</p><div className="mt-1.5 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold tracking-[-0.015em] text-[#292321]">{stage.title}</h2><span className="rounded-full border border-[#d8cec6] bg-[#e9dfd7] px-2 py-0.5 font-mono text-[0.52rem] text-[#6d645f]">{stage.outcomes.length} outcomes</span></div><div className="mt-3 flex items-center gap-2"><div className="h-1 flex-1 overflow-hidden rounded-full bg-[#ded3c9]"><div className="h-full rounded-full bg-primary" style={{ width: `${stage.progress}%` }} /></div><span className="font-mono text-[0.5rem] text-[#817770]">{stage.progress}%</span></div></header>
      <div className="flex flex-col gap-2.5 p-2.5">{stage.outcomes.map((outcome) => <OutcomeCard key={outcome.id} outcome={outcome} onOpen={() => onOpenOutcome(outcome.id)} />)}<button type="button" onClick={() => onAddOutcome(stage.id)} className="w-full rounded-xl border border-dashed border-[#c7b9ae] px-3 py-2.5 text-[0.65rem] font-medium text-[#776d67] transition-colors hover:border-[#a99688] hover:bg-[#f8f3ee] hover:text-[#3f3834] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">+ Add outcome to stage</button></div>
    </section>
  );
}

function InspectorSection({ label, children }: { label: string; children: ReactNode }) {
  return <section className="border-b border-[#5c4b44]/10 px-5 py-5 last:border-b-0"><p className="mb-2.5 font-mono text-[0.58rem] font-bold tracking-[0.12em] text-[#736a64] uppercase">{label}</p>{children}</section>;
}

export function ProjectBoard() {
  const [project, setProject] = useState<ProjectSummary>(demoProject);
  const [stages, setStages] = useState<ProjectStage[]>(demoStages);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [outcomeStageId, setOutcomeStageId] = useState(demoStages[0]?.id ?? "");
  const [quickOpen, setQuickOpen] = useState(false);
  const outcomes = useMemo(() => stages.flatMap((stage) => stage.outcomes), [stages]);
  const acceptedCount = outcomes.filter((outcome) => outcome.state === "Accepted").length;
  const selectedOutcome = outcomes.find((outcome) => outcome.id === selectedOutcomeId);

  function addStage() {
    const number = stages.length + 1;
    setStages((current) => [...current, { id: `stage-${Date.now()}`, number: String(number).padStart(2, "0"), title: `New Stage ${number}`, progress: 0, outcomes: [] }]);
  }
  function addOutcome(stageId: string, outcome: Outcome) {
    setStages((current) => current.map((stage) => stage.id === stageId ? recalculateStage({ ...stage, outcomes: [...stage.outcomes, outcome] }) : stage));
  }
  function openOutcomeDialog(stageId: string) { setOutcomeStageId(stageId); setDialog("outcome"); }
  function acceptSelectedOutcome() {
    if (!selectedOutcomeId) return;
    setStages((current) => current.map((stage) => recalculateStage({ ...stage, outcomes: stage.outcomes.map((outcome) => outcome.id === selectedOutcomeId ? { ...outcome, state: "Accepted" } : outcome) })));
    setReviewVisible(false);
  }

  return (
    <div className="relative min-h-svh pb-12">
      <div className="sticky top-0 z-20 hidden h-[4.875rem] items-center justify-between gap-4 px-7 py-3 pointer-events-none lg:flex">
        <LiquidGlass kind="toolbar" renderKey={project.name} className="flex h-12 min-w-56 items-center rounded-[1.15rem] border border-white/80 px-4 pointer-events-auto"><div className="flex items-center gap-2 text-xs text-[#776d67]"><span>Projects</span><span className="text-[#aaa09a]">/</span><strong className="font-semibold text-[#282321]">{project.name}</strong></div></LiquidGlass>
        <LiquidGlass kind="toolbar" renderKey={`actions-${project.name}`} className="flex h-12 items-center gap-1 rounded-[1.15rem] border border-white/80 p-1 pointer-events-auto"><Button variant="ghost" size="lg" className="rounded-xl bg-transparent text-[#3f3834] hover:bg-white/30" onClick={() => setDialog("settings")}><Settings2 /> Project settings</Button><Button size="lg" className="rounded-xl" onClick={() => setDialog("project")}><Plus /> New project</Button></LiquidGlass>
      </div>

      <header className="border-b border-[#523f39]/11 bg-transparent px-5 pt-8 pb-6 sm:px-7 lg:px-7 lg:pt-7"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-primary uppercase">Project workspace / outcome board</p><h1 className="mt-2.5 text-3xl font-medium tracking-[-0.045em] text-[#1d1917] sm:text-[2.45rem] sm:leading-[1.05]">{project.name}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#4c423d]/80">{project.description}</p><div className="mt-6 flex flex-wrap gap-y-4"><Metadata label="Project lead"><span className="flex size-6 items-center justify-center rounded-full border border-[#d8cec6] bg-[#e9dfd7] font-mono text-[0.5rem] text-[#574d47]">{getInitials(project.lead)}</span>{project.lead}</Metadata><Metadata label="Assistant lead"><span className="flex size-6 items-center justify-center rounded-full border border-[#d8cec6] bg-[#e9dfd7] font-mono text-[0.5rem] text-[#574d47]">{getInitials(project.assistant)}</span>{project.assistant}</Metadata><Metadata label="Project state"><span className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(203,77,34,.09)]" />{project.state}</Metadata><Metadata label="Outcome progress">{acceptedCount} accepted / {outcomes.length} total</Metadata></div></header>

      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-7"><div><h2 className="text-sm font-semibold text-[#292321]">Project stages</h2><p className="mt-1 text-[0.69rem] text-[#736a64]">Each column is a stage. Each card is an outcome the project must produce.</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="border-[#d7cdc5] bg-[#faf7f4]" onClick={() => openOutcomeDialog(stages[0]?.id ?? "")}><Plus /> Outcome</Button><Button size="sm" onClick={addStage}><Plus /> Stage</Button></div></div>

      <div className="project-board-scroll overflow-x-auto px-5 pb-3 sm:px-7"><div className="flex w-max min-w-full items-start gap-3.5 pb-3">{stages.map((stage) => <StageColumn key={stage.id} stage={stage} onOpenOutcome={(id) => { setSelectedOutcomeId(id); setReviewVisible(false); }} onAddOutcome={openOutcomeDialog} />)}<button type="button" onClick={addStage} className="grid min-h-32 w-[20rem] shrink-0 place-items-center rounded-xl border border-dashed border-[#c7b9ae] bg-[#fffdfa]/55 p-5 text-xs font-medium text-[#6d645f] transition-colors hover:bg-[#fffdfa]/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">+ Add another stage</button></div></div>
      <p className="px-5 pt-1 font-mono text-[0.54rem] leading-4 tracking-[0.04em] text-[#817770] uppercase sm:px-7">Project → Stage → Outcome → Department → Member → Features / Tasks → Output → Lead review</p>

      <div className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6"><LiquidGlass kind="control" renderKey={quickOpen ? "open" : "closed"} className="flex items-center gap-1 rounded-[1.15rem] border border-white/80 p-1.5">{quickOpen ? <><button type="button" onClick={() => { addStage(); setQuickOpen(false); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-[#4a403a] hover:bg-white/35">+ Stage</button><button type="button" onClick={() => { openOutcomeDialog(stages[0]?.id ?? ""); setQuickOpen(false); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-[#4a403a] hover:bg-white/35">+ Outcome</button></> : null}<button type="button" aria-label={quickOpen ? "Close quick actions" : "Open quick actions"} aria-expanded={quickOpen} onClick={() => setQuickOpen((value) => !value)} className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_7px_17px_rgba(169,63,28,.16)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none">{quickOpen ? <X className="size-4" /> : <Plus className="size-4" />}</button></LiquidGlass></div>

      <ProjectDialog open={dialog === "project"} onOpenChange={(open) => setDialog(open ? "project" : null)} onSubmit={setProject} />
      <SettingsDialog open={dialog === "settings"} onOpenChange={(open) => setDialog(open ? "settings" : null)} project={project} onSubmit={setProject} />
      <OutcomeDialog open={dialog === "outcome"} onOpenChange={(open) => setDialog(open ? "outcome" : null)} stages={stages} defaultStageId={outcomeStageId} onSubmit={addOutcome} />

      <InspectorDrawer open={Boolean(selectedOutcome)} onOpenChange={(open) => { if (!open) { setSelectedOutcomeId(null); setReviewVisible(false); } }} title={selectedOutcome?.title ?? "Outcome details"} eyebrow={selectedOutcome ? `Outcome / ${selectedOutcome.state}` : "Outcome"} renderKey={`${selectedOutcome?.id ?? "none"}-${selectedOutcome?.state ?? "none"}-${reviewVisible}`}>
        {selectedOutcome ? <><InspectorSection label="Expected outcome"><p className="text-sm leading-6 text-[#625951]">{selectedOutcome.description}</p></InspectorSection><InspectorSection label="Ownership"><div className="flex flex-wrap gap-2"><span className={cn("rounded-full border px-2.5 py-1 font-mono text-[0.6rem] font-semibold", departmentStyles[selectedOutcome.department] ?? "border-border bg-muted text-muted-foreground")}>{selectedOutcome.department}</span><span className="rounded-full border border-[#d8cec6] bg-white/70 px-2.5 py-1 font-mono text-[0.6rem] text-[#625951]">{selectedOutcome.member}</span></div></InspectorSection><InspectorSection label="Features defined by assignee"><div className="divide-y divide-[#5c4b44]/8 text-xs text-[#514943]">{["Dashboard shell and responsive layout", "Live KPI data states"].map((feature) => <div key={feature} className="flex items-center justify-between gap-4 py-2.5"><span>{feature}</span><Check className="size-3.5 text-primary" /></div>)}<div className="flex items-center justify-between gap-4 py-2.5"><span>Client activity timeline</span><CircleDot className="size-3.5 text-[#817770]" /></div></div></InspectorSection><InspectorSection label="Current output"><div className="rounded-xl border border-[#d8cec6] bg-white/55 p-3.5"><div className="flex items-start gap-3"><FileText className="mt-0.5 size-4 text-primary" /><div><p className="text-xs font-semibold text-[#342e2b]">{selectedOutcome.output ?? "No output submitted"}</p><p className="mt-1 text-[0.66rem] leading-5 text-[#736a64]">Output preview remains a placeholder until project artifacts are connected.</p></div></div></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={!selectedOutcome.output}>Open output</Button><Button size="sm" onClick={() => setReviewVisible(true)}>Compare with outcome</Button></div></InspectorSection>{reviewVisible ? <InspectorSection label="Lead comparison"><div className="rounded-xl border border-primary/14 bg-primary/4 p-3.5"><p className="text-xs leading-5 text-[#625951]">Verify every acceptance condition before accepting the outcome. Task count alone is not evidence of completion.</p></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm">Request revision</Button><Button size="sm" onClick={acceptSelectedOutcome}>Accept outcome</Button></div></InspectorSection> : null}</> : null}
      </InspectorDrawer>
    </div>
  );
}
