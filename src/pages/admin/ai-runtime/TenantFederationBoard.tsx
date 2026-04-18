// ═══════════════════════════════════════════════════════════════
// Phase 7C — Multi-Tenant Federation Board
// View tenant scopes, quotas, and kill switches. All write ops
// route through internal-agent-tenant-federation BFF, which
// hard-clamps autonomy to L3 server-side.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { Globe, ShieldAlert, Gauge } from "lucide-react";

interface Scope { id: string; tenant_id: string; agent_id: string; enabled: boolean; trust_rung: number; updated_at: string; }
interface Quota { id: string; tenant_id: string; daily_cents_cap: number; weekly_cents_cap: number; max_actions_per_hour: number; consumed_cents_today: number; consumed_actions_hour: number; }
interface Kill { id: string; tenant_id: string; switch_key: string; active: boolean; activated_at: string | null; expires_at: string | null; }

export default function TenantFederationBoard() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [kills, setKills] = useState<Kill[]>([]);

  async function load() {
    const [s, q, k] = await Promise.all([
      supabase.from("internal_agent_tenant_scopes").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("internal_agent_tenant_quotas").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("internal_agent_tenant_kill_switches").select("*").order("updated_at", { ascending: false }).limit(100),
    ]);
    setScopes((s.data as any) ?? []);
    setQuotas((q.data as any) ?? []);
    setKills((k.data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Tenant Federation">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Globe className="h-6 w-6" /> Multi-Tenant Federation
          </h1>
          <p className="text-sm text-muted-foreground">
            Phase 7C · per-tenant agent scopes, cost quotas, and tenant-scoped kill switches. All tenant-facing autonomy is hard-clamped to L3.
          </p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Tenant agent scopes</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            {scopes.length === 0 && <div className="text-muted-foreground">No tenant scopes configured.</div>}
            {scopes.map(s => (
              <div key={s.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{s.agent_id}</div>
                  <div className="text-muted-foreground">tenant {s.tenant_id.slice(0, 8)}…</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={s.enabled ? "default" : "outline"}>{s.enabled ? "enabled" : "disabled"}</Badge>
                  <Badge variant="outline">L{s.trust_rung} (cap L3)</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4" />Tenant quotas</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            {quotas.length === 0 && <div className="text-muted-foreground">No tenant quotas configured.</div>}
            {quotas.map(q => (
              <div key={q.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">tenant {q.tenant_id.slice(0, 8)}…</div>
                  <div className="text-muted-foreground">
                    {q.consumed_cents_today}¢ / {q.daily_cents_cap}¢ today · {q.consumed_actions_hour} / {q.max_actions_per_hour} actions/hr
                  </div>
                </div>
                <Badge variant={q.consumed_cents_today >= q.daily_cents_cap ? "destructive" : "outline"}>
                  {q.consumed_cents_today >= q.daily_cents_cap ? "at cap" : "ok"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4" />Tenant kill switches</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            {kills.length === 0 && <div className="text-muted-foreground">No tenant kill switches.</div>}
            {kills.map(k => (
              <div key={k.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{k.switch_key}</div>
                  <div className="text-muted-foreground">tenant {k.tenant_id.slice(0, 8)}…{k.activated_at ? ` · activated ${new Date(k.activated_at).toLocaleString()}` : ""}</div>
                </div>
                <Badge variant={k.active ? "destructive" : "outline"}>{k.active ? "ACTIVE" : "off"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}
