import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListFilter, Activity, AlertTriangle, Zap, ShieldOff, Ban, Clock } from "lucide-react";
import { getUsageLedger } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type FilterType = "all" | "failures" | "fallbacks" | "demo" | "premium" | "blocked";

const FILTERS: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Activity },
  { key: "failures", label: "Failures", icon: AlertTriangle },
  { key: "fallbacks", label: "Fallbacks", icon: Zap },
  { key: "demo", label: "Demo Mode", icon: ShieldOff },
  { key: "premium", label: "Premium", icon: Clock },
  { key: "blocked", label: "Blocked", icon: Ban },
];

function statusBadge(status: string) {
  const variant = status === "success" ? "default"
    : status === "error" || status === "blocked_budget" ? "destructive"
    : "secondary";
  return <Badge variant={variant} className="text-[10px]">{status}</Badge>;
}

export default function AIG05UsageLedgerExplorer() {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ["ai-usage-ledger", 500],
    queryFn: () => getUsageLedger(500),
  });

  const filtered = useMemo(() => {
    if (filter === "all") return ledger;
    return ledger.filter(r => {
      switch (filter) {
        case "failures": return r.status === "error";
        case "fallbacks": return r.status === "fallback_success";
        case "demo": return r.mode === "demo";
        case "premium": return r.request_class === "premium_synthesis";
        case "blocked": return r.status === "blocked_budget";
        default: return true;
      }
    });
  }, [ledger, filter]);

  const totalCost = ledger.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
  const successCount = ledger.filter(r => r.status === "success").length;
  const blockedCount = ledger.filter(r => r.status === "blocked_budget").length;
  const avgLatency = ledger.length > 0
    ? ledger.reduce((s, r) => s + (r.latency_ms ?? 0), 0) / ledger.length
    : 0;

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListFilter className="h-6 w-6" /> AIG05 — AI Usage Ledger Explorer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every AI invocation: capability, provider, model, status, tokens, cost, latency, mode
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Invocations</p>
          <p className="text-2xl font-bold">{ledger.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold">
            {ledger.length > 0 ? ((successCount / ledger.length) * 100).toFixed(1) : "0"}%
          </p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Avg Latency</p>
          <p className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Blocked</p>
          <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
        </CardContent></Card>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="gap-1.5"
          >
            <f.icon className="h-3.5 w-3.5" />
            {f.label}
            {f.key !== "all" && (
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {ledger.filter(r => {
                  switch (f.key) {
                    case "failures": return r.status === "error";
                    case "fallbacks": return r.status === "fallback_success";
                    case "demo": return r.mode === "demo";
                    case "premium": return r.request_class === "premium_synthesis";
                    case "blocked": return r.status === "blocked_budget";
                    default: return false;
                  }
                }).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Ledger table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {filtered.length} invocations {filter !== "all" ? `(${filter})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading usage ledger…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invocations match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Capability</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 200).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-[11px] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-[11px]">{r.capability_key}</TableCell>
                      <TableCell className="text-[11px]">{r.provider_id?.slice(0, 8) ?? "—"}</TableCell>
                      <TableCell className="text-[11px]">{r.model_id?.slice(0, 8) ?? "—"}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{r.request_class}</Badge>
                      </TableCell>
                      <TableCell className="text-[11px] tabular-nums">
                        {(r.total_tokens ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[11px] tabular-nums">
                        ${(r.estimated_cost_usd ?? 0).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-[11px] tabular-nums">
                        {r.latency_ms ? `${r.latency_ms}ms` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.mode === "demo" ? "secondary" : "outline"} className="text-[10px]">
                          {r.mode}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
