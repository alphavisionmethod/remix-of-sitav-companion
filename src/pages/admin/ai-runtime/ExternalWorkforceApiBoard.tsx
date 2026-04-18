// ═══════════════════════════════════════════════════════════════
// Phase 8B — External Workforce API + Webhooks board
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { KeyRound, Webhook, RefreshCw } from "lucide-react";

interface ApiKey { id: string; tenant_id: string; key_id: string; scope: string; status: string; last_used_at: string | null; }
interface Sub { id: string; tenant_id: string; callback_url: string; event_types: string[]; status: string; failure_count: number; last_delivered_at: string | null; }
interface Delivery { id: string; event_type: string; http_status: number | null; retry_count: number; created_at: string; error_message: string | null; }

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  paused: "bg-amber-500/10 text-amber-600",
  revoked: "bg-red-500/10 text-red-600",
};

export default function ExternalWorkforceApiBoard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [k, s, d] = await Promise.all([
      supabase.from("external_workforce_api_keys").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("external_workforce_subscriptions").select("*").order("updated_at", { ascending: false }).limit(20),
      supabase.from("external_workforce_webhook_deliveries").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setKeys((k.data as any) ?? []);
    setSubs((s.data as any) ?? []);
    setDeliveries((d.data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <AdminControlPlaneShell contextScope="External Workforce API">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Webhook className="h-5 w-5" /> External Workforce API & Webhooks</h1>
          <p className="text-sm text-muted-foreground">Phase 8B — read-only signed API + HMAC-SHA256 webhooks. No internal IDs leaked.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><KeyRound className="h-4 w-4" /> API keys</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {keys.length === 0 && <p className="text-xs text-muted-foreground">No API keys issued.</p>}
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                <div>
                  <div className="font-mono">{k.key_id}</div>
                  <div className="text-muted-foreground">{k.tenant_id} · {k.scope}</div>
                </div>
                <Badge className={statusColor[k.status] ?? ""}>{k.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Webhook subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {subs.length === 0 && <p className="text-xs text-muted-foreground">No subscriptions.</p>}
            {subs.map((s) => (
              <div key={s.id} className="text-xs border-b border-border/30 pb-1">
                <div className="flex justify-between">
                  <span className="font-medium truncate max-w-[60%]">{s.callback_url}</span>
                  <Badge className={statusColor[s.status] ?? ""}>{s.status}</Badge>
                </div>
                <div className="text-muted-foreground">{s.event_types.join(", ") || "—"} · failures {s.failure_count}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent deliveries</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {deliveries.length === 0 && <p className="text-xs text-muted-foreground">No deliveries yet.</p>}
          {deliveries.map((d) => (
            <div key={d.id} className="flex justify-between text-xs border-b border-border/30 pb-1">
              <span>{d.event_type}</span>
              <span className="text-muted-foreground">{d.http_status ?? "—"} · retries {d.retry_count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminControlPlaneShell>
  );
}
