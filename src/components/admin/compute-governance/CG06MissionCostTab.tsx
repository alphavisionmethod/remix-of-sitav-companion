import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tierColors } from "./shared";
import type { ComputeModelTier } from "@/lib/compute-governance";

interface MockMission {
  id: string;
  name: string;
  domain: string;
  agents: string[];
  tiersUsed: ComputeModelTier[];
  estimatedCost: number;
  actualCost: number;
  verificationCost: number;
  retries: number;
  retryCost: number;
  cacheSavings: number;
  compressionSavings: number;
  outcome: "high-value" | "standard" | "low-value" | "waste";
  valueScore: number;
  status: "completed" | "active" | "failed";
  duration: string;
}

const mockMissions: MockMission[] = [
  { id: "m1", name: "Q2 Tax Optimization Strategy", domain: "finance-os", agents: ["Finance Advisor", "Strategy Synthesizer"], tiersUsed: ["standard", "premium"], estimatedCost: 800, actualCost: 620, verificationCost: 45, retries: 1, retryCost: 12, cacheSavings: 180, compressionSavings: 90, outcome: "high-value", valueScore: 92, status: "completed", duration: "2h 14m" },
  { id: "m2", name: "Portfolio Rebalance Analysis", domain: "finance-os", agents: ["Finance Advisor"], tiersUsed: ["standard"], estimatedCost: 300, actualCost: 280, verificationCost: 20, retries: 0, retryCost: 0, cacheSavings: 65, compressionSavings: 30, outcome: "standard", valueScore: 68, status: "completed", duration: "45m" },
  { id: "m3", name: "Website SEO Audit", domain: "business-os", agents: ["Growth Agent", "Content Advisor"], tiersUsed: ["utility", "standard"], estimatedCost: 400, actualCost: 520, verificationCost: 35, retries: 4, retryCost: 120, cacheSavings: 20, compressionSavings: 15, outcome: "low-value", valueScore: 28, status: "completed", duration: "1h 50m" },
  { id: "m4", name: "Runaway Monitor Loop", domain: "admin", agents: ["Self-Healing Agent"], tiersUsed: ["utility"], estimatedCost: 50, actualCost: 340, verificationCost: 10, retries: 12, retryCost: 280, cacheSavings: 0, compressionSavings: 0, outcome: "waste", valueScore: 5, status: "failed", duration: "38m" },
  { id: "m5", name: "Customer Churn Prediction", domain: "business-os", agents: ["Strategy Synthesizer", "Finance Advisor"], tiersUsed: ["premium", "exceptional"], estimatedCost: 1200, actualCost: 980, verificationCost: 60, retries: 0, retryCost: 0, cacheSavings: 320, compressionSavings: 140, outcome: "high-value", valueScore: 95, status: "active", duration: "ongoing" },
];

const outcomeColors = { "high-value": "text-emerald-400 bg-emerald-500/10", standard: "text-blue-400 bg-blue-500/10", "low-value": "text-amber-400 bg-amber-500/10", waste: "text-rose-400 bg-rose-500/10" };

export const CG06MissionCostTab = () => {
  const totalCost = mockMissions.reduce((s, m) => s + m.actualCost, 0);
  const totalSaved = mockMissions.reduce((s, m) => s + m.cacheSavings + m.compressionSavings, 0);
  const avgValue = Math.round(mockMissions.reduce((s, m) => s + m.valueScore, 0) / mockMissions.length);
  const wasteCount = mockMissions.filter(m => m.outcome === "waste").length;
  const lowValue = mockMissions.filter(m => m.outcome === "low-value").length;

  const recommendations: string[] = [];
  if (wasteCount > 0) recommendations.push(`${wasteCount} waste mission(s) — review agent autonomy and retry limits`);
  if (lowValue > 0) recommendations.push(`${lowValue} low-value mission(s) with high cost — consider routing policy tightening`);
  const retryHeavy = mockMissions.filter(m => m.retries > 3);
  if (retryHeavy.length > 0) recommendations.push(`${retryHeavy.length} mission(s) with excessive retries — check provider health`);

  return (
    <div className="space-y-4">
      {/* Summary Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Mission Cost", value: `$${(totalCost / 100).toFixed(2)}`, icon: BarChart3 },
          { label: "Efficiency Savings", value: `$${(totalSaved / 100).toFixed(2)}`, icon: TrendingDown },
          { label: "Avg Value Score", value: `${avgValue}/100`, icon: TrendingUp },
          { label: "Waste Missions", value: String(wasteCount), icon: AlertTriangle },
          { label: "Active Missions", value: String(mockMissions.filter(m => m.status === "active").length), icon: Target },
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
              {mockMissions.map(m => (
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
                    <div className="flex gap-1">{m.tiersUsed.map(t => <Badge key={t} className={`${tierColors[t]} text-[9px]`} variant="secondary">{t}</Badge>)}</div>
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
