import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SkeletonTone = "base" | "strong" | "soft" | "accent";

const toneClasses: Record<SkeletonTone, string> = {
  base: "bg-foreground/14",
  strong: "bg-foreground/20",
  soft: "bg-foreground/9",
  accent: "bg-primary/26",
};

interface SkeletonProps extends ComponentProps<"div"> {
  tone?: SkeletonTone;
}

function Skeleton({ className, tone = "base", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-bone rounded-md", toneClasses[tone], className)}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonTone };
