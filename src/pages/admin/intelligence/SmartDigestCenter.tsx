import {
  FileText, Clock, Activity, DollarSign, TrendingUp,
  AlertTriangle, RefreshCw, CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const mockDigests = [
  { id: "d-1", type: "daily_summary", domain: "engineering", fresh: true, hitRate: 0.82, genCost: 15, avoidedSpend: 120, age: "2hr", expiresIn: "22hr", cacheStatus: "cached" },
  { id: "d-2", type: "boardroom_packet", domain: "admin-ops", fresh: true, hitRate: 0.75, genCost: 25, avoidedSpend: 200, age: "4hr", expiresIn: "20hr", cacheStatus: "cached" },
  { id: "d-3", type: "risk_packet", domain: "compliance-trust", fresh: true, hitRate: 0.68, genCost: 18, avoidedSpend: 90, age: "1hr", expiresIn: "23hr", cacheStatus: "cached" },
  { id: "d-4", type: "release_packet", domain: "engineering", fresh: true, hitRate: 0.90, genCost: 20, avoidedSpend: 180, age: "30min", expiresIn: "23.5hr", cacheStatus: "cached" },
  { id: "d-5", type: "opportunity_packet", domain: "revenue-business", fresh: true, hitRate: 0.72, genCost: 12, avoidedSpend: 85, age: "3hr", expiresIn: "21hr", cacheStatus: "cached" },
  { id: "d-6", type: "mission_digest", domain: "engineering", fresh: false, hitRate: 0.45, genCost: 22, avoidedSpend: 60, age: "28hr", expiresIn: "expired", cacheStatus: "stale" },
  { id: "d-7", type: "daily_summary", domain: "investment-finance", fresh: true, hitRate: 0.78, genCost: 16, avoidedSpend: 130, age: "5hr", expiresIn: "19hr", cacheStatus: "cached" },
  { id: "d-8", type: "daily_summary", domain: "digital-presence", fresh: false, hitRate: 0.35, genCost: 14, avoidedSpend: 30, age: "26hr", expiresIn: "expired", cacheStatus: "stale" },
];

const SmartDigestCenter = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  const freshCount = mockDigests.filter(d => d.fresh).length;
  const staleCount = mockDigests.filter(d => !d.fresh).length;
  const avgHitRate = Math.round(mockDigests.reduce((s, d) => s + d.hitRate, 0) / mockDigests.length * 100);
  const totalGenCost = mockDigests.reduce((s, d) => s + d.genCost, 0);
  const totalAvoided = mockDigests.reduce((s, d) => s + d.avoidedSpend, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        icon={<FileText className="h-6 w-6" />}
        title="Smart Digest & Precompute Center"
        subtitle="Manage precomputed intelligence — digests, freshness, hit rates, and avoided spend"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Digests", value: String(mockDigests.length) },
          { label: "Fresh", value: String(freshCount), color: "text-emerald-400" },
          { label: "Stale", value: String(staleCount), color: staleCount > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Avg Hit Rate", value: `${avgHitRate}%` },
          { label: "Avoided Spend", value: `$${(totalAvoided / 100).toFixed(0)}`, color: "text-emerald-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color || "text-foreground"}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Digest Library Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Digest Library</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Hit Rate</TableHead>
                <TableHead className="text-xs text-right">Gen Cost</TableHead>
                <TableHead className="text-xs text-right">Avoided Spend</TableHead>
                <TableHead className="text-xs">Age</TableHead>
                <TableHead className="text-xs">Expires In</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDigests.sort((a, b) => b.hitRate - a.hitRate).map(d => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs font-medium text-foreground">{d.type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.domain}</TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={d.hitRate * 100} className="w-12 h-1.5" />
                      <span className={d.hitRate >= 0.7 ? "text-emerald-400" : d.hitRate >= 0.5 ? "text-foreground" : "text-amber-400"}>{(d.hitRate * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">${(d.genCost / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">${(d.avoidedSpend / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{d.age}</TableCell>
                  <TableCell className="text-[10px]"><span className={d.expiresIn === "expired" ? "text-rose-400" : "text-muted-foreground"}>{d.expiresIn}</span></TableCell>
                  <TableCell><Badge variant={d.fresh ? "secondary" : "destructive"} className="text-[9px]">{d.cacheStatus}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stale Warnings */}
      {staleCount > 0 && (
        <Card className="bg-card/80 border-amber-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Stale Digest Warnings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mockDigests.filter(d => !d.fresh).map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5">
                <div>
                  <p className="text-xs font-medium text-foreground">{d.type.replace(/_/g, " ")} — {d.domain}</p>
                  <p className="text-[10px] text-muted-foreground">Age: {d.age} · Hit rate dropped to {(d.hitRate * 100).toFixed(0)}%</p>
                </div>
                <Badge variant="outline" className="text-[9px] text-amber-400">recompute</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Avoided Spend Cards */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Avoided Interactive Spend by Type</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(
              mockDigests.reduce<Record<string, { avoided: number; genCost: number; count: number }>>((acc, d) => {
                if (!acc[d.type]) acc[d.type] = { avoided: 0, genCost: 0, count: 0 };
                acc[d.type].avoided += d.avoidedSpend;
                acc[d.type].genCost += d.genCost;
                acc[d.type].count++;
                return acc;
              }, {})
            ).sort(([, a], [, b]) => b.avoided - a.avoided).map(([type, data]) => (
              <div key={type} className="p-3 rounded-lg bg-secondary/20 text-center space-y-1">
                <p className="text-lg font-bold text-emerald-400">${(data.avoided / 100).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">{type.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground/60">{data.count} digests · ${(data.genCost / 100).toFixed(2)} gen cost</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartDigestCenter;
