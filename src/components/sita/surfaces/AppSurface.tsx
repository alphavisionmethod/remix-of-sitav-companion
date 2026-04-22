// ═══════════════════════════════════════════════════════════════
// SITA OS — App Surface Wrapper
// Applies surface level hierarchy (0-3) with domain awareness
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { SURFACE_TOKENS, type SurfaceLevel } from "@/platform/design-system/sita-design-tokens";
import type { ReactNode, CSSProperties } from "react";

interface AppSurfaceProps {
  level?: SurfaceLevel;
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "aside" | "main";
  style?: CSSProperties;
}

const LEVEL_CLASSES: Record<SurfaceLevel, string> = {
  0: "bg-surface-0 border-transparent",
  1: "bg-surface-1 border-border-subtle shadow-xs",
  2: "bg-surface-2 border-border shadow-card",
  3: "bg-surface-3 border-border shadow-card-hover",
};

export function AppSurface({ level = 1, children, className, as: Tag = "div", style }: AppSurfaceProps) {
  return (
    <Tag
      className={cn("border rounded-xl", LEVEL_CLASSES[level], className)}
      style={{
        ...style,
        "--surface-level": level,
      } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
