import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { ShieldCheck, Heart, AlertTriangle, TrendingUp, TrendingDown, Clock, Star, MessageSquare, BarChart3, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const ALERTS: any[] = [];

const ti = (t: string) => t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="text-muted-foreground">—</span>;

const SENTIMENT_TREND: any[] = [];

const TrustPulse = () => {
  const [tab, setTab] = useState("dimensions");
  const avg = Math.round(([] as any[]).reduce((a, c) => a + c.score, 0) / ([] as any[]).length);
  const dimAvg = Math.round(([] as any[]).reduce((a, d) => a + d.score, 0) / ([] as any[]).length);
  const latestSentiment = SENTIMENT_TREND[([] as any[]).length - 1];

  return (
    <div className="space-y-6 p-6">
<SitaPageHeader icon={<ShieldCheck className="h-5 w-5" />} title="Trust & Reputation Pulse" subtitle="Multi-dimensional trust health — reviews, responsiveness, delivery, satisfaction, proof" />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Avg Client Trust", v: `${avg}/100`, c: avg >= 70 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400" },
          { l: "Trust Dimensions", v: `${dimAvg}/100`, c: "text-primary" },
          { l: "Strong Clients", v: ([] as any[]).filter(c => c.score >= 80).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "At Risk", v: ([] as any[]).filter(c => c.score < 50).length, c: "text-destructive" },
          { l: "Sentiment", v: `${latestSentiment.positive}%+`, c: "text-[hsl(var(--trust-safe))]" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dimensions"><Activity className="h-3.5 w-3.5 mr-1" />Trust Dimensions</TabsTrigger>
          <TabsTrigger value="clients"><Heart className="h-3.5 w-3.5 mr-1" />Client Board</TabsTrigger>
          <TabsTrigger value="sentiment"><BarChart3 className="h-3.5 w-3.5 mr-1" />Sentiment Trend</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Alerts</TabsTrigger>
        </TabsList>

        {/* Trust Dimensions */}
        <TabsContent value="dimensions" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Multi-Axis Trust Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([] as any[]).map(dim => (
                <div key={dim.dimension}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{dim.dimension}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${parseInt(dim.trend) > 0 ? "text-[hsl(var(--trust-safe))]" : parseInt(dim.trend) < 0 ? "text-destructive" : "text-muted-foreground"}`}>{parseInt(dim.trend) > 0 ? "+" : ""}{dim.trend}</span>
                      <span className="text-sm font-bold">{dim.score}</span>
                    </div>
                  </div>
                  <Progress value={dim.score} className="h-2 mb-1" />
                  <p className="text-[10px] text-muted-foreground">{dim.evidence}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Radar-like summary */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Trust Health Summary</h3>
              <div className="grid grid-cols-5 gap-2">
                {([] as any[]).map(dim => (
                  <div key={dim.dimension} className="text-center">
                    <div className="relative w-14 h-14 mx-auto">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.91" fill="none" className="stroke-muted/20" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="15.91" fill="none" className={dim.score >= 85 ? "stroke-[hsl(var(--trust-safe))]" : dim.score >= 70 ? "stroke-primary" : "stroke-orange-400"} strokeWidth="2.5" strokeDasharray={`${dim.score} ${100 - dim.score}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{dim.score}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{dim.dimension.split(" ")[0]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Board */}
        <TabsContent value="clients" className="space-y-2 mt-4">
          {([] as any[]).sort((a, b) => a.score - b.score).map(c => (
            <div key={c.client} className={`rounded-xl border p-4 ${c.score < 50 ? "border-destructive/30 bg-destructive/5" : "border-border/40 bg-card"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">{c.client}</span>{ti(c.trend)}</div>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-0.5" />{c.lastContact}</span><Badge variant={c.score >= 80 ? "default" : c.score >= 50 ? "outline" : "destructive"}>{c.score}</Badge></div>
              </div>
              <Progress value={c.score} className="h-1.5 mb-2" />
              <div className="flex gap-4 text-[10px]"><span>Resp: {c.signals.resp}%</span><span>Pay: {c.signals.pay}%</span><span>Engage: {c.signals.engage}%</span><span>Sat: {c.signals.sat}%</span></div>
              {c.risks.length > 0 && <div className="flex gap-1 mt-2">{c.risks.map(r => <Badge key={r} variant="outline" className="text-[10px] text-destructive">{r}</Badge>)}</div>}
              {c.opps.length > 0 && <div className="flex gap-1 mt-1">{c.opps.map(o => <Badge key={o} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">{o}</Badge>)}</div>}
            </div>
          ))}
        </TabsContent>

        {/* Sentiment Trend */}
        <TabsContent value="sentiment" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Client Sentiment Over Time</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([] as any[]).map((s, i) => (
                <div key={s.month}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground w-10">{s.month}</span>
                    <div className="flex gap-3">
                      <span className="text-[hsl(var(--trust-safe))]">{s.positive}% positive</span>
                      <span className="text-muted-foreground">{s.neutral}% neutral</span>
                      <span className="text-destructive">{s.negative}% negative</span>
                    </div>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-[hsl(var(--trust-safe))]/60 transition-all" style={{ width: `${s.positive}%` }} />
                    <div className="bg-muted/40 transition-all" style={{ width: `${s.neutral}%` }} />
                    <div className="bg-destructive/40 transition-all" style={{ width: `${s.negative}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--trust-safe))]/60" /> Positive</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted/40" /> Neutral</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive/40" /> Negative</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-2 mt-4">
          {([] as any[]).map((a, i) => (
            <div key={i} className={`rounded-xl border p-4 ${a.severity === "critical" ? "border-destructive/30 bg-destructive/5" : a.severity === "positive" ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-border/40 bg-card"}`}>
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-semibold">{a.client}</span><Badge variant={a.severity === "critical" ? "destructive" : a.severity === "positive" ? "default" : "outline"}>{a.severity}</Badge></div>
              <p className="text-xs text-muted-foreground mb-2">{a.msg}</p>
              <p className="text-xs text-primary">→ {a.action}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default TrustPulse;
