import { motion } from "framer-motion";
import { Heart, AlertTriangle, TrendingDown, RefreshCw, Gift, Users, ArrowRight, BarChart3, Target, ThumbsUp, ThumbsDown, Minus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
import { Typography } from "@/components/sita/Typography";
export default function RetentionOffice() {
  const [tab, setTab] = useState("overview");

  return (
    <PageShell width="wide" className="space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Typography role="appTitle" className="flex items-center gap-2"><Heart className="w-6 h-6 text-pink-400" /> Retention Office</Typography>
        <p className="text-sm text-muted-foreground">Churn prediction, NPS tracking, re-engagement workflows, and engagement health</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Retention Rate", v: "91%", c: "text-[hsl(var(--trust-safe))]" },
          { l: "NPS Score", v: NPS_DATA.current, c: "text-primary" },
          { l: "Churn Risk Clients", v: ([] as any[]).length, c: "text-orange-400" },
          { l: "Revenue at Risk", v: "$18,500", c: "text-destructive" },
          { l: "Win-Back Pipeline", v: ([] as any[]).length, c: "text-purple-400" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><Heart className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="churn"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Churn Prediction</TabsTrigger>
          <TabsTrigger value="nps"><BarChart3 className="h-3.5 w-3.5 mr-1" />NPS Dashboard</TabsTrigger>
          <TabsTrigger value="winback"><RefreshCw className="h-3.5 w-3.5 mr-1" />Win-Back</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Health Segments */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Customer Health Segments</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-1 h-8 rounded-full overflow-hidden mb-4">
                {([] as any[]).map(s => <div key={s.label} className={`${s.color} transition-all`} style={{ width: `${s.pct}%` }} />)}
              </div>
              <div className="flex gap-6">
                {([] as any[]).map(s => (
                  <div key={s.label} className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}: {s.count}</span></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At Risk */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> At-Risk Clients</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as any[]).map(c => (
                <div key={c.name} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div><p className="text-sm font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.company} · LTV {c.ltv}</p></div>
                    <span className="text-xs text-muted-foreground">Last: {c.lastActive}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">{c.signals.map(s => <Badge key={s} variant="destructive" className="text-xs">{s}</Badge>)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Prediction */}
        <TabsContent value="churn" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-orange-400" /> Churn Prediction Model</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as any[]).map((pred, i) => (
                <div key={i} className={`p-4 rounded-xl border ${pred.probability >= 60 ? "border-destructive/30 bg-destructive/5" : pred.probability >= 40 ? "border-orange-400/30 bg-orange-400/5" : "border-border/40 bg-card"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{pred.client}</p>
                      <p className="text-xs text-muted-foreground">LTV: {pred.ltv}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${pred.probability >= 60 ? "text-destructive" : pred.probability >= 40 ? "text-orange-400" : "text-yellow-400"}`}>{pred.probability}%</p>
                      <p className="text-[10px] text-muted-foreground">churn probability</p>
                    </div>
                  </div>
                  <Progress value={pred.probability} className="h-2 mb-2" />
                  <div className="flex gap-1 flex-wrap mb-2">
                    {pred.signals.map(s => <Badge key={s} variant="outline" className="text-[10px] text-orange-400">{s}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-primary flex items-center gap-1"><ArrowRight className="h-3 w-3" />{pred.action}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                        <AlertTriangle className="h-3 w-3" />Execute
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1 text-primary border-primary/30">
                        <RefreshCw className="h-3 w-3" />Launch Retention Automation
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NPS Dashboard */}
        <TabsContent value="nps" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Current NPS</p>
                <p className="text-4xl font-bold text-primary mt-1">{NPS_DATA.current}</p>
                <p className="text-xs text-[hsl(var(--trust-safe))]">{NPS_DATA.trend} vs last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Previous NPS</p>
                <p className="text-4xl font-bold text-muted-foreground mt-1">{NPS_DATA.previous}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Responses</p>
                <p className="text-4xl font-bold text-foreground mt-1">{NPS_DATA.distribution.reduce((a, d) => a + d.count, 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Score Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {NPS_DATA.distribution.map(d => (
                <div key={d.range}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      {d.range.includes("Promoters") ? <ThumbsUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : d.range.includes("Detractors") ? <ThumbsDown className="h-3.5 w-3.5 text-destructive" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="font-medium text-foreground">{d.range}</span>
                    </div>
                    <span className="text-muted-foreground">{d.count} ({d.pct}%)</span>
                  </div>
                  <Progress value={d.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Responses */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Responses</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {NPS_DATA.recentResponses.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border ${r.score >= 9 ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : r.score <= 6 ? "border-destructive/30 bg-destructive/5" : "border-border/40 bg-card"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                    <Badge variant={r.score >= 9 ? "default" : r.score <= 6 ? "destructive" : "outline"}>{r.score}/10</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">"{r.comment}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Win-Back */}
        <TabsContent value="winback" className="space-y-3 mt-4">
          {([] as any[]).map(c => (
            <Card key={c.name} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-sm font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">Churned {c.churned} · LTV {c.ltv}</p></div>
                  <Button variant="ghost" size="sm" className="text-xs">Start Campaign</Button>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Reason:</strong> {c.reason}</p>
                <p className="text-xs text-primary mt-1"><strong>Strategy:</strong> {c.strategy}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
