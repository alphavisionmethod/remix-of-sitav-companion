import { useEffect, useState } from "react";
import { ScrollText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface AuditRow {
  id: string;
  action: string;
  plane: string;
  severity: string;
  target_type: string | null;
  target_id: string | null;
  justification: string | null;
  created_at: string;
}

const SEV_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  info: "secondary",
  warning: "outline",
  critical: "destructive",
};

export default function TrustAudit() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("admin_action_audit")
        .select("id, action, plane, severity, target_type, target_id, justification, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as AuditRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <ScrollText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Immutable ledger of meaningful actions across all four pillars and the platform layer.
          </p>
        </div>
      </header>

      {loading && <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading audit entries…</div>}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <div className="font-medium">Could not load audit log</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No audit entries yet. Records appear here as soon as the system or your advisors take a tracked action.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={SEV_VARIANT[r.severity] ?? "default"} className="capitalize">{r.severity}</Badge>
                  <Badge variant="outline" className="capitalize">{r.plane}</Badge>
                  <span className="font-mono text-xs truncate">{r.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              {(r.target_type || r.justification) && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.target_type && <span>{r.target_type}{r.target_id ? `: ${r.target_id}` : ""}</span>}
                  {r.target_type && r.justification && <span> · </span>}
                  {r.justification && <span>{r.justification}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}