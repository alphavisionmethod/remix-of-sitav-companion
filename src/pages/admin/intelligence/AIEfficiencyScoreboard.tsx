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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_INTEL_AGENTS as DEMO_AGENTS, DEMO_PATHS, DEMO_WORKFLOWS } from "@/lib/demo-data/admin-intelligence";

const trendIcons = { improving: TrendingUp, stable: Activity, degrading: TrendingDown };
const trendColors = { improving: "text-emerald-400", stable: "text-muted-foreground", degrading: "text-rose-400" };

const ScoreCell = ({ v, threshold = 80 }: { v: number; threshold?: number }) => (
  <span className={v >= threshold ? "text-emerald-400" : v >= 60 ? "text-foreground" : "text-rose-400"}>{v}</span>
);

const AIEfficiencyScoreboard = () => {
  const { isAdmin, loading } = useRequireAdmin();
  const [view, setView] = useState("agents");
  if (loading || !isAdmin) return null;

  const topAgent = DEMO_AGENTS.sort((a, b) => b.composite - a.composite)[0];
  const avgComposite = Math.round(DEMO_AGENTS.reduce((s, a) => s + a.composite, 0) / DEMO_AGENTS.length);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        icon={<Gauge className="h-6 w-6" />}
        title="AI Efficiency Scoreboard"
        subtitle="Compare agents, workflows, and reasoning paths on quality-per-dollar"
      >
        <Badge variant="secondary" className="gap-1"><Award className="h-3 w-3" /> Top: {topAgent.name} ({topAgent.composite})</Badge>
      </SitaPageHeader>

      {/* Composite Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {DEMO_AGENTS.sort((a, b) => b.composite - a.composite).map(a => {
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
                  {DEMO_AGENTS.sort((a, b) => b.composite - a.composite).map(a => {
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
                  {DEMO_WORKFLOWS.sort((a, b) => b.composite - a.composite).map(w => {
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
                  {DEMO_PATHS.sort((a, b) => b.composite - a.composite).map(p => (
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
          {DEMO_AGENTS.filter(a => a.composite < 80).map(a => (
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
