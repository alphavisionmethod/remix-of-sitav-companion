import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/hooks/useEngineEventsData";
import { useIntelligenceAssets } from "@/hooks/useIntelligencePersistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const IntelligenceMarketDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading: evLoading } = useEngineEvents("intelligence-market", { limit: 30 });
  const { assets, stats, loading: assetLoading } = useIntelligenceAssets();

  if (authLoading || !isAdmin) return null;
  const loading = evLoading || assetLoading;

  const domainMap: Record<string, { invested: number; returned: number; assets: number }> = {};
  for (const a of assets) {
    const d = a.domain || "platform";
    if (!domainMap[d]) domainMap[d] = { invested: 0, returned: 0, assets: 0 };
    domainMap[d].assets++;
    domainMap[d].returned += a.cost_avoided_cents;
    domainMap[d].invested += 10;
  }
  const domains = Object.entries(domainMap)
    .map(([domain, d]) => ({ domain, ...d, roi: d.invested > 0 ? (d.returned / d.invested).toFixed(1) : "0" }))
    .sort((a, b) => b.returned - a.returned);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<BarChart3 className="h-6 w-6" />} title="Intelligence Market" subtitle="Capital allocation view — where AI compute yields the most value" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Domains", v: String(domains.length) },
          { l: "Total Assets", v: String(stats.total) },
          { l: "Total Returns", v: `$${(stats.totalCostAvoided / 100).toFixed(0)}`, c: "text-emerald-400" },
          { l: "Market Events", v: String(events.length) },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading market data…</div>
      ) : domains.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No intelligence market data yet. Domain ROI data will appear as intelligence assets accumulate.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Domain AI ROI</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Domain</TableHead><TableHead className="text-xs text-right">Assets</TableHead>
            <TableHead className="text-xs text-right">Returns</TableHead><TableHead className="text-xs text-right">ROI</TableHead>
          </TableRow></TableHeader><TableBody>
            {domains.map(d => (<TableRow key={d.domain}>
              <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
              <TableCell className="text-xs text-right">{d.assets}</TableCell>
              <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.returned / 100).toFixed(0)}</TableCell>
              <TableCell className="text-xs text-right font-bold">{d.roi}x</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default IntelligenceMarketDashboard;
