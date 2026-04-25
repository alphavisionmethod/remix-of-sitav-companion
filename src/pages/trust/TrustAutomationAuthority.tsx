import { useEffect, useState } from "react";
import { Bot, ShieldCheck, AlertTriangle, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface PolicyRow {
  id: string;
  domain: string;
  autonomy_level: number;
  emergency_stop: boolean;
  paused_at: string | null;
  allow_financial: boolean;
  allow_communication: boolean;
  allow_client_facing: boolean;
  allow_scheduling: boolean;
  max_financial_impact_cents: number;
  require_approval_above_confidence: number;
}

const LEVEL_LABEL = ["L0 · Off", "L1 · Watch", "L2 · Suggest", "L3 · Draft", "L4 · Act w/ approval", "L5 · Auto", "L6 · Full"];

export default function TrustAutomationAuthority() {
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("advisor_autonomy_policies")
        .select(
          "id, domain, autonomy_level, emergency_stop, paused_at, allow_financial, allow_communication, allow_client_facing, allow_scheduling, max_financial_impact_cents, require_approval_above_confidence",
        )
        .order("domain");
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as PolicyRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <Bot className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Automation Authority</h1>
          <p className="text-sm text-muted-foreground">
            Nothing acts on your behalf without an explicit grant of authority. Revoke at any time.
          </p>
        </div>
      </header>

      {loading && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading policies…</div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <div className="font-medium">Could not load autonomy policies</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-primary/60" />
          No autonomy policies configured. Defaults apply: every action requires explicit approval.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{r.domain}</Badge>
                  <span className="text-sm font-medium">{LEVEL_LABEL[r.autonomy_level] ?? `L${r.autonomy_level}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.emergency_stop && (
                    <Badge variant="destructive" className="gap-1"><Pause className="h-3 w-3" />E-STOP</Badge>
                  )}
                  {r.paused_at && <Badge variant="outline">Paused</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div>Financial: <span className={r.allow_financial ? "text-foreground" : ""}>{r.allow_financial ? "allowed" : "blocked"}</span></div>
                <div>Communication: <span className={r.allow_communication ? "text-foreground" : ""}>{r.allow_communication ? "allowed" : "blocked"}</span></div>
                <div>Client-facing: <span className={r.allow_client_facing ? "text-foreground" : ""}>{r.allow_client_facing ? "allowed" : "blocked"}</span></div>
                <div>Scheduling: <span className={r.allow_scheduling ? "text-foreground" : ""}>{r.allow_scheduling ? "allowed" : "blocked"}</span></div>
                <div>Max impact: <span className="text-foreground">${(r.max_financial_impact_cents / 100).toFixed(2)}</span></div>
                <div>Approval if confidence ≥: <span className="text-foreground">{Math.round(r.require_approval_above_confidence * 100)}%</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}