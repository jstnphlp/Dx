import { ArrowRight, FolderKanban, UsersRound } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { LiquidGlass } from "@/components/shared/liquid-glass";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";
import { ToastSimulator } from "@/components/shared/toast-simulator";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/features/auth/queries";
import {
  getCustomerSummary,
  getRecentCustomers,
} from "@/features/customers/queries";

const statusVariant = {
  active: "success",
  lead: "warning",
  inactive: "muted",
} as const;

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

        <LiquidGlass
          kind="data"
          renderKey={`overview-${summary.total}-${recent.length}`}
          className="overflow-hidden rounded-[1.25rem] border border-white/85 shadow-[0_14px_38px_rgba(55,39,31,0.07)]"
          role="region"
          aria-label="Customer overview"
        >
          <section aria-labelledby="customer-summary-title">
            <CardHeader className="border-b border-foreground/10 px-4 py-4 sm:px-4 sm:pt-4">
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
          </section>

          <section aria-labelledby="recent-customers-title">
            <CardHeader className="flex-row items-start justify-between gap-4 border-y border-foreground/10 px-4 py-4 sm:px-4 sm:pt-4">
              <div>
                <CardTitle id="recent-customers-title" className="text-base">
                  Recently added
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  The latest customer records in this workspace.
                </p>
              </div>
              <Link
                href="/customers"
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>

            <CardContent className="p-0 sm:p-0">
              {recent.length ? (
                <div className="divide-y">
                  {recent.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/45"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {customer.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {customer.email ?? "No email address"}
                        </p>
                      </div>
                      <Badge
                        variant={statusVariant[customer.status]}
                        className="capitalize"
                      >
                        {customer.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8">
                  <EmptyState
                    icon={<UsersRound />}
                    title="No customers yet"
                    description="Add your first customer to populate this workspace."
                  />
                </div>
              )}
            </CardContent>
          </section>
        </LiquidGlass>
      </PageContainer>
    </div>
  );
}
