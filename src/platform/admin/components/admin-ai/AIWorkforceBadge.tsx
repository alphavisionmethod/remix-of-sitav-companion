import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const ROLE_DOMAIN_COLORS: Record<string, string> = {
  architecture: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  runtime_truth: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  connectors: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ai_governance: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  quality: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  data: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  devices: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  budget: "bg-green-500/15 text-green-400 border-green-500/30",
  incidents: "bg-red-500/15 text-red-400 border-red-500/30",
  remediation: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function RoleDomainBadge({ domain }: { domain: string }) {
  const cls = ROLE_DOMAIN_COLORS[domain] || "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cls)}>{domain.replace(/_/g, " ")}</span>;
}

export function BudgetClassBadge({ budgetClass }: { budgetClass: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    economy_admin: { label: "Economy", cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    balanced_admin: { label: "Balanced", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    premium_architecture: { label: "Premium", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    deep_audit: { label: "Deep Audit", cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    internal_diagnostics: { label: "Diagnostics", cls: "bg-muted text-muted-foreground border-border" },
  };
  const entry = map[budgetClass] || { label: budgetClass, cls: "bg-muted text-muted-foreground border-border" };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", entry.cls)}>{entry.label}</span>;
}

export function RiskTierBadge({ tier }: { tier: string }) {
  const map: Record<string, { variant: BadgeVariant; cls: string }> = {
    standard: { variant: "outline", cls: "" },
    elevated: { variant: "secondary", cls: "border-amber-500/30 text-amber-400" },
    critical: { variant: "destructive", cls: "" },
  };
  const entry = map[tier] || { variant: "outline" as BadgeVariant, cls: "" };
  return <Badge variant={entry.variant} className={cn("text-xs", entry.cls)}>{tier}</Badge>;
}

export function AutonomyBadge({ level }: { level: string }) {
  return <Badge variant="outline" className="text-xs">{level.replace(/_/g, " ")}</Badge>;
}

export function LaunchHonestyBadge({ cls }: { cls: string }) {
  const map: Record<string, string> = {
    internal_only: "bg-muted text-muted-foreground",
    real_internal: "bg-blue-500/15 text-blue-400",
    demo_governed: "bg-amber-500/15 text-amber-400",
    partial: "bg-orange-500/15 text-orange-400",
    planned: "bg-muted text-muted-foreground",
  };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", map[cls] || "bg-muted text-muted-foreground")}>{cls.replace(/_/g, " ")}</span>;
}
