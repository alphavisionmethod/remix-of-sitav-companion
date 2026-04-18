// ═══════════════════════════════════════════════════════════════
// Phase 9B — Tenant Self-Service Console (tenant-facing)
// Tenants manage their own kill-switches, quotas, and audit history.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Shield, Activity, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Action { id: string; action_kind: string; target_ref: string; status: string; created_at: string; justification: string | null; }
interface Quota { id: string; quota_key: string; quota_value: number; hard_ceiling: number; current_usage: number; reset_period: string; }

export default function TenantSelfServiceConsole() {
  const [actions, setActions] = useState<Action[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, number>>({});

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("tenant-self-service-bff", { body: { op: "summary" } });
    if (error) toast.error(error.message);
    else {
      setActions((data?.actions as Action[]) ?? []);
      setQuotas((data?.quotas as Quota[]) ?? []);
    }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function saveQuota(q: Quota) {
    const newVal = editing[q.id] ?? q.quota_value;
    if (newVal > q.hard_ceiling) {
      toast.error(`Cannot exceed hard ceiling of ${q.hard_ceiling}`);
      return;
    }
    const { error } = await supabase.functions.invoke("tenant-self-service-bff", {
      body: { op: "update_quota", quota_key: q.quota_key, quota_value: newVal },
    });
    if (error) toast.error(error.message);
    else {
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
  }

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
