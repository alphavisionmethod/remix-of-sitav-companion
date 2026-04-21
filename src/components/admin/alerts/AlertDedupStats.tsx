// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Dedup Stats
// Shows deduplication effectiveness metrics from alert_dedup_log.
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, GitMerge, VolumeX } from "lucide-react";

interface DedupEntry {
  id: string;
  fingerprint: string;
  occurrence_count: number;
  was_deduplicated: boolean;
  was_suppressed: boolean;
  original_severity: string;
  created_at: string;
}

export function AlertDedupStats() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["alert-dedup-log"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("alert_dedup_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as DedupEntry[];
    },
    refetchInterval: 30_000,
  });

  const total = entries.length;
  const deduped = entries.filter((e) => e.was_deduplicated).length;
  const suppressed = entries.filter((e) => e.was_suppressed).length;
  const dedupRate = total > 0 ? Math.round((deduped / total) * 100) : 0;
  const suppressRate = total > 0 ? Math.round((suppressed / total) * 100) : 0;

  // Group by fingerprint for top-deduped
  const fpMap = new Map<string, { count: number; totalOccurrences: number }>();
  for (const e of entries) {
    const cur = fpMap.get(e.fingerprint) ?? { count: 0, totalOccurrences: 0 };
    cur.count++;
    cur.totalOccurrences += e.occurrence_count;
    fpMap.set(e.fingerprint, cur);
  }
  const topFingerprints = [...fpMap.entries()]
    .sort((a, b) => b[1].totalOccurrences - a[1].totalOccurrences)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" /> Deduplication Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4"><Loader2 className="h-4 w-4 mx-auto animate-spin text-muted-foreground" /></div>
        ) : total === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No dedup log entries yet</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold">{total}</p>
                <p className="text-[10px] text-muted-foreground">Total Events</p>
              </div>
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold text-primary flex items-center justify-center gap-1"><GitMerge className="h-3.5 w-3.5" />{dedupRate}%</p>
                <p className="text-[10px] text-muted-foreground">Deduplicated</p>
              </div>
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold text-amber-500 flex items-center justify-center gap-1"><VolumeX className="h-3.5 w-3.5" />{suppressRate}%</p>
                <p className="text-[10px] text-muted-foreground">Suppressed</p>
              </div>
            </div>
            {topFingerprints.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Recurring Fingerprints</p>
                {topFingerprints.map(([fp, stats]) => (
                  <div key={fp} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                    <span className="font-mono text-[10px] truncate max-w-[200px]">{fp}</span>
                    <Badge variant="outline" className="text-[9px]">{stats.totalOccurrences} occurrences</Badge>
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