import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceToolbar } from "@/components/shared/workspace-toolbar";

interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="relative min-h-svh pb-12">
      <WorkspaceToolbar section="Workspace" current={title} />

      <PageContainer className="pt-6 lg:pt-7">
        <PageHeader
          eyebrow="Workspace"
          title={title}
          description="This workspace is being prepared."
        />

        <section className="grid min-h-[28rem] place-items-center rounded-xl border border-border/80 bg-secondary px-6 text-center shadow-[0_4px_15px_rgba(55,39,31,0.025)]">
          <div>
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.13em] text-primary uppercase">
              Coming soon
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
              {title} is on the way.
            </h2>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
