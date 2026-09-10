import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps extends ComponentProps<"div"> {
  width?: "standard" | "wide";
}

export function PageContainer({
  className,
  width = "wide",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8 px-5 pt-7 pb-12 sm:px-7 sm:pt-9 lg:px-8 lg:pt-10 lg:pb-14",
        width === "wide" ? "max-w-7xl" : "max-w-5xl",
        className,
      )}
      {...props}
    />
  );
}
