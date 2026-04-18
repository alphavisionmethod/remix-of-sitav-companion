// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Health Badge
// Compact summary widget for the admin dashboard that shows
// boundary health at a glance and links to the full board.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Layers, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { ROUTE_LAYER_MAP, SERVICE_LAYER_MAP, LAYERS, type Layer } from "@/platform/architecture/layer-manifest";
import { SERVICE_BUDGET, DUPLICATE_SERVICES } from "@/platform/architecture/service-ownership-manifest";
import { FORBIDDEN_PATTERNS } from "@/platform/architecture/boundary-rules";

const LAYER_DOT_COLORS: Record<Layer, string> = {
  "web": "bg-blue-500",
  "app": "bg-emerald-500",
  "os-services": "bg-[hsl(var(--sita-purple))]",
  "os-kernel": "bg-amber-500",
  "admin-operator": "bg-red-500",
  "domain-capability": "bg-[hsl(var(--sita-gold))]",
};

export function ArchitectureHealthBadge() {
  const budget = SERVICE_BUDGET;
  const totalRoutes = ROUTE_LAYER_MAP.length;
  const duplicateCount = DUPLICATE_SERVICES.length;
  const forbiddenRuleCount = FORBIDDEN_PATTERNS.length;

  const routesByLayer = useMemo(() => {
    const counts: Record<string, number> = {};
    ROUTE_LAYER_MAP.forEach(r => { counts[r.layer] = (counts[r.layer] || 0) + 1; });
    return counts;
  }, []);

  // Compute health score: budget compliance + no duplicates + all 6 layers active
  const activeLayers = Object.values(LAYERS).filter(l => (routesByLayer[l] || 0) > 0).length;
  const budgetScore = budget.withinBudget ? 40 : Math.max(0, 40 - (budget.overage || 0) * 2);
  const dupeScore = Math.max(0, 30 - duplicateCount);
  const layerScore = Math.round((activeLayers / 6) * 30);
  const healthScore = Math.min(100, budgetScore + dupeScore + layerScore);

  const healthStatus = healthScore >= 85 ? "healthy" : healthScore >= 60 ? "caution" : "critical";
  const statusConfig = {
    healthy: { label: "Healthy", color: "text-[hsl(var(--trust-safe))]", border: "border-[hsl(var(--trust-safe)/0.3)]", bg: "bg-[hsl(var(--trust-safe)/0.05)]" },
    caution: { label: "Caution", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5" },
    critical: { label: "At Risk", color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5" },
  }[healthStatus];

  return (
    <Link to="/admin/architecture/boundaries" className="block group">
      <Card className={`${statusConfig.border} ${statusConfig.bg} hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[hsl(var(--sita-purple)/0.15)]">
                <Shield className="h-4 w-4 text-[hsl(var(--sita-purple-light))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Architecture Health</p>
                <p className="text-[10px] text-muted-foreground">6-Layer boundary integrity</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] gap-1 ${statusConfig.color}`}>
              {healthScore >= 85 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {statusConfig.label}
            </Badge>
          </div>

          {/* Score bar */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Boundary Score</span>
              <span className={`font-bold ${statusConfig.color}`}>{healthScore}/100</span>
            </div>
            <Progress value={healthScore} className="h-1.5" />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{budget.total}<span className="text-xs text-muted-foreground">/{budget.maxCanonical}</span></div>
              <div className="text-[9px] text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{totalRoutes}</div>
              <div className="text-[9px] text-muted-foreground">Routes</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${duplicateCount > 0 ? "text-amber-400" : "text-[hsl(var(--trust-safe))]"}`}>{duplicateCount}</div>
              <div className="text-[9px] text-muted-foreground">Dupes</div>
            </div>
          </div>

          {/* Layer dots */}
          <div className="flex items-center gap-1.5 mb-2">
            {(Object.values(LAYERS) as Layer[]).map(layer => (
              <div key={layer} className="flex items-center gap-1" title={`${layer}: ${routesByLayer[layer] || 0} routes`}>
                <div className={`h-2 w-2 rounded-full ${LAYER_DOT_COLORS[layer]}`} />
                <span className="text-[9px] text-muted-foreground">{routesByLayer[layer] || 0}</span>
              </div>
            ))}
          </div>

          {/* Link hint */}
          <div className="flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View full board</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
