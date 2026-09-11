import type { Metadata } from "next";

import { VisiworkOffice } from "@/features/visiwork/components/visiwork-office";

export const metadata: Metadata = { title: "Visiwork" };

export default function VisiworkPage() {
  return <VisiworkOffice />;
}
