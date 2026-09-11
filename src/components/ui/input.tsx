import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/75 hover:bg-muted/20 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted/70 disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
