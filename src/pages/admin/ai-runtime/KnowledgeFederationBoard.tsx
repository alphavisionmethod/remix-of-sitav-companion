// ═══════════════════════════════════════════════════════════════
// Phase 8C — Cross-Tenant Knowledge Federation board
// Hardened by Frontend Polish Closure (loading + empty + error states).
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Network, RefreshCw, Users, Share2, Layers } from "lucide-react";
import { toast } from "sonner";
import { BoardSection } from "@/platform/admin/components/admin/ai-runtime/_shared/BoardSection";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [o, s, a] = await Promise.all([
        supabase.from("tenant_federation_optins").select("*").order("opted_in_at", { ascending: false }).limit(20),
        supabase.from("federated_knowledge_shares").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("federated_pattern_aggregates").select("*").order("window_end", { ascending: false }).limit(30),
      ]);
      const firstError = o.error ?? s.error ?? a.error;
      if (firstError) throw firstError;
      setOptins((o.data ?? []) as typeof optins);
      setShares((s.data ?? []) as typeof shares);
      setAggs((a.data ?? []) as typeof aggs);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function runAggregator() {
    const { error } = await supabase.functions.invoke("federated-knowledge-aggregator", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Federation aggregation complete"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="Knowledge Federation">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Network className="h-5 w-5" /> Cross-Tenant Knowledge Federation</h1>
          <p className="text-sm text-muted-foreground">Phase 8C — opt-in only, differential-privacy ε ≤ 1.0, no individual tenant IDs leaked.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runAggregator} disabled={loading}>Run aggregator</Button>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BoardSection
          title="Tenant opt-ins"
          icon={<Users className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={refresh}
          isEmpty={optins.length === 0}
          emptyIcon={<Users className="h-5 w-5" />}
          emptyTitle="No tenants have opted in"
          emptyDescription="Federation is strictly opt-in. Once a tenant accepts the latest opt-in version, their entry will appear here with the version they consented to and the activation timestamp."
        >
          {optins.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
              <div className="min-w-0">
                <div className="font-medium truncate">{o.tenant_id}</div>
                <div className="text-muted-foreground">v{o.opt_in_version} · {new Date(o.opted_in_at).toLocaleDateString()}</div>
              </div>
              <Badge variant={o.revoked_at ? "destructive" : "outline"}>{o.revoked_at ? "revoked" : "active"}</Badge>
            </div>
          ))}
        </BoardSection>

        <BoardSection
          title="Recent shares (raw)"
          icon={<Share2 className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={refresh}
          isEmpty={shares.length === 0}
          emptyIcon={<Share2 className="h-5 w-5" />}
          emptyTitle="No shares submitted yet"
          emptyDescription="Raw shares are differentially-privatized signals contributed by opted-in tenants. They never expose individual identifiers and require ε ≤ 1.0 noise floor."
        >
          {shares.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.pattern_kind}</div>
                <div className="text-muted-foreground font-mono truncate">{s.pattern_hash.slice(0, 16)}…</div>
              </div>
              <Badge variant="outline">ε {s.dp_epsilon}</Badge>
            </div>
          ))}
        </BoardSection>
      </div>

      <BoardSection
        title="Federated pattern aggregates"
        icon={<Layers className="h-4 w-4" />}
        loading={loading}
        error={error}
        onRetry={refresh}
        isEmpty={aggs.length === 0}
        emptyIcon={<Layers className="h-5 w-5" />}
        emptyTitle="No aggregates produced yet"
        emptyDescription="Aggregates appear after the federation aggregator runs across enough opted-in tenants to satisfy the privacy floor. Use Run aggregator above to trigger an immediate cycle."
      >
        <div className="overflow-x-auto">
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
        </div>
      </BoardSection>
    </AdminControlPlaneShell>
  );
}
