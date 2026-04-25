// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Store Premium UI Components
// ═══════════════════════════════════════════════════════════════

import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown, Home, Briefcase, DollarSign, Headphones, TrendingUp, BarChart3, FolderOpen, Shield,
  Sparkles, ShoppingBag, Receipt, Target, Tag, Zap, Plane, Wrench, Building, LineChart,
  Download, Check, Clock, AlertTriangle, ArrowRight, Star, ChevronRight, Package, Workflow,
  Brain, FileText, Plug, Layout, ExternalLink, Lock, RefreshCw, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import type { PackManifest, InternalApp, InstallState, StoreCategory, PackStatus } from "@/lib/pack-store";
import { isInstalled, getInstallState } from "@/lib/pack-store";

// ── Icon Resolver ───────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Crown, Home, Briefcase, DollarSign, Headphones, TrendingUp, BarChart3, FolderOpen, Shield,
  Sparkles, ShoppingBag, Receipt, Target, Tag, Zap, Plane, Wrench, Building, LineChart,
  Package, Workflow, Brain, FileText, Plug, Layout,
};

export const resolveIcon = (name: string) => ICON_MAP[name] || Package;

// ── Status Badge ────────────────────────────────────────────────

export const PackStatusBadge = ({ status }: { status: PackStatus }) => {
  const config: Record<PackStatus, { label: string; className: string }> = {
    available: { label: "Available", className: "bg-secondary text-muted-foreground" },
    installed: { label: "Installed", className: "bg-trust-safe/15 text-trust-safe" },
    installing: { label: "Installing…", className: "bg-primary/15 text-primary animate-pulse" },
    "setup-required": { label: "Setup Required", className: "bg-accent/15 text-accent" },
    "update-available": { label: "Update", className: "bg-primary/15 text-primary" },
    "trial-active": { label: "Trial Active", className: "bg-accent/15 text-accent" },
    "trial-ending": { label: "Trial Ending", className: "bg-urgency-high/15 text-urgency-high" },
    paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
    disabled: { label: "Disabled", className: "bg-muted text-muted-foreground" },
    incompatible: { label: "Incompatible", className: "bg-destructive/15 text-destructive" },
    migrating: { label: "Migrating", className: "bg-accent/15 text-accent animate-pulse" },
  };
  const c = config[status];
  return <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", c.className)}>{c.label}</span>;
};

// ── Tier Badge ──────────────────────────────────────────────────

export const TierBadge = ({ tier }: { tier: string }) => {
  const colors: Record<string, string> = {
    free: "bg-secondary text-muted-foreground",
    starter: "bg-trust-safe/10 text-trust-safe",
    professional: "bg-primary/10 text-primary",
    premium: "bg-accent/10 text-accent",
    enterprise: "bg-foreground/10 text-foreground",
  };
  return <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 capitalize", colors[tier] || colors.free)}>{tier}</span>;
};

// ── Featured Pack Card ──────────────────────────────────────────

export const FeaturedPackCard = ({ pack, onClick }: { pack: PackManifest; onClick: () => void }) => {
  const Icon = resolveIcon(pack.icon);
  const state = getInstallState(pack.pack_id);

  return (
    <div onClick={onClick} className="group relative overflow-hidden rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5">
      {/* Gradient header */}
      <div className={cn("relative h-28 bg-gradient-to-br p-5 flex items-end", pack.gradient)}>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {pack.new_release && <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-white">New</span>}
          <TierBadge tier={pack.entitlement_tier} />
        </div>
        <div className="absolute -bottom-5 -right-5 h-20 w-20 rounded-full bg-white/5 blur-xl" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{pack.name}</h3>
            <p className="text-xs text-white/70">{pack.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{pack.description}</p>

        {/* Outcomes */}
        <div className="space-y-1">
          {pack.outcomes_improved.slice(0, 2).map((o, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3 w-3 text-trust-safe shrink-0" />
              <span className="text-foreground/80">{o}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {pack.rating && (
              <div className="flex items-center gap-0.5 text-xs text-accent">
                <Star className="h-3 w-3 fill-accent" />
                <span className="font-medium">{pack.rating}</span>
              </div>
            )}
            {pack.installs && <span className="text-[10px] text-muted-foreground">{pack.installs.toLocaleString()} installs</span>}
          </div>
          {state ? (
            <PackStatusBadge status={state.status} />
          ) : (
            <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
              <span>View</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Compact Pack Card ───────────────────────────────────────────

export const PackCard = ({ pack, onClick }: { pack: PackManifest; onClick: () => void }) => {
  const Icon = resolveIcon(pack.icon);
  const state = getInstallState(pack.pack_id);

  return (
    <div onClick={onClick} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer transition-all hover:shadow-card-hover hover:border-primary/20">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", pack.gradient)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground truncate">{pack.name}</h4>
          {pack.new_release && <span className="text-[9px] font-bold uppercase text-accent">New</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{pack.subtitle}</p>
      </div>
      <div className="shrink-0">
        {state ? <PackStatusBadge status={state.status} /> : <TierBadge tier={pack.entitlement_tier} />}
      </div>
    </div>
  );
};

// ── Internal App Card ───────────────────────────────────────────

export const InternalAppCard = ({ app, onClick }: { app: InternalApp; onClick: () => void }) => {
  const Icon = resolveIcon(app.icon);

  return (
    <div onClick={onClick} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 cursor-pointer transition-all hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110", app.gradient)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-center">
        <h4 className="text-sm font-semibold text-foreground">{app.name}</h4>
        <p className="text-[10px] text-muted-foreground mt-0.5">{app.subtitle}</p>
      </div>
      {app.premium && <TierBadge tier="premium" />}
    </div>
  );
};

// ── Category Strip ──────────────────────────────────────────────

export const CategoryStrip = ({ categories, activeCategory, onSelect }: {
  categories: { id: string; label: string; icon: string }[];
  activeCategory: string;
  onSelect: (id: string) => void;
}) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
    {categories.map(cat => {
      const Icon = resolveIcon(cat.icon);
      return (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeCategory === cat.id
              ? "bg-primary/15 text-primary border border-primary/20"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {cat.label}
        </button>
      );
    })}
  </div>
);

// ── Install Flow Step ───────────────────────────────────────────

export const InstallStep = ({ step, current, total, title, description, completed }: {
  step: number; current: number; total: number; title: string; description: string; completed: boolean;
}) => (
  <div className={cn(
    "flex items-start gap-3 rounded-xl border p-4 transition-all",
    completed ? "border-trust-safe/20 bg-trust-safe/5" :
    step === current ? "border-primary/20 bg-primary/5" :
    "border-border bg-card opacity-50"
  )}>
    <div className={cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
      completed ? "bg-trust-safe/20 text-trust-safe" :
      step === current ? "bg-primary/20 text-primary" :
      "bg-secondary text-muted-foreground"
    )}>
      {completed ? <Check className="h-3.5 w-3.5" /> : step}
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

// ── Outcome Card ────────────────────────────────────────────────

export const OutcomeCard = ({ outcome }: { outcome: string }) => (
  <div className="flex items-center gap-2 rounded-lg bg-trust-safe/5 border border-trust-safe/10 px-3 py-2">
    <TrendingUp className="h-3.5 w-3.5 text-trust-safe shrink-0" />
    <span className="text-xs font-medium text-foreground">{outcome}</span>
  </div>
);

// ── Workflow Included Card ──────────────────────────────────────

export const WorkflowIncludedCard = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
    <Workflow className="h-3.5 w-3.5 text-primary shrink-0" />
    <span className="text-xs text-foreground capitalize">{name.replace(/-/g, " ")}</span>
  </div>
);

// ── Connector Dependency Card ───────────────────────────────────

export const ConnectorCard = ({ name, required }: { name: string; required: boolean }) => (
  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
    <div className="flex items-center gap-2">
      <Plug className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-foreground capitalize">{name.replace(/-/g, " ")}</span>
    </div>
    {required ? (
      <span className="text-[9px] font-semibold text-accent">Required</span>
    ) : (
      <span className="text-[9px] text-muted-foreground">Optional</span>
    )}
  </div>
);

// ── Pricing Card ────────────────────────────────────────────────

export const PricingCard = ({ pricing, tier, trialDays }: {
  pricing?: { monthly: number; annual: number; currency: string };
  tier: string; trialDays: number;
}) => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
    {pricing ? (
      <>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold text-foreground">${pricing.monthly}</span>
          <span className="text-xs text-muted-foreground">/month</span>
        </div>
        <p className="text-[11px] text-muted-foreground">${pricing.annual}/year (save {Math.round((1 - pricing.annual / (pricing.monthly * 12)) * 100)}%)</p>
      </>
    ) : (
      <span className="font-display text-2xl font-bold text-foreground">Free</span>
    )}
    <TierBadge tier={tier} />
    {trialDays > 0 && (
      <p className="text-xs text-trust-safe flex items-center gap-1">
        <Play className="h-3 w-3" /> {trialDays}-day free trial
      </p>
    )}
  </div>
);

// ── Store Hero ──────────────────────────────────────────────────

export const StoreHero = ({ installedCount, appsEnabled, updatesAvailable, trialsActive }: {
  installedCount: number; appsEnabled: number; updatesAvailable: number; trialsActive: number;
}) => (
  <div className="relative overflow-hidden rounded-2xl gradient-sita-subtle border border-border p-8">
    <div className="relative z-10">
      <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
        <Package className="h-4 w-4" /> Pack Store
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
        Expand your operating intelligence
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-lg">
        Install packs to add workflows, advisors, boardroom views, and templates — everything stays inside one calm, unified OS.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <StoreMetric label="Installed Packs" value={installedCount} />
        <StoreMetric label="Apps Enabled" value={appsEnabled} />
        {updatesAvailable > 0 && <StoreMetric label="Updates" value={updatesAvailable} accent />}
        {trialsActive > 0 && <StoreMetric label="Active Trials" value={trialsActive} accent />}
      </div>
    </div>
    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
    <div className="absolute -bottom-6 right-20 h-28 w-28 rounded-full bg-accent/5 blur-2xl" />
  </div>
);

const StoreMetric = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
  <div className={cn("rounded-lg border px-3 py-1.5", accent ? "border-primary/20 bg-primary/5" : "border-border bg-card")}>
    <span className={cn("font-display text-lg font-bold", accent ? "text-primary" : "text-foreground")}>{value}</span>
    <span className="text-[10px] text-muted-foreground ml-1.5">{label}</span>
  </div>
);

// ── Empty State ─────────────────────────────────────────────────

export const StoreEmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
    <Package className="h-10 w-10 text-muted-foreground/30 mb-4" />
    <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
