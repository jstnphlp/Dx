import { ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";

import {
  LedgerTable,
  type LedgerStatusTone,
} from "@/components/shared/ledger-table";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { ToastSimulator } from "@/components/shared/toast-simulator";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/features/auth/queries";
import {
  getCustomerSummary,
  getRecentCustomers,
} from "@/features/customers/queries";

const statusTone: Record<string, LedgerStatusTone> = {
  active: "success",
  lead: "info",
  inactive: "neutral",
};

export default async function DashboardPage() {
  const [user, summary, recent] = await Promise.all([
    requireCurrentUser(),
    getCustomerSummary(),
    getRecentCustomers(),
  ]);

  const metrics = [
    ["Total customers", summary.total],
    ["Active", summary.active],
    ["Open leads", summary.leads],
    ["Inactive", summary.inactive],
  ] as const;

  return (
    <div className="relative min-h-svh pb-12">
      <WorkspaceToolbar
        section="Workspace"
        current="Overview"
        actions={
          <Link
            href="/projects"
            className={buttonVariants({
              variant: "ghost",
              size: "lg",
              className: "rounded-xl bg-transparent hover:bg-card/30",
            })}
          >
            <FolderKanban /> Project workspace
          </Link>
        }
      />
      <PageContainer className="pt-6 lg:pt-7">
        <PageHeader
          eyebrow="Workspace overview"
          title={`Good day, ${user.fullName.split(" ")[0]}.`}
          description="A clear view of customer activity and the records that need attention."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ToastSimulator />
              <Link href="/customers" className={buttonVariants()}>
                Manage customers <ArrowRight />
              </Link>
            </div>
          }
        />

        <div className="space-y-6">
          <section aria-labelledby="customer-summary-title">
            <Card className="overflow-hidden rounded-[15px] shadow-[0_12px_34px_rgba(55,39,31,.035)]">
              <CardHeader className="border-b border-foreground/10 px-5 py-[18px] sm:px-5 sm:pt-[18px]">
                <CardTitle id="customer-summary-title" className="text-base">
                  Customer summary
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Current status across all customer records.
                </p>
              </CardHeader>
              <CardContent className="grid p-0 sm:grid-cols-2 sm:p-0 lg:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-foreground/10 p-5 last:border-b-0 sm:border-r sm:nth-[2n]:border-r-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
                  >
                    <p className="text-2xl font-semibold tracking-[-0.035em]">
                      {value}
                    </p>
                    <p className="mt-1 font-mono text-[0.65rem] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                      {label}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <LedgerTable
            size="standard"
            eyebrow="Recently added"
            description="The latest customer records in this workspace."
            rows={recent.map((customer) => ({
              id: customer.id,
              title: customer.name,
              subtitle: customer.email ?? "No email address",
              status: {
                label: customer.status,
                tone: statusTone[customer.status],
              },
            }))}
            actionHref="/customers"
            emptyTitle="No customers yet"
            emptyDescription="Add your first customer to populate this workspace."
            showArrow={false}
          />
        </div>
      </PageContainer>
    </div>
  );
}
