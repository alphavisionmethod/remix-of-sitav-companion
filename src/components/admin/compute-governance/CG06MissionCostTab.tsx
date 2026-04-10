import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tierColors } from "./shared";
import type { ComputeModelTier } from "@/lib/compute-governance";
import { useMissionCostData } from "@/hooks/use-compute-governance";

export const CG06MissionCostTab = () => {
  const { data: missions = [], isLoading } = useMissionCostData();

  const totalCost = missions.reduce((s, m) => s + m.actualCost, 0);
  const totalSaved = missions.reduce((s, m) => s + m.cacheSavings + m.compressionSavings, 0);
  const avgValue = missions.length > 0 ? Math.round(missions.reduce((s, m) => s + m.valueScore, 0) / missions.length) : 0;
  const wasteCount = missions.filter(m => m.outcome === "waste").length;
  const lowValue = missions.filter(m => m.outcome === "low-value").length;

  const recommendations: string[] = [];
  if (wasteCount > 0) recommendations.push(`${wasteCount} waste mission(s) — review agent autonomy and retry limits`);
  if (lowValue > 0) recommendations.push(`${lowValue} low-value mission(s) with high cost — consider routing policy tightening`);
  const retryHeavy = missions.filter(m => m.retries > 3);
  if (retryHeavy.length > 0) recommendations.push(`${retryHeavy.length} mission(s) with excessive retries — check provider health`);

  const outcomeColors = { "high-value": "text-emerald-400 bg-emerald-500/10", standard: "text-blue-400 bg-blue-500/10", "low-value": "text-amber-400 bg-amber-500/10", waste: "text-rose-400 bg-rose-500/10" };

  return (
    <div className="space-y-4">
      {/* Summary Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Mission Cost", value: `$${(totalCost / 100).toFixed(2)}`, icon: BarChart3 },
          { label: "Efficiency Savings", value: `$${(totalSaved / 100).toFixed(2)}`, icon: TrendingDown },
          { label: "Avg Value Score", value: `${avgValue}/100`, icon: TrendingUp },
          { label: "Waste Missions", value: String(wasteCount), icon: AlertTriangle },
          { label: "Active Missions", value: String(missions.filter(m => m.status === "active").length), icon: Target },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Cost Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Mission Cost Breakdown</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading mission data…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Mission</TableHead>
                  <TableHead className="text-xs">Domain</TableHead>
                  <TableHead className="text-xs">Agents</TableHead>
                  <TableHead className="text-xs">Tiers</TableHead>
                  <TableHead className="text-xs text-right">Est.</TableHead>
                  <TableHead className="text-xs text-right">Actual</TableHead>
                  <TableHead className="text-xs text-right">Retries</TableHead>
                  <TableHead className="text-xs text-right">Saved</TableHead>
                  <TableHead className="text-xs">Outcome</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs font-medium">
                      <div>
                        <p className="text-foreground">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.duration} · {m.status}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{m.domain}</Badge></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{m.agents.join(", ")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">{m.tiersUsed.map(t => <Badge key={t} className={`${tierColors[t as ComputeModelTier] || "text-muted-foreground"} text-[9px]`} variant="secondary">{t}</Badge>)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-muted-foreground">${(m.estimatedCost / 100).toFixed(2)}</TableCell>
                    <TableCell className={`text-xs text-right font-mono ${m.actualCost > m.estimatedCost ? "text-rose-400" : "text-foreground"}`}>
                      ${(m.actualCost / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-xs text-right ${m.retries > 3 ? "text-rose-400" : "text-muted-foreground"}`}>
                      {m.retries} {m.retryCost > 0 && <span className="text-[10px]">(${(m.retryCost / 100).toFixed(2)})</span>}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-400">
                      ${((m.cacheSavings + m.compressionSavings) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${outcomeColors[m.outcome]} text-[9px]`} variant="secondary">{m.outcome}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={m.valueScore >= 70 ? "text-emerald-400" : m.valueScore >= 40 ? "text-amber-400" : "text-rose-400"}>
                        {m.valueScore}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Optimization Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 text-xs text-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                {r}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
