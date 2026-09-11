"use client";

import { BellRing } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastSimulator() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("Simulation complete", {
          description: "The centered Liquid Glass toast is working.",
        })
      }
    >
      <BellRing /> Test toast
    </Button>
  );
}
