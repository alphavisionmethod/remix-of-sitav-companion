import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Typography } from "@/components/sita/Typography";

const appleSpring = { type: "spring", mass: 1, stiffness: 120, damping: 14 };

interface SitaCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  elevated?: boolean;
  glass?: boolean;
  lane?: "action" | "opportunity" | "unresolved" | "changed";
  onClick?: () => void;
  selected?: boolean;
}

export const SitaCard = ({ children, className, glow, hover = true, elevated, glass, lane, onClick, selected }: SitaCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      role="article"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hover && !shouldReduceMotion ? { y: -2, transition: appleSpring } : undefined}
      whileTap={hover && !shouldReduceMotion ? { scale: 0.98, transition: { duration: 0.1 } } : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border/50 bg-card transition-all duration-300 touch-manipulation",
        elevated ? "bg-card-elevated" : "",
        hover && "cursor-pointer hover:shadow-card-hover hover:border-border/80",
        glass && "backdrop-blur-2xl bg-card/60 border-border/30",
        glow && "shadow-glow-purple border-primary/20",
        selected && "border-primary/40 shadow-glow-purple ring-1 ring-primary/20",
        lane === "action" && "lane-action",
        lane === "opportunity" && "lane-opportunity",
        lane === "unresolved" && "lane-unresolved",
        lane === "changed" && "lane-changed",
        !className?.includes("p-") && "p-5",
        className
      )}
      style={!glow && !selected ? { boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.03), var(--shadow-card)" } : undefined}
    >
      {children}
    </motion.div>
  );
};

export const SitaCardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mb-3 flex items-center justify-between", className)}>{children}</div>
);

export const SitaCardTitle = ({ children, className, sub }: { children: ReactNode; className?: string; sub?: string }) => (
  <div>
    <h3 className={cn("font-display text-sm font-semibold tracking-[-0.01em] text-foreground", className)}>{children}</h3>
    {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

export const SitaMetric = ({ label, value, trend, sub, className }: { label: string; value: string | number; trend?: "up" | "down" | "flat"; sub?: string; className?: string }) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="font-display text-3xl font-light tracking-[-0.02em] text-foreground tabular-nums">{value}</p>
      {trend && (
        <span className={cn(
          "text-xs font-semibold px-1.5 py-0.5 rounded-full",
          trend === "up" && "text-trust-safe bg-[hsl(var(--trust-safe)/0.1)]",
          trend === "down" && "text-urgency-high bg-[hsl(var(--urgency-high)/0.1)]",
          trend === "flat" && "text-muted-foreground bg-muted/50"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
        </span>
      )}
    </div>
    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

export const SitaSectionHeader = ({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: ReactNode; className?: string }) => (
  <div className={cn("flex items-end justify-between", className)}>
    <div>
      <h2 className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/50">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SitaPageHeader = ({ title, subtitle, actions, className }: { title: string; subtitle?: string; actions?: ReactNode; className?: string }) => (
  <div role="banner" className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4", className)}>
    <div className="min-w-0">
      <Typography role="appTitle" as="h1" className="text-xl sm:text-[1.75rem]">{title}</Typography>
      {subtitle && <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-lg tracking-[-0.01em]">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
  </div>
);

export const SitaButton = ({ children, variant = "primary", size = "default", className, ...props }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "accent" | "danger"; size?: "sm" | "default"; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 touch-manipulation active:scale-[0.97]",
      size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
      variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
      variant === "secondary" && "border border-border/50 bg-secondary text-secondary-foreground hover:bg-muted",
      variant === "ghost" && "text-muted-foreground hover:bg-secondary hover:text-foreground",
      variant === "accent" && "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20",
      variant === "danger" && "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
