"use client";

import { ErrorState } from "@/components/shared/error-state";
import { PageContainer } from "@/components/shared/page-container";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState onRetry={reset} />
    </PageContainer>
  );
}
