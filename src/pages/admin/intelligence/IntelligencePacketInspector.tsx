import { useState } from "react";
import {
  Package, Activity, Layers, AlertTriangle, Clock, CheckCircle,
  Gauge, FileText, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DEMO_INTEL_PACKETS as DEMO_PACKETS } from "@/data/seed/admin-intelligence";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const IntelligencePacketInspector = () => {
  const { isDemoMode } = useDataMode();
  const { isAdmin, loading } = useRequireAdmin();
  const [selected, setSelected] = useState<string | null>(null);
  if (loading || !isAdmin) return null;

  const avgCompression = DEMO_PACKETS.reduce((s, p) => s + p.compressionRatio, 0) / DEMO_PACKETS.length;
  const avgTokens = Math.round(DEMO_PACKETS.reduce((s, p) => s + p.tokenCount, 0) / DEMO_PACKETS.length);
  const freshCount = DEMO_PACKETS.filter(p => p.fresh).length;
  const totalCompileCost = DEMO_PACKETS.reduce((s, p) => s + p.compileCost, 0);
  const selectedPacket = DEMO_PACKETS.find(p => p.domain === selected);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader
        icon={<Package className="h-6 w-6" />}
        title="Intelligence Packet Inspector"
        subtitle="Inspect domain-specific intelligence packets — compression, freshness, and contents"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Avg Packet Size", value: `${avgTokens.toLocaleString()} tok`, sub: "vs ~12k raw" },
          { label: "Avg Compression", value: `${(avgCompression * 100).toFixed(0)}%`, sub: "of original size" },
          { label: "Fresh Packets", value: `${freshCount}/${DEMO_PACKETS.length}`, sub: "ready to use" },
          { label: "Total Compile Cost", value: `$${(totalCompileCost / 100).toFixed(2)}`, sub: "this cycle" },
          { label: "Est. Daily Savings", value: `$${((DEMO_PACKETS.reduce((s, p) => s + (12000 - p.tokenCount), 0) * 0.003) / 100).toFixed(0)}`, sub: "from packet-driven" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Packet Grid */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Domain Packets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Tokens</TableHead>
                <TableHead className="text-xs text-right">Compression</TableHead>
                <TableHead className="text-xs text-right">Changes</TableHead>
                <TableHead className="text-xs text-right">Risks</TableHead>
                <TableHead className="text-xs text-right">Constraints</TableHead>
                <TableHead className="text-xs text-right">Prior Recs</TableHead>
                <TableHead className="text-xs text-right">Unresolved</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs text-right">Quality</TableHead>
                <TableHead className="text-xs text-right">Cost</TableHead>
                <TableHead className="text-xs">Compiled</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_PACKETS.map(p => (
                <TableRow key={p.domain} className="cursor-pointer hover:bg-secondary/30" onClick={() => setSelected(p.domain)}>
                  <TableCell className="text-xs font-medium text-foreground">{p.domain}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{p.tokenCount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right text-emerald-400">{(p.compressionRatio * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-xs text-right">{p.changes}</TableCell>
                  <TableCell className="text-xs text-right">{p.risks > 0 ? <span className="text-amber-400">{p.risks}</span> : "0"}</TableCell>
                  <TableCell className="text-xs text-right">{p.constraints}</TableCell>
                  <TableCell className="text-xs text-right">{p.priorRecs}</TableCell>
                  <TableCell className="text-xs text-right">{p.unresolved > 0 ? <span className="text-amber-400">{p.unresolved}</span> : "0"}</TableCell>
                  <TableCell className="text-xs text-right"><span className={p.confidence >= 80 ? "text-emerald-400" : p.confidence >= 60 ? "text-foreground" : "text-rose-400"}>{p.confidence}%</span></TableCell>
                  <TableCell className="text-xs text-right">{p.qualityScore}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${(p.compileCost / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{p.compiledAgo}</TableCell>
                  <TableCell><Badge variant={p.fresh ? "secondary" : "destructive"} className="text-[9px]">{p.fresh ? "fresh" : "stale"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Compression Effect */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Compression Effectiveness</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {DEMO_PACKETS.map(p => (
            <div key={p.domain} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-[160px] truncate">{p.domain}</span>
              <div className="flex-1 relative h-4 bg-secondary/30 rounded">
                <div className="absolute h-full bg-primary/30 rounded" style={{ width: `${p.compressionRatio * 100 * 5}%` }} />
                <div className="absolute h-full bg-primary rounded" style={{ width: `${p.compressionRatio * 100 * 5}%`, opacity: 0.7 }} />
              </div>
              <span className="text-xs font-mono text-emerald-400 w-[50px] text-right">{(p.compressionRatio * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-muted-foreground w-[60px] text-right">{p.tokenCount} tok</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligencePacketInspector;
