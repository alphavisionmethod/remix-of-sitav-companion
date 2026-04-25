// ═══════════════════════════════════════════════════════════════
// Phase 9B/9-Hardening — Tenant Self-Service Console (tenant-facing)
// Tenants manage their kill-switches, quotas, federation opt-ins,
// and review their own audit history. Hard-gated by `is_tenant_admin`.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Shield, Activity, RefreshCw, Power, Lock } from "lucide-react";
import { toast } from "sonner";

interface Action { id: string; action_kind: string; target_ref: string; status: string; created_at: string; justification: string | null; }
interface Quota { id: string; quota_key: string; quota_value: number; hard_ceiling: number; current_usage: number; reset_period: string; }
interface KillSwitch { id: string; switch_key: string; enabled: boolean; justification: string | null; updated_at: string; }

const SWITCH_LABELS: Record<string, string> = {
  federation: "Knowledge Federation",
  external_api: "External API access",
  webhooks: "Webhook deliveries",
  ai_actions: "AI autonomous actions",
  quotas_pause: "Pause all quota-gated workloads",
};

export default function TenantSelfServiceConsole() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [switches, setSwitches] = useState<KillSwitch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [switchJustifications, setSwitchJustifications] = useState<Record<string, string>>({});

  async function checkAuth() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setAuthorized(false); return; }
    const { data: ok } = await supabase.rpc("is_tenant_admin", { _user_id: u.user.id });
    setAuthorized(Boolean(ok));
  }

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("tenant-self-service-bff", { body: { op: "summary" } });
    if (error) toast.error(error.message);
    else {
      setActions((data?.actions as Action[]) ?? []);
      setQuotas((data?.quotas as Quota[]) ?? []);
    }
    const { data: ksData } = await supabase
      .from("tenant_kill_switches")
      .select("*")
      .order("switch_key");
    setSwitches((ksData as KillSwitch[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (authorized) refresh(); }, [authorized]);

  async function saveQuota(q: Quota) {
    const newVal = editing[q.id] ?? q.quota_value;
    if (newVal > q.hard_ceiling) {
      toast.error(`Cannot exceed hard ceiling of ${q.hard_ceiling}`);
      return;
    }
    const { error } = await supabase.functions.invoke("tenant-self-service-bff", {
      body: { op: "update_quota", quota_key: q.quota_key, quota_value: newVal },
    });
    if (error) { toast.error(error.message); return; }
    await supabase.functions.invoke("tenant-self-service-bff", {
      body: {
        op: "record_action",
        action_kind: "quota_change",
        target_ref: q.quota_key,
        before_state: { quota_value: q.quota_value },
        after_state: { quota_value: newVal },
      },
    });
    toast.success("Quota updated");
    refresh();
  }

  async function toggleSwitch(key: string, currentEnabled: boolean) {
    const newEnabled = !currentEnabled;
    const justification = switchJustifications[key] ?? "";
    if (newEnabled && justification.length < 20) {
      toast.error("Justification of at least 20 characters required to enable a kill-switch");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("tenant_kill_switches")
      .upsert({
        user_id: u.user.id,
        switch_key: key,
        enabled: newEnabled,
        justification: newEnabled ? justification : null,
        enabled_at: newEnabled ? new Date().toISOString() : null,
        disabled_at: newEnabled ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,switch_key" });
    if (error) { toast.error(error.message); return; }
    await supabase.functions.invoke("tenant-self-service-bff", {
      body: {
        op: "record_action",
        action_kind: "kill_switch_toggle",
        target_ref: key,
        before_state: { enabled: currentEnabled },
        after_state: { enabled: newEnabled, justification },
      },
    });
    toast.success(`Kill-switch ${newEnabled ? "enabled" : "disabled"}`);
    refresh();
  }

  if (authorized === null) {
    return <div className="p-6 text-sm text-muted-foreground">Checking access…</div>;
  }
  if (!authorized) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" /> Access denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Self-Service Console requires the <code>tenant_admin</code> role. Contact your workspace
            administrator to be granted access.
          </CardContent>
        </Card>
      </div>
    );
  }

  const switchKeys = ["federation","external_api","webhooks","ai_actions","quotas_pause"];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Settings2 className="h-6 w-6" /> Self-Service Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your kill-switches, quotas, and review your action history.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Power className="h-4 w-4" /> Kill switches</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {switchKeys.map(key => {
              const sw = switches.find(s => s.switch_key === key);
              const enabled = sw?.enabled ?? false;
              return (
                <div key={key} className="flex flex-col gap-2 border-b pb-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{SWITCH_LABELS[key]}</div>
                      <div className="text-xs text-muted-foreground">
                        {enabled ? "ENABLED — workload paused" : "Inactive"}
                        {sw?.updated_at && <> · updated {new Date(sw.updated_at).toLocaleString()}</>}
                      </div>
                    </div>
                    <Switch checked={enabled} onCheckedChange={() => toggleSwitch(key, enabled)} />
                  </div>
                  {!enabled && (
                    <Textarea
                      placeholder="Justification (≥20 chars) required to enable"
                      className="text-xs"
                      rows={2}
                      value={switchJustifications[key] ?? ""}
                      onChange={(e) => setSwitchJustifications(s => ({ ...s, [key]: e.target.value }))}
                    />
                  )}
                  {enabled && sw?.justification && (
                    <div className="text-xs italic text-muted-foreground">{sw.justification}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Quotas</CardTitle></CardHeader>
        <CardContent>
          {quotas.length === 0 ? <p className="text-sm text-muted-foreground">No quotas configured for your account.</p> : (
            <div className="space-y-3">
              {quotas.map(q => (
                <div key={q.id} className="flex items-center justify-between gap-4 border-b pb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{q.quota_key}</div>
                    <div className="text-xs text-muted-foreground">
                      Used {q.current_usage} / Limit {q.quota_value} (Hard ceiling {q.hard_ceiling}) · {q.reset_period}
                    </div>
                  </div>
                  <Input
                    type="number"
                    className="w-28"
                    defaultValue={q.quota_value}
                    max={q.hard_ceiling}
                    min={0}
                    onChange={(e) => setEditing(s => ({ ...s, [q.id]: Number(e.target.value) }))}
                  />
                  <Button size="sm" onClick={() => saveQuota(q)}>Save</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Recent actions</CardTitle></CardHeader>
        <CardContent>
          {actions.length === 0 ? <p className="text-sm text-muted-foreground">No self-service actions yet.</p> : (
            <div className="space-y-2">
              {actions.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <div className="font-medium">{a.action_kind}</div>
                    <div className="text-xs text-muted-foreground">{a.target_ref} · {new Date(a.created_at).toLocaleString()}</div>
                    {a.justification && <div className="text-xs italic">{a.justification}</div>}
                  </div>
                  <Badge variant={a.status === "completed" ? "default" : "secondary"}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
