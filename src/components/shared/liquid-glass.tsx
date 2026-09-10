"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

import {
  LiquidGlassEngine,
  type LiquidGlassOptions,
} from "@/lib/liquid-glass";
import { cn } from "@/lib/utils";

export type LiquidGlassKind =
  | "navigation"
  | "toolbar"
  | "control"
  | "inspector";

const presets: Record<LiquidGlassKind, Partial<LiquidGlassOptions>> = {
  navigation: {
    bezelWidth: 18,
    depth: 13,
    ior: 1.42,
    profile: "lens",
    blur: 1.05,
    saturation: 1.16,
    tint: "rgba(255,252,249,.43)",
    specular: { intensity: 0.5, shininess: 30, lightDir: [-0.45, -0.72, 0.52] },
  },
  toolbar: {
    bezelWidth: 15,
    depth: 12,
    ior: 1.42,
    profile: "smooth",
    blur: 0.75,
    saturation: 1.16,
    tint: "rgba(255,252,249,.34)",
    specular: { intensity: 0.57, shininess: 30, lightDir: [-0.45, -0.72, 0.52] },
  },
  control: {
    bezelWidth: 14,
    depth: 17,
    ior: 1.47,
    profile: "lens",
    blur: 0.55,
    saturation: 1.22,
    tint: "rgba(255,252,249,.26)",
    specular: { intensity: 0.67, shininess: 26, lightDir: [-0.45, -0.72, 0.52] },
  },
  inspector: {
    bezelWidth: 14,
    depth: 8,
    ior: 1.37,
    profile: "smooth",
    blur: 0.45,
    saturation: 1.06,
    tint: "rgba(249,246,242,.82)",
    specular: { intensity: 0.3, shininess: 34, lightDir: [-0.45, -0.72, 0.52] },
  },
};

interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  kind?: LiquidGlassKind;
  renderKey?: string | number;
}

export function LiquidGlass({
  children,
  className,
  kind = "navigation",
  renderKey,
  ...props
}: LiquidGlassProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidGlassEngine | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const options = presets[kind];
    if (!engineRef.current) {
      engineRef.current = new LiquidGlassEngine(elementRef.current, options);
    } else {
      engineRef.current.setOptions(options);
    }

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [kind, renderKey]);

  return (
    <div
      ref={elementRef}
      className={cn("liquid-glass", className)}
      {...props}
    >
      {children}
    </div>
  );
}
