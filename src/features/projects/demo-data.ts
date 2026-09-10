import type { ProjectStage, ProjectSummary } from "./types";

export const demoProject: ProjectSummary = {
  name: "Client Management System",
  description:
    "Build a client-facing management platform with onboarding, account tracking, communication history, dashboards, and internal administrative tools.",
  lead: "Rex Jumawid",
  assistant: "Ana Mendoza",
  state: "Active",
};

export const demoStages: ProjectStage[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Discovery & Planning",
    progress: 100,
    outcomes: [
      {
        id: "requirements",
        title: "Validated client requirements",
        description:
          "Approved requirements package defining scope, users, and business rules.",
        state: "Accepted",
        department: "S&M",
        member: "Marco Reyes",
        tasks: "6 / 6 complete",
        features: "2 defined",
        output: "Requirements Pack v1.0",
      },
      {
        id: "architecture",
        title: "Technical solution direction",
        description:
          "Architecture and technical direction agreed before implementation.",
        state: "Accepted",
        department: "R&D",
        member: "Justin Cruz",
        tasks: "5 / 5 complete",
        features: "3 defined",
        output: "Architecture Brief v1",
      },
    ],
  },
  {
    id: "stage-2",
    number: "02",
    title: "Experience Design",
    progress: 58,
    outcomes: [
      {
        id: "prototype",
        title: "Approved end-to-end UI/UX prototype",
        description:
          "Clickable prototype covering the critical customer and staff workflows.",
        state: "For review",
        department: "Creatives",
        member: "Bea Santos",
        tasks: "11 / 13 complete",
        features: "4 defined",
        output: "Figma Prototype v3",
      },
      {
        id: "design-system",
        title: "Production-ready design system",
        description:
          "Reusable design tokens and component specifications ready for R&D.",
        state: "In progress",
        department: "Creatives",
        member: "Bea Santos + Carlo Lim",
        tasks: "7 / 10 complete",
        features: "5 defined",
      },
    ],
  },
  {
    id: "stage-3",
    number: "03",
    title: "Core Development",
    progress: 28,
    outcomes: [
      {
        id: "dashboard",
        title: "Functional client dashboard",
        description:
          "Working dashboard with live states, permissions, and responsive behavior.",
        state: "Blocked",
        department: "R&D",
        member: "Justin Cruz + Nico Ramos",
        tasks: "4 / 12 complete",
        features: "4 defined",
        dependency:
          "Waiting on Stage 02: Production-ready design system must be accepted first.",
      },
      {
        id: "auth",
        title: "Working authentication and role access",
        description:
          "Secure sign-in and role-based access to application areas.",
        state: "In progress",
        department: "R&D",
        member: "Nico Ramos",
        tasks: "5 / 8 complete",
        features: "3 defined",
        output: "Auth branch build",
      },
    ],
  },
  {
    id: "stage-4",
    number: "04",
    title: "Testing & Release",
    progress: 0,
    outcomes: [
      {
        id: "release-candidate",
        title: "Release candidate passes acceptance criteria",
        description:
          "A deployable build that passes functional and technical acceptance checks.",
        state: "Planned",
        department: "R&D",
        member: "Unassigned",
        dependency:
          "Waiting on Stage 03: Core Development outcomes must be accepted.",
      },
      {
        id: "client-approval",
        title: "Client release approval",
        description:
          "Client confirms the release satisfies the agreed project scope.",
        state: "Planned",
        department: "S&M",
        member: "Marco Reyes",
      },
    ],
  },
];
