// ═══════════════════════════════════════════════════════════════
// SITA OS — AIG09: AI Runtime Verification Board
// Per-capability live test matrix with pass/fail, latency,
// tokens, cost, receipts, and fallback/degraded truth
// ═══════════════════════════════════════════════════════════════

import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useAIRuntimeVerification, type CapabilityVerification } from "@/lib/ai/hooks/use-ai-runtime-verification";
import { getAIStatusMessage } from "@/hooks/use-ai-health";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, Play, RefreshCw, Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<CapabilityVerification["last_status"], { icon: React.ReactNode; label: string; className: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Pass", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  failure: { icon: <XCircle className="h-4 w-4" />, label: "Fail", className: "bg-destructive/10 text-destructive border-destructive/30" },
  degraded: { icon: <AlertTriangle className="h-4 w-4" />, label: "Degraded", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  never: { icon: <Clock className="h-4 w-4" />, label: "Never Tested", className: "bg-muted text-muted-foreground border-border" },
};

function HealthSummaryCards({ health }: { health: ReturnType<typeof useAIRuntimeVerification>["health"] }) {
  if (!health) return null;
  const checks = health.checks;
  const items = [
    { label: "API Key", ok: checks.api_key_present },
    { label: "Provider Reachable", ok: checks.provider_reachable },
    { label: "Model Invocation", ok: checks.model_invocation_ok },
    { label: "Structured Output", ok: checks.structured_output_ok },
    { label: "Rate Limit", ok: checks.rate_limit_ok },
    { label: "Budget", ok: checks.budget_ok },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <Card key={item.label} className={item.ok ? "border-emerald-500/30" : "border-destructive/30"}>
          <CardContent className="p-3 flex items-center gap-2">
            {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-destructive" />}
            <span className="text-xs font-medium">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AIG09RuntimeVerification() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { health, healthLoading, capabilities, capabilitiesLoading, runSmokeTest } = useAIRuntimeVerification();

  if (adminLoading || !isAdmin) return <div className="p-8 text-muted-foreground">Checking access…</div>;

  const passCount = capabilities.filter((c) => c.last_status === "success").length;
  const failCount = capabilities.filter((c) => c.last_status === "failure").length;
  const degradedCount = capabilities.filter((c) => c.last_status === "degraded").length;
  const neverCount = capabilities.filter((c) => c.last_status === "never").length;

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> AIG09 — AI Runtime Verification Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Per-capability live test matrix — proves which AI features are truly operational
          </p>
        </div>
        <Button
          onClick={() => runSmokeTest.mutate()}
          disabled={runSmokeTest.isPending}
          className="gap-2"
        >
          {runSmokeTest.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Verification
        </Button>
      </div>

      {/* Overall Health Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Provider Health
          </CardTitle>
          <CardDescription>{getAIStatusMessage(health)}</CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <p className="text-sm text-muted-foreground">Loading health checks…</p>
          ) : (
            <HealthSummaryCards health={health} />
          )}
        </CardContent>
      </Card>

      {/* Summary Counters */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pass", count: passCount, color: "text-emerald-400" },
          { label: "Fail", count: failCount, color: "text-destructive" },
          { label: "Degraded", count: degradedCount, color: "text-amber-400" },
          { label: "Never Tested", count: neverCount, color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capability Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" /> Capability Verification Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {capabilitiesLoading ? (
            <p className="text-sm text-muted-foreground">Loading capabilities…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Tokens (in/out)</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Fallback</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Last Invoked</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capabilities.map((cap) => {
                  const cfg = STATUS_CONFIG[cap.last_status];
                  return (
                    <TableRow key={cap.capability_key}>
                      <TableCell className="font-mono text-xs">{cap.capability_key}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{cap.provider ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{cap.model ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        {cap.latency_ms != null ? `${cap.latency_ms}ms` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {cap.input_tokens != null ? `${cap.input_tokens}/${cap.output_tokens ?? 0}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {cap.estimated_cost_usd != null ? `$${cap.estimated_cost_usd.toFixed(4)}` : "—"}
                      </TableCell>
                      <TableCell>
                        {cap.fallback_used ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">Yes</Badge>
                        ) : cap.last_status === "never" ? "—" : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{cap.mode ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {cap.last_invoked_at
                          ? formatDistanceToNow(new Date(cap.last_invoked_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {cap.receipt_id ? cap.receipt_id.slice(0, 8) + "…" : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Degraded Details */}
      {capabilities.some((c) => c.degraded_reason) && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Degraded Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {capabilities
              .filter((c) => c.degraded_reason)
              .map((c) => (
                <div key={c.capability_key} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs">{c.capability_key}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-amber-400">{c.degraded_reason}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
