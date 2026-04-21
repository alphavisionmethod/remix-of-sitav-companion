// ═══════════════════════════════════════════════════════════════
// SITA OS — SLA Breach Contributing Events Panel
// Shows alerts & drills that contributed to an SLA breach.
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Play, Zap, ExternalLink, Loader2 } from "lucide-react";

interface ContributingEvent {
  id: string;
  sla_alert_id: string;
  contributing_alert_id: string | null;
  drill_result_id: string | null;
  event_type: string;
  contribution_summary: string;
  severity: string;
  occurred_at: string;
}

const sevColors: Record<string, string> = {
  critical: "text-red-500 bg-red-500/10",
  high: "text-orange-500 bg-orange-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  low: "text-blue-500 bg-blue-500/10",
};

export function SLABreachContributorsPanel({ slaAlertId }: { slaAlertId: string }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["sla-breach-contributors", slaAlertId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sla_breach_contributing_events")
        .select("*")
        .eq("sla_alert_id", slaAlertId)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContributingEvent[];
    },
    enabled: !!slaAlertId,
  });

  const alertEvents = events.filter((e) => e.event_type === "alert");
  const drillEvents = events.filter((e) => e.event_type === "drill");
  const incidentEvents = events.filter((e) => e.event_type === "incident");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" /> Contributing Events
          <Badge variant="outline" className="text-[9px] ml-auto">{events.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4"><Loader2 className="h-4 w-4 mx-auto animate-spin text-muted-foreground" /></div>
        ) : events.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No contributing events linked yet</p>
        ) : (
          <div className="space-y-3">
            {alertEvents.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" /> Alerts ({alertEvents.length})
                </p>
                {alertEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="space-y-0.5">
                      <p className="text-xs">{e.contribution_summary}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(e.occurred_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[9px] ${sevColors[e.severity] ?? ""}`}>{e.severity}</Badge>
                      {e.contributing_alert_id && (
                        <Button variant="ghost" size="sm" className="h-5 px-1.5" asChild>
                          <Link to={`/admin/alerts?focus=${e.contributing_alert_id}`}>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {drillEvents.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Play className="h-2.5 w-2.5" /> Chaos Drills ({drillEvents.length})
                </p>
                {drillEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="space-y-0.5">
                      <p className="text-xs">{e.contribution_summary}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(e.occurred_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${sevColors[e.severity] ?? ""}`}>{e.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
            {incidentEvents.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Incidents ({incidentEvents.length})
                </p>
                {incidentEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="space-y-0.5">
                      <p className="text-xs">{e.contribution_summary}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(e.occurred_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${sevColors[e.severity] ?? ""}`}>{e.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}