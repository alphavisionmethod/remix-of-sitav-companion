import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon, ArrowRight, Sparkles, AlertTriangle, Clock, CheckCircle, FileText, Receipt, ShieldCheck } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { TrustBadge, TrustLevel } from "./TrustBadge";
import { StateBadge, ExecutionState } from "./StateBadge";

/* =============== TIMELINE ITEM =============== */
export const TimelineItem = ({ icon: Icon, color, title, subtitle, time, className }: {
  icon: LucideIcon; color?: string; title: string; subtitle?: string; time: string; className?: string;
}) => (
  <div className={cn("flex gap-3 py-2.5", className)}>
    <div className="flex flex-col items-center">
      <div className={cn("rounded-lg bg-secondary p-1.5", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-1 flex-1 w-px bg-border" />
    </div>
    <div className="flex-1 pb-3">
      <p className="text-sm text-foreground leading-snug">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <p className="mt-1 text-[11px] text-muted-foreground/70">{time}</p>
    </div>
  </div>
);

/* =============== OPPORTUNITY CARD =============== */
export const OpportunityCard = ({ title, description, action, onClick, className }: {
  title: string; description?: string; action?: string; onClick?: () => void; className?: string;
}) => (
  <div onClick={onClick} className={cn("lane-opportunity rounded-xl border border-border bg-card p-4 pl-5 transition-all hover:shadow-card-hover hover:border-accent/20 cursor-pointer", className)}>
    <div className="flex items-start gap-3">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        {action && (
          <button className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/20">
            {action} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  </div>
);

/* =============== RISK CARD =============== */
export const RiskCard = ({ title, description, severity, onClick, className }: {
  title: string; description?: string; severity: "high" | "medium" | "low"; onClick?: () => void; className?: string;
}) => (
  <div onClick={onClick} className={cn("lane-action rounded-xl border border-border bg-card p-4 pl-5 transition-all hover:shadow-card-hover cursor-pointer", className)}>
    <div className="flex items-start gap-3">
      <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", severity === "high" ? "text-urgency-critical" : severity === "medium" ? "text-urgency-high" : "text-urgency-medium")} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <TrustBadge level={severity === "high" ? "blocked" : severity === "medium" ? "degraded" : "review"} size="sm" />
    </div>
  </div>
);

/* =============== PROOF CARD =============== */
export const ProofCard = ({ title, artifact, time, trust, state, hash, className }: {
  title: string; artifact: string; time: string; trust: TrustLevel; state: ExecutionState; hash?: string; className?: string;
}) => (
  <div className={cn(
    "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover cursor-pointer",
    trust === "verified" && "proof-card-verified",
    className
  )}>
    <div className="flex items-start gap-3">
      <div className={cn("rounded-lg p-2", trust === "verified" ? "bg-trust-verified/10" : "bg-primary/8")}>
        <Receipt className={cn("h-4 w-4", trust === "verified" ? "text-trust-verified" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{artifact}</p>
        {hash && (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 truncate" title={hash}>
            <ShieldCheck className="inline h-2.5 w-2.5 mr-1" />{hash.slice(0, 8)}…{hash.slice(-6)}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/70">{time}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StateBadge state={state} size="sm" />
        <TrustBadge level={trust} size="sm" />
      </div>
    </div>
  </div>
);

/* =============== ADVISOR CARD =============== */
export const AdvisorCard = ({ name, role, confidence, recommendation, reasoning, requiresApproval, className }: {
  name: string; role: string; confidence: "High" | "Medium" | "Low"; recommendation: string; reasoning?: string; requiresApproval?: boolean; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-sita font-display text-xs font-bold text-primary-foreground">
        {name.split(" ").map(n => n[0]).join("")}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-[11px] text-muted-foreground">{role} · Confidence: {confidence}</p>
      </div>
    </div>
    <p className="text-sm text-foreground">{recommendation}</p>
    {reasoning && <p className="mt-1.5 text-xs text-muted-foreground italic">{reasoning}</p>}
    {requiresApproval && (
      <div className="mt-3">
        <TrustBadge level="approval" label="Requires Approval" />
      </div>
    )}
  </div>
);

/* =============== EMPTY STATE =============== */
/**
 * EmptyState — backward-compatible shim.
 * For new code, prefer PremiumEmptyState with variant support.
 */
export const EmptyState = ({ icon: Icon, title, description, action, className }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode; className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
    <div className="rounded-2xl bg-secondary p-5">
      <Icon className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="mt-4 font-display text-sm font-semibold text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* =============== LOADING STATE =============== */
export const LoadingState = ({ message = "Loading...", className }: { message?: string; className?: string }) => (
  <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
    <div className="space-y-2 w-full max-w-xs">
      <div className="skeleton-sita h-6 w-3/4 mx-auto" />
      <div className="skeleton-sita h-4 w-full" />
      <div className="skeleton-sita h-4 w-5/6 mx-auto" />
      <div className="skeleton-sita h-10 w-full mt-4" />
    </div>
    <p className="mt-4 text-xs text-muted-foreground">{message}</p>
  </div>
);

/* =============== ERROR STATE =============== */
export const ErrorState = ({ title = "Something went wrong", message, onRetry, diagnosticLink, className }: {
  title?: string; message?: string; onRetry?: () => void; diagnosticLink?: string; className?: string;
}) => (
  <div className={cn("rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center", className)}>
    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {message && <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">{message}</p>}
    <div className="flex items-center justify-center gap-3 mt-4">
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors">
          Retry
        </button>
      )}
      {diagnosticLink && (
        <a href={diagnosticLink} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
          View Diagnostics
        </a>
      )}
    </div>
  </div>
);

/* =============== KPI COUNT-UP HOOK =============== */
function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return current;
}

/* =============== KPI TILE =============== */
export const KPITile = ({ label, value, trend, icon: Icon, sub, className, animate }: {
  label: string; value: string | number; trend?: "up" | "down" | "flat"; icon?: LucideIcon; sub?: string; className?: string; animate?: boolean;
}) => {
  // Extract numeric portion for count-up
  const numericTarget = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const prefix = typeof value === "string" ? (value.match(/^[^0-9]*/)?.[0] || "") : "";
  const suffix = typeof value === "string" ? (value.match(/[^0-9.]*$/)?.[0] || "") : "";
  const animatedNum = useCountUp(animate !== false ? numericTarget : numericTarget, 800);
  const displayValue = animate !== false && numericTarget > 0
    ? `${prefix}${animatedNum.toLocaleString()}${suffix}`
    : value;

  return (
    <div className={cn("group rounded-xl border border-border bg-card p-4 card-hover-lift", className)}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold tracking-tight text-foreground tabular-nums kpi-count-up">{displayValue}</p>
        {trend && (
          <span className={cn("text-xs font-semibold tabular-nums", trend === "up" ? "text-trust-safe" : trend === "down" ? "text-urgency-high" : "text-muted-foreground")}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
};

/* =============== URGENCY BADGE =============== */
export const UrgencyBadge = ({ level, className }: { level: "critical" | "high" | "medium" | "low" | "none"; className?: string }) => {
  const styles = {
    critical: "text-urgency-critical bg-urgency-critical/10 border-urgency-critical/20",
    high: "text-urgency-high bg-urgency-high/10 border-urgency-high/20",
    medium: "text-urgency-medium bg-urgency-medium/10 border-urgency-medium/20",
    low: "text-urgency-low bg-urgency-low/10 border-urgency-low/20",
    none: "text-urgency-none bg-urgency-none/10 border-urgency-none/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", styles[level], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", `bg-urgency-${level}`)} />
      {level}
    </span>
  );
};

/* =============== CUSTOMER ROW =============== */
export const CustomerRow = ({ name, initials, subtitle, value, trust, onClick, className }: {
  name: string; initials: string; subtitle: string; value?: string; trust: TrustLevel; onClick?: () => void; className?: string;
}) => (
  <div onClick={onClick} className={cn("flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover hover:border-primary/15 cursor-pointer", className)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary">{initials}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="font-display text-sm font-semibold text-foreground">{value}</span>}
      <TrustBadge level={trust} size="sm" />
    </div>
  </div>
);

/* =============== CONTEXTUAL DRAWER =============== */
export const ContextDrawer = ({ open, onClose, title, children, className }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string;
}) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("fixed right-0 top-0 z-50 h-full w-[400px] max-w-[90vw] animate-slide-in-right border-l border-border bg-card overflow-y-auto scrollbar-thin", className)}>
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4 z-10">
          <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
};

/* =============== TAB BAR =============== */
export const SitaTabs = ({ tabs, active, onChange, className }: {
  tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (key: string) => void; className?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLabel = tabs.find((t) => t.key === active)?.label ?? active;

  // Auto-scroll active tab into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector("[data-active='true']") as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  return (
    <div className={cn("relative", className)}>
      {/* Scrollable pill bar */}
      <div
        ref={scrollRef}
        className="flex gap-0.5 rounded-xl bg-surface-1 p-1 border border-border/40 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            data-active={active === t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap snap-start shrink-0 min-h-[36px] touch-manipulation transition-colors duration-200",
              active === t.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
            )}
          >
            {active === t.key && (
              <motion.div
                layoutId="sita-tab-pill"
                className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {t.label}
              {t.count !== undefined && (
                <span className={cn("ml-1.5 rounded-full px-1.5 py-px text-[10px]", active === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  {t.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* =============== SECTION HEADER =============== */
export const SectionHeader = ({ title, subtitle, action, className }: {
  title: string; subtitle?: string; action?: ReactNode; className?: string;
}) => (
  <div className={cn("flex items-end justify-between", className)}>
    <div>
      <h3 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);
