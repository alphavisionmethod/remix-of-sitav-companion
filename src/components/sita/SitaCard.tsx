import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SitaCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  elevated?: boolean;
  lane?: "action" | "opportunity" | "unresolved" | "changed";
  onClick?: () => void;
  selected?: boolean;
}

export const SitaCard = ({ children, className, glow, hover = true, elevated, lane, onClick, selected }: SitaCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    onClick={onClick}
    className={cn(
      "rounded-xl border border-border bg-card transition-all duration-200",
      elevated ? "bg-card-elevated" : "",
      hover && "hover:shadow-card-hover hover:border-primary/15 cursor-pointer",
      glow && "shadow-glow-purple border-primary/20",
      selected && "border-primary/40 shadow-glow-purple ring-1 ring-primary/20",
      lane === "action" && "lane-action",
      lane === "opportunity" && "lane-opportunity",
      lane === "unresolved" && "lane-unresolved",
      lane === "changed" && "lane-changed",
      !className?.includes("p-") && "p-5",
      className
    )}
  >
    {children}
  </motion.div>
);

export const SitaCardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mb-3 flex items-center justify-between", className)}>{children}</div>
);

export const SitaCardTitle = ({ children, className, sub }: { children: ReactNode; className?: string; sub?: string }) => (
  <div>
    <h3 className={cn("font-display text-sm font-semibold tracking-wide text-foreground", className)}>{children}</h3>
    {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

export const SitaMetric = ({ label, value, trend, sub, className }: { label: string; value: string | number; trend?: "up" | "down" | "flat"; sub?: string; className?: string }) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {trend && (
        <span className={cn(
          "text-xs font-semibold",
          trend === "up" && "text-trust-safe",
          trend === "down" && "text-urgency-high",
          trend === "flat" && "text-muted-foreground"
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
      <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SitaPageHeader = ({ title, subtitle, actions, className }: { title: string; subtitle?: string; actions?: ReactNode; className?: string }) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div className="min-w-0">
      <h1 className="font-display text-[1.65rem] font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground max-w-lg">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const SitaButton = ({ children, variant = "primary", size = "default", className, ...props }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "accent" | "danger"; size?: "sm" | "default"; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30",
      size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
      variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
      variant === "secondary" && "border border-border bg-secondary text-secondary-foreground hover:bg-muted",
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
