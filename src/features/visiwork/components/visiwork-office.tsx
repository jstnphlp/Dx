"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  FolderKanban,
  Radio,
  Send,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  departments,
  initials,
  members,
  projects,
  type DepartmentId,
} from "@/features/operations/demo-data";

type View = "departments" | "projects";

const initialMessages = [
  {
    author: "Rex Jumawid",
    text: "Use General Chat for cross-company coordination and handoffs.",
    time: "8:45 AM",
  },
  {
    author: "Bea Santos",
    text: "The latest creative output is ready for review.",
    time: "9:10 AM",
  },
];

export function VisiworkOffice() {
  const [view, setView] = useState<View>("departments");
  const [room, setRoom] = useState<DepartmentId | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const visibleProjects = useMemo(
    () =>
      room
        ? projects.filter((project) => project.departments.includes(room))
        : projects,
    [room],
  );

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = String(data.get("message") ?? "").trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { author: "You", text, time: "Now" },
    ]);
    form.reset();
  }

  return (
    <div className="relative min-h-svh pb-10">
      <WorkspaceToolbar
        section="Workspace"
        current={room ? departments[room].name : "VisiWork"}
      />
      <PageContainer className="pt-5 lg:pt-6" width="wide">
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
                <ArrowLeft /> Bird&apos;s view
              </Button>
            ) : (
              <div className="flex rounded-xl border border-border/80 bg-secondary p-1 shadow-[0_4px_15px_rgba(55,39,31,.025)]">
                <Button
                  size="sm"
                  variant={view === "departments" ? "secondary" : "ghost"}
                  onClick={() => setView("departments")}
                >
                  <Building2 /> Departments
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
          <section className="min-w-0">
            {room ? (
              <div className="space-y-3">
                {visibleProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : view === "departments" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {(Object.keys(departments) as DepartmentId[]).map((id) => {
                  const department = departments[id];
                  const people = members.filter(
                    (member) => member.department === id,
                  );
                  const active = people.filter((member) => member.working);
                  const work = projects.filter((project) =>
                    project.departments.includes(id),
                  );
                  return (
                    <article
                      key={id}
                      className="overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)]"
                    >
                      <div className="flex items-start justify-between gap-4 border-b border-border/80 bg-muted px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl border border-border bg-secondary text-primary">
                            <Building2 className="size-4" />
                          </span>
                          <div>
                            <h2 className="font-semibold">{department.name}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {department.tagline}
                            </p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 font-mono text-[0.58rem] font-bold text-primary-strong uppercase">
                          <Radio className="size-3" /> {active.length} working
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {people.map((person) => (
                          <div
                            key={person.id}
                            className="rounded-xl border border-border/80 bg-card p-3 shadow-[0_3px_10px_rgba(55,39,31,.025)]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="grid size-7 place-items-center rounded-full bg-muted font-mono text-[0.55rem] font-bold">
                                {initials(person.name)}
                              </span>
                              <strong className="truncate text-xs">
                                {person.name}
                              </strong>
                            </div>
                            <p className="mt-2 truncate text-[0.65rem] text-muted-foreground">
                              {person.working ? "Working now" : "Offline"}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-border/80 bg-muted/55 px-4 py-3 text-xs text-muted-foreground">
                        <span>
                          {work.length} active project
                          {work.length === 1 ? "" : "s"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRoom(id)}
                        >
                          Enter office <ArrowUpRight />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          <aside className="flex min-h-[34rem] flex-col overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)] xl:sticky xl:top-24 xl:h-[calc(100svh-8rem)]">
            <header className="flex items-center justify-between border-b border-border/80 bg-muted px-4 py-3.5">
              <div>
                <p className="font-mono text-[0.56rem] font-bold tracking-[.12em] text-primary uppercase">
                  {room ? departments[room].name : "General room"}
                </p>
                <h2 className="mt-1 text-sm font-semibold">Team chat</h2>
              </div>
              <span className="flex items-center gap-1 font-mono text-[0.56rem] font-bold text-primary">
                <span className="size-1.5 rounded-full bg-primary" /> LIVE
              </span>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.author}-${index}`}
                  className={cn(
                    "max-w-[88%]",
                    message.author === "You" && "ml-auto",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl border border-border/80 bg-card p-3 text-xs leading-5 shadow-[0_3px_10px_rgba(55,39,31,.025)]",
                      message.author === "You" &&
                        "border-primary/20 bg-primary/8",
                    )}
                  >
                    <strong className="mb-1 block text-[0.68rem]">
                      {message.author}
                    </strong>
                    {message.text}
                  </div>
                  <p className="mt-1 px-1 font-mono text-[0.52rem] text-muted-foreground">
                    {message.time}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={sendMessage}
              className="flex gap-2 border-t border-border/80 bg-muted/55 p-3"
            >
              <input
                name="message"
                aria-label="Message team"
                placeholder="Message everyone…"
                className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
              <Button size="icon" aria-label="Send message">
                <Send />
              </Button>
            </form>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_10px_30px_rgba(55,39,31,.04)]">
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.55rem] font-bold tracking-[.1em] text-primary uppercase">
              Company project
            </p>
            <h2 className="mt-1.5 text-base font-semibold">{project.title}</h2>
          </div>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-[0.55rem] font-bold uppercase">
            {project.status}
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
              Open outcomes
            </p>
            <strong className="mt-1 block text-sm">
              {project.openOutcomes} / {project.totalOutcomes}
            </strong>
          </div>
          <div>
            <p className="font-mono text-[0.52rem] font-bold text-muted-foreground uppercase">
              Progress
            </p>
            <strong className="mt-1 block text-sm">{project.progress}%</strong>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.departments.map((id) => (
            <span
              key={id}
              className="rounded-full bg-secondary px-2 py-1 font-mono text-[0.52rem] text-muted-foreground"
            >
              {departments[id].short}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4 text-[0.68rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UsersRound className="size-3.5" /> {project.workers.length || "No"}{" "}
            working
          </span>
          <span className="font-semibold text-primary">Open workspace →</span>
        </div>
      </div>
    </article>
  );
}
