import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface ProbeRow {
  id: string;
  provider: string;
  user_id: string;
  account_id: string | null;
  status: string;
  lifecycle_state: string;
  alert_state: string;
  reauth_required: boolean;
  failure_class: string | null;
  failure_reason: string | null;
  retry_count: number;
  probe_finished_at: string | null;
}

const lifecycleColor = (s: string) => {
  switch (s) {
    case "healthy": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "degraded": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "reauth_required": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "failing":
    case "blocked": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

export default function OAuthRefreshHealthBoard() {
  const [rows, setRows] = useState<ProbeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("oauth_refresh_probe_results")
      .select("id, provider, user_id, account_id, status, lifecycle_state, alert_state, reauth_required, failure_class, failure_reason, retry_count, probe_finished_at")
      .order("probe_finished_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as ProbeRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const triggerProbe = async () => {
    setTriggering(true);
    try {
      await supabase.functions.invoke("oauth-refresh-probe", { body: {} });
      await load();
    } finally { setTriggering(false); }
  };

  const byProvider = ["google", "microsoft", "slack"].map(p => {
    const provRows = rows.filter(r => r.provider === p);
    const healthy = provRows.filter(r => r.lifecycle_state === "healthy").length;
    const degraded = provRows.filter(r => r.lifecycle_state === "degraded").length;
    const failing = provRows.filter(r => r.lifecycle_state === "failing" || r.lifecycle_state === "blocked").length;
    const reauth = provRows.filter(r => r.reauth_required).length;
    return { provider: p, total: provRows.length, healthy, degraded, failing, reauth };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">OAuth Refresh Health</h2>
          <p className="text-sm text-muted-foreground">Live token-refresh probes for Google, Microsoft, and Slack connectors.</p>
        </div>
        <Button onClick={triggerProbe} disabled={triggering} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${triggering ? "animate-spin" : ""}`} />
          Run probes now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byProvider.map(p => (
          <Card key={p.provider}>
            <CardHeader className="pb-2"><CardTitle className="capitalize text-base">{p.provider}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {p.healthy} healthy
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {p.degraded} degraded
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldAlert className="h-4 w-4 text-destructive" /> {p.failing} failing · {p.reauth} reauth
              </div>
              <div className="text-xs text-muted-foreground">{p.total} probes recorded</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent probe results</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loading && rows.length === 0 && <div className="text-sm text-muted-foreground">No probe results yet. Click "Run probes now" to start.</div>}
          {rows.length > 0 && (
            <div className="space-y-2">
              {rows.slice(0, 50).map(r => (
                <div key={r.id} className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{r.provider}</Badge>
                    <Badge className={lifecycleColor(r.lifecycle_state)}>{r.lifecycle_state}</Badge>
                    {r.reauth_required && <Badge variant="destructive">reauth</Badge>}
                    <span className="text-muted-foreground text-xs">{r.account_id ?? r.user_id.slice(0, 8)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.failure_class && <span className="mr-2">{r.failure_class}</span>}
                    {r.probe_finished_at && new Date(r.probe_finished_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
