// ═══════════════════════════════════════════════════════════════
// SITA OS — SLA Breach Timeline Panel
// Visual timeline grouping alerts, incidents, and chaos drills
// by timestamp and impact severity.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play, Zap, Loader2, Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  event_type: string;
  contribution_summary: string;
  severity: string;
  occurred_at: string;
  contributing_alert_id: string | null;
  drill_result_id: string | null;
}

const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const sevDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-400",
};
const typeIcon: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="h-3 w-3" />,
  drill: <Play className="h-3 w-3" />,
  incident: <Zap className="h-3 w-3" />,
};

interface TimelineGroup {
  label: string;
  events: TimelineEvent[];
  maxSeverity: string;
}

function groupByHour(events: TimelineEvent[]): TimelineGroup[] {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const d = new Date(e.occurred_at);
    const key = `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2, "0")}:00`;
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([label, evts]) => {
      const sorted = evts.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9));
      return { label, events: sorted, maxSeverity: sorted[0]?.severity ?? "low" };
    });
}

export function SLABreachTimelinePanel({ slaAlertId }: { slaAlertId: string }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["sla-breach-timeline", slaAlertId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sla_breach_contributing_events")
        .select("*")
        .eq("sla_alert_id", slaAlertId)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TimelineEvent[];
    },
    enabled: !!slaAlertId,
  });

  const groups = useMemo(() => groupByHour(events), [events]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> SLA Breach Timeline
          <Badge variant="outline" className="text-[9px] ml-auto">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4"><Loader2 className="h-4 w-4 mx-auto animate-spin text-muted-foreground" /></div>
        ) : groups.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No timeline events</p>
        ) : (
          <div className="relative pl-4 border-l-2 border-border/50 space-y-4">
            {groups.map((g) => (
              <div key={g.label} className="relative">
                {/* Dot on the timeline line */}
                <div className={`absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-background ${sevDot[g.maxSeverity] ?? "bg-muted"}`} />
                <p className="text-[10px] font-medium text-muted-foreground mb-1">{g.label}</p>
                <div className="space-y-1">
                  {g.events.map((e) => (
                    <div key={e.id} className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/20 transition-colors">
                      <span className="mt-0.5 text-muted-foreground">{typeIcon[e.event_type] ?? <Zap className="h-3 w-3" />}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{e.contribution_summary}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(e.occurred_at).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${sevDot[e.severity] ? `text-${e.severity === "critical" ? "red" : e.severity === "high" ? "orange" : e.severity === "medium" ? "amber" : "blue"}-500` : ""}`}>
                        {e.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}