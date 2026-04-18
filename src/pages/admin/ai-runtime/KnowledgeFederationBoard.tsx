// ═══════════════════════════════════════════════════════════════
// Phase 8C — Cross-Tenant Knowledge Federation board
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { Network, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Optin { id: string; tenant_id: string; opt_in_version: string; opted_in_at: string; revoked_at: string | null; }
interface Share { id: string; pattern_kind: string; pattern_hash: string; dp_epsilon: number; created_at: string; }
interface Aggregate { id: string; pattern_key: string; frequency_band: string; confidence_band: string; contributing_tenant_count: number; window_end: string; }

const bandColor: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600",
  medium: "bg-amber-500/10 text-amber-600",
  high: "bg-emerald-500/10 text-emerald-600",
};

export default function KnowledgeFederationBoard() {
  const [optins, setOptins] = useState<Optin[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [aggs, setAggs] = useState<Aggregate[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [o, s, a] = await Promise.all([
      supabase.from("tenant_federation_optins").select("*").order("opted_in_at", { ascending: false }).limit(20),
      supabase.from("federated_knowledge_shares").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("federated_pattern_aggregates").select("*").order("window_end", { ascending: false }).limit(30),
    ]);
    setOptins((o.data as any) ?? []);
    setShares((s.data as any) ?? []);
    setAggs((a.data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function runAggregator() {
    const { error } = await supabase.functions.invoke("federated-knowledge-aggregator", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Federation aggregation complete"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="Knowledge Federation">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Network className="h-5 w-5" /> Cross-Tenant Knowledge Federation</h1>
          <p className="text-sm text-muted-foreground">Phase 8C — opt-in only, differential-privacy ε ≤ 1.0, no individual tenant IDs leaked.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runAggregator} disabled={loading}>Run aggregator</Button>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Tenant opt-ins</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {optins.length === 0 && <p className="text-xs text-muted-foreground">No tenants opted in.</p>}
            {optins.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                <div>
                  <div className="font-medium">{o.tenant_id}</div>
                  <div className="text-muted-foreground">v{o.opt_in_version} · {new Date(o.opted_in_at).toLocaleDateString()}</div>
                </div>
                <Badge variant={o.revoked_at ? "destructive" : "outline"}>{o.revoked_at ? "revoked" : "active"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent shares (raw)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {shares.length === 0 && <p className="text-xs text-muted-foreground">No shares yet.</p>}
            {shares.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                <div>
                  <div className="font-medium">{s.pattern_kind}</div>
                  <div className="text-muted-foreground font-mono">{s.pattern_hash.slice(0, 16)}…</div>
                </div>
                <Badge variant="outline">ε {s.dp_epsilon}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Federated pattern aggregates</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {aggs.length === 0 && <p className="text-xs text-muted-foreground">No aggregates produced.</p>}
          {aggs.map((a) => (
            <div key={a.id} className="flex justify-between text-xs border-b border-border/30 pb-1">
              <span className="font-mono">{a.pattern_key}</span>
              <div className="flex gap-1">
                <Badge className={bandColor[a.frequency_band]}>freq {a.frequency_band}</Badge>
                <Badge className={bandColor[a.confidence_band]}>conf {a.confidence_band}</Badge>
                <Badge variant="outline">{a.contributing_tenant_count} tenants</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminControlPlaneShell>
  );
}
