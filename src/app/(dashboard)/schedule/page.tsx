import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return <ComingSoonPage title="Schedule" />;
}
