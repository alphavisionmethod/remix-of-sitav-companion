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

const mockPackets = [
  { domain: "admin-ops", tokenCount: 1200, compressionRatio: 0.12, fresh: true, changes: 3, risks: 1, constraints: 2, priorRecs: 4, unresolved: 1, confidence: 82, compiledAgo: "15min", compileCost: 8, compileLatency: 240, qualityScore: 85 },
  { domain: "engineering", tokenCount: 1800, compressionRatio: 0.15, fresh: true, changes: 5, risks: 2, constraints: 3, priorRecs: 6, unresolved: 2, confidence: 76, compiledAgo: "8min", compileCost: 12, compileLatency: 380, qualityScore: 78 },
  { domain: "revenue-business", tokenCount: 1400, compressionRatio: 0.11, fresh: true, changes: 2, risks: 0, constraints: 1, priorRecs: 5, unresolved: 0, confidence: 89, compiledAgo: "22min", compileCost: 9, compileLatency: 290, qualityScore: 88 },
  { domain: "digital-presence", tokenCount: 2100, compressionRatio: 0.18, fresh: false, changes: 8, risks: 3, constraints: 2, priorRecs: 3, unresolved: 4, confidence: 58, compiledAgo: "2hr", compileCost: 15, compileLatency: 520, qualityScore: 62 },
  { domain: "investment-finance", tokenCount: 1600, compressionRatio: 0.14, fresh: true, changes: 4, risks: 1, constraints: 4, priorRecs: 7, unresolved: 1, confidence: 84, compiledAgo: "12min", compileCost: 10, compileLatency: 340, qualityScore: 86 },
  { domain: "concierge-household", tokenCount: 900, compressionRatio: 0.08, fresh: true, changes: 1, risks: 0, constraints: 0, priorRecs: 2, unresolved: 0, confidence: 94, compiledAgo: "45min", compileCost: 5, compileLatency: 150, qualityScore: 92 },
  { domain: "connectors-integrations", tokenCount: 1100, compressionRatio: 0.10, fresh: true, changes: 2, risks: 1, constraints: 1, priorRecs: 3, unresolved: 1, confidence: 80, compiledAgo: "30min", compileCost: 7, compileLatency: 210, qualityScore: 82 },
  { domain: "launch-deployment", tokenCount: 1500, compressionRatio: 0.13, fresh: true, changes: 3, risks: 2, constraints: 2, priorRecs: 4, unresolved: 2, confidence: 72, compiledAgo: "18min", compileCost: 11, compileLatency: 360, qualityScore: 74 },
  { domain: "compliance-trust", tokenCount: 1300, compressionRatio: 0.12, fresh: true, changes: 0, risks: 0, constraints: 5, priorRecs: 3, unresolved: 0, confidence: 96, compiledAgo: "1hr", compileCost: 8, compileLatency: 260, qualityScore: 94 },
];

const IntelligencePacketInspector = () => {
  const { isAdmin, loading } = useRequireAdmin();
  const [selected, setSelected] = useState<string | null>(null);
  if (loading || !isAdmin) return null;

  const avgCompression = mockPackets.reduce((s, p) => s + p.compressionRatio, 0) / mockPackets.length;
  const avgTokens = Math.round(mockPackets.reduce((s, p) => s + p.tokenCount, 0) / mockPackets.length);
  const freshCount = mockPackets.filter(p => p.fresh).length;
  const totalCompileCost = mockPackets.reduce((s, p) => s + p.compileCost, 0);
  const selectedPacket = mockPackets.find(p => p.domain === selected);

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
          { label: "Fresh Packets", value: `${freshCount}/${mockPackets.length}`, sub: "ready to use" },
          { label: "Total Compile Cost", value: `$${(totalCompileCost / 100).toFixed(2)}`, sub: "this cycle" },
          { label: "Est. Daily Savings", value: `$${((mockPackets.reduce((s, p) => s + (12000 - p.tokenCount), 0) * 0.003) / 100).toFixed(0)}`, sub: "from packet-driven" },
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
              {mockPackets.map(p => (
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
          {mockPackets.map(p => (
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
