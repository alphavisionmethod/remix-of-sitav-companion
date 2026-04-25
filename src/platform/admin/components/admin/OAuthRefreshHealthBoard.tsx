import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectorStateBadge } from "@/platform/cloud/components/ConnectorStateBadge";
import { IntegrationReceiptDrawer, ReauthCTAButton } from "@/platform/admin/components/admin/integrations/IntegrationReceiptDrawer";
import { RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, FileText } from "lucide-react";

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

export default function OAuthRefreshHealthBoard() {
  const [rows, setRows] = useState<ProbeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAccountId, setDrawerAccountId] = useState<string | null>(null);
  const [drawerProvider, setDrawerProvider] = useState<string | null>(null);
  const [drawerLabel, setDrawerLabel] = useState<string | null>(null);

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

  const openDrawer = (r: ProbeRow) => {
    setDrawerAccountId(r.account_id);
    setDrawerProvider(r.provider);
    setDrawerLabel(r.account_id ?? r.user_id.slice(0, 8));
    setDrawerOpen(true);
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
                <div key={r.id} className="flex items-center justify-between border-b border-border py-2 text-sm gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="capitalize text-xs font-medium w-20">{r.provider}</span>
                    <ConnectorStateBadge
                      state={r.reauth_required ? "reauth_required" : r.lifecycle_state}
                      size="xs"
                    />
                    <span className="text-muted-foreground text-xs font-mono">
                      {r.account_id ?? r.user_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.failure_class && (
                      <span className="text-xs text-muted-foreground">{r.failure_class}</span>
                    )}
                    {r.probe_finished_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.probe_finished_at).toLocaleString()}
                      </span>
                    )}
                    {r.reauth_required && r.account_id && (
                      <ReauthCTAButton accountId={r.account_id} />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => openDrawer(r)}
                    >
                      <FileText className="h-3 w-3 mr-1" /> Receipts
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IntegrationReceiptDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        accountId={drawerAccountId}
        provider={drawerProvider}
        fallbackLabel={drawerLabel}
      />
    </div>
  );
}
