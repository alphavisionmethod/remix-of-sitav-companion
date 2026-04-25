import { AlertTriangle, Activity, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/hooks/useEngineEventsData";
import { useIntelligenceAssets } from "@/hooks/useIntelligencePersistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const sevColors: Record<string,string> = { critical: "text-rose-400 bg-rose-500/10", high: "text-amber-400 bg-amber-500/10", medium: "text-yellow-400 bg-yellow-500/10", low: "text-muted-foreground bg-secondary/30" };

const DecayMonitorDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading: eventsLoading } = useEngineEvents("intelligence-decay", { limit: 50 });
  const { assets, loading: assetsLoading } = useIntelligenceAssets();

  if (authLoading || !isAdmin) return null;

  const loading = eventsLoading || assetsLoading;

  // Derive decay alerts from assets with low freshness
  const decayAlerts = assets
    .filter(a => Number(a.freshness_score) < 0.5 || a.invalidated)
    .map(a => ({
      type: a.invalidated ? "invalidated" : "stale_asset",
      asset: a.title || a.asset_type,
      domain: a.domain,
      severity: Number(a.freshness_score) < 0.2 ? "critical" : Number(a.freshness_score) < 0.4 ? "high" : "medium",
      freshness: `${(Number(a.freshness_score) * 100).toFixed(0)}%`,
      decayRate: Number(a.decay_rate),
      rec: a.invalidated ? "Remove or archive" : Number(a.freshness_score) < 0.3 ? "Refresh urgently" : "Schedule refresh",
    }));

  // Merge with any engine_events decay alerts
  const eventAlerts = events.map(e => ({
    type: (e.event_data.alert_type as string) || "decay_detected",
    asset: (e.event_data.asset_name as string) || "Unknown",
    domain: (e.event_data.domain as string) || "platform",
    severity: (e.event_data.severity as string) || "medium",
    freshness: (e.event_data.freshness as string) || "N/A",
    decayRate: Number(e.event_data.decay_rate) || 0,
    rec: (e.event_data.recommendation as string) || "Review",
  }));

  const allAlerts = [...decayAlerts, ...eventAlerts];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<AlertTriangle className="h-6 w-6" />} title="Intelligence Decay Monitor" subtitle="Detecting stale assets, rising false positives, and degraded recommendations" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Alerts", v: String(allAlerts.length) },
          { l: "Critical", v: String(allAlerts.filter(a => a.severity === "critical").length), c: "text-rose-400" },
          { l: "Stale Assets", v: String(decayAlerts.length), c: "text-amber-400" },
          { l: "From Events", v: String(eventAlerts.length) },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-2xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading decay data…</div>
      ) : allAlerts.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No decay alerts detected. All intelligence assets are fresh.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Decay Alerts</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Asset</TableHead>
            <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-center">Severity</TableHead>
            <TableHead className="text-xs text-right">Freshness</TableHead><TableHead className="text-xs">Recommendation</TableHead>
          </TableRow></TableHeader><TableBody>
            {allAlerts.map((a, i) => (<TableRow key={i}>
              <TableCell className="text-xs text-muted-foreground">{a.type.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs font-medium text-foreground">{a.asset}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{a.domain}</TableCell>
              <TableCell className="text-center"><Badge className={`${sevColors[a.severity] || ""} text-[9px]`} variant="secondary">{a.severity}</Badge></TableCell>
              <TableCell className="text-xs text-right">{a.freshness}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{a.rec}</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default DecayMonitorDashboard;
