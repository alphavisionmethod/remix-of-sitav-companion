// ═══════════════════════════════════════════════════════════════
// SITA OS — BAP01 Backend / API Deployability Center
// Phase 16 — live 15-item Backend / API Reality scoreboard.
// Route: /admin/backend-api/deployability (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Network,
  Activity,
} from "lucide-react";
import {
  backendApiReadinessSummary,
  type BackendApiReadinessItem,
  type BackendApiReadinessStatus,
} from "@/runtimes/backend/release";
import {
  EDGE_FUNCTION_REGISTRY,
  policyCoverageSummary,
  frontendActionCoverageSummary,
} from "@/lib/backend-topology";

const STATUS_VARIANT: Record<BackendApiReadinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  partial: "secondary",
  deferred: "outline",
  missing: "destructive",
};

const STATUS_ICON: Record<BackendApiReadinessStatus, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  partial: AlertCircle,
  deferred: Clock,
  missing: XCircle,
};

function ItemRow({ item }: { item: BackendApiReadinessItem }) {
  const Icon = STATUS_ICON[item.status];
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card/50 px-3 py-2.5">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{item.title}</span>
          <Badge variant={STATUS_VARIANT[item.status]} className="text-[10px] uppercase">
            {item.status}
          </Badge>
          {item.blocker && item.status !== "ready" && (
            <Badge variant="destructive" className="text-[10px]">
              blocker
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 break-words">{item.evidence}</p>
        {item.remediation && (
          <p className="text-xs text-muted-foreground mt-1 italic">↳ {item.remediation}</p>
        )}
      </div>
    </div>
  );
}

export default function BAP01BackendApiDeployabilityCenter() {
  const summary = useMemo(() => backendApiReadinessSummary(), []);
  const policy = useMemo(() => policyCoverageSummary(), []);
  const actions = useMemo(() => frontendActionCoverageSummary(), []);
  const pct = Math.round(((summary.ready + summary.partial * 0.5) / summary.total) * 100);
  const fnCount = EDGE_FUNCTION_REGISTRY.length;
  const activeCount = EDGE_FUNCTION_REGISTRY.filter((e) => e.status === "active").length;

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Backend / API Deployability Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Phase 16 · 15-item Backend / API Reality Checklist · live disk truth.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <p className="text-xs">Edge functions</p>
            </div>
            <p className="text-2xl font-semibold mt-1">{fnCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeCount} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Network className="h-4 w-4" />
              <p className="text-xs">Frontend actions</p>
            </div>
            <p className="text-2xl font-semibold mt-1">{actions.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {actions.p0} P0 · {actions.p1} P1 · {actions.p2} P2
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs">Policy envelope</p>
            </div>
            <p className="text-sm font-medium mt-1">
              {policy.rateLimit.strict} strict-RL · {policy.auditLog.required} req-audit
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              high-risk: {policy.highRiskWithStrictRateLimit} RL · {policy.highRiskWithRequiredAudit} audit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <p className="text-xs">Readiness</p>
            </div>
            <p className="text-2xl font-semibold mt-1">{pct}%</p>
            <Badge variant={summary.ok ? "default" : "destructive"} className="mt-1 text-[10px]">
              {summary.ok ? "READY" : "BLOCKED"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backend / API Reality Checklist (15 items)
            </CardTitle>
            <Badge variant={summary.ok ? "default" : "destructive"}>
              {summary.ok ? "READY" : "BLOCKED"}
            </Badge>
          </div>
          <CardDescription>
            {summary.ready}/{summary.total} ready · {summary.partial} partial · {summary.deferred} deferred · {summary.missing} missing
          </CardDescription>
          <Progress value={pct} className="mt-2 h-1.5" />
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.items.map((it) => (
            <ItemRow key={it.id} item={it} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
