// ═══════════════════════════════════════════════════════════════
// Phase 7C — Multi-Tenant Federation Board
// Hardened by Frontend Polish Closure (loading + empty + error states).
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Globe, ShieldAlert, Gauge, RefreshCw } from "lucide-react";
import { BoardSection } from "@/platform/admin/components/admin/ai-runtime/_shared/BoardSection";

interface Scope { id: string; tenant_id: string; agent_id: string; enabled: boolean; trust_rung: number; updated_at: string; }
interface Quota { id: string; tenant_id: string; daily_cents_cap: number; weekly_cents_cap: number; max_actions_per_hour: number; consumed_cents_today: number; consumed_actions_hour: number; }
interface Kill { id: string; tenant_id: string; switch_key: string; active: boolean; activated_at: string | null; expires_at: string | null; }

export default function TenantFederationBoard() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [kills, setKills] = useState<Kill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, q, k] = await Promise.all([
        supabase.from("internal_agent_tenant_scopes").select("*").order("updated_at", { ascending: false }).limit(100),
        supabase.from("internal_agent_tenant_quotas").select("*").order("updated_at", { ascending: false }).limit(100),
        supabase.from("internal_agent_tenant_kill_switches").select("*").order("updated_at", { ascending: false }).limit(100),
      ]);
      const firstError = s.error ?? q.error ?? k.error;
      if (firstError) throw firstError;
      setScopes((s.data ?? []) as typeof scopes);
      setQuotas((q.data ?? []) as typeof quotas);
      setKills((k.data ?? []) as typeof kills);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Tenant Federation">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Globe className="h-6 w-6" /> Multi-Tenant Federation
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 7C · per-tenant agent scopes, cost quotas, and tenant-scoped kill switches. All tenant-facing autonomy is hard-clamped to L3.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <BoardSection
          title="Tenant agent scopes"
          icon={<Globe className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={load}
          isEmpty={scopes.length === 0}
          emptyIcon={<Globe className="h-5 w-5" />}
          emptyTitle="No tenant agent scopes configured"
          emptyDescription="Scopes appear once a tenant onboards and an agent is enabled for them. Scope rows show the per-tenant trust rung — server-side capped at L3 regardless of any client value."
        >
          <div className="text-xs space-y-2">
            {scopes.map((s) => (
              <div key={s.id} className="flex items-center justify-between border rounded p-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.agent_id}</div>
                  <div className="text-muted-foreground">tenant {s.tenant_id.slice(0, 8)}…</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant={s.enabled ? "default" : "outline"}>{s.enabled ? "enabled" : "disabled"}</Badge>
                  <Badge variant="outline">L{s.trust_rung} (cap L3)</Badge>
                </div>
              </div>
            ))}
          </div>
        </BoardSection>

        <BoardSection
          title="Tenant quotas"
          icon={<Gauge className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={load}
          isEmpty={quotas.length === 0}
          emptyIcon={<Gauge className="h-5 w-5" />}
          emptyTitle="No tenant quotas defined"
          emptyDescription="Quota rows govern daily / weekly spend ceilings and per-hour action ceilings. Configure tenant quotas to enforce hard cost limits before any agent run is admitted."
        >
          <div className="text-xs space-y-2">
            {quotas.map((q) => (
              <div key={q.id} className="flex items-center justify-between border rounded p-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">tenant {q.tenant_id.slice(0, 8)}…</div>
                  <div className="text-muted-foreground">
                    {q.consumed_cents_today}¢ / {q.daily_cents_cap}¢ today · {q.consumed_actions_hour} / {q.max_actions_per_hour} actions/hr
                  </div>
                </div>
                <Badge variant={q.consumed_cents_today >= q.daily_cents_cap ? "destructive" : "outline"}>
                  {q.consumed_cents_today >= q.daily_cents_cap ? "at cap" : "ok"}
                </Badge>
              </div>
            ))}
          </div>
        </BoardSection>

        <BoardSection
          title="Tenant kill switches"
          icon={<ShieldAlert className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={load}
          isEmpty={kills.length === 0}
          emptyIcon={<ShieldAlert className="h-5 w-5" />}
          emptyTitle="No tenant kill switches"
          emptyDescription="Kill switches appear here when a tenant operator or supervisor halts a capability. Active switches require justification and expire automatically unless renewed."
        >
          <div className="text-xs space-y-2">
            {kills.map((k) => (
              <div key={k.id} className="flex items-center justify-between border rounded p-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{k.switch_key}</div>
                  <div className="text-muted-foreground">tenant {k.tenant_id.slice(0, 8)}…{k.activated_at ? ` · activated ${new Date(k.activated_at).toLocaleString()}` : ""}</div>
                </div>
                <Badge variant={k.active ? "destructive" : "outline"}>{k.active ? "ACTIVE" : "off"}</Badge>
              </div>
            ))}
          </div>
        </BoardSection>
      </div>
    </AdminControlPlaneShell>
  );
}
