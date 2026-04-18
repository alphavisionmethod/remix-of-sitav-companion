// ═══════════════════════════════════════════════════════════════
// Nova SDK — Layout System
// Constraint-based layout primitives enforcing SPACE scale
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { cn } from "@/lib/utils";
import { SPACE } from "@/lib/design-system/app-window-system";

type SpaceKey = keyof typeof SPACE;

// ── VStack ───────────────────────────────────────────────────

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: SpaceKey;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  padding?: SpaceKey;
}

export const VStack: React.FC<StackProps> = ({ spacing = "tight", align = "stretch", justify, padding, className, style, ...props }) => (
  <div
    className={cn("flex flex-col", className)}
    style={{
      gap: SPACE[spacing],
      alignItems: align === "stretch" ? "stretch" : `flex-${align}`,
      justifyContent: justify ? (justify === "between" ? "space-between" : justify === "around" ? "space-around" : `flex-${justify}`) : undefined,
      padding: padding ? SPACE[padding] : undefined,
      ...style,
    }}
    {...props}
  />
);

export const HStack: React.FC<StackProps> = ({ spacing = "tight", align = "center", justify, padding, className, style, ...props }) => (
  <div
    className={cn("flex flex-row", className)}
    style={{
      gap: SPACE[spacing],
      alignItems: align === "stretch" ? "stretch" : align === "center" ? "center" : `flex-${align}`,
      justifyContent: justify ? (justify === "between" ? "space-between" : justify === "around" ? "space-around" : `flex-${justify}`) : undefined,
      padding: padding ? SPACE[padding] : undefined,
      ...style,
    }}
    {...props}
  />
);

// ── Spacer ───────────────────────────────────────────────────

interface SpacerProps {
  size?: SpaceKey;
  flex?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ size, flex = !size }) => (
  <div style={flex ? { flex: 1 } : { height: size ? SPACE[size] : 0, width: size ? SPACE[size] : 0 }} />
);

// ── Divider ──────────────────────────────────────────────────

interface DividerProps {
  vertical?: boolean;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ vertical, className }) => (
  <div className={cn(
    "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)]",
    vertical ? "w-px self-stretch" : "h-px w-full",
    className
  )} />
);

// ── SplitView ────────────────────────────────────────────────

interface SplitViewProps {
  sidebar: React.ReactNode;
  sidebarWidth?: number;
  children: React.ReactNode;
  className?: string;
}

export const SplitView: React.FC<SplitViewProps> = ({ sidebar, sidebarWidth = 160, children, className }) => (
  <div className={cn("flex min-h-0 flex-1", className)}>
    <div
      className="border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] flex-shrink-0 overflow-y-auto"
      style={{ width: sidebarWidth, padding: SPACE.tight }}
    >
      {sidebar}
    </div>
    <div className="flex-1 overflow-y-auto" style={{ padding: SPACE.normal }}>
      {children}
    </div>
  </div>
);

// ── AppLayout ────────────────────────────────────────────────
// Enforces the mandatory app structure: optional sidebar + content

interface AppLayoutProps {
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, sidebarWidth = 144, toolbar, children, minHeight = 280, className }) => (
  <div className={cn("flex flex-col", className)} style={{ minHeight }}>
    {toolbar && (
      <div className="border-b border-[hsl(0_0%_0%/0.04)] dark:border-[hsl(0_0%_100%/0.04)] px-3 flex items-center" style={{ height: 36 }}>
        {toolbar}
      </div>
    )}
    <div className="flex flex-1 min-h-0">
      {sidebar && (
        <div
          className="border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] flex-shrink-0 overflow-y-auto"
          style={{ width: sidebarWidth, padding: SPACE.tight }}
        >
          {sidebar}
        </div>
      )}
      <div className="flex-1 overflow-y-auto" style={{ padding: SPACE.normal }}>
        {children}
      </div>
    </div>
  </div>
);

// ── ScrollArea ───────────────────────────────────────────────

export const NovaScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("overflow-y-auto scrollbar-thin", className)} {...props} />
);
