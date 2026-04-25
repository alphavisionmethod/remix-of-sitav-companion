// ═══════════════════════════════════════════════════════════════
// Phase 8B — External Workforce API + Webhooks board
// Hardened by Frontend Polish Closure: BoardSection wrapper supplies
// trust-grade empty / loading / error states for all three sections.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { KeyRound, Webhook, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { BoardSection } from "@/platform/admin/components/admin/ai-runtime/_shared/BoardSection";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [k, s, d] = await Promise.all([
        supabase.from("external_workforce_api_keys").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("external_workforce_subscriptions").select("*").order("updated_at", { ascending: false }).limit(20),
        supabase.from("external_workforce_webhook_deliveries").select("*").order("created_at", { ascending: false }).limit(30),
      ]);
      const firstError = k.error ?? s.error ?? d.error;
      if (firstError) throw firstError;
      setKeys((k.data ?? []) as typeof keys);
      setSubs((s.data ?? []) as typeof subs);
      setDeliveries((d.data ?? []) as typeof deliveries);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  return (
    <AdminControlPlaneShell contextScope="External Workforce API">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Webhook className="h-5 w-5" /> External Workforce API &amp; Webhooks</h1>
          <p className="text-sm text-muted-foreground">Phase 8B — read-only signed API + HMAC-SHA256 webhooks. No internal IDs leaked.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} aria-label="Refresh" className="self-start sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BoardSection
          title="API keys"
          icon={<KeyRound className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={refresh}
          isEmpty={keys.length === 0}
          emptyIcon={<KeyRound className="h-5 w-5" />}
          emptyTitle="No API keys issued yet"
          emptyDescription="Issue a signed key from the Owner Workspace to allow trusted tenants to read workforce signals. Keys are scoped, revocable, and audited."
        >
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
              <div className="min-w-0">
                <div className="font-mono truncate">{k.key_id}</div>
                <div className="text-muted-foreground truncate">{k.tenant_id} · {k.scope}</div>
              </div>
              <Badge className={statusColor[k.status] ?? ""}>{k.status}</Badge>
            </div>
          ))}
        </BoardSection>

        <BoardSection
          title="Webhook subscriptions"
          icon={<Send className="h-4 w-4" />}
          loading={loading}
          error={error}
          onRetry={refresh}
          isEmpty={subs.length === 0}
          emptyIcon={<Send className="h-5 w-5" />}
          emptyTitle="No webhook subscriptions"
          emptyDescription="Tenants subscribe to workforce events via signed callbacks. Once a tenant registers a callback URL it will appear here with its event filter and delivery health."
        >
          {subs.map((s) => (
            <div key={s.id} className="text-xs border-b border-border/30 pb-1">
              <div className="flex justify-between gap-2">
                <span className="font-medium truncate max-w-[60%]">{s.callback_url}</span>
                <Badge className={statusColor[s.status] ?? ""}>{s.status}</Badge>
              </div>
              <div className="text-muted-foreground">{s.event_types.join(", ") || "—"} · failures {s.failure_count}</div>
            </div>
          ))}
        </BoardSection>
      </div>

      <BoardSection
        title="Recent deliveries"
        icon={<ShieldCheck className="h-4 w-4" />}
        loading={loading}
        error={error}
        onRetry={refresh}
        isEmpty={deliveries.length === 0}
        emptyIcon={<Send className="h-5 w-5" />}
        emptyTitle="No webhook deliveries in the last window"
        emptyDescription="Deliveries appear as soon as the workforce emits an event matching an active subscription. Each delivery is HMAC-signed and retried up to 5 times with exponential backoff."
      >
        <div className="overflow-x-auto">
          {deliveries.map((d) => (
            <div key={d.id} className="flex justify-between text-xs border-b border-border/30 pb-1">
              <span>{d.event_type}</span>
              <span className="text-muted-foreground">{d.http_status ?? "—"} · retries {d.retry_count}</span>
            </div>
          ))}
        </div>
      </BoardSection>
    </AdminControlPlaneShell>
  );
}
