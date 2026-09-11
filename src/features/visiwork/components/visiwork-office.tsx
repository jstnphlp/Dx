"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  FolderKanban,
  Radio,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { departments } from "@/features/operations/demo-data";
import {
  projectProgress,
  useOperationalDemo,
  type DepartmentId,
  type OperationalProject,
} from "@/features/operations/store";
import { cn } from "@/lib/utils";

type View = "departments" | "projects";

export function VisiworkOffice() {
  const operations = useOperationalDemo();
  const [view, setView] = useState<View>("departments");
  const [room, setRoom] = useState<DepartmentId | null>(null);
  const [preview, setPreview] = useState<DepartmentId | null>(null);
  const [message, setMessage] = useState("");
  const roomId = room ?? "general";
  const visibleProjects = useMemo(
    () =>
      room
        ? operations.state.projects.filter((project) =>
            project.departments.includes(room),
          )
        : operations.state.projects,
    [operations.state.projects, room],
  );
  const messages = operations.state.roomMessages[roomId] ?? [];
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    operations.sendRoomMessage(roomId, message);
    setMessage("");
  }

  return (
    <div className="relative min-h-svh pb-16">
      <WorkspaceToolbar
        section="Workspace"
        current={room ? departments[room].name : "VisiWork"}
      />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="Live company workspace"
          title={
            room ? `${departments[room].name} Department View` : "VisiWork"
          }
          description={
            room
              ? "Projects, stages, outcomes, and people this department is responsible for."
              : "See where people are working, what projects are moving, and where a handoff needs attention."
          }
          action={
            room ? (
              <Button variant="outline" onClick={() => setRoom(null)}>
                <ArrowLeft /> Back to Bird&apos;s View
              </Button>
            ) : (
              <div className="flex rounded-lg bg-secondary p-1">
                <Button
                  size="sm"
                  variant={view === "departments" ? "secondary" : "ghost"}
                  onClick={() => setView("departments")}
                >
                  <Building2 /> Department
                </Button>
                <Button
                  size="sm"
                  variant={view === "projects" ? "secondary" : "ghost"}
                  onClick={() => setView("projects")}
                >
                  <FolderKanban /> Projects
                </Button>
              </div>
            )
          }
        />
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="min-w-0">
            {room ? (
              <DepartmentRoom department={room} projects={visibleProjects} />
            ) : view === "projects" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {operations.state.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {lzDepartments().map((id) => {
                    const members = operations.state.members.filter(
                      (member) => member.department === id,
                    );
                    const projects = operations.state.projects.filter(
                      (project) => project.departments.includes(id),
                    );
                    return (
                      <article
                        key={id}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                      >
                        <header className="flex items-start justify-between gap-3 border-b border-border bg-secondary p-4">
                          <div className="flex gap-3">
                            <span className="grid size-10 place-items-center rounded-xl bg-card text-primary">
                              <Building2 className="size-4" />
                            </span>
                            <div>
                              <h2 className="text-sm font-semibold">
                                {departments[id].name}
                              </h2>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {departments[id].tagline}
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 rounded-full bg-card px-2 py-1 font-mono text-[0.52rem] text-primary">
                            <Radio className="size-3" />
                            {
                              members.filter((member) => member.working).length
                            }{" "}
                            working
                          </span>
                        </header>
                        <div className="grid grid-cols-2 gap-2 p-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="rounded-lg bg-secondary p-3"
                            >
                              <strong className="block truncate text-xs">
                                {member.name}
                              </strong>
                              <span className="mt-1 block text-[0.62rem] text-muted-foreground">
                                {member.working ? "Working now" : "Offline"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <footer className="flex items-center justify-between border-t border-border p-3">
                          <button
                            type="button"
                            onClick={() => setPreview(id)}
                            className="text-xs text-muted-foreground"
                          >
                            {projects.length} projects · Preview
                          </button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRoom(id)}
                          >
                            Enter office <ArrowUpRight />
                          </Button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
                {preview ? (
                  <DepartmentPreview
                    department={preview}
                    onClose={() => setPreview(null)}
                  />
                ) : null}
              </>
            )}
          </main>
          <aside className="flex min-h-[34rem] flex-col overflow-hidden rounded-xl border border-border bg-card xl:sticky xl:top-24 xl:h-[calc(100svh-8rem)]">
            <header className="flex items-center justify-between border-b border-border bg-secondary p-4">
              <div>
                <p className="font-mono text-[0.54rem] font-bold text-primary uppercase">
                  {room ? departments[room].name : "General room"}
                </p>
                <h2 className="mt-1 text-sm font-semibold">Team chat</h2>
              </div>
              <span className="flex items-center gap-1 font-mono text-[0.52rem] text-primary">
                <i className="size-1.5 rounded-full bg-primary" /> LIVE
              </span>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((item) => (
                <article
                  key={item.id}
                  className={cn(
                    "max-w-[90%] rounded-xl bg-secondary p-3",
                    item.author === operations.currentMember.name &&
                      "ml-auto bg-primary/8",
                  )}
                >
                  <strong className="text-[0.65rem]">{item.author}</strong>
                  <p className="mt-1 text-xs leading-5">{item.text}</p>
                  <time className="mt-1 block font-mono text-[0.5rem] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </time>
                </article>
              ))}
            </div>
            <form
              onSubmit={send}
              className="flex gap-2 border-t border-border p-3"
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  room
                    ? `Message ${departments[room].short}…`
                    : "Message everyone…"
                }
                aria-label="Team message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <Send />
              </Button>
            </form>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}

function DepartmentPreview({
  department,
  onClose,
}: {
  department: DepartmentId;
  onClose: () => void;
}) {
  const { state } = useOperationalDemo();
  const projects = state.projects.filter((project) =>
    project.departments.includes(department),
  );
  return (
    <section className="mt-4 rounded-xl border border-border bg-card p-4">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            {departments[department].name} Department View
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Project → Stage → Outcome
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close preview"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>
      <div className="mt-4 space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg bg-secondary p-3">
            <strong className="text-xs">{project.title}</strong>
            {project.stages.map((stage) => (
              <div key={stage.id} className="mt-2 border-l border-border pl-3">
                <span className="text-[0.62rem] font-semibold">
                  {stage.name}
                </span>
                {stage.outcomes
                  .filter((outcome) => outcome.departments.includes(department))
                  .map((outcome) => (
                    <p
                      key={outcome.id}
                      className="mt-1 text-[0.62rem] text-muted-foreground"
                    >
                      {outcome.title} · {outcome.status}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
function DepartmentRoom({
  department,
  projects,
}: {
  department: DepartmentId;
  projects: OperationalProject[];
}) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">
          {departments[department].name} Department View
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Projects, stages, and outcomes this department is responsible for.
        </p>
      </header>
      {projects.map((project) => (
        <section
          key={project.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{project.title}</h3>
            <Link
              href={`/projects?project=${project.id}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Open project <ArrowUpRight />
            </Link>
          </div>
          {project.stages.map((stage) => {
            const outcomes = stage.outcomes.filter((outcome) =>
              outcome.departments.includes(department),
            );
            return outcomes.length ? (
              <div key={stage.id} className="mt-3 rounded-lg bg-secondary p-3">
                <strong className="text-xs">{stage.name}</strong>
                {outcomes.map((outcome) => (
                  <Link
                    key={outcome.id}
                    href={`/projects?project=${project.id}&outcome=${outcome.id}`}
                    className="mt-2 flex items-center justify-between rounded-lg bg-card p-3 text-xs"
                  >
                    <span>{outcome.title}</span>
                    <span className="text-muted-foreground">
                      {outcome.status} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : null;
          })}
        </section>
      ))}
    </div>
  );
}
function ProjectCard({ project }: { project: OperationalProject }) {
  const outcomes = project.stages.flatMap((stage) => stage.outcomes);
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.52rem] font-bold text-primary uppercase">
            Company project
          </p>
          <h2 className="mt-1 text-base font-semibold">{project.title}</h2>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 font-mono text-[0.52rem] text-muted-foreground">
          {project.status}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
        <i
          className="block h-full bg-primary"
          style={{ width: `${projectProgress(project)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[0.62rem] text-muted-foreground">
        <span>
          {outcomes.filter((outcome) => outcome.status !== "Accepted").length}{" "}
          open outcomes
        </span>
        <span>{projectProgress(project)}%</span>
      </div>
      <Link
        href={`/projects?project=${project.id}`}
        className={buttonVariants({
          variant: "ghost",
          className: "mt-4 w-full justify-between border-t border-border",
        })}
      >
        <UsersRound /> Open workspace <ArrowUpRight />
      </Link>
    </article>
  );
}
function lzDepartments() {
  return Object.keys(departments) as DepartmentId[];
}
