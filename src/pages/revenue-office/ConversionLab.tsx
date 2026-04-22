import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { FlaskConical, ArrowUpRight, ArrowDownRight, BarChart3, Play, Pause, Plus, Brain, Target, TrendingUp, Zap, AlertTriangle, CheckCircle, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DEMO_EXPERIMENTS } from "@/data/seed/revenue-office";
import { useConversionExperiments } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const FUNNEL_BENCHMARKS = [
  { stage: "Landing Page → Form Start", current: 42, benchmark: 45, status: "near" as const },
  { stage: "Form Start → Form Complete", current: 68, benchmark: 75, status: "below" as const },
  { stage: "Form Complete → Booking", current: 34, benchmark: 30, status: "above" as const },
  { stage: "Booking → Show Up", current: 82, benchmark: 85, status: "near" as const },
  { stage: "Show Up → Proposal", current: 71, benchmark: 65, status: "above" as const },
  { stage: "Proposal → Close", current: 45, benchmark: 50, status: "below" as const },
];

const OPTIMIZATION_QUEUE = [
  { area: "Form Completion Rate", currentRate: "68%", targetRate: "75%", estimatedImpact: "+$4,200/mo", priority: "high" as const, suggestions: ["Reduce form fields from 8 to 5", "Add progress indicator", "Enable autofill"], advisor: "Funnel Advisor" },
  { area: "Proposal Close Rate", currentRate: "45%", targetRate: "55%", estimatedImpact: "+$8,400/mo", priority: "high" as const, suggestions: ["Add video walkthrough", "Shorten follow-up to 24hrs", "Include social proof"], advisor: "Revenue Ops Advisor" },
  { area: "Email → Click Rate", currentRate: "3.2%", targetRate: "5%", estimatedImpact: "+12 leads/mo", priority: "medium" as const, suggestions: ["Personalize subject lines", "Test emoji in subjects", "Segment by engagement"], advisor: "Campaign Advisor" },
  { area: "Checkout Abandonment", currentRate: "32%", targetRate: "20%", estimatedImpact: "+$6,800/mo", priority: "high" as const, suggestions: ["Add trust badges", "Simplify payment form", "Add exit-intent recovery"], advisor: "Offer Advisor" },
];

const HEATMAP_DATA = [
  { element: "Hero CTA Button", clicks: 342, conversions: 48, rate: 14.0 },
  { element: "Pricing Section", clicks: 289, conversions: 22, rate: 7.6 },
  { element: "Testimonial Carousel", clicks: 156, conversions: 12, rate: 7.7 },
  { element: "FAQ Accordion", clicks: 124, conversions: 8, rate: 6.5 },
  { element: "Footer CTA", clicks: 87, conversions: 15, rate: 17.2 },
  { element: "Navigation Menu", clicks: 445, conversions: 5, rate: 1.1 },
];

const ADVISOR_CONVERSION_INSIGHTS = [
  { advisor: "Funnel Advisor", insight: "Your highest-converting path is Referral → Direct booking (34% close rate). Invest more in referral incentives.", confidence: 88 },
  { advisor: "Campaign Advisor", insight: "Wednesday 10am sends outperform all other times by 42%. Consolidate major sends to this window.", confidence: 82 },
  { advisor: "Offer Advisor", insight: "Bundled offers convert 2.3x better than single services. Test a 'Starter Bundle' for new leads.", confidence: 76 },
  { advisor: "Revenue Ops Advisor", insight: "Speed-to-response under 15 minutes has 78% higher conversion. Current average is 2.4 hours.", confidence: 91 },
];

export default function ConversionLab() {
  const [tab, setTab] = useState("experiments");
  const { data: liveExperiments, isLoading } = useConversionExperiments();
  const EXPERIMENTS = (liveExperiments && liveExperiments.length > 0 ? liveExperiments.map((e: any) => ({
    name: e.name,
    status: e.status || "draft",
    startDate: e.started_at ? new Date(e.started_at).toLocaleDateString() : "—",
    lift: `+${((e.conversion_rate_b - e.conversion_rate_a) / Math.max(e.conversion_rate_a, 0.01) * 100).toFixed(1)}%`,
    confidence: e.confidence_level || 0,
    winner: e.winner || null,
    variants: [
      { name: e.variant_a || "Control", visitors: Math.round((e.sample_size || 0) / 2), conversions: Math.round((e.sample_size || 0) / 2 * (e.conversion_rate_a || 0) / 100), rate: e.conversion_rate_a || 0 },
      { name: e.variant_b || "Variant B", visitors: Math.round((e.sample_size || 0) / 2), conversions: Math.round((e.sample_size || 0) / 2 * (e.conversion_rate_b || 0) / 100), rate: e.conversion_rate_b || 0 },
    ],
  })) : DEMO_EXPERIMENTS);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" /> Conversion Lab
            </h1>
            <p className="text-sm text-muted-foreground">A/B testing, funnel benchmarks, optimization queue, and conversion intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Experiment</Button>
        </div>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Active Tests", v: EXPERIMENTS.filter(e => e.status === "running").length, c: "text-primary" },
          { l: "Avg Lift", v: "+14.2%", c: "text-[hsl(var(--trust-safe))]" },
          { l: "Confidence Avg", v: "87%", c: "text-blue-400" },
          { l: "Revenue from Tests", v: "$12,400", c: "text-emerald-400" },
          { l: "Optimizations Queued", v: OPTIMIZATION_QUEUE.length, c: "text-amber-400" },
        ].map(m => (
          <Card key={m.l} className="bg-card/50 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="experiments"><FlaskConical className="h-3.5 w-3.5 mr-1" />Experiments</TabsTrigger>
          <TabsTrigger value="benchmarks"><BarChart3 className="h-3.5 w-3.5 mr-1" />Benchmarks</TabsTrigger>
          <TabsTrigger value="optimization"><Target className="h-3.5 w-3.5 mr-1" />Optimization Queue</TabsTrigger>
          <TabsTrigger value="heatmap"><Eye className="h-3.5 w-3.5 mr-1" />Element Analytics</TabsTrigger>
          <TabsTrigger value="insights"><Brain className="h-3.5 w-3.5 mr-1" />Advisor Insights</TabsTrigger>
        </TabsList>

        {/* Experiments */}
        <TabsContent value="experiments" className="space-y-4 mt-4">
          {EXPERIMENTS.map((exp, i) => (
            <motion.div key={exp.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{exp.name}</p>
                        <Badge variant={exp.status === "running" ? "default" : exp.status === "completed" ? "secondary" : "outline"} className="text-xs">{exp.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Started {exp.startDate}</p>
                    </div>
                    {exp.status !== "draft" && (
                      <div className="text-right">
                        <p className={`text-lg font-bold ${exp.lift.startsWith("+") ? "text-green-400" : "text-foreground"}`}>{exp.lift}</p>
                        <p className="text-xs text-muted-foreground">{exp.confidence}% confidence</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {exp.variants.map(v => (
                      <div key={v.name} className={`flex items-center justify-between p-3 rounded-lg border ${exp.winner === v.name ? "border-green-500/30 bg-green-500/5" : "border-border/30 bg-muted/10"}`}>
                        <div className="flex items-center gap-2">
                          {exp.winner === v.name && <Badge className="text-xs bg-green-500/20 text-green-400">Winner</Badge>}
                          <span className="text-sm text-foreground">{v.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right"><p className="text-sm font-medium text-foreground">{v.visitors.toLocaleString()}</p><p className="text-xs text-muted-foreground">visitors</p></div>
                          <div className="text-right"><p className="text-sm font-medium text-foreground">{v.conversions}</p><p className="text-xs text-muted-foreground">conversions</p></div>
                          <div className="text-right w-16"><p className="text-sm font-bold text-primary">{v.rate}%</p><p className="text-xs text-muted-foreground">rate</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {exp.confidence > 0 && <Progress value={exp.confidence} className="h-1" />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Benchmarks */}
        <TabsContent value="benchmarks" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Funnel Stage Benchmarks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {FUNNEL_BENCHMARKS.map(b => (
                <div key={b.stage} className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{b.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${b.status === "above" ? "text-[hsl(var(--trust-safe))]" : b.status === "below" ? "text-red-400" : "text-amber-400"}`}>{b.current}%</span>
                      <span className="text-xs text-muted-foreground">/ {b.benchmark}% benchmark</span>
                      {b.status === "above" ? <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> :
                       b.status === "below" ? <ArrowDownRight className="h-3.5 w-3.5 text-red-400" /> :
                       <TrendingUp className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${b.benchmark}%` }} />
                    <div className={`absolute inset-y-0 left-0 rounded-full ${b.status === "above" ? "bg-[hsl(var(--trust-safe))]" : b.status === "below" ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${b.current}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Queue */}
        <TabsContent value="optimization" className="space-y-3 mt-4">
          {OPTIMIZATION_QUEUE.map((opt, i) => (
            <Card key={i} className={`bg-card/50 ${opt.priority === "high" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.area}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Current: <span className="text-foreground font-medium">{opt.currentRate}</span></span>
                      <span>Target: <span className="text-[hsl(var(--trust-safe))]">{opt.targetRate}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{opt.estimatedImpact}</p>
                    <Badge variant={opt.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{opt.priority} priority</Badge>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {opt.suggestions.map((s, si) => (
                    <div key={si} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <p className="text-[10px] text-foreground flex items-center gap-1"><Brain className="h-3 w-3 text-primary" />{opt.advisor}</p>
                  <Button variant="outline" size="sm" className="text-[10px] h-6">Start Optimization</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Element Analytics */}
        <TabsContent value="heatmap" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-primary" />Page Element Performance</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {HEATMAP_DATA.sort((a, b) => b.rate - a.rate).map(h => (
                <div key={h.element} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{h.element}</span>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{h.clicks} clicks</span>
                      <span>{h.conversions} conversions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${h.rate >= 10 ? "text-[hsl(var(--trust-safe))]" : h.rate >= 5 ? "text-amber-400" : "text-red-400"}`}>{h.rate}%</p>
                    <p className="text-[10px] text-muted-foreground">conv rate</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advisor Insights */}
        <TabsContent value="insights" className="space-y-3 mt-4">
          {ADVISOR_CONVERSION_INSIGHTS.map((a, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-primary">{a.advisor}</p>
                    <Badge variant="outline" className="text-[10px]">{a.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm text-foreground">{a.insight}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}