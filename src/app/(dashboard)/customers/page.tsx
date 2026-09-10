import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { requireCurrentUser } from "@/features/auth/queries";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { listCustomers } from "@/features/customers/queries";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, user] = await Promise.all([
    searchParams,
    requireCurrentUser(),
  ]);
  const result = await listCustomers(params);

  return (
    <div className="relative min-h-svh pb-12">
      <WorkspaceToolbar section="Workspace" current="Customers" />
      <PageContainer className="pt-6 lg:pt-7">
        <PageHeader
          eyebrow="Client records"
          title="Customers"
          description="Search, filter, and maintain customer records. Mutations are validated, authorized, revalidated, and audited."
        />
        <CustomerTable result={result} role={user.role} />
      </PageContainer>
    </div>
  );
}
