"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";

import type { CurrentUser } from "@/features/auth/queries";

export type DepartmentId = "rd" | "creatives" | "sm" | "leadership";
export type ProjectStatus = "Planning" | "In Progress" | "Done";
export type OutcomeStatus =
  | "Planned"
  | "In progress"
  | "For review"
  | "Needs revision"
  | "Blocked"
  | "Accepted"
  | "Skipped";

export interface OperationalMember {
  id: string;
  name: string;
  role: string;
  department: DepartmentId;
  working: boolean;
}

export interface WorkTask {
  id: string;
  title: string;
  done: boolean;
}

export interface WorkFeature {
  id: string;
  name: string;
  description: string;
  tasks: WorkTask[];
}

export interface Submission {
  id: string;
  version: number;
  title: string;
  notes: string;
  state: "For review" | "Needs revision" | "Accepted";
  submittedAt: string;
  feedback: string;
  verification: boolean[];
}

export interface OperationalOutcome {
  id: string;
  title: string;
  description: string;
  status: OutcomeStatus;
  departments: DepartmentId[];
  memberIds: string[];
  participantIds: string[];
  criteria: string[];
  prerequisiteId: string | null;
  features: WorkFeature[];
  outputDraft: string;
  outputNotes: string;
  submissions: Submission[];
  feedback: string;
}

export interface OperationalStage {
  id: string;
  name: string;
  outcomes: OperationalOutcome[];
}

export interface ProjectMessage {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Announcement extends ProjectMessage {
  pinned: boolean;
}

export interface OperationalProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  lead: string;
  assistant: string;
  departments: DepartmentId[];
  stages: OperationalStage[];
  messages: ProjectMessage[];
  announcements: Announcement[];
}

export interface ScheduleBlock {
  id: string;
  memberId: string;
  day: number;
  start: number;
  end: number;
}

export interface ScheduleOverride {
  id: string;
  memberId: string;
  weekOffset: number;
  day: number;
  start: number;
  end: number;
}

export interface WorkSession {
  id: string;
  memberId: string;
  startedAt: string;
  endedAt: string | null;
}

export type ActivityType =
  | "time"
  | "project"
  | "outcome"
  | "task"
  | "output"
  | "schedule"
  | "people"
  | "announcement";

export interface OperationalActivity {
  id: string;
  actor: string;
  type: ActivityType;
  action: string;
  detail: string;
  projectId?: string;
  outcomeId?: string;
  createdAt: string;
}

export interface OperationalState {
  version: 6;
  currentMemberId: string;
  members: OperationalMember[];
  projects: OperationalProject[];
  schedule: ScheduleBlock[];
  overrides: ScheduleOverride[];
  sessions: WorkSession[];
  roomMessages: Record<string, ProjectMessage[]>;
  activity: OperationalActivity[];
}

type ProjectInput = Pick<
  OperationalProject,
  "title" | "description" | "status" | "lead" | "departments"
> & { initialStage: string };

type OutcomeInput = Pick<
  OperationalOutcome,
  "title" | "description" | "departments" | "memberIds" | "criteria"
> & { prerequisiteId?: string | null };

interface OperationalActions {
  createProject: (input: ProjectInput) => void;
  setProjectStatus: (projectId: string, status: ProjectStatus) => void;
  addStage: (projectId: string, name: string) => void;
  renameStage: (projectId: string, stageId: string, name: string) => void;
  addOutcome: (projectId: string, stageId: string, input: OutcomeInput) => void;
  joinOutcome: (projectId: string, outcomeId: string) => void;
  skipDependency: (projectId: string, outcomeId: string) => void;
  addFeature: (
    projectId: string,
    outcomeId: string,
    name: string,
    description: string,
  ) => void;
  deleteFeature: (
    projectId: string,
    outcomeId: string,
    featureId: string,
  ) => void;
  addTask: (
    projectId: string,
    outcomeId: string,
    featureId: string,
    title: string,
  ) => void;
  toggleTask: (
    projectId: string,
    outcomeId: string,
    featureId: string,
    taskId: string,
  ) => void;
  deleteTask: (
    projectId: string,
    outcomeId: string,
    featureId: string,
    taskId: string,
  ) => void;
  saveOutput: (
    projectId: string,
    outcomeId: string,
    title: string,
    notes: string,
  ) => void;
  submitOutput: (
    projectId: string,
    outcomeId: string,
    title: string,
    notes: string,
  ) => void;
  reviewOutput: (
    projectId: string,
    outcomeId: string,
    accepted: boolean,
    feedback: string,
    verification: boolean[],
  ) => boolean;
  sendProjectMessage: (projectId: string, text: string) => void;
  postAnnouncement: (projectId: string, text: string, pinned: boolean) => void;
  toggleAnnouncement: (projectId: string, announcementId: string) => void;
  sendRoomMessage: (roomId: string, text: string) => void;
  toggleTime: () => void;
  setWorking: (memberId: string, working: boolean) => void;
  generateSchedule: (
    weeklyHours: number,
    dailyHours: number,
    restDays: number,
  ) => void;
  adjustSchedule: (
    blockId: string,
    deltaStart: number,
    deltaDuration: number,
    dayDelta?: number,
  ) => void;
  addOverride: (
    memberId: string,
    weekOffset: number,
    day: number,
    start: number,
    end: number,
  ) => void;
  clearOverrides: (memberId: string, weekOffset: number, day: number) => void;
  resetDemo: () => void;
}

interface OperationalContextValue extends OperationalActions {
  state: OperationalState;
  currentMember: OperationalMember;
}

const Context = createContext<OperationalContextValue | null>(null);
const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  department: z.enum(["rd", "creatives", "sm", "leadership"]),
  working: z.boolean(),
});
const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
});
const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema),
});
const submissionSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  title: z.string(),
  notes: z.string(),
  state: z.enum(["For review", "Needs revision", "Accepted"]),
  submittedAt: z.iso.datetime(),
  feedback: z.string(),
  verification: z.array(z.boolean()),
});
const outcomeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum([
    "Planned",
    "In progress",
    "For review",
    "Needs revision",
    "Blocked",
    "Accepted",
    "Skipped",
  ]),
  departments: z.array(memberSchema.shape.department),
  memberIds: z.array(z.string()),
  participantIds: z.array(z.string()),
  criteria: z.array(z.string()),
  prerequisiteId: z.string().nullable(),
  features: z.array(featureSchema),
  outputDraft: z.string(),
  outputNotes: z.string(),
  submissions: z.array(submissionSchema),
  feedback: z.string(),
});
const stageSchema = z.object({
  id: z.string(),
  name: z.string(),
  outcomes: z.array(outcomeSchema),
});
const messageSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  createdAt: z.iso.datetime(),
});
const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["Planning", "In Progress", "Done"]),
  lead: z.string(),
  assistant: z.string(),
  departments: z.array(memberSchema.shape.department),
  stages: z.array(stageSchema),
  messages: z.array(messageSchema),
  announcements: z.array(messageSchema.extend({ pinned: z.boolean() })),
});
const scheduleSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  day: z.number().int().min(0).max(6),
  start: z.number().min(0).max(24),
  end: z.number().min(0).max(24),
});
const sessionSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
});
const activitySchema = z.object({
  id: z.string(),
  actor: z.string(),
  type: z.enum([
    "time",
    "project",
    "outcome",
    "task",
    "output",
    "schedule",
    "people",
    "announcement",
  ]),
  action: z.string(),
  detail: z.string(),
  projectId: z.string().optional(),
  outcomeId: z.string().optional(),
  createdAt: z.iso.datetime(),
});
const storedStateSchema = z
  .object({
    version: z.literal(6),
    currentMemberId: z.string(),
    members: z.array(memberSchema),
    projects: z.array(projectSchema),
    schedule: z.array(scheduleSchema),
    overrides: z.array(scheduleSchema.extend({ weekOffset: z.number().int() })),
    sessions: z.array(sessionSchema),
    roomMessages: z.record(z.string(), z.array(messageSchema)),
    activity: z.array(activitySchema),
  })
  .transform((value) => value as OperationalState);

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function seedOutcome(
  id: string,
  title: string,
  description: string,
  status: OutcomeStatus,
  departments: DepartmentId[],
  memberIds: string[],
  criteria: string[],
  prerequisiteId: string | null = null,
): OperationalOutcome {
  const accepted = status === "Accepted";
  return {
    id,
    title,
    description,
    status,
    departments,
    memberIds,
    participantIds: [],
    criteria,
    prerequisiteId,
    features: [
      {
        id: `${id}-feature-1`,
        name: "Core work",
        description: "Primary work required to achieve this outcome.",
        tasks: [
          {
            id: `${id}-task-1`,
            title: "Clarify the expected result",
            done: accepted,
          },
          {
            id: `${id}-task-2`,
            title: "Complete the primary implementation",
            done: accepted,
          },
          {
            id: `${id}-task-3`,
            title: "Prepare the work for review",
            done: accepted,
          },
        ],
      },
    ],
    outputDraft: accepted ? `${title} package` : "",
    outputNotes: "",
    submissions: accepted
      ? [
          {
            id: `${id}-submission-1`,
            version: 1,
            title: `${title} package`,
            notes: "Seeded accepted output.",
            state: "Accepted",
            submittedAt: new Date(Date.now() - 86_400_000).toISOString(),
            feedback: "Verified against the expected outcome.",
            verification: criteria.map(() => true),
          },
        ]
      : [],
    feedback: "",
  };
}

export function createOperationalSeed(user: CurrentUser): OperationalState {
  const members: OperationalMember[] = [
    {
      id: "rex",
      name: "Rex Jumawid",
      role: "Project Lead / Leadership",
      department: "leadership",
      working: true,
    },
    {
      id: "ana",
      name: "Ana Mendoza",
      role: "Assistant Lead / Operations",
      department: "leadership",
      working: false,
    },
    {
      id: user.id,
      name: user.fullName,
      role: `${user.role} account / Software Developer`,
      department: "rd",
      working: true,
    },
    {
      id: "justin",
      name: "Justin Cruz",
      role: "Software Developer",
      department: "rd",
      working: false,
    },
    {
      id: "bea",
      name: "Bea Santos",
      role: "Creative / UI UX",
      department: "creatives",
      working: true,
    },
    {
      id: "marco",
      name: "Marco Reyes",
      role: "Sales & Marketing",
      department: "sm",
      working: true,
    },
  ];
  const requirements = seedOutcome(
    "requirements",
    "Validated client requirements",
    "Approved requirements package defining scope, users, and business rules.",
    "Accepted",
    ["sm"],
    ["marco"],
    ["Scope is approved", "Business rules are documented"],
  );
  const prototype = seedOutcome(
    "prototype",
    "Approved end-to-end UI/UX prototype",
    "Clickable prototype covering the critical customer and staff workflows.",
    "For review",
    ["creatives"],
    ["bea"],
    [
      "Critical workflows are represented",
      "Responsive states are included",
      "Lead review is recorded",
    ],
    "requirements",
  );
  const auth = seedOutcome(
    "auth",
    "Working authentication and role access",
    "Secure sign-in and role-based access to application areas.",
    "In progress",
    ["rd"],
    [user.id],
    [
      "Users can sign in securely",
      "Protected routes enforce access",
      "Failure states are clear",
    ],
    "prototype",
  );
  const release = seedOutcome(
    "release",
    "Release candidate passes acceptance criteria",
    "A deployable build that passes functional and technical acceptance checks.",
    "Blocked",
    ["rd", "leadership"],
    ["justin"],
    ["Required checks pass", "Deployment notes are complete"],
    "auth",
  );

  const projects: OperationalProject[] = [
    {
      id: "cms",
      title: "Client Management System",
      description:
        "Build a client-facing management platform with onboarding, account tracking, communication history, dashboards, and internal administrative tools.",
      status: "In Progress",
      lead: "Rex Jumawid",
      assistant: "Ana Mendoza",
      departments: ["rd", "creatives", "sm", "leadership"],
      stages: [
        {
          id: "cms-stage-1",
          name: "Discovery & Planning",
          outcomes: [requirements],
        },
        { id: "cms-stage-2", name: "Experience Design", outcomes: [prototype] },
        { id: "cms-stage-3", name: "Core Development", outcomes: [auth] },
        { id: "cms-stage-4", name: "Testing & Release", outcomes: [release] },
      ],
      messages: [
        {
          id: "message-1",
          author: "Rex Jumawid",
          text: "Use this project channel for decisions and delivery handoffs.",
          createdAt: new Date(Date.now() - 3_600_000).toISOString(),
        },
      ],
      announcements: [
        {
          id: "announcement-1",
          author: "Rex Jumawid",
          text: "Creative review is the current delivery priority.",
          createdAt: new Date(Date.now() - 7_200_000).toISOString(),
          pinned: true,
        },
      ],
    },
    ...[
      [
        "dx",
        "Dx Visual System",
        "Internal visual and interaction system for the Prometheus operating environment.",
        "In Progress",
        ["creatives", "rd"],
      ],
      [
        "customers",
        "First 10 Customers",
        "Build and qualify a repeatable pipeline for the company’s first ten paying customers.",
        "Planning",
        ["sm", "leadership"],
      ],
      [
        "disc",
        "DISC",
        "Research and organize the next validation experiment and technical proof.",
        "Planning",
        ["rd"],
      ],
    ].map(([id, title, description, status, departmentIds], index) => ({
      id: id as string,
      title: title as string,
      description: description as string,
      status: status as ProjectStatus,
      lead: "Rex Jumawid",
      assistant: "Ana Mendoza",
      departments: departmentIds as DepartmentId[],
      stages: [
        {
          id: `${id}-stage-1`,
          name: index === 0 ? "Visual direction" : "Project setup",
          outcomes: [
            seedOutcome(
              `${id}-outcome-1`,
              `${title} initial outcome`,
              `Deliver and verify the first expected result for ${String(title).toLowerCase()}.`,
              index === 0 ? "In progress" : "Planned",
              departmentIds as DepartmentId[],
              [index === 1 ? "marco" : user.id],
              ["The result is demonstrable", "The output is documented"],
            ),
          ],
        },
      ],
      messages: [],
      announcements: [],
    })),
  ];

  const templates = [
    ["rex", 0, 14, 22],
    ["rex", 2, 10, 15],
    ["rex", 4, 14, 18],
    ["ana", 1, 9, 13],
    ["ana", 3, 13, 17],
    ["ana", 4, 15, 19],
    [user.id, 0, 15, 19],
    [user.id, 1, 7, 12],
    [user.id, 4, 14, 20],
    ["justin", 1, 10, 16],
    ["justin", 2, 13, 20],
    ["justin", 4, 15, 23],
    ["bea", 1, 10, 16],
    ["bea", 3, 12, 18],
    ["bea", 4, 14, 21],
    ["marco", 2, 16, 21],
    ["marco", 3, 10, 15],
    ["marco", 4, 16, 20],
  ] as const;

  const now = Date.now();
  return {
    version: 6,
    currentMemberId: user.id,
    members,
    projects,
    schedule: templates.map(([memberId, day, start, end], index) => ({
      id: `block-${index}`,
      memberId,
      day,
      start,
      end,
    })),
    overrides: [],
    sessions: [
      {
        id: "session-seed-1",
        memberId: user.id,
        startedAt: new Date(now - 2 * 3_600_000).toISOString(),
        endedAt: new Date(now - 30 * 60_000).toISOString(),
      },
    ],
    roomMessages: {
      general: [
        {
          id: "room-1",
          author: "Rex Jumawid",
          text: "Use General Chat for cross-company coordination and handoffs.",
          createdAt: new Date(now - 4_800_000).toISOString(),
        },
        {
          id: "room-2",
          author: "Bea Santos",
          text: "The latest creative output is ready for review.",
          createdAt: new Date(now - 3_600_000).toISOString(),
        },
      ],
    },
    activity: [
      {
        id: "activity-1",
        actor: user.fullName,
        type: "task",
        action: "Completed task",
        detail: "Finished the authentication validation task.",
        projectId: "cms",
        outcomeId: "auth",
        createdAt: new Date(now - 18 * 60_000).toISOString(),
      },
      {
        id: "activity-2",
        actor: "Rex Jumawid",
        type: "project",
        action: "Created project stage",
        detail: "Created Testing & Release.",
        projectId: "cms",
        createdAt: new Date(now - 37 * 60_000).toISOString(),
      },
      {
        id: "activity-3",
        actor: "Bea Santos",
        type: "output",
        action: "Submitted output",
        detail: "Submitted a new interface review version.",
        projectId: "dx",
        createdAt: new Date(now - 64 * 60_000).toISOString(),
      },
    ],
  };
}

function findOutcome(project: OperationalProject, outcomeId: string) {
  return project.stages
    .flatMap((stage) => stage.outcomes)
    .find((item) => item.id === outcomeId);
}

function updateProject(
  state: OperationalState,
  projectId: string,
  updater: (project: OperationalProject) => OperationalProject,
) {
  return {
    ...state,
    projects: state.projects.map((project) =>
      project.id === projectId ? updater(project) : project,
    ),
  };
}

function updateOutcome(
  state: OperationalState,
  projectId: string,
  outcomeId: string,
  updater: (
    outcome: OperationalOutcome,
    project: OperationalProject,
  ) => OperationalOutcome,
) {
  return updateProject(state, projectId, (project) => ({
    ...project,
    stages: project.stages.map((stage) => ({
      ...stage,
      outcomes: stage.outcomes.map((outcome) =>
        outcome.id === outcomeId ? updater(outcome, project) : outcome,
      ),
    })),
  }));
}

export function outcomeProgress(outcome: OperationalOutcome) {
  if (outcome.status === "Accepted") return 100;
  const tasks = outcome.features.flatMap((feature) => feature.tasks);
  return tasks.length
    ? Math.round(
        (tasks.filter((task) => task.done).length / tasks.length) * 100,
      )
    : 0;
}

export function projectProgress(project: OperationalProject) {
  const outcomes = project.stages.flatMap((stage) => stage.outcomes);
  return outcomes.length
    ? Math.round(
        outcomes.reduce((sum, outcome) => sum + outcomeProgress(outcome), 0) /
          outcomes.length,
      )
    : 0;
}

export function sessionHours(session: WorkSession, now = Date.now()) {
  const end = session.endedAt ? new Date(session.endedAt).getTime() : now;
  return Math.max(0, end - new Date(session.startedAt).getTime()) / 3_600_000;
}

export function sessionIsInWeek(
  session: WorkSession,
  weekOffset = 0,
  now = new Date(),
) {
  const start = new Date(now);
  const weekday = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekday + weekOffset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const value = new Date(session.startedAt);
  return value >= start && value < end;
}

export function OperationalDemoProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const seed = useMemo(() => createOperationalSeed(user), [user]);
  const [state, setState] = useState(seed);
  const hydrated = useRef(false);
  const storageKey = `dx-operational-demo-v6:${user.id}`;

  useEffect(() => {
    let timer: number | undefined;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = storedStateSchema.safeParse(JSON.parse(raw));
        if (parsed.success && parsed.data.currentMemberId === user.id) {
          timer = window.setTimeout(() => {
            setState(parsed.data);
            hydrated.current = true;
          }, 0);
        }
      }
    } catch {
      // Invalid browser state is deliberately replaced by the safe seed.
    }
    if (timer === undefined) hydrated.current = true;
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [storageKey, user.id]);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const commit = useCallback(
    (change: (current: OperationalState) => OperationalState) =>
      setState((current) => change(current)),
    [],
  );
  const log = useCallback(
    (
      current: OperationalState,
      type: ActivityType,
      action: string,
      detail: string,
      projectId?: string,
      outcomeId?: string,
    ) => ({
      ...current,
      activity: [
        {
          id: uid("activity"),
          actor:
            current.members.find(
              (member) => member.id === current.currentMemberId,
            )?.name ?? "Team member",
          type,
          action,
          detail,
          projectId,
          outcomeId,
          createdAt: new Date().toISOString(),
        },
        ...current.activity,
      ].slice(0, 250),
    }),
    [],
  );

  const actions = useMemo<OperationalActions>(
    () => ({
      createProject(input) {
        commit((current) =>
          log(
            {
              ...current,
              projects: [
                ...current.projects,
                {
                  id: uid("project"),
                  title: input.title,
                  description: input.description,
                  status: input.status,
                  lead: input.lead,
                  assistant: "Ana Mendoza",
                  departments: input.departments,
                  stages: [
                    {
                      id: uid("stage"),
                      name: input.initialStage,
                      outcomes: [],
                    },
                  ],
                  messages: [],
                  announcements: [],
                },
              ],
            },
            "project",
            "Created project",
            input.title,
          ),
        );
      },
      setProjectStatus(projectId, status) {
        commit((current) =>
          log(
            updateProject(current, projectId, (project) => ({
              ...project,
              status,
            })),
            "project",
            "Updated project state",
            status,
            projectId,
          ),
        );
      },
      addStage(projectId, name) {
        commit((current) =>
          log(
            updateProject(current, projectId, (project) => ({
              ...project,
              stages: [
                ...project.stages,
                { id: uid("stage"), name, outcomes: [] },
              ],
            })),
            "project",
            "Created project stage",
            name,
            projectId,
          ),
        );
      },
      renameStage(projectId, stageId, name) {
        commit((current) =>
          log(
            updateProject(current, projectId, (project) => ({
              ...project,
              stages: project.stages.map((stage) =>
                stage.id === stageId ? { ...stage, name } : stage,
              ),
            })),
            "project",
            "Renamed project stage",
            name,
            projectId,
          ),
        );
      },
      addOutcome(projectId, stageId, input) {
        commit((current) => {
          const outcome = seedOutcome(
            uid("outcome"),
            input.title,
            input.description,
            input.prerequisiteId ? "Blocked" : "Planned",
            input.departments,
            input.memberIds,
            input.criteria,
            input.prerequisiteId ?? null,
          );
          return log(
            updateProject(current, projectId, (project) => ({
              ...project,
              stages: project.stages.map((stage) =>
                stage.id === stageId
                  ? { ...stage, outcomes: [...stage.outcomes, outcome] }
                  : stage,
              ),
            })),
            "outcome",
            "Created project outcome",
            input.title,
            projectId,
            outcome.id,
          );
        });
      },
      joinOutcome(projectId, outcomeId) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) =>
              outcome.participantIds.includes(current.currentMemberId)
                ? outcome
                : {
                    ...outcome,
                    participantIds: [
                      ...outcome.participantIds,
                      current.currentMemberId,
                    ],
                  },
            ),
            "people",
            "Joined outcome",
            "Added as a contributing member.",
            projectId,
            outcomeId,
          ),
        );
      },
      skipDependency(projectId, outcomeId) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              prerequisiteId: null,
              status: "Planned",
            })),
            "outcome",
            "Skipped dependency",
            "Outcome is now ready to begin.",
            projectId,
            outcomeId,
          ),
        );
      },
      addFeature(projectId, outcomeId, name, description) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              features: [
                ...outcome.features,
                { id: uid("feature"), name, description, tasks: [] },
              ],
            })),
            "outcome",
            "Added feature",
            name,
            projectId,
            outcomeId,
          ),
        );
      },
      deleteFeature(projectId, outcomeId, featureId) {
        commit((current) =>
          updateOutcome(current, projectId, outcomeId, (outcome) => ({
            ...outcome,
            features: outcome.features.filter(
              (feature) => feature.id !== featureId,
            ),
          })),
        );
      },
      addTask(projectId, outcomeId, featureId, title) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              status:
                outcome.status === "Planned" ? "In progress" : outcome.status,
              features: outcome.features.map((feature) =>
                feature.id === featureId
                  ? {
                      ...feature,
                      tasks: [
                        ...feature.tasks,
                        { id: uid("task"), title, done: false },
                      ],
                    }
                  : feature,
              ),
            })),
            "task",
            "Added task",
            title,
            projectId,
            outcomeId,
          ),
        );
      },
      toggleTask(projectId, outcomeId, featureId, taskId) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              features: outcome.features.map((feature) =>
                feature.id === featureId
                  ? {
                      ...feature,
                      tasks: feature.tasks.map((task) =>
                        task.id === taskId
                          ? { ...task, done: !task.done }
                          : task,
                      ),
                    }
                  : feature,
              ),
            })),
            "task",
            "Updated task",
            "Task completion changed.",
            projectId,
            outcomeId,
          ),
        );
      },
      deleteTask(projectId, outcomeId, featureId, taskId) {
        commit((current) =>
          updateOutcome(current, projectId, outcomeId, (outcome) => ({
            ...outcome,
            features: outcome.features.map((feature) =>
              feature.id === featureId
                ? {
                    ...feature,
                    tasks: feature.tasks.filter((task) => task.id !== taskId),
                  }
                : feature,
            ),
          })),
        );
      },
      saveOutput(projectId, outcomeId, title, notes) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              outputDraft: title,
              outputNotes: notes,
            })),
            "output",
            "Saved output draft",
            title || "Untitled draft",
            projectId,
            outcomeId,
          ),
        );
      },
      submitOutput(projectId, outcomeId, title, notes) {
        commit((current) =>
          log(
            updateOutcome(current, projectId, outcomeId, (outcome) => ({
              ...outcome,
              status: "For review",
              outputDraft: title,
              outputNotes: notes,
              submissions: [
                {
                  id: uid("submission"),
                  version: outcome.submissions.length + 1,
                  title,
                  notes,
                  state: "For review",
                  submittedAt: new Date().toISOString(),
                  feedback: "",
                  verification: outcome.criteria.map(() => false),
                },
                ...outcome.submissions,
              ],
            })),
            "output",
            "Submitted output",
            title,
            projectId,
            outcomeId,
          ),
        );
      },
      reviewOutput(projectId, outcomeId, accepted, feedback, verification) {
        let valid = true;
        commit((current) => {
          const project = current.projects.find(
            (item) => item.id === projectId,
          );
          const currentOutcome = project
            ? findOutcome(project, outcomeId)
            : undefined;
          if (
            !currentOutcome ||
            !currentOutcome.submissions.length ||
            (accepted && verification.some((item) => !item)) ||
            (!accepted && !feedback.trim())
          ) {
            valid = false;
            return current;
          }
          let next = updateOutcome(
            current,
            projectId,
            outcomeId,
            (outcome) => ({
              ...outcome,
              status: accepted ? "Accepted" : "Needs revision",
              feedback,
              submissions: outcome.submissions.map((submission, index) =>
                index === 0
                  ? {
                      ...submission,
                      state: accepted ? "Accepted" : "Needs revision",
                      feedback,
                      verification,
                    }
                  : submission,
              ),
            }),
          );
          if (accepted)
            next = updateProject(next, projectId, (p) => ({
              ...p,
              stages: p.stages.map((stage) => ({
                ...stage,
                outcomes: stage.outcomes.map((outcome) =>
                  outcome.prerequisiteId === outcomeId &&
                  outcome.status === "Blocked"
                    ? { ...outcome, status: "Planned" }
                    : outcome,
                ),
              })),
            }));
          return log(
            next,
            "output",
            accepted ? "Accepted output" : "Requested revision",
            feedback,
            projectId,
            outcomeId,
          );
        });
        return valid;
      },
      sendProjectMessage(projectId, text) {
        commit((current) =>
          updateProject(current, projectId, (project) => ({
            ...project,
            messages: [
              ...project.messages,
              {
                id: uid("message"),
                author:
                  current.members.find(
                    (member) => member.id === current.currentMemberId,
                  )?.name ?? "You",
                text,
                createdAt: new Date().toISOString(),
              },
            ],
          })),
        );
      },
      postAnnouncement(projectId, text, pinned) {
        commit((current) =>
          log(
            updateProject(current, projectId, (project) => ({
              ...project,
              announcements: [
                {
                  id: uid("announcement"),
                  author:
                    current.members.find(
                      (member) => member.id === current.currentMemberId,
                    )?.name ?? "You",
                  text,
                  createdAt: new Date().toISOString(),
                  pinned,
                },
                ...project.announcements,
              ],
            })),
            "announcement",
            "Posted announcement",
            text,
            projectId,
          ),
        );
      },
      toggleAnnouncement(projectId, announcementId) {
        commit((current) =>
          updateProject(current, projectId, (project) => ({
            ...project,
            announcements: project.announcements.map((item) =>
              item.id === announcementId
                ? { ...item, pinned: !item.pinned }
                : item,
            ),
          })),
        );
      },
      sendRoomMessage(roomId, text) {
        commit((current) => ({
          ...current,
          roomMessages: {
            ...current.roomMessages,
            [roomId]: [
              ...(current.roomMessages[roomId] ?? []),
              {
                id: uid("room-message"),
                author:
                  current.members.find(
                    (member) => member.id === current.currentMemberId,
                  )?.name ?? "You",
                text,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }));
      },
      toggleTime() {
        commit((current) => {
          const open = current.sessions.find(
            (session) =>
              session.memberId === current.currentMemberId && !session.endedAt,
          );
          const sessions = open
            ? current.sessions.map((session) =>
                session.id === open.id
                  ? { ...session, endedAt: new Date().toISOString() }
                  : session,
              )
            : [
                ...current.sessions,
                {
                  id: uid("session"),
                  memberId: current.currentMemberId,
                  startedAt: new Date().toISOString(),
                  endedAt: null,
                },
              ];
          const members = current.members.map((member) =>
            member.id === current.currentMemberId
              ? { ...member, working: !open }
              : member,
          );
          return log(
            { ...current, sessions, members },
            "time",
            open ? "Timed out" : "Timed in",
            open ? "Ended a work session." : "Started a work session.",
          );
        });
      },
      setWorking(memberId, working) {
        commit((current) => ({
          ...current,
          members: current.members.map((member) =>
            member.id === memberId ? { ...member, working } : member,
          ),
        }));
      },
      generateSchedule(weeklyHours, dailyHours, restDays) {
        commit((current) => {
          const workDays = Math.max(1, Math.min(7, 7 - restDays));
          let remaining = Math.max(1, weeklyHours);
          const generated: ScheduleBlock[] = [];
          for (let day = 0; day < workDays && remaining > 0; day += 1) {
            const duration = Math.min(Math.max(1, dailyHours), remaining);
            generated.push({
              id: uid("block"),
              memberId: current.currentMemberId,
              day,
              start: 9,
              end: 9 + duration,
            });
            remaining -= duration;
          }
          return log(
            {
              ...current,
              schedule: [
                ...current.schedule.filter(
                  (block) => block.memberId !== current.currentMemberId,
                ),
                ...generated,
              ],
            },
            "schedule",
            "Generated schedule",
            `${weeklyHours} planned hours.`,
          );
        });
      },
      adjustSchedule(blockId, deltaStart, deltaDuration, dayDelta = 0) {
        commit((current) =>
          log(
            {
              ...current,
              schedule: current.schedule.map((block) =>
                block.id === blockId
                  ? {
                      ...block,
                      day: Math.max(0, Math.min(6, block.day + dayDelta)),
                      start: Math.max(
                        7,
                        Math.min(23, block.start + deltaStart),
                      ),
                      end: Math.max(
                        8,
                        Math.min(24, block.end + deltaStart + deltaDuration),
                      ),
                    }
                  : block,
              ),
            },
            "schedule",
            "Updated shift",
            "Adjusted a planned schedule block.",
          ),
        );
      },
      addOverride(memberId, weekOffset, day, start, end) {
        commit((current) =>
          log(
            {
              ...current,
              overrides: [
                ...current.overrides,
                { id: uid("override"), memberId, weekOffset, day, start, end },
              ],
            },
            "schedule",
            "Added schedule override",
            `Day ${day + 1}: ${start}:00–${end}:00.`,
          ),
        );
      },
      clearOverrides(memberId, weekOffset, day) {
        commit((current) => ({
          ...current,
          overrides: current.overrides.filter(
            (item) =>
              !(
                item.memberId === memberId &&
                item.weekOffset === weekOffset &&
                item.day === day
              ),
          ),
        }));
      },
      resetDemo() {
        setState(seed);
      },
    }),
    [commit, log, seed],
  );

  const currentMember =
    state.members.find((member) => member.id === state.currentMemberId) ??
    state.members[0]!;
  return (
    <Context.Provider value={{ state, currentMember, ...actions }}>
      {children}
    </Context.Provider>
  );
}

export function useOperationalDemo() {
  const value = useContext(Context);
  if (!value)
    throw new Error(
      "useOperationalDemo must be used within OperationalDemoProvider",
    );
  return value;
}
