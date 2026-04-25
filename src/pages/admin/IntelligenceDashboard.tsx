import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  Brain, TrendingUp, AlertTriangle, Zap, Target, ArrowUpRight, ArrowDownRight,
  Lightbulb, Shield, Clock, Activity, ChevronRight, Sparkles, BarChart3, RefreshCw
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const SMART_ALERTS = [
  { id: "sa-1", title: "Connector degradation trend detected — Slack sync latency +340% over 4h", severity: "high" as const, confidence: 0.91, source: "anomaly-detector", evidenceCount: 4, timeHorizon: "2–6h", recommendation: "Pre-emptive connector restart and sync queue flush" },
  { id: "sa-2", title: "Approval backlog risk — 12 pending >2h, P95 wait approaching SLO", severity: "medium" as const, confidence: 0.84, source: "slo-monitor", evidenceCount: 3, timeHorizon: "1–3h", recommendation: "Auto-escalate pending approvals older than 90m to backup approvers" },
  { id: "sa-3", title: "Projection lag spike — boardroom read-model 45s behind event stream", severity: "high" as const, confidence: 0.88, source: "projection-monitor", evidenceCount: 5, timeHorizon: "Immediate", recommendation: "Trigger read-model rebuild for boardroom-summary projection" },
  { id: "sa-4", title: "Cost anomaly — AI inference spend 2.3× baseline in last 6h", severity: "medium" as const, confidence: 0.79, source: "cost-monitor", evidenceCount: 2, timeHorizon: "12–24h", recommendation: "Review prompt family pf-concierge-travel for token bloat" },
];

const FORECASTS = [
  { id: "fc-1", title: "Incident forecast: brain-core memory pressure", probability: 0.72, timeHorizon: "4–8h", impact: "Service degradation for advisor responses", prevention: "Scale memory allocation or flush stale caches", trend: "rising" as const, evidenceCount: 6 },
  { id: "fc-2", title: "Fleet node failure: node-pool-3 disk pressure", probability: 0.65, timeHorizon: "12–24h", impact: "Pod eviction affecting concierge workers", prevention: "Pre-emptive node drain and replacement", trend: "rising" as const, evidenceCount: 4 },
  { id: "fc-3", title: "SLO breach risk: approval-service p99 latency", probability: 0.58, timeHorizon: "6–12h", impact: "User-visible delay in approval flow", prevention: "Connection pool tuning and query optimization", trend: "stable" as const, evidenceCount: 3 },
  { id: "fc-4", title: "Connector sync failure: Google Calendar", probability: 0.45, timeHorizon: "24–48h", impact: "Stale calendar data for travel concierge", prevention: "Refresh OAuth token and verify API quota", trend: "declining" as const, evidenceCount: 2 },
  { id: "fc-5", title: "Deployment risk: Ring 1 promotion gate incomplete", probability: 0.81, timeHorizon: "Before next deploy", impact: "Blocked promotion, delayed release", prevention: "Complete smoke verification for 3 remaining services", trend: "rising" as const, evidenceCount: 5 },
  { id: "fc-6", title: "Capacity pressure: event-bus partition saturation", probability: 0.52, timeHorizon: "48–72h", impact: "Event processing delays across all domains", prevention: "Add partitions or increase consumer parallelism", trend: "stable" as const, evidenceCount: 3 },
];

const OPTIMIZATIONS = [
  { id: "opt-1", title: "Policy simplification", description: "3 overlapping approval policies can be merged into 1 with conditional branches — reduces evaluation time by ~40%", impact: "high" as const, effort: "low" as const, confidence: 0.87, domain: "policy-engine" },
  { id: "opt-2", title: "Projection rebuild strategy", description: "Switching boardroom projections to incremental rebuild saves ~85% compute on each refresh cycle", impact: "high" as const, effort: "medium" as const, confidence: 0.82, domain: "projection-service" },
  { id: "opt-3", title: "AI prompt deduplication", description: "pf-business-summary and pf-boardroom-digest share 72% context — merge into single family with output variants", impact: "medium" as const, effort: "low" as const, confidence: 0.91, domain: "ai-gateway" },
  { id: "opt-4", title: "Connector sync batching", description: "Batching Google Workspace syncs into 5-min windows reduces API calls by 60% and improves quota headroom", impact: "medium" as const, effort: "low" as const, confidence: 0.85, domain: "connector-service" },
];

const STRATEGIC_INSIGHTS = [
  { id: "str-1", title: "Platform adoption momentum", summary: "Active operator sessions up 23% week-over-week. Concierge usage driving engagement.", confidence: 0.88, trend: "rising" as const, timeToValue: "Immediate", precedent: "Similar growth pattern preceded 40% retention lift in Q2 2025" },
  { id: "str-2", title: "Governance maturity gap", summary: "Approval chain coverage at 67% — below 80% threshold for enterprise customers. Priority gap in financial domain.", confidence: 0.82, trend: "stable" as const, timeToValue: "2–4 weeks", precedent: "Enterprise pilots require >80% approval coverage for sign-off" },
  { id: "str-3", title: "AI cost trajectory", summary: "Current spend trajectory will exceed monthly budget by day 22. Primarily driven by premium model usage in non-critical paths.", confidence: 0.76, trend: "rising" as const, timeToValue: "10–12 days", precedent: "Last month's mid-cycle intervention saved $1,200" },
];

const sevColor = { high: "text-red-500 bg-red-500/10 border-red-500/20", medium: "text-amber-500 bg-amber-500/10 border-amber-500/20", low: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
const impactColor = { high: "text-red-500", medium: "text-amber-500", low: "text-blue-500" };
const trendIcon = { rising: ArrowUpRight, stable: Activity, declining: ArrowDownRight };
const trendColor = { rising: "text-red-500", stable: "text-amber-500", declining: "text-emerald-500" };

const IntelligenceDashboard = () => {
  const [tab, setTab] = useState("alerts");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Intelligence Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Predictive analytics, smart alerts, optimization, and strategic intelligence</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      {/* KPI row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Smart Alerts", value: SMART_ALERTS.length, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Active Forecasts", value: FORECASTS.length, icon: TrendingUp, color: "text-primary" },
          { label: "Optimizations", value: OPTIMIZATIONS.length, icon: Zap, color: "text-emerald-500" },
          { label: "Avg Confidence", value: "82%", icon: Target, color: "text-blue-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="alerts"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Smart Alerts</TabsTrigger>
          <TabsTrigger value="forecasts"><TrendingUp className="h-3.5 w-3.5 mr-1" /> Forecasts</TabsTrigger>
          <TabsTrigger value="optimization"><Zap className="h-3.5 w-3.5 mr-1" /> Optimization</TabsTrigger>
          <TabsTrigger value="strategic"><Sparkles className="h-3.5 w-3.5 mr-1" /> Strategic</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-2 mt-4">
          {SMART_ALERTS.map(a => (
            <motion.div key={a.id} variants={fadeUp} initial="hidden" animate="show">
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-medium text-foreground">{a.title}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${sevColor[a.severity]}`}>{a.severity}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                    <span>Confidence: <span className="text-foreground font-medium">{(a.confidence * 100).toFixed(0)}%</span></span>
                    <span>Source: <span className="text-foreground">{a.source}</span></span>
                    <span>Evidence: <span className="text-foreground">{a.evidenceCount} signals</span></span>
                    <span>Horizon: <span className="text-foreground">{a.timeHorizon}</span></span>
                  </div>
                  <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span><strong className="text-foreground">Recommendation:</strong> {a.recommendation}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-2 mt-4">
          {FORECASTS.map(f => {
            const TrendIcon = trendIcon[f.trend];
            return (
              <motion.div key={f.id} variants={fadeUp} initial="hidden" animate="show">
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-foreground flex-1">{f.title}</span>
                      <div className="flex items-center gap-2">
                        <TrendIcon className={`h-3.5 w-3.5 ${trendColor[f.trend]}`} />
                        <Badge variant="outline" className="text-[9px]">{(f.probability * 100).toFixed(0)}% likely</Badge>
                      </div>
                    </div>
                    <div className="mb-2"><Progress value={f.probability * 100} className="h-1.5" /></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                      <span>Horizon: <span className="text-foreground">{f.timeHorizon}</span></span>
                      <span>Impact: <span className="text-foreground">{f.impact}</span></span>
                      <span>Evidence: <span className="text-foreground">{f.evidenceCount} signals</span></span>
                      <span>Trend: <span className={trendColor[f.trend]}>{f.trend}</span></span>
                    </div>
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
                      <Shield className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span><strong className="text-foreground">Prevention:</strong> {f.prevention}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-2 mt-4">
          {OPTIMIZATIONS.map(o => (
            <motion.div key={o.id} variants={fadeUp} initial="hidden" animate="show">
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{o.title}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[9px] ${impactColor[o.impact]}`}>Impact: {o.impact}</Badge>
                      <Badge variant="outline" className="text-[9px]">Effort: {o.effort}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{o.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Confidence: <span className="text-foreground font-medium">{(o.confidence * 100).toFixed(0)}%</span></span>
                    <span>Domain: <span className="text-foreground">{o.domain}</span></span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Preview Impact</Button>
                    <Button size="sm" className="h-7 text-xs">Apply Optimization</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="strategic" className="space-y-2 mt-4">
          {STRATEGIC_INSIGHTS.map(s => {
            const TrendIcon = trendIcon[s.trend];
            return (
              <motion.div key={s.id} variants={fadeUp} initial="hidden" animate="show">
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-foreground flex-1">{s.title}</span>
                      <TrendIcon className={`h-4 w-4 ${trendColor[s.trend]}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{s.summary}</p>
                    <div className="grid grid-cols-3 gap-3 text-[10px] text-muted-foreground">
                      <div><span className="uppercase tracking-wider">Confidence</span><p className="text-foreground font-medium mt-0.5">{(s.confidence * 100).toFixed(0)}%</p></div>
                      <div><span className="uppercase tracking-wider">Time to Value</span><p className="text-foreground font-medium mt-0.5">{s.timeToValue}</p></div>
                      <div><span className="uppercase tracking-wider">Trend</span><p className={`font-medium mt-0.5 ${trendColor[s.trend]}`}>{s.trend}</p></div>
                    </div>
                    <div className="mt-3 p-2 rounded bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
                      <BarChart3 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span><strong className="text-foreground">Historical precedent:</strong> {s.precedent}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligenceDashboard;
