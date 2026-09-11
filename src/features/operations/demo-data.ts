export type DepartmentId = "rd" | "creatives" | "sm" | "leadership";

export const departments = {
  rd: {
    name: "R&D",
    short: "R&D",
    tagline: "Research. Build. Improve.",
  },
  creatives: {
    name: "Creatives",
    short: "Creatives",
    tagline: "Design. Shape. Communicate.",
  },
  sm: {
    name: "Sales & Marketing",
    short: "S&M",
    tagline: "Reach. Learn. Grow.",
  },
  leadership: {
    name: "X Team",
    short: "X Team",
    tagline: "Decide. Align. Lead.",
  },
} satisfies Record<
  DepartmentId,
  { name: string; short: string; tagline: string }
>;

export const members = [
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
    id: "nico",
    name: "Nico Ramos",
    role: "Software Developer",
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
] as const;

export type ProjectDemo = {
  id: string;
  title: string;
  description: string;
  status: "Planning" | "In Progress" | "Done";
  progress: number;
  openOutcomes: number;
  totalOutcomes: number;
  stages: string[];
  departments: DepartmentId[];
  workers: string[];
};

export const projects: ProjectDemo[] = [
  {
    id: "cms",
    title: "Client Management System",
    description:
      "Client-facing management platform with onboarding, account tracking, dashboards, communication, and administrative tools.",
    status: "In Progress",
    progress: 42,
    openOutcomes: 14,
    totalOutcomes: 17,
    stages: ["Project setup", "Research & planning", "Design & UX"],
    departments: ["rd", "creatives", "sm", "leadership"],
    workers: ["Nico Ramos", "Bea Santos", "Marco Reyes"],
  },
  {
    id: "dx",
    title: "Dx Visual System",
    description:
      "Internal visual and interaction system for the Prometheus operating environment.",
    status: "In Progress",
    progress: 66,
    openOutcomes: 3,
    totalOutcomes: 3,
    stages: ["Visual direction", "Implementation"],
    departments: ["creatives", "rd"],
    workers: ["Bea Santos", "Nico Ramos"],
  },
  {
    id: "customers",
    title: "First 10 Customers",
    description:
      "Build and qualify a repeatable pipeline for the company’s first ten paying customers.",
    status: "Planning",
    progress: 30,
    openOutcomes: 2,
    totalOutcomes: 2,
    stages: ["Market learning"],
    departments: ["sm", "leadership"],
    workers: ["Marco Reyes", "Rex Jumawid"],
  },
  {
    id: "disc",
    title: "DISC",
    description:
      "Research and organize the next validation experiment and technical proof.",
    status: "Planning",
    progress: 15,
    openOutcomes: 1,
    totalOutcomes: 1,
    stages: ["Research"],
    departments: ["rd"],
    workers: [],
  },
];

export const scheduleBlocks = [
  {
    person: "Rex Jumawid",
    department: "leadership",
    day: 0,
    start: 14,
    duration: 8,
  },
  {
    person: "Rex Jumawid",
    department: "leadership",
    day: 2,
    start: 10,
    duration: 5,
  },
  {
    person: "Rex Jumawid",
    department: "leadership",
    day: 4,
    start: 14,
    duration: 4,
  },
  {
    person: "Ana Mendoza",
    department: "leadership",
    day: 1,
    start: 9,
    duration: 4,
  },
  {
    person: "Ana Mendoza",
    department: "leadership",
    day: 3,
    start: 13,
    duration: 4,
  },
  {
    person: "Ana Mendoza",
    department: "leadership",
    day: 4,
    start: 15,
    duration: 4,
  },
  { person: "Nico Ramos", department: "rd", day: 0, start: 15, duration: 4 },
  { person: "Nico Ramos", department: "rd", day: 1, start: 7, duration: 5 },
  { person: "Nico Ramos", department: "rd", day: 4, start: 14, duration: 6 },
  { person: "Justin Cruz", department: "rd", day: 1, start: 10, duration: 6 },
  { person: "Justin Cruz", department: "rd", day: 2, start: 13, duration: 7 },
  { person: "Justin Cruz", department: "rd", day: 4, start: 15, duration: 8 },
  {
    person: "Bea Santos",
    department: "creatives",
    day: 1,
    start: 10,
    duration: 6,
  },
  {
    person: "Bea Santos",
    department: "creatives",
    day: 3,
    start: 12,
    duration: 6,
  },
  {
    person: "Bea Santos",
    department: "creatives",
    day: 4,
    start: 14,
    duration: 7,
  },
  { person: "Marco Reyes", department: "sm", day: 2, start: 16, duration: 5 },
  { person: "Marco Reyes", department: "sm", day: 3, start: 10, duration: 5 },
  { person: "Marco Reyes", department: "sm", day: 4, start: 16, duration: 4 },
] as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
