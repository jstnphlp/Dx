import type { Metadata } from "next";

import { TeamDirectory } from "@/features/team/components/team-directory";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return <TeamDirectory />;
}
