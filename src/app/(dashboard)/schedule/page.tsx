import type { Metadata } from "next";

import { ScheduleWorkspace } from "@/features/schedule/components/schedule-workspace";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return <ScheduleWorkspace />;
}
