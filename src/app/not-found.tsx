import { SearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="app-scene" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl rounded-xl border bg-card shadow-[0_12px_36px_rgba(55,39,31,0.07)]">
        <EmptyState
          icon={<SearchX />}
          title="Page not found"
          description="The page may have moved or the address may be incorrect."
          action={
            <Link href="/dashboard" className={buttonVariants()}>
              Go to dashboard
            </Link>
          }
        />
      </div>
    </main>
  );
}
