import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-[0.03em] uppercase",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary-strong",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-primary/10 text-primary-strong",
        warning: "bg-chart-3/10 text-chart-3",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
