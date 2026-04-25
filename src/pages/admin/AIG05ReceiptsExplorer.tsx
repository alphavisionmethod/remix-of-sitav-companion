import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, BarChart3, ArrowDownUp } from "lucide-react";
import { getInferenceReceipts, getReceiptStats, getReceiptRecords, getFallbackEvents } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AIG05ReceiptsExplorer() {
  const { data: receipts = [] } = useQuery({
    queryKey: ["ai-inference-receipts"],
    queryFn: () => getInferenceReceipts(100),
  });

  const { data: stats } = useQuery({
    queryKey: ["ai-receipt-stats"],
    queryFn: getReceiptStats,
  });

  const { data: canonicalReceipts = [] } = useQuery({
    queryKey: ["ai-receipt-records"],
    queryFn: () => getReceiptRecords(50),
  });

  const { data: fallbacks = [] } = useQuery({
    queryKey: ["ai-fallback-events"],
    queryFn: () => getFallbackEvents(50),
  });

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6" /> AIG06 — AI Receipts / Trace Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Every AI invocation: provider, model, latency, cost, validation, fallbacks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Inference Receipts</p>
          <p className="text-2xl font-bold">{stats?.totalReceipts ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Canonical Receipts</p>
          <p className="text-2xl font-bold">{canonicalReceipts.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">${((stats?.totalCostCents ?? 0) / 100).toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Avg Latency</p>
          <p className="text-2xl font-bold">{stats?.avgLatencyMs ?? 0}ms</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Fallback Events</p>
          <p className="text-2xl font-bold">{fallbacks.length}</p>
        </CardContent></Card>
      </div>

      {stats && Object.keys(stats.byProvider).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Requests by Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byProvider).map(([provider, count]) => (
                <div key={provider} className="p-3 rounded-md border border-border">
                  <p className="text-xs text-muted-foreground">{provider}</p>
                  <p className="text-lg font-bold">{count as number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback Events */}
      {fallbacks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowDownUp className="h-5 w-5" /> Fallback Events</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {fallbacks.slice(0, 20).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.capability_key}</TableCell>
                    <TableCell className="text-xs">{f.fallback_reason}</TableCell>
                    <TableCell><Badge variant={f.result_state === "fallback_success" ? "default" : "destructive"} className="text-xs">{f.result_state}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(f.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Canonical Receipt Records */}
      {canonicalReceipts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Canonical Receipt Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Structured Valid</TableHead>
                <TableHead>Degraded Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {canonicalReceipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.capability_key}</TableCell>
                    <TableCell><Badge variant={r.mode === "real" ? "default" : "secondary"} className="text-xs">{r.mode}</Badge></TableCell>
                    <TableCell className="text-xs">{r.decision_class ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.structured_output_valid != null ? (r.structured_output_valid ? "✓" : "✗") : "—"}</TableCell>
                    <TableCell className="text-xs">{r.degraded_reason ?? "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Legacy Inference Receipts */}
      <Card>
        <CardHeader><CardTitle>Inference Receipts</CardTitle></CardHeader>
        <CardContent>
          {receipts.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Capability</TableHead>
                <TableHead>Tokens (In/Out)</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.provider}</TableCell>
                    <TableCell className="font-mono text-xs">{r.model}</TableCell>
                    <TableCell className="text-xs">{r.capability_id ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.input_tokens ?? 0} / {r.output_tokens ?? 0}</TableCell>
                    <TableCell className="text-xs">{r.cost_actual_cents ? `${r.cost_actual_cents}¢` : r.cost_estimate_cents ? `~${r.cost_estimate_cents}¢` : "—"}</TableCell>
                    <TableCell className="text-xs">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.verification_outcome === "success" ? "default" : "outline"} className="text-xs">
                        {r.verification_outcome ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No receipts yet. AI invocations will appear here after use.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
