// ═══════════════════════════════════════════════════════════════
// SITA OS — Live Alerts Panel (Phase 20.1.C)
// Compact embedded view of the most recent active alerts from
// `public.alerts`, with deep-link to the full triage board.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertRow {
  id: string;
  source: string;
  subsystem: string;
  severity: string;
  status: string;
  title: string;
  count: number;
  last_seen_at: string;
}

const SEV_COLORS: Record<string, string> = {
  critical: "text-destructive border-destructive/40",
  high: "text-accent border-accent/40",
  medium: "text-yellow-400 border-yellow-400/40",
  low: "text-muted-foreground border-border",
  info: "text-muted-foreground border-border",
};

export function AlertsLivePanel() {
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("alerts")
      .select("id,source,subsystem,severity,status,title,count,last_seen_at")
      .in("status", ["active", "acknowledged"])
      .order("last_seen_at", { ascending: false })
      .limit(10);
    setRows((data as AlertRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <SitaCard hover={false}>
      <div className="flex items-center justify-between">
        <SitaCardTitle sub={`${rows.length} active or acknowledged · live from \`alerts\``}>
          Live Alerts
        </SitaCardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/alerts" className="text-[10px]">
              Triage <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {rows.length === 0 && !loading && (
          <div className="text-center py-6">
            <AlertTriangle className="h-5 w-5 text-trust-safe mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">No active alerts</p>
          </div>
        )}
        {rows.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-3 py-2"
          >
            <Badge
              variant="outline"
              className={cn("text-[9px] shrink-0 capitalize", SEV_COLORS[a.severity] ?? SEV_COLORS.info)}
            >
              {a.severity}
            </Badge>
            <span className="text-xs text-foreground truncate flex-1">{a.title}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {a.subsystem} · {a.source}
            </span>
            {a.count > 1 && (
              <Badge variant="outline" className="text-[9px] shrink-0">
                ×{a.count}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </SitaCard>
  );
}
