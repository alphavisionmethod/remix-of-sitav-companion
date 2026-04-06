// ═══════════════════════════════════════════════════════════════
// SITA OS — AIG09: AI Runtime Verification Board
// Per-capability live test matrix with pass/fail, latency,
// tokens, cost, receipts, and degraded truth
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

const STATUS_CONFIG: Record<CapabilityVerification["last_status"], { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Pass", variant: "default" },
  failure: { icon: <XCircle className="h-4 w-4" />, label: "Fail", variant: "destructive" },
  degraded: { icon: <AlertTriangle className="h-4 w-4" />, label: "Degraded", variant: "secondary" },
  never: { icon: <Clock className="h-4 w-4" />, label: "Never Tested", variant: "outline" },
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
        <Card key={item.label}>
          <CardContent className="p-3 flex items-center gap-2">
            {item.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
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

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pass", count: passCount, variant: "default" as const },
          { label: "Fail", count: failCount, variant: "destructive" as const },
          { label: "Degraded", count: degradedCount, variant: "secondary" as const },
          { label: "Never Tested", count: neverCount, variant: "outline" as const },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{s.count}</div>
              <Badge variant={s.variant} className="mt-1">{s.label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

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
                        <Badge variant={cfg.variant} className="gap-1">
                          {cfg.icon} {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{cap.provider_id ? cap.provider_id.slice(0, 8) + "…" : "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{cap.model_id ? cap.model_id.slice(0, 8) + "…" : "—"}</TableCell>
                      <TableCell className="text-xs">
                        {cap.latency_ms != null ? `${cap.latency_ms}ms` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {cap.prompt_tokens != null ? `${cap.prompt_tokens}/${cap.completion_tokens ?? 0}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {cap.estimated_cost_usd != null ? `$${cap.estimated_cost_usd.toFixed(4)}` : "—"}
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

      {capabilities.some((c) => c.error_summary) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Error Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {capabilities
              .filter((c) => c.error_summary)
              .map((c) => (
                <div key={c.capability_key} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs">{c.capability_key}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-destructive">{c.error_summary}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
