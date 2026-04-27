import { useAction } from "@/hooks/use-action";
// ═══════════════════════════════════════════════════════════════
// SITA OS — AIG09: AI Runtime Verification Board (Full 8-Section)
// Mission-control-grade operator surface for AI runtime truth
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useAIRuntimeVerification, type CapabilityVerification } from "@/lib/ai/hooks/use-ai-runtime-verification";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { reclassifyAIFeatures, type ReclassificationResult } from "@/lib/ai/ai-launch-honesty-reclassifier";
import { seedAIRoutingActivation } from "@/lib/ai/ai-routing-seed-service";
import { getAIStatusMessage } from "@/platform/governance/hooks/use-ai-health";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, Play, RefreshCw, Shield,
  Server, Cpu, FileCheck, DollarSign, AlertOctagon, Receipt, Eye, Loader2, Database,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";

const STATUS_CONFIG: Record<CapabilityVerification["last_status"], { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Pass", variant: "default" },
  failure: { icon: <XCircle className="h-4 w-4" />, label: "Fail", variant: "destructive" },
  degraded: { icon: <AlertTriangle className="h-4 w-4" />, label: "Degraded", variant: "secondary" },
  never: { icon: <Clock className="h-4 w-4" />, label: "Unverified", variant: "outline" },
};

const HONESTY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  real: "default", partial: "secondary", demo_governed: "outline",
  internal_only: "outline", unavailable: "destructive", planned: "outline",
};

// ─── AIR01: Executive Summary ───────────────────────────────
function AIR01ExecutiveSummary({ capabilities, health }: {
  capabilities: CapabilityVerification[];
  health: ReturnType<typeof useAIRuntimeVerification>["health"];
}) {
  const passCount = capabilities.filter(c => c.last_status === "success").length;
  const failCount = capabilities.filter(c => c.last_status === "failure").length;
  const degradedCount = capabilities.filter(c => c.last_status === "degraded").length;
  const neverCount = capabilities.filter(c => c.last_status === "never").length;

  const checks = health?.checks;
  const items = [
    { label: "Live Verified", value: passCount, icon: <CheckCircle2 className="h-4 w-4 text-primary" /> },
    { label: "Partial", value: degradedCount, icon: <AlertTriangle className="h-4 w-4 text-amber-400" /> },
    { label: "Failed", value: failCount, icon: <XCircle className="h-4 w-4 text-destructive" /> },
    { label: "Unverified", value: neverCount, icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
  ];

  const healthItems = checks ? [
    { label: "API Key", ok: checks.api_key_present },
    { label: "Provider", ok: checks.provider_reachable },
    { label: "Model", ok: checks.model_invocation_ok },
    { label: "Structured", ok: checks.structured_output_ok },
    { label: "Rate Limit", ok: checks.rate_limit_ok },
    { label: "Budget", ok: checks.budget_ok },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(i => (
          <Card key={i.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {i.icon}
              <div>
                <div className="text-2xl font-bold">{i.value}</div>
                <div className="text-xs text-muted-foreground">{i.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {healthItems.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {healthItems.map(h => (
            <Card key={h.label}>
              <CardContent className="p-2 flex items-center gap-2">
                {h.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                <span className="text-xs">{h.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AIR02: Provider Health ─────────────────────────────────
function AIR02ProviderHealth() {
  const { data: providers = [] } = useQuery({
    queryKey: ["air-provider-health"],
    queryFn: async () => {
      const { data } = await db.from("ai_provider_registry")
        .select("provider_key, display_name, is_active, launch_stage, secret_env_name, mode")
        .order("display_name");
      const { data: health } = await db.from("ai_provider_health")
        .select("provider, health_state, last_success_at, last_failure_at, avg_latency_ms, error_rate")
        .order("updated_at", { ascending: false })
        .limit(20);
      // Latest receipt per provider from ai_inference_receipts
      const { data: receipts } = await db.from("ai_inference_receipts")
        .select("provider, latency_ms, cost_actual_cents, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []).map(p => {
        const h = health?.find(h => h.provider === p.provider_key);
        const latestReceipt = receipts?.find(r => r.provider === p.provider_key);
        return {
          ...p,
          health_state: h?.health_state ?? "unknown",
          last_success_at: h?.last_success_at,
          last_failure_at: h?.last_failure_at,
          avg_latency_ms: h?.avg_latency_ms,
          error_rate: h?.error_rate,
          last_receipt_at: latestReceipt?.created_at,
          last_receipt_latency: latestReceipt?.latency_ms,
          last_receipt_cost: latestReceipt?.cost_actual_cents,
        };
      });
    },
    staleTime: 30_000,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provider</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Health</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Secret</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Error Rate</TableHead>
          <TableHead>Last Success</TableHead>
          <TableHead>Last Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map(p => (
          <TableRow key={p.provider_key}>
            <TableCell className="font-medium">{p.display_name}</TableCell>
            <TableCell>{p.is_active ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
            <TableCell>
              <Badge variant={p.health_state === "healthy" ? "default" : p.health_state === "degraded" ? "secondary" : "outline"} className="text-xs">
                {p.health_state}
              </Badge>
            </TableCell>
            <TableCell className="text-xs">{p.launch_stage}</TableCell>
            <TableCell className="font-mono text-xs">{p.secret_env_name ?? "—"}</TableCell>
            <TableCell className="text-xs">{p.avg_latency_ms ? `${Math.round(p.avg_latency_ms)}ms` : "—"}</TableCell>
            <TableCell className="text-xs">{p.error_rate != null ? `${(p.error_rate * 100).toFixed(1)}%` : "—"}</TableCell>
            <TableCell className="text-xs">{p.last_success_at ? formatDistanceToNow(new Date(p.last_success_at), { addSuffix: true }) : "—"}</TableCell>
            <TableCell className="text-xs">
              {p.last_receipt_at ? (
                <span title={`Latency: ${p.last_receipt_latency ?? "—"}ms | Cost: ${p.last_receipt_cost != null ? `${p.last_receipt_cost}¢` : "—"}`}>
                  {formatDistanceToNow(new Date(p.last_receipt_at), { addSuffix: true })}
                </span>
              ) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── AIR03: Model Readiness ─────────────────────────────────
function AIR03ModelReadiness() {
  const { data: models = [] } = useQuery({
    queryKey: ["air-model-readiness"],
    queryFn: async () => {
      const { data } = await db.from("ai_model_registry")
        .select("model_id, provider, display_name, model_class, cost_tier, latency_tier, is_active, structured_output_support, tool_calling_support")
        .order("provider")
        .limit(50);
      return data ?? [];
    },
    staleTime: 60_000,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Model</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Cost Tier</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Structured</TableHead>
          <TableHead>Tools</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map(m => (
          <TableRow key={m.model_id}>
            <TableCell className="font-mono text-xs">{m.display_name ?? m.model_id}</TableCell>
            <TableCell className="text-xs">{m.provider}</TableCell>
            <TableCell><Badge variant="outline" className="text-xs">{m.model_class}</Badge></TableCell>
            <TableCell className="text-xs">{m.cost_tier ?? "—"}</TableCell>
            <TableCell className="text-xs">{m.latency_tier ?? "—"}</TableCell>
            <TableCell>{m.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
            <TableCell>{m.structured_output_support ? "✓" : "—"}</TableCell>
            <TableCell>{m.tool_calling_support ? "✓" : "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── AIR04: Capability Runtime Matrix ───────────────────────
function AIR04CapabilityMatrix({ capabilities }: { capabilities: CapabilityVerification[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Capability</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Receipt</TableHead>
          <TableHead>Last Invoked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capabilities.map(cap => {
          const cfg = STATUS_CONFIG[cap.last_status];
          return (
            <TableRow key={cap.capability_key}>
              <TableCell className="font-mono text-xs font-medium">{cap.capability_key}</TableCell>
              <TableCell><Badge variant={cfg.variant} className="gap-1 text-xs">{cfg.icon}{cfg.label}</Badge></TableCell>
              <TableCell className="text-xs">{cap.provider_id ? cap.provider_id.slice(0, 12) : "—"}</TableCell>
              <TableCell className="font-mono text-xs">{cap.model_id ? cap.model_id.slice(0, 12) : "—"}</TableCell>
              <TableCell className="text-xs">{cap.latency_ms != null ? `${cap.latency_ms}ms` : "—"}</TableCell>
              <TableCell className="text-xs">{cap.prompt_tokens != null ? `${cap.prompt_tokens}/${cap.completion_tokens ?? 0}` : "—"}</TableCell>
              <TableCell className="text-xs">{cap.estimated_cost_usd != null ? `$${cap.estimated_cost_usd.toFixed(4)}` : "—"}</TableCell>
              <TableCell className="text-xs">{cap.mode ?? "—"}</TableCell>
              <TableCell>{cap.receipt_id ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{cap.last_invoked_at ? formatDistanceToNow(new Date(cap.last_invoked_at), { addSuffix: true }) : "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── AIR05: Recent Verification Feed ────────────────────────
function AIR05RecentVerificationFeed() {
  const { data: recent = [] } = useQuery({
    queryKey: ["air-recent-verifications"],
    queryFn: async () => {
      const { data } = await db.from("ai_usage_ledger")
        .select("capability_key, provider_id, model_id, status, latency_ms, receipt_id, mode, created_at, error_summary")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    staleTime: 15_000,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Capability</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Receipt</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recent.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="text-xs">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</TableCell>
            <TableCell className="font-mono text-xs">{r.capability_key}</TableCell>
            <TableCell className="text-xs">{r.provider_id?.slice(0, 10) ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">{r.model_id?.slice(0, 10) ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={r.status === "success" ? "default" : "destructive"} className="text-xs">{r.status}</Badge>
            </TableCell>
            <TableCell className="text-xs">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</TableCell>
            <TableCell>{r.receipt_id ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell className="text-xs">{r.mode ?? "—"}</TableCell>
            <TableCell className="text-xs text-destructive max-w-[200px] truncate">{r.error_summary ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── AIR06: Receipt & Usage Truth ───────────────────────────
function AIR06ReceiptUsageTruth() {
  const { data: stats } = useQuery({
    queryKey: ["air-receipt-usage-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: ledger } = await db.from("ai_usage_ledger")
        .select("status, receipt_id, estimated_cost_usd, latency_ms, capability_key")
        .gte("created_at", today)
        .limit(500);
      const rows = ledger ?? [];
      const totalInvocations = rows.length;
      const withReceipt = rows.filter(r => r.receipt_id).length;
      const successes = rows.filter(r => r.status === "success").length;
      const totalCost = rows.reduce((sum, r) => sum + (r.estimated_cost_usd ?? 0), 0);
      const avgLatency = rows.length > 0 ? rows.reduce((sum, r) => sum + (r.latency_ms ?? 0), 0) / rows.length : 0;
      const capCosts: Record<string, number> = {};
      rows.forEach(r => { capCosts[r.capability_key] = (capCosts[r.capability_key] ?? 0) + (r.estimated_cost_usd ?? 0); });
      return { totalInvocations, withReceipt, successes, totalCost, avgLatency, capCosts };
    },
    staleTime: 30_000,
  });

  // Latest receipt card
  const { data: latestReceipt } = useQuery({
    queryKey: ["air-latest-receipt"],
    queryFn: async () => {
      const { data } = await db.from("ai_receipt_records")
        .select("id, capability_key, decision_class, mode, created_at, provider_id, model_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 30_000,
  });

  if (!stats) return <p className="text-sm text-muted-foreground p-4">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Invocations Today", value: stats.totalInvocations },
          { label: "With Receipt", value: `${stats.withReceipt}/${stats.totalInvocations}` },
          { label: "Success Rate", value: stats.totalInvocations > 0 ? `${((stats.successes / stats.totalInvocations) * 100).toFixed(0)}%` : "—" },
          { label: "Total Cost", value: `$${stats.totalCost.toFixed(4)}` },
          { label: "Avg Latency", value: `${Math.round(stats.avgLatency)}ms` },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {latestReceipt && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2"><Receipt className="h-4 w-4" /> Latest Receipt</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div><span className="text-muted-foreground">Capability:</span> <span className="font-mono">{latestReceipt.capability_key}</span></div>
              <div><span className="text-muted-foreground">Decision:</span> <Badge variant="outline" className="text-xs ml-1">{latestReceipt.decision_class ?? "—"}</Badge></div>
              <div><span className="text-muted-foreground">Mode:</span> {latestReceipt.mode}</div>
              <div><span className="text-muted-foreground">Time:</span> {formatDistanceToNow(new Date(latestReceipt.created_at), { addSuffix: true })}</div>
            </div>
          </CardContent>
        </Card>
      )}
      {Object.keys(stats.capCosts).length > 0 && (
        <Table>
          <TableHeader><TableRow><TableHead>Capability</TableHead><TableHead>Cost Today</TableHead></TableRow></TableHeader>
          <TableBody>
            {Object.entries(stats.capCosts).sort(([, a], [, b]) => b - a).map(([cap, cost]) => (
              <TableRow key={cap}>
                <TableCell className="font-mono text-xs">{cap}</TableCell>
                <TableCell className="text-xs">${cost.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── AIR07: Launch Honesty Reclassification ─────────────────
function AIR07LaunchHonestyReclass() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["air-launch-honesty-reclass"],
    queryFn: reclassifyAIFeatures,
    staleTime: 60_000,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Running reclassification…</p>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Capability</TableHead>
            <TableHead>Previous</TableHead>
            <TableHead>Recommended</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Invocations</TableHead>
            <TableHead>Claim Risk</TableHead>
            <TableHead>Gaps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map(r => {
            const changed = r.previousClass !== r.recommendedClass;
            return (
              <TableRow key={r.capabilityKey} className={changed ? "bg-amber-500/5" : ""}>
                <TableCell className="font-mono text-xs font-medium">{r.capabilityKey}</TableCell>
                <TableCell>
                  <Badge variant={HONESTY_VARIANT[r.previousClass] ?? "outline"} className="text-xs">
                    {r.previousClass.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={HONESTY_VARIANT[r.recommendedClass] ?? "outline"} className={`text-xs ${changed ? "ring-1 ring-amber-400" : ""}`}>
                    {r.recommendedClass.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs max-w-[200px]">{r.reason}</TableCell>
                <TableCell className="text-xs">{(r.evidence.successRate30d * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-xs">{r.evidence.invocationCount30d}</TableCell>
                <TableCell className="text-xs text-destructive">{r.claimRisk ?? "—"}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{r.blockingGaps.length > 0 ? r.blockingGaps.join("; ") : "None"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── AIR08: Seed Activation Panel ───────────────────────────
function AIR08SeedActivation() {
  const queryClient = useQueryClient();
  const [results, setResults] = useState<{ phase: string; status: string; message: string }[]>([]);

  const seedMutation = useAction("admin", "seed.run", {
    invalidateKeys: [["air-provider-health"]],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={() => seedMutation.mutate({})} disabled={seedMutation.isPending} className="gap-2">
          {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          Seed AI Routing Activation
        </Button>
        <p className="text-xs text-muted-foreground">Seeds providers, models, routing, and launch honesty defaults</p>
      </div>
      {results.length > 0 && (
        <Table>
          <TableHeader><TableRow><TableHead>Phase</TableHead><TableHead>Status</TableHead><TableHead>Detail</TableHead></TableRow></TableHeader>
          <TableBody>
            {results.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs capitalize">{r.phase}</TableCell>
                <TableCell><Badge variant={r.status === "success" ? "default" : "destructive"} className="text-xs">{r.status}</Badge></TableCell>
                <TableCell className="text-xs">{r.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── Main Board ─────────────────────────────────────────────
export default function AIG09RuntimeVerification() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { health, healthLoading, capabilities, capabilitiesLoading, runSmokeTest } = useAIRuntimeVerification();

  if (adminLoading || !isAdmin) return <div className="p-8 text-muted-foreground">Checking access…</div>;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AIGSubNav />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> AIG09 — AI Runtime Verification Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mission control for AI runtime truth — provider health, capability verification, receipts, and launch honesty
          </p>
        </div>
        <Button onClick={() => runSmokeTest.mutate()} disabled={runSmokeTest.isPending} className="gap-2">
          {runSmokeTest.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Verification
        </Button>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="summary" className="gap-1 text-xs"><Activity className="h-3.5 w-3.5" />Summary</TabsTrigger>
          <TabsTrigger value="providers" className="gap-1 text-xs"><Server className="h-3.5 w-3.5" />Providers</TabsTrigger>
          <TabsTrigger value="models" className="gap-1 text-xs"><Cpu className="h-3.5 w-3.5" />Models</TabsTrigger>
          <TabsTrigger value="capabilities" className="gap-1 text-xs"><Zap className="h-3.5 w-3.5" />Capabilities</TabsTrigger>
          <TabsTrigger value="feed" className="gap-1 text-xs"><FileCheck className="h-3.5 w-3.5" />Feed</TabsTrigger>
          <TabsTrigger value="receipts" className="gap-1 text-xs"><Receipt className="h-3.5 w-3.5" />Receipts</TabsTrigger>
          <TabsTrigger value="honesty" className="gap-1 text-xs"><Eye className="h-3.5 w-3.5" />Honesty</TabsTrigger>
          <TabsTrigger value="seed" className="gap-1 text-xs"><Database className="h-3.5 w-3.5" />Seed</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" />AIR01 — Executive Summary</CardTitle>
              <CardDescription>{getAIStatusMessage(health)}</CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading || capabilitiesLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : <AIR01ExecutiveSummary capabilities={capabilities} health={health} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" />AIR02 — Provider Health</CardTitle></CardHeader>
            <CardContent><AIR02ProviderHealth /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4" />AIR03 — Model Readiness</CardTitle></CardHeader>
            <CardContent><AIR03ModelReadiness /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4" />AIR04 — Capability Runtime Matrix</CardTitle></CardHeader>
            <CardContent>{capabilitiesLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : <AIR04CapabilityMatrix capabilities={capabilities} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-4 w-4" />AIR05 — Recent Verification Runs</CardTitle></CardHeader>
            <CardContent><AIR05RecentVerificationFeed /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" />AIR06 — Receipt & Usage Truth</CardTitle></CardHeader>
            <CardContent><AIR06ReceiptUsageTruth /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="honesty">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />AIR07 — Launch Honesty Reclassification</CardTitle>
            <CardDescription>Evidence-driven reclassification based on runtime proof</CardDescription>
          </CardHeader>
            <CardContent><AIR07LaunchHonestyReclass /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seed">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" />AIR08 — Routing Seed Activation</CardTitle>
            <CardDescription>Seed provider, model, routing, and honesty defaults for live activation</CardDescription>
          </CardHeader>
            <CardContent><AIR08SeedActivation /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
