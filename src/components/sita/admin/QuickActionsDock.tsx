// ═══════════════════════════════════════════════════════════════
// SITA OS — Quick Actions Dock
// Reusable admin quick-action grid for any admin surface
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3, Cpu, Shield, RotateCcw, Eye, Users, Sparkles,
  Zap, Package, CreditCard, ScrollText, Key,
} from "lucide-react";

export interface QuickAction {
  label: string;
  route: string;
  icon: React.ElementType;
  description?: string;
}

const defaultActions: QuickAction[] = [
  { label: "Owner Dashboard", route: "/owner", icon: BarChart3, description: "Advanced controls" },
  { label: "Owner Dashboard", route: "/owner", icon: Sparkles, description: "Founder-safe view" },
  { label: "Mission Control", route: "/mission-control", icon: Cpu, description: "System operations" },
  { label: "Policy Simulator", route: "/mission/policies/simulate", icon: Shield, description: "What-if scenarios" },
  { label: "Workflow Replay", route: "/mission/workflows/latest/replay", icon: RotateCcw, description: "Replay & recover" },
  { label: "Observability", route: "/observability", icon: Eye, description: "Telemetry & health" },
  { label: "Users", route: "/users", icon: Users, description: "User management" },
  { label: "Leases", route: "/owner/leases", icon: Key, description: "Capability leases" },
  { label: "Constitution", route: "/owner/constitution", icon: ScrollText, description: "Governance rules" },
  { label: "Pricing", route: "/owner/pricing", icon: CreditCard, description: "Plans & pricing" },
  { label: "Packs", route: "/owner/packs", icon: Package, description: "Pack management" },
  { label: "AI Team", route: "/owner/internal-agents", icon: Zap, description: "Agent oversight" },
];

interface QuickActionsDockProps {
  actions?: QuickAction[];
  columns?: number;
  compact?: boolean;
}

export function QuickActionsDock({ actions = defaultActions, columns = 3, compact = false }: QuickActionsDockProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("grid gap-2", `grid-cols-2 md:grid-cols-${columns}`)}>
      {actions.map(a => (
        <button
          key={a.route}
          onClick={() => navigate(a.route)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-border bg-card/60 text-left hover:bg-secondary/50 hover:border-primary/20 transition-all group",
            compact ? "p-2.5" : "p-3"
          )}
        >
          <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <div className="min-w-0">
            <span className={cn("text-foreground group-hover:text-primary transition-colors block truncate", compact ? "text-[10px]" : "text-xs")}>
              {a.label}
            </span>
            {!compact && a.description && (
              <span className="text-[9px] text-muted-foreground block">{a.description}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
