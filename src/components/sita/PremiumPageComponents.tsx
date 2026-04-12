// ═══════════════════════════════════════════════════════════════
// Premium Page Components — Glassmorphic cards, ambient glows,
// staggered reveals, and entrance animations
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Stagger Container ────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export function StaggerReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ── Glassmorphic Card ────────────────────────────────────────

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "primary" | "accent" | "gold" | "emerald" | "rose" | "none";
  intensity?: "subtle" | "medium" | "strong";
  hover?: boolean;
}

const glowColors: Record<string, string> = {
  primary: "hsl(var(--primary) / 0.08)",
  accent: "hsl(var(--accent) / 0.08)",
  gold: "hsl(45 90% 55% / 0.06)",
  emerald: "hsl(150 60% 45% / 0.06)",
  rose: "hsl(350 70% 55% / 0.06)",
  none: "transparent",
};

const glowShadows: Record<string, string> = {
  primary: "0 0 60px hsl(var(--primary) / 0.08), 0 8px 32px hsl(0 0% 0% / 0.08)",
  accent: "0 0 60px hsl(var(--accent) / 0.08), 0 8px 32px hsl(0 0% 0% / 0.08)",
  gold: "0 0 60px hsl(45 90% 55% / 0.08), 0 8px 32px hsl(0 0% 0% / 0.08)",
  emerald: "0 0 60px hsl(150 60% 45% / 0.08), 0 8px 32px hsl(0 0% 0% / 0.08)",
  rose: "0 0 60px hsl(350 70% 55% / 0.08), 0 8px 32px hsl(0 0% 0% / 0.08)",
  none: "0 4px 24px hsl(0 0% 0% / 0.06)",
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ glow = "none", intensity = "subtle", hover = true, className, style, children, ...props }, ref) => {
    const opacity = intensity === "strong" ? 0.12 : intensity === "medium" ? 0.08 : 0.04;
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-border/60 overflow-hidden",
          hover && "transition-all duration-300 hover:border-border hover:shadow-lg",
          className
        )}
        style={{
          background: `linear-gradient(135deg, hsl(var(--card) / 0.85), hsl(var(--card) / 0.95))`,
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          boxShadow: glowShadows[glow],
          ...style,
        }}
        {...props}
      >
        {/* Ambient glow overlay */}
        {glow !== "none" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 30% 0%, ${glowColors[glow]}, transparent 70%)`,
              opacity: intensity === "strong" ? 1.5 : intensity === "medium" ? 1 : 0.6,
            }}
          />
        )}
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// ── Metric Highlight ─────────────────────────────────────────

interface MetricHighlightProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  glow?: GlassCardProps["glow"];
  icon?: React.ReactNode;
}

export function MetricHighlight({ label, value, sub, trend, glow = "primary", icon }: MetricHighlightProps) {
  return (
    <GlassCard glow={glow} intensity="medium" className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
          <p className="font-display text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {sub && (
            <p className={cn(
              "text-xs mt-0.5",
              trend === "up" ? "text-chart-2" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            )}>
              {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
            </p>
          )}
        </div>
        {icon && <div className="rounded-xl bg-primary/8 p-2.5">{icon}</div>}
      </div>
    </GlassCard>
  );
}

// ── Ambient Section Header ───────────────────────────────────

interface AmbientHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  actions?: React.ReactNode;
}

export function AmbientHeader({ title, subtitle, icon, accentColor, actions }: AmbientHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 16 }}
      className="relative mb-6"
    >
      {/* Ambient glow behind header */}
      {accentColor && (
        <div
          className="absolute -top-8 -left-8 w-64 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: accentColor }}
        />
      )}
      <div className="relative flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: accentColor
                  ? `linear-gradient(135deg, ${accentColor}, transparent)`
                  : "hsl(var(--primary) / 0.1)",
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
    </motion.div>
  );
}

// ── Chart Container (glassmorphic) ───────────────────────────

export function ChartContainer({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <GlassCard glow="primary" intensity="subtle" className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}
