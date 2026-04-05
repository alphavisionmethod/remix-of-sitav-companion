import { useState } from "react";
import {
  Gauge, TrendingUp, TrendingDown, Activity, AlertTriangle,
  Award, RefreshCw, Target, Brain, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

const mockAgents = [
  { id: "a-1", name: "Finance Advisor", composite: 82, quality: 88, costEff: 76, acceptance: 0.92, override: 0.08, falsePositive: 0.03, verification: 0.95, reuse: 0.45, downstream: 78, trend: "improving" },
  { id: "a-2", name: "Self-Healing Agent", composite: 91, quality: 90, costEff: 95, acceptance: 0.95, override: 0.05, falsePositive: 0.02, verification: 0.98, reuse: 0.62, downstream: 88, trend: "improving" },
  { id: "a-3", name: "Strategy Synthesizer", composite: 71, quality: 85, costEff: 52, acceptance: 0.78, override: 0.22, falsePositive: 0.08, verification: 0.82, reuse: 0.28, downstream: 65, trend: "degrading" },
  { id: "a-4", name: "Growth Agent", composite: 74, quality: 80, costEff: 68, acceptance: 0.85, override: 0.15, falsePositive: 0.05, verification: 0.88, reuse: 0.35, downstream: 72, trend: "stable" },
  { id: "a-5", name: "Monitor Agent", composite: 93, quality: 92, costEff: 96, acceptance: 0.98, override: 0.02, falsePositive: 0.01, verification: 0.99, reuse: 0.72, downstream: 90, trend: "improving" },
  { id: "a-6", name: "Design Agent", composite: 77, quality: 83, costEff: 71, acceptance: 0.82, override: 0.18, falsePositive: 0.06, verification: 0.86, reuse: 0.40, downstream: 74, trend: "stable" },
];

const mockWorkflows = [
  { id: "w-1", name: "Incident Response", composite: 88, quality: 92, costEff: 84, acceptance: 0.96, override: 0.04, reuse: 0.58, trend: "improving" },
  { id: "w-2", name: "Release Approval", composite: 82, quality: 86, costEff: 78, acceptance: 0.90, override: 0.10, reuse: 0.42, trend: "stable" },
  { id: "w-3", name: "Lead Qualification", composite: 76, quality: 80, costEff: 72, acceptance: 0.85, override: 0.15, reuse: 0.35, trend: "stable" },
  { id: "w-4", name: "Portfolio Rebalance", composite: 69, quality: 75, costEff: 63, acceptance: 0.78, override: 0.22, reuse: 0.30, trend: "degrading" },
];

const mockPaths = [
  { label: "root-cause → fix-plan", composite: 90, cost: 45, quality: 94, acceptance: 0.96, reuse: 0.65 },
  { label: "fingerprint → self-heal", composite: 92, cost: 20, quality: 96, acceptance: 0.98, reuse: 0.78 },
  { label: "thesis → trade-memo", composite: 72, cost: 120, quality: 82, acceptance: 0.80, reuse: 0.25 },
  { label: "diagnostic → recommendation", composite: 78, cost: 80, quality: 84, acceptance: 0.85, reuse: 0.38 },
  { label: "strategy → synthesis", composite: 68, cost: 150, quality: 80, acceptance: 0.75, reuse: 0.20 },
];

const trendIcons = { improving: TrendingUp, stable: Activity, degrading: TrendingDown };
const trendColors = { improving: "text-emerald-400", stable: "text-muted-foreground", degrading: "text-rose-400" };

const ScoreCell = ({ v, threshold = 80 }: { v: number; threshold?: number }) => (
  <span className={v >= threshold ? "text-emerald-400" : v >= 60 ? "text-foreground" : "text-rose-400"}>{v}</span>
);

const AIEfficiencyScoreboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  const [view, setView] = useState("agents");
  if (loading || !isAdmin) return null;

  const topAgent = mockAgents.sort((a, b) => b.composite - a.composite)[0];
  const avgComposite = Math.round(mockAgents.reduce((s, a) => s + a.composite, 0) / mockAgents.length);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader
        icon={<Gauge className="h-6 w-6" />}
        title="AI Efficiency Scoreboard"
        subtitle="Compare agents, workflows, and reasoning paths on quality-per-dollar"
      >
        <Badge variant="secondary" className="gap-1"><Award className="h-3 w-3" /> Top: {topAgent.name} ({topAgent.composite})</Badge>
      </SitaPageHeader>

      {/* Composite Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockAgents.sort((a, b) => b.composite - a.composite).map(a => {
          const TrendIcon = trendIcons[a.trend as keyof typeof trendIcons] || Activity;
          return (
            <Card key={a.id} className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <TrendIcon className={`h-3 w-3 ${trendColors[a.trend as keyof typeof trendColors]}`} />
                </div>
                <p className={`text-2xl font-bold ${a.composite >= 80 ? "text-emerald-400" : a.composite >= 60 ? "text-foreground" : "text-rose-400"}`}>{a.composite}</p>
                <p className="text-[10px] text-muted-foreground truncate">{a.name}</p>
                <Progress value={a.composite} className="h-1" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="bg-secondary/50 h-auto p-1">
          <TabsTrigger value="agents" className="text-xs">By Agent</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs">By Workflow</TabsTrigger>
          <TabsTrigger value="paths" className="text-xs">By Reasoning Path</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Agent</TableHead>
                    <TableHead className="text-xs text-right">Composite</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                    <TableHead className="text-xs text-right">Cost Eff.</TableHead>
                    <TableHead className="text-xs text-right">Acceptance</TableHead>
                    <TableHead className="text-xs text-right">Override</TableHead>
                    <TableHead className="text-xs text-right">False Pos.</TableHead>
                    <TableHead className="text-xs text-right">Verification</TableHead>
                    <TableHead className="text-xs text-right">Reuse</TableHead>
                    <TableHead className="text-xs text-right">Downstream</TableHead>
                    <TableHead className="text-xs">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAgents.sort((a, b) => b.composite - a.composite).map(a => {
                    const TrendIcon = trendIcons[a.trend as keyof typeof trendIcons] || Activity;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-medium text-foreground">{a.name}</TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={a.composite} /></TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={a.quality} /></TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={a.costEff} /></TableCell>
                        <TableCell className="text-xs text-right">{(a.acceptance * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right"><span className={a.override > 0.15 ? "text-amber-400" : "text-foreground"}>{(a.override * 100).toFixed(0)}%</span></TableCell>
                        <TableCell className="text-xs text-right"><span className={a.falsePositive > 0.05 ? "text-amber-400" : "text-foreground"}>{(a.falsePositive * 100).toFixed(1)}%</span></TableCell>
                        <TableCell className="text-xs text-right">{(a.verification * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right">{(a.reuse * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={a.downstream} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendIcon className={`h-3 w-3 ${trendColors[a.trend as keyof typeof trendColors]}`} />
                            <span className={`text-[10px] ${trendColors[a.trend as keyof typeof trendColors]}`}>{a.trend}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Workflow</TableHead>
                    <TableHead className="text-xs text-right">Composite</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                    <TableHead className="text-xs text-right">Cost Eff.</TableHead>
                    <TableHead className="text-xs text-right">Acceptance</TableHead>
                    <TableHead className="text-xs text-right">Override</TableHead>
                    <TableHead className="text-xs text-right">Reuse</TableHead>
                    <TableHead className="text-xs">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkflows.sort((a, b) => b.composite - a.composite).map(w => {
                    const TrendIcon = trendIcons[w.trend as keyof typeof trendIcons] || Activity;
                    return (
                      <TableRow key={w.id}>
                        <TableCell className="text-xs font-medium text-foreground">{w.name}</TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={w.composite} /></TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={w.quality} /></TableCell>
                        <TableCell className="text-xs text-right"><ScoreCell v={w.costEff} /></TableCell>
                        <TableCell className="text-xs text-right">{(w.acceptance * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right">{(w.override * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right">{(w.reuse * 100).toFixed(0)}%</TableCell>
                        <TableCell><TrendIcon className={`h-3 w-3 ${trendColors[w.trend as keyof typeof trendColors]}`} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Reasoning Path</TableHead>
                    <TableHead className="text-xs text-right">Composite</TableHead>
                    <TableHead className="text-xs text-right">Avg Cost ¢</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                    <TableHead className="text-xs text-right">Acceptance</TableHead>
                    <TableHead className="text-xs text-right">Reuse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPaths.sort((a, b) => b.composite - a.composite).map(p => (
                    <TableRow key={p.label}>
                      <TableCell className="text-xs font-medium text-foreground font-mono">{p.label}</TableCell>
                      <TableCell className="text-xs text-right"><ScoreCell v={p.composite} /></TableCell>
                      <TableCell className="text-xs text-right font-mono">{p.cost}¢</TableCell>
                      <TableCell className="text-xs text-right"><ScoreCell v={p.quality} /></TableCell>
                      <TableCell className="text-xs text-right">{(p.acceptance * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-xs text-right">{(p.reuse * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Efficiency Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {mockAgents.filter(a => a.composite < 80).map(a => (
            <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-foreground">
                <span className="font-medium">{a.name}</span>:
                {a.override > 0.15 ? " High override rate — review prompt quality." : ""}
                {a.reuse < 0.3 ? " Low intelligence reuse — expand asset library." : ""}
                {a.costEff < 60 ? " Poor cost efficiency — consider model tier adjustment." : ""}
                {a.falsePositive > 0.05 ? " Elevated false positive rate — tune thresholds." : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIEfficiencyScoreboard;
