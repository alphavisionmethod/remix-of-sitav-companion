// ═══════════════════════════════════════════════════════════════
// SITA OS — App Surface Wrapper
// Applies surface level hierarchy (0-3) with domain awareness
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { SURFACE_TOKENS, type SurfaceLevel } from "@/lib/design-system/sita-design-tokens";
import type { ReactNode, CSSProperties } from "react";

interface AppSurfaceProps {
  level?: SurfaceLevel;
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "aside" | "main";
  style?: CSSProperties;
}

const LEVEL_CLASSES: Record<SurfaceLevel, string> = {
  0: "bg-[hsl(0_0%_6%)] border-[hsl(0_0%_100%/0.04)]",
  1: "bg-[hsl(0_0%_9%)] border-[hsl(0_0%_100%/0.06)] shadow-[0_1px_2px_hsl(0_0%_0%/0.04)]",
  2: "bg-[hsl(0_0%_12%)] border-[hsl(0_0%_100%/0.08)] shadow-[0_2px_8px_hsl(0_0%_0%/0.06),0_1px_2px_hsl(0_0%_0%/0.04)]",
  3: "bg-[hsl(0_0%_14%)] border-[hsl(0_0%_100%/0.10)] shadow-[0_4px_16px_hsl(0_0%_0%/0.10),0_12px_32px_hsl(0_0%_0%/0.08)]",
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
