"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Settings2,
  UsersRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { InspectorDrawer } from "@/components/shared/inspector-drawer";
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
import { TimePicker } from "@/components/ui/time-picker";
import { departments } from "@/features/operations/demo-data";
import {
  sessionHours,
  sessionIsInWeek,
  useOperationalDemo,
  type DepartmentId,
  type ScheduleBlock,
} from "@/features/operations/store";
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
const hours = Array.from({ length: 17 }, (_, index) => index + 7);

export function ScheduleWorkspace() {
  const operations = useOperationalDemo();
  const [mode, setMode] = useState<"team" | "shifts">("team");
  const [department, setDepartment] = useState<DepartmentId | "all">("all");
  const [selectedMembers, setSelectedMembers] = useState(() =>
    operations.state.members.map((member) => member.id),
  );
  const [personId, setPersonId] = useState(operations.currentMember.id);
  const [week, setWeek] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [drawerDay, setDrawerDay] = useState<number | null>(null);
  const person =
    operations.state.members.find((member) => member.id === personId) ??
    operations.currentMember;
  const blocks = operations.state.schedule.filter((block) =>
    department === "all"
      ? selectedMembers.includes(block.memberId)
      : selectedMembers.includes(block.memberId) &&
        operations.state.members.find((member) => member.id === block.memberId)
          ?.department === department,
  );
  const personBlocks = effectiveBlocks(
    operations.state.schedule,
    operations.state.overrides,
    personId,
    week,
  );
  const planned = personBlocks.reduce(
    (sum, block) => sum + block.end - block.start,
    0,
  );
  const worked = operations.state.sessions
    .filter(
      (session) =>
        session.memberId === personId && sessionIsInWeek(session, week),
    )
    .reduce((sum, session) => sum + sessionHours(session), 0);

  return (
    <div className="relative min-h-svh pb-20">
      <WorkspaceToolbar section="Workspace" current="Schedule" />
      <PageContainer className="pt-5 lg:pt-6">
        <PageHeader
          eyebrow="Company availability"
          title="Schedule"
          description="Chosen startup duty hours in one merged weekly calendar."
          action={
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-lg bg-secondary p-1">
                <Button
                  size="sm"
                  variant={mode === "team" ? "secondary" : "ghost"}
                  onClick={() => setMode("team")}
                >
                  <UsersRound /> Team Schedule
                </Button>
                <Button
                  size="sm"
                  variant={mode === "shifts" ? "secondary" : "ghost"}
                  onClick={() => setMode("shifts")}
                >
                  <Clock3 /> Shifts
                </Button>
              </div>
              <Button onClick={() => setConfigOpen(true)}>
                <Settings2 /> Configure my schedule
              </Button>
            </div>
          }
        />
        {mode === "team" ? (
          <>
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_14rem_auto]">
                <div>
                  <p className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
                    People
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {operations.state.members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={(event) =>
                            setSelectedMembers((current) =>
                              event.target.checked
                                ? [...current, member.id]
                                : current.filter((id) => id !== member.id),
                            )
                          }
                        />
                        {member.name}
                      </label>
                    ))}
                  </div>
                </div>
                <label>
                  <span className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
                    Department
                  </span>
                  <Select
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value as DepartmentId | "all")
                    }
                    className="mt-2"
                  >
                    <option value="all">All departments</option>
                    {lzDepartments().map((id) => (
                      <option key={id} value={id}>
                        {departments[id].name}
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="self-end text-xs text-muted-foreground">
                  Merged week ·{" "}
                  {new Set(blocks.map((block) => block.memberId)).size} people
                </div>
              </div>
            </section>
            {configuring ? (
              <ConfigureTools onDone={() => setConfiguring(false)} />
            ) : null}
            <TeamCalendar
              blocks={blocks}
              configuring={configuring}
              onOpenDay={(day) => {
                setPersonId(operations.currentMember.id);
                setDrawerDay(day);
              }}
            />
            <section className="rounded-xl border border-border bg-card p-4">
              <strong className="text-sm">
                Redistribute hours instead of forcing identical days.
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate a base schedule, mark rest days, then move or resize
                your own blocks while keeping the weekly target visible.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label>
                  <span className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
                    Member
                  </span>
                  <Select
                    value={personId}
                    onChange={(event) => setPersonId(event.target.value)}
                    className="mt-2"
                  >
                    <option value={operations.currentMember.id}>
                      {operations.currentMember.name} (you)
                    </option>
                    {operations.state.members
                      .filter(
                        (member) => member.id !== operations.currentMember.id,
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </Select>
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Previous week"
                    onClick={() => setWeek((value) => value - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="min-w-28 text-center text-xs font-semibold">
                    {weekLabel(week)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Next week"
                    onClick={() => setWeek((value) => value + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </section>
            <header>
              <p className="font-mono text-[0.56rem] font-bold text-primary uppercase">
                Planned vs actual
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {person.name}&apos;s shifts
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Compare scheduled commitment with recorded work sessions one
                week at a time.
              </p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Scheduled"
                value={`${planned}h`}
                note="Effective planned hours"
              />
              <Stat
                label="Worked"
                value={`${round(worked)}h`}
                note="Recorded Time In / Out"
              />
              <Stat
                label="Variance"
                value={`${round(worked - planned)}h`}
                note="Worked minus scheduled"
              />
              <Stat
                label="Schedule overlap"
                value={`${round(Math.min(worked, planned))}h`}
                note="Worked inside planned windows"
              />
            </div>
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <header className="border-b border-border p-4">
                <h3 className="text-sm font-semibold">Week comparison</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select any day to inspect its default schedule, override, and
                  actual sessions.
                </p>
              </header>
              {days.map((day, index) => {
                const dayBlocks = personBlocks.filter(
                  (block) => block.day === index,
                );
                const dayHours = dayBlocks.reduce(
                  (sum, block) => sum + block.end - block.start,
                  0,
                );
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDrawerDay(index)}
                    className="grid w-full gap-3 border-b border-border/70 p-4 text-left last:border-b-0 hover:bg-secondary/60 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                  >
                    <div>
                      <strong className="text-sm">{day}</strong>
                      <p className="mt-1 font-mono text-[0.52rem] text-muted-foreground">
                        {dayDate(week, index)}
                      </p>
                    </div>
                    <div>
                      {dayBlocks.length ? (
                        dayBlocks.map((block) => (
                          <span
                            key={block.id}
                            className="mr-2 inline-flex rounded-lg bg-secondary px-3 py-2 text-xs"
                          >
                            {formatHour(block.start)}–{formatHour(block.end)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Rest day / no schedule
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[0.56rem] text-muted-foreground">
                      {dayHours}h planned
                    </span>
                  </button>
                );
              })}
            </section>
          </>
        )}
      </PageContainer>
      <ScheduleDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        onConfigure={() => {
          setConfigOpen(false);
          setMode("team");
          setConfiguring(true);
        }}
      />
      <DayDrawer
        memberId={personId}
        week={week}
        day={drawerDay}
        onClose={() => setDrawerDay(null)}
      />
    </div>
  );
}

function TeamCalendar({
  blocks,
  configuring,
  onOpenDay,
}: {
  blocks: ScheduleBlock[];
  configuring: boolean;
  onOpenDay: (day: number) => void;
}) {
  const operations = useOperationalDemo();
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="text-sm font-semibold">Team Schedule</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Each horizontal band is one hour. Simultaneous schedules split into
            visual lanes.
          </p>
        </div>
        <div className="hidden text-[0.62rem] text-muted-foreground sm:block">
          7:00 AM–12:00 AM
        </div>
      </header>
      <div className="overflow-x-auto">
        <div className="grid min-w-[68rem] grid-cols-[5rem_repeat(7,minmax(8.5rem,1fr))]">
          <div className="border-r border-b border-border bg-muted p-3 font-mono text-[0.52rem] text-muted-foreground">
            TIME
          </div>
          {days.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => onOpenDay(index)}
              className="border-r border-b border-border bg-muted p-3 text-left last:border-r-0"
            >
              <strong className="text-xs">{day}</strong>
              <span className="mt-1 block font-mono text-[0.5rem] text-muted-foreground">
                {dayDate(0, index)}
              </span>
            </button>
          ))}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-r border-b border-border/60 p-2 font-mono text-[0.48rem] text-muted-foreground">
                {formatHour(hour)}
              </div>
              {days.map((_, day) => (
                <div
                  key={`${day}-${hour}`}
                  className="relative min-h-14 border-r border-b border-border/60 p-1"
                >
                  {blocks
                    .filter(
                      (block) => block.day === day && block.start === hour,
                    )
                    .map((block, index) => {
                      const member = operations.state.members.find(
                        (item) => item.id === block.memberId,
                      );
                      const mine =
                        block.memberId === operations.currentMember.id;
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "relative z-10 mb-1 rounded-md border border-chart-4/20 bg-chart-4/10 p-1.5 text-[0.55rem]",
                            mine && "border-primary/25 bg-primary/10",
                          )}
                          style={{ marginLeft: `${index * 8}px` }}
                        >
                          <strong className="block truncate">
                            {member?.name}
                          </strong>
                          <span>
                            {formatHour(block.start)}–{formatHour(block.end)}
                          </span>
                          {configuring && mine ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              <Mini
                                onClick={() =>
                                  operations.adjustSchedule(block.id, -1, 0)
                                }
                              >
                                Earlier
                              </Mini>
                              <Mini
                                onClick={() =>
                                  operations.adjustSchedule(block.id, 1, 0)
                                }
                              >
                                Later
                              </Mini>
                              <Mini
                                onClick={() =>
                                  operations.adjustSchedule(block.id, 0, 1)
                                }
                              >
                                +1h
                              </Mini>
                              <Mini
                                onClick={() =>
                                  operations.adjustSchedule(block.id, 0, -1)
                                }
                              >
                                −1h
                              </Mini>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConfigureTools({ onDone }: { onDone: () => void }) {
  const operations = useOperationalDemo();
  const mine = operations.state.schedule.filter(
    (block) => block.memberId === operations.currentMember.id,
  );
  return (
    <section className="rounded-xl border border-primary/20 bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.55rem] font-bold text-primary uppercase">
            Personal schedule
          </p>
          <h2 className="mt-1 text-base font-semibold">
            Configure my schedule
          </h2>
        </div>
        <Button onClick={onDone}>Done configuring</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Use the controls on your calendar blocks to move or resize them.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {days.map((day, index) => (
          <Button
            key={day}
            size="sm"
            variant="outline"
            onClick={() =>
              mine
                .filter((block) => block.day === index)
                .forEach((block) =>
                  operations.adjustSchedule(
                    block.id,
                    0,
                    0,
                    index === 6 ? -6 : 1,
                  ),
                )
            }
          >
            {day}: mark rest / move blocks
          </Button>
        ))}
      </div>
    </section>
  );
}

function ScheduleDialog({
  open,
  onOpenChange,
  onConfigure,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigure: () => void;
}) {
  const operations = useOperationalDemo();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    operations.generateSchedule(
      Number(data.get("weekly")),
      Number(data.get("daily")),
      Number(data.get("rest")),
    );
    onConfigure();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Configure my schedule</DialogTitle>
            <DialogDescription>
              Set the initial workload, then shape the week directly on the
              calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="weekly"
              label="Hours per week"
              defaultValue={20}
              max={119}
            />
            <Field
              id="daily"
              label="Initial hours per day"
              defaultValue={4}
              max={17}
            />
            <Field id="rest" label="Rest days" defaultValue={2} max={6} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Generate initial schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DayDrawer({
  memberId,
  week,
  day,
  onClose,
}: {
  memberId: string;
  week: number;
  day: number | null;
  onClose: () => void;
}) {
  const operations = useOperationalDemo();
  const [message, setMessage] = useState("");
  if (day === null) return null;
  const selectedDay = day;
  const member = operations.state.members.find((item) => item.id === memberId);
  const defaults = operations.state.schedule.filter(
    (block) => block.memberId === memberId && block.day === selectedDay,
  );
  const overrides = operations.state.overrides.filter(
    (item) =>
      item.memberId === memberId &&
      item.weekOffset === week &&
      item.day === selectedDay,
  );
  const actual = operations.state.sessions.filter(
    (item) => item.memberId === memberId && sessionIsInWeek(item, week),
  );
  const scheduled = (overrides.length ? overrides : defaults).reduce(
    (sum, block) => sum + block.end - block.start,
    0,
  );
  const worked = actual.reduce(
    (sum, session) => sum + sessionHours(session),
    0,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = timeToHour(String(data.get("start")));
    const end = timeToHour(String(data.get("end")));
    if (end <= start) {
      setMessage("End time must be after start time.");
      return;
    }
    operations.addOverride(memberId, week, selectedDay, start, end);
    setMessage("");
  }
  return (
    <InspectorDrawer
      open
      onOpenChange={(value) => !value && onClose()}
      title={days[selectedDay]}
      eyebrow="Daily schedule record"
    >
      <div className="divide-y divide-border">
        <DrawerSection
          title="Default schedule"
          value={`${defaults.reduce((sum, block) => sum + block.end - block.start, 0)}h`}
        >
          {defaults.length ? (
            defaults.map((block) => <BlockLabel key={block.id} block={block} />)
          ) : (
            <p className="text-xs text-muted-foreground">
              No default schedule.
            </p>
          )}
        </DrawerSection>
        <DrawerSection title="Schedule override" value="Changes this date only">
          <div className="space-y-2">
            {overrides.map((block) => (
              <BlockLabel key={block.id} block={block} />
            ))}
          </div>
          <form onSubmit={submit} className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs">
              Start
              <TimePicker
                name="start"
                defaultValue="14:00"
                aria-label="Override start time"
              />
            </label>
            <label className="text-xs">
              End
              <TimePicker
                name="end"
                defaultValue="18:00"
                aria-label="Override end time"
              />
            </label>
            <Button type="submit" className="col-span-2">
              Add override block
            </Button>
            <Button
              type="button"
              variant="outline"
              className="col-span-2"
              onClick={() =>
                operations.clearOverrides(memberId, week, selectedDay)
              }
            >
              Clear override
            </Button>
          </form>
          {message ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {message}
            </p>
          ) : null}
        </DrawerSection>
        <DrawerSection title="Actual work sessions" value={`${round(worked)}h`}>
          {actual.length ? (
            actual.map((session) => (
              <p key={session.id} className="text-xs">
                {new Date(session.startedAt).toLocaleTimeString()}–
                {session.endedAt
                  ? new Date(session.endedAt).toLocaleTimeString()
                  : "In progress"}
              </p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No sessions recorded.
            </p>
          )}
        </DrawerSection>
        <DrawerSection title={member?.name ?? "Member"} value="Daily summary">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span>
              Scheduled <strong>{scheduled}h</strong>
            </span>
            <span>
              Worked <strong>{round(worked)}h</strong>
            </span>
            <span>
              Overlap <strong>{round(Math.min(worked, scheduled))}h</strong>
            </span>
            <span>
              Outside <strong>{round(Math.max(0, worked - scheduled))}h</strong>
            </span>
          </div>
        </DrawerSection>
      </div>
    </InspectorDrawer>
  );
}

function effectiveBlocks(
  blocks: ScheduleBlock[],
  overrides: Array<ScheduleBlock & { weekOffset?: number }>,
  memberId: string,
  week: number,
) {
  const custom = overrides.filter(
    (block) => block.memberId === memberId && block.weekOffset === week,
  );
  return custom.length
    ? [
        ...blocks.filter(
          (block) =>
            block.memberId === memberId &&
            !custom.some((item) => item.day === block.day),
        ),
        ...custom,
      ]
    : blocks.filter((block) => block.memberId === memberId);
}
function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[0.55rem] font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <strong className="mt-2 block text-2xl">{value}</strong>
      <small className="text-muted-foreground">{note}</small>
    </article>
  );
}
function DrawerSection({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-5">
      <div className="mb-3 flex justify-between gap-3">
        <strong className="text-sm">{title}</strong>
        <span className="text-[0.62rem] text-muted-foreground">{value}</span>
      </div>
      {children}
    </section>
  );
}
function BlockLabel({
  block,
}: {
  block: Pick<ScheduleBlock, "id" | "start" | "end">;
}) {
  return (
    <p className="rounded-lg bg-secondary px-3 py-2 text-xs">
      {formatHour(block.start)}–{formatHour(block.end)}
    </p>
  );
}
function Mini({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded bg-card px-1 py-0.5 text-[0.48rem]"
    >
      {children}
    </button>
  );
}
function Field({
  id,
  label,
  defaultValue,
  max,
}: {
  id: string;
  label: string;
  defaultValue: number;
  max: number;
}) {
  return (
    <label>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type="number"
        min={id === "rest" ? 0 : 1}
        max={max}
        defaultValue={defaultValue}
      />
    </label>
  );
}
function formatHour(hour: number) {
  const value = hour % 24;
  if (value === 0) return "12 AM";
  if (value === 12) return "12 PM";
  return `${value > 12 ? value - 12 : value} ${value >= 12 ? "PM" : "AM"}`;
}
function timeToHour(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return (hour ?? 0) + (minute ?? 0) / 60;
}
function round(value: number) {
  return Math.round(value * 10) / 10;
}
function weekLabel(offset: number) {
  const start = startOfWeek(offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
}
function dayDate(offset: number, day: number) {
  const date = startOfWeek(offset);
  date.setDate(date.getDate() + day);
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}
function startOfWeek(offset: number) {
  const date = new Date();
  const weekday = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - weekday + offset * 7);
  return date;
}
function lzDepartments() {
  return Object.keys(departments) as DepartmentId[];
}
