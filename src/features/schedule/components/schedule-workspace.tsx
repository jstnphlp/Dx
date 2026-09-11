"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Settings2,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { LiquidGlass } from "@/components/shared/liquid-glass";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
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
import {
  departments,
  members,
  scheduleBlocks,
  type DepartmentId,
} from "@/features/operations/demo-data";
import { cn } from "@/lib/utils";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const dates = [
  "Sep 7",
  "Sep 8",
  "Sep 9",
  "Sep 10",
  "Sep 11",
  "Sep 12",
  "Sep 13",
];
const hours = Array.from({ length: 17 }, (_, index) => index + 7);

function formatHour(hour: number) {
  const value = hour % 24;
  if (value === 0) return "12 AM";
  if (value === 12) return "12 PM";
  return `${value > 12 ? value - 12 : value} ${value >= 12 ? "PM" : "AM"}`;
}

export function ScheduleWorkspace() {
  const [mode, setMode] = useState<"team" | "shifts">("team");
  const [department, setDepartment] = useState<DepartmentId | "all">("all");
  const [person, setPerson] = useState("Nico Ramos");
  const [configOpen, setConfigOpen] = useState(false);
  const [timedIn, setTimedIn] = useState(false);
  const [week, setWeek] = useState(1);

  const visibleBlocks = useMemo(
    () =>
      scheduleBlocks.filter(
        (block) => department === "all" || block.department === department,
      ),
    [department],
  );
  const personBlocks = scheduleBlocks.filter(
    (block) => block.person === person,
  );
  const scheduledHours = personBlocks.reduce(
    (sum, block) => sum + block.duration,
    0,
  );

  return (
    <div className="relative min-h-svh pb-20">
      <WorkspaceToolbar section="Workspace" current="Schedule" />
      <PageContainer className="pt-5 lg:pt-6" width="wide">
        <PageHeader
          eyebrow="Planning and attendance"
          title={mode === "team" ? "Team Schedule" : "Shifts"}
          description={
            mode === "team"
              ? "A merged view of planned commitment across the whole team."
              : "Compare planned commitment with recorded work sessions for each teammate."
          }
          action={
            <Button onClick={() => setConfigOpen(true)}>
              <Settings2 /> Configure my schedule
            </Button>
          }
        />

        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-secondary p-3 shadow-[0_4px_15px_rgba(55,39,31,.025)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              size="sm"
              variant={mode === "team" ? "secondary" : "ghost"}
              onClick={() => setMode("team")}
            >
              <UsersRound /> Team schedule
            </Button>
            <Button
              size="sm"
              variant={mode === "shifts" ? "secondary" : "ghost"}
              onClick={() => setMode("shifts")}
            >
              <Clock3 /> Shifts
            </Button>
          </div>
          {mode === "team" ? (
            <div className="flex items-center gap-2">
              <Label
                htmlFor="department"
                className="font-mono text-[0.58rem] text-muted-foreground uppercase"
              >
                Department
              </Label>
              <Select
                id="department"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value as DepartmentId | "all")
                }
                className="h-9 w-44"
              >
                <option value="all">All departments</option>
                {(Object.keys(departments) as DepartmentId[]).map((id) => (
                  <option key={id} value={id}>
                    {departments[id].name}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <Select
              aria-label="Team member"
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              className="h-9 w-52"
            >
              {members.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </Select>
          )}
        </div>

        {mode === "team" ? (
          <TeamCalendar blocks={visibleBlocks} />
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary p-4 shadow-[0_4px_15px_rgba(55,39,31,.025)]">
              <div>
                <p className="font-mono text-[0.56rem] font-bold text-primary uppercase">
                  Commitment view
                </p>
                <h2 className="mt-1 text-base font-semibold">{person}</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous week"
                  disabled={week === 0}
                  onClick={() => setWeek((value) => Math.max(0, value - 1))}
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-24 text-center text-xs font-semibold">
                  Sep {week * 7 + 1}–{week * 7 + 7}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next week"
                  disabled={week === 3}
                  onClick={() => setWeek((value) => Math.min(3, value + 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Scheduled", `${scheduledHours}h`],
                ["Worked", week === 1 ? "14h 32m" : "0h"],
                [
                  "Variance",
                  week === 1
                    ? `−${Math.max(0, scheduledHours - 14)}h`
                    : `−${scheduledHours}h`,
                ],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className="rounded-xl border border-border/80 bg-secondary p-5 shadow-[0_4px_15px_rgba(55,39,31,.025)]"
                >
                  <p className="font-mono text-[0.56rem] font-bold text-muted-foreground uppercase">
                    {label}
                  </p>
                  <strong className="mt-2 block text-2xl tracking-tight">
                    {value}
                  </strong>
                </article>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)]">
              {days.map((day, index) => {
                const blocks = personBlocks.filter(
                  (block) => block.day === index,
                );
                const planned = blocks.reduce(
                  (sum, block) => sum + block.duration,
                  0,
                );
                return (
                  <div
                    key={day}
                    className="grid gap-3 border-b border-border/70 bg-muted/45 p-4 last:border-b-0 even:bg-secondary sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                  >
                    <div>
                      <strong className="text-sm">{day}</strong>
                      <p className="mt-1 font-mono text-[0.55rem] text-muted-foreground">
                        {dates[index]}
                      </p>
                    </div>
                    <div>
                      {blocks.length ? (
                        blocks.map((block) => (
                          <span
                            key={`${block.start}-${block.duration}`}
                            className="mr-2 inline-flex rounded-lg border border-primary/20 bg-primary/8 px-3 py-2 text-xs font-medium"
                          >
                            {formatHour(block.start)}–
                            {formatHour(block.start + block.duration)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Rest day / no schedule
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[0.6rem] font-bold text-muted-foreground">
                      {planned}h planned
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </PageContainer>

      <div className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6">
        <LiquidGlass
          kind="control"
          renderKey={timedIn ? "active" : "idle"}
          className="rounded-2xl"
          contentClassName="p-1.5"
        >
          <button
            type="button"
            onClick={() => setTimedIn((value) => !value)}
            className={cn(
              "flex min-w-48 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
              timedIn
                ? "bg-primary text-primary-foreground"
                : "bg-card/25 text-foreground hover:bg-card/45",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                timedIn ? "animate-pulse bg-white" : "bg-primary",
              )}
            />
            <span>
              <strong className="block text-sm">
                {timedIn ? "Time Out" : "Time In"}
              </strong>
              <small
                className={cn(
                  "mt-0.5 block text-[0.62rem]",
                  timedIn ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {timedIn
                  ? "Session in progress · 00:00"
                  : "Start a work session"}
              </small>
            </span>
          </button>
        </LiquidGlass>
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="font-mono text-[0.6rem] font-bold tracking-[.1em] text-primary uppercase">
              Schedule preferences
            </p>
            <DialogTitle>Configure my schedule</DialogTitle>
            <DialogDescription>
              Set the commitment used to generate your initial weekly plan.
              Changes remain local in this prototype.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weekly">Weekly hours</Label>
              <Input id="weekly" type="number" defaultValue={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily">Hours per day</Label>
              <Input id="daily" type="number" defaultValue={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest">Rest days</Label>
              <Input id="rest" type="number" defaultValue={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setConfigOpen(false)}>
              Generate schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamCalendar({
  blocks,
}: {
  blocks: ReadonlyArray<(typeof scheduleBlocks)[number]>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-[0_4px_15px_rgba(55,39,31,.025)]">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Merged weekly schedule</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sep 7–13 · {new Set(blocks.map((block) => block.person)).size}{" "}
            people shown
          </p>
        </div>
        <span className="hidden items-center gap-2 text-[0.65rem] text-muted-foreground sm:flex">
          <i className="size-2 rounded-full bg-primary" /> Your schedule{" "}
          <i className="ml-2 size-2 rounded-full bg-chart-4" /> Team
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[68rem] grid-cols-[5rem_repeat(7,minmax(8.5rem,1fr))]">
          <div className="border-r border-b border-border/70 bg-muted p-3 font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
            Time
          </div>
          {days.map((day, index) => (
            <div
              key={day}
              className="border-r border-b border-border/70 bg-muted p-3 text-center last:border-r-0"
            >
              <strong className="block text-xs">{day}</strong>
              <span className="mt-1 block font-mono text-[0.52rem] text-muted-foreground">
                {dates[index]}
              </span>
            </div>
          ))}
          <div className="relative border-r border-border/70">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 border-b border-border/50 px-2 pt-1 text-right font-mono text-[0.5rem] text-muted-foreground"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div
              key={day}
              className="relative border-r border-border/70 last:border-r-0"
            >
              {hours.map((hour) => (
                <div key={hour} className="h-12 border-b border-border/50" />
              ))}
              {blocks
                .filter((block) => block.day === dayIndex)
                .map((block, index, sameDay) => (
                  <div
                    key={`${block.person}-${block.start}`}
                    title={`${block.person}: ${formatHour(block.start)}–${formatHour(block.start + block.duration)}`}
                    className={cn(
                      "absolute overflow-hidden rounded-lg border px-2 py-1.5 text-[0.58rem] leading-4 shadow-sm",
                      block.person === "Nico Ramos"
                        ? "border-primary/25 bg-primary/90 text-primary-foreground"
                        : "border-chart-4/25 bg-chart-4/85 text-white",
                    )}
                    style={{
                      top: `${(block.start - 7) * 48 + 3}px`,
                      height: `${block.duration * 48 - 6}px`,
                      left: `${4 + (index % 2) * 49}%`,
                      width: sameDay.length > 1 ? "46%" : "94%",
                    }}
                  >
                    <strong className="block truncate">{block.person}</strong>
                    <span className="opacity-80">
                      {formatHour(block.start)}–
                      {formatHour(block.start + block.duration)}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
