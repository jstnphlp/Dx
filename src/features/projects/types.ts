export type OutcomeState =
  | "Accepted"
  | "For review"
  | "In progress"
  | "Blocked"
  | "Planned";

export interface Outcome {
  id: string;
  title: string;
  description: string;
  state: OutcomeState;
  department: string;
  member: string;
  tasks?: string;
  features?: string;
  output?: string;
  dependency?: string;
}

export interface ProjectStage {
  id: string;
  number: string;
  title: string;
  progress: number;
  outcomes: Outcome[];
}

export interface ProjectSummary {
  name: string;
  description: string;
  lead: string;
  assistant: string;
  state: "Active" | "Paused" | "Completed";
}
