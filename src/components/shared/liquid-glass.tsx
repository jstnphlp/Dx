"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

import { LiquidGlassEngine, type LiquidGlassOptions } from "@/lib/liquid-glass";
import { cn } from "@/lib/utils";

export type LiquidGlassKind = "navigation" | "toolbar" | "control" | "overlay";

const presets: Record<LiquidGlassKind, Partial<LiquidGlassOptions>> = {
  navigation: {
    bezelWidth: 8,
    depth: 7,
    ior: 1.36,
    profile: "smooth",
    blur: 0.65,
    saturation: 1.1,
    tint: "rgba(255,252,249,.22)",
    specular: {
      intensity: 0.24,
      shininess: 38,
      lightDir: [-0.45, -0.72, 0.52],
    },
  },
  toolbar: {
    bezelWidth: 15,
    depth: 9,
    ior: 1.39,
    profile: "smooth",
    blur: 0.65,
    saturation: 1.1,
    tint: "rgba(255,252,249,.22)",
    specular: {
      intensity: 0.42,
      shininess: 34,
      lightDir: [-0.45, -0.72, 0.52],
    },
  },
  control: {
    bezelWidth: 14,
    depth: 17,
    ior: 1.47,
    profile: "lens",
    blur: 0.55,
    saturation: 1.22,
    tint: "rgba(255,252,249,.26)",
    specular: {
      intensity: 0.67,
      shininess: 26,
      lightDir: [-0.45, -0.72, 0.52],
    },
  },
  overlay: {
    bezelWidth: 14,
    depth: 8,
    ior: 1.37,
    profile: "smooth",
    blur: 0.65,
    saturation: 1.04,
    tint: "rgba(249,246,242,.92)",
    specular: {
      intensity: 0.24,
      shininess: 38,
      lightDir: [-0.45, -0.72, 0.52],
    },
  },
};

interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  contentClassName?: string;
  kind?: LiquidGlassKind;
  renderKey?: string | number;
}

export function LiquidGlass({
  children,
  className,
  contentClassName,
  kind = "navigation",
  renderKey,
  ...props
}: LiquidGlassProps) {
  const opticsRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidGlassEngine | null>(null);

  useEffect(() => {
    if (!opticsRef.current) return;

    const options = presets[kind];
    if (!engineRef.current) {
      engineRef.current = new LiquidGlassEngine(opticsRef.current, options);
    } else {
      engineRef.current.setOptions(options);
    }

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [kind, renderKey]);

  return (
    <div className={cn("liquid-glass", className)} {...props}>
      <div
        ref={opticsRef}
        className="liquid-glass__optics"
        aria-hidden="true"
      />
      <div className={cn("liquid-glass__content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
