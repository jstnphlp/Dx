import type { Metadata } from "next";

import { OperationsReports } from "@/features/reports/components/operations-reports";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default function ReportsPage() {
  return <OperationsReports />;
}
