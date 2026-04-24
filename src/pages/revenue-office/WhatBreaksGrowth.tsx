import { Typography } from "@/components/sita/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShieldAlert, AlertTriangle, Target, Users, Zap, MessageCircle, Clock,
  Wrench, CheckCircle, ArrowRight, Brain, TrendingDown, XCircle, Shield,
  Eye, BarChart3, RefreshCw, Package, Mail, Phone, Star, Heart
} from "lucide-react";
import { useRevenueRiskAreas } from "@/hooks/use-revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const FRAGILITY_MATRIX = [
  { system: "Lead Capture → Nurture", fragility: 32, bottleneck: "Form abandonment at 41%", resilience: "Backup: SMS opt-in added", status: "moderate" as const },
  { system: "Nurture → Appointment", fragility: 58, bottleneck: "Email 4 drop-off at 40%", resilience: "No alternative path", status: "fragile" as const },
  { system: "Appointment → Proposal", fragility: 22, bottleneck: "No-show rate 18%", resilience: "Auto-rebook active", status: "resilient" as const },
  { system: "Proposal → Close", fragility: 45, bottleneck: "Quote follow-up gap", resilience: "3/5/7 day reminders partial", status: "moderate" as const },
  { system: "Close → Onboarding", fragility: 18, bottleneck: "Delay > 48hrs for 12% of clients", resilience: "Auto-welcome sequence", status: "resilient" as const },
  { system: "Onboarding → Retention", fragility: 51, bottleneck: "30-day check-in only 50% engagement", resilience: "Churn signals monitored", status: "fragile" as const },
  { system: "Retention → Advocacy", fragility: 64, bottleneck: "Review requests sent to only 35% of happy clients", resilience: "No referral program", status: "fragile" as const },
];

const SCENARIO_STRESS_TESTS = [
  { scenario: "Key team member unavailable for 2 weeks", impact: "Lead response time +300%, booking capacity -40%", survivability: 35, recommendation: "Create delegation playbook and auto-assignment rules" },
  { scenario: "Email deliverability drops to 85%", impact: "Nurture conversion -22%, campaign ROI breaks even", survivability: 58, recommendation: "Activate SMS fallback for critical sequences" },
  { scenario: "Top 3 clients churn simultaneously", impact: "Revenue -38%, cash flow crisis in 45 days", survivability: 42, recommendation: "Diversify client base, activate pipeline acceleration" },
  { scenario: "Negative press / 1-star review surge", impact: "Inbound leads -25%, trust pulse drops to critical", survivability: 62, recommendation: "Activate reputation repair mode, pause outbound campaigns" },
  { scenario: "Pricing competitor undercuts by 30%", impact: "New deal conversion -18%, existing client inquiries +40%", survivability: 71, recommendation: "Emphasize value differentiation, create competitor comparison assets" },
];

const ASSUMPTION_AUDIT = [
  { assumption: "Leads prefer email communication", evidence: "SMS open rate 3.2x higher than email", verdict: "challenged" as const, advisorNote: "Campaign Advisor: Test SMS-first for initial outreach" },
  { assumption: "14-day nurture is optimal length", evidence: "Conversion peaks at day 7, drops 40% after day 10", verdict: "invalid" as const, advisorNote: "Funnel Advisor: Shorten to 7-10 day sequence" },
  { assumption: "Free consultation drives conversions", evidence: "82% show rate, 45% convert to paid — strong", verdict: "validated" as const, advisorNote: "Booking Advisor: Maintain but add pre-qualification" },
  { assumption: "Annual pricing drives retention", evidence: "Monthly clients churn 2.1x more, but annual has 12% lower initial conversion", verdict: "partially valid" as const, advisorNote: "Offer Advisor: Test hybrid quarterly option" },
  { assumption: "Reviews drive new business", evidence: "38% of new clients cite reviews as primary factor", verdict: "validated" as const, advisorNote: "Reputation Advisor: Increase review request velocity" },
  { assumption: "Upsells work best at 90 days", evidence: "Data shows 60-day upsell has 18% higher acceptance", verdict: "challenged" as const, advisorNote: "Revenue Ops Advisor: Move upsell trigger to day 60" },
];

const DEPENDENCY_RISKS = [
  { dependency: "Single email provider", risk: "Outage = all nurture + campaigns offline", severity: "high" as const, mitigation: "Add SMS fallback channel", status: "unmitigated" },
  { dependency: "Manual lead qualification", risk: "Response time > 4hrs for 30% of leads", severity: "high" as const, mitigation: "Implement lead scoring automation", status: "in progress" },
  { dependency: "Founder-dependent closing", risk: "Growth ceiling at ~$60K MRR", severity: "critical" as const, mitigation: "Build sales playbook + train team member", status: "unmitigated" },
  { dependency: "One booking platform", risk: "Platform change = all scheduling disrupted", severity: "medium" as const, mitigation: "Abstract booking layer", status: "mitigated" },
];

export default function WhatBreaksGrowth() {
  const [tab, setTab] = useState("fragility");
  const { data: liveRiskAreas } = useRevenueRiskAreas();
  const riskAreas = (liveRiskAreas && liveRiskAreas.length > 0 ? liveRiskAreas : []);
  const totalRisks = riskAreas.reduce((a, r) => a + r.risks.length, 0);
  const highSeverity = riskAreas.reduce((a, r) => a + r.risks.filter(x => x.severity === "high").length, 0);
  const avgFragility = Math.round(FRAGILITY_MATRIX.reduce((a, f) => a + f.fragility, 0) / FRAGILITY_MATRIX.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle" className="flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-amber-400" /> What Breaks Growth?</Typography>
        <p className="text-muted-foreground">Reverse-analysis of weak assumptions, delivery risks, fragility points, stress tests, and dependency mapping</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Total Risks", v: totalRisks, c: "text-foreground" },
          { l: "High Severity", v: highSeverity, c: "text-red-400" },
          { l: "Fragility Index", v: `${avgFragility}%`, c: avgFragility > 50 ? "text-red-400" : "text-amber-400" },
          { l: "Assumptions Challenged", v: ASSUMPTION_AUDIT.filter(a => a.verdict !== "validated").length, c: "text-amber-400" },
          { l: "Unmitigated Dependencies", v: DEPENDENCY_RISKS.filter(d => d.status === "unmitigated").length, c: "text-red-400" },
        ].map(m => (
          <Card key={m.l} className="bg-card/50 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="fragility"><ShieldAlert className="h-3.5 w-3.5 mr-1" />Fragility Map</TabsTrigger>
          <TabsTrigger value="assumptions"><Brain className="h-3.5 w-3.5 mr-1" />Assumption Audit</TabsTrigger>
          <TabsTrigger value="stress"><Zap className="h-3.5 w-3.5 mr-1" />Stress Tests</TabsTrigger>
          <TabsTrigger value="dependencies"><Shield className="h-3.5 w-3.5 mr-1" />Dependencies</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Risk Areas</TabsTrigger>
        </TabsList>

        {/* Fragility Map */}
        <TabsContent value="fragility" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-amber-400" />Journey Fragility Matrix</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {FRAGILITY_MATRIX.map(f => (
                <div key={f.system} className={`p-3 rounded-lg border ${f.status === "fragile" ? "border-red-500/30 bg-red-500/5" : f.status === "moderate" ? "border-amber-500/30 bg-amber-500/5" : "border-border/30 bg-muted/10"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{f.system}</span>
                    <Badge variant={f.status === "fragile" ? "destructive" : f.status === "moderate" ? "secondary" : "outline"} className="text-[10px] capitalize">{f.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-muted-foreground w-16">Fragility</span>
                    <Progress value={f.fragility} className="h-2 flex-1" />
                    <span className={`text-xs font-bold ${f.fragility > 50 ? "text-red-400" : f.fragility > 30 ? "text-amber-400" : "text-[hsl(var(--trust-safe))]"}`}>{f.fragility}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div><span className="text-muted-foreground">Bottleneck:</span> <span className="text-foreground">{f.bottleneck}</span></div>
                    <div><span className="text-muted-foreground">Resilience:</span> <span className={f.resilience.includes("No ") ? "text-red-400" : "text-[hsl(var(--trust-safe))]"}>{f.resilience}</span></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assumption Audit */}
        <TabsContent value="assumptions" className="space-y-3 mt-4">
          {ASSUMPTION_AUDIT.map((a, i) => (
            <Card key={i} className={`bg-card/50 ${a.verdict === "invalid" ? "border-red-500/30" : a.verdict === "challenged" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {a.verdict === "validated" ? <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))] mt-0.5" /> :
                     a.verdict === "invalid" ? <XCircle className="h-4 w-4 text-red-400 mt-0.5" /> :
                     <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">"{a.assumption}"</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.evidence}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] capitalize ${a.verdict === "validated" ? "bg-emerald-500/10 text-emerald-400" : a.verdict === "invalid" ? "bg-red-500/10 text-red-400" : a.verdict === "challenged" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>{a.verdict}</Badge>
                </div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10 mt-2">
                  <p className="text-[10px] text-foreground flex items-start gap-1"><Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />{a.advisorNote}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Stress Tests */}
        <TabsContent value="stress" className="space-y-3 mt-4">
          {SCENARIO_STRESS_TESTS.map((s, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.scenario}</p>
                    <p className="text-xs text-red-400 mt-1">{s.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${s.survivability >= 60 ? "text-amber-400" : "text-red-400"}`}>{s.survivability}%</p>
                    <p className="text-[10px] text-muted-foreground">survivability</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">Survivability</span>
                  <Progress value={s.survivability} className="h-2 flex-1" />
                </div>
                <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-foreground">{s.recommendation}</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1"><ArrowRight className="w-3 h-3" />Plan</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Dependencies */}
        <TabsContent value="dependencies" className="space-y-3 mt-4">
          {DEPENDENCY_RISKS.map((d, i) => (
            <Card key={i} className={`bg-card/50 ${d.severity === "critical" ? "border-red-500/30" : d.severity === "high" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${d.severity === "critical" ? "text-red-400" : d.severity === "high" ? "text-amber-400" : "text-blue-400"}`} />
                    <span className="text-sm font-medium text-foreground">{d.dependency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{d.severity}</Badge>
                    <Badge className={`text-[10px] ${d.status === "mitigated" ? "bg-emerald-500/10 text-emerald-400" : d.status === "in progress" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>{d.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-red-400 mb-1">{d.risk}</p>
                <p className="text-xs text-muted-foreground">Mitigation: <span className="text-foreground">{d.mitigation}</span></p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Risk Areas (existing) */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {/* Advisor Invalidation Triggers */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Advisor-Linked Invalidation Triggers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as never[]).map((inv, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50 border border-border/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground"><span className="font-medium">{inv.advisor}:</span> {inv.condition}</p>
                    <p className="text-[10px] text-muted-foreground">Impact: {inv.impact}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {riskAreas.map((area) => (
            <Card key={area.area} className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <area.icon className={`h-5 w-5 ${area.color}`} />{area.area}
                  <Badge variant="secondary" className="text-[10px] ml-2">{area.risks.length} risks</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {area.risks.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${r.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                        <span className="text-sm text-foreground">{r.risk}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                        <span className="text-xs text-muted-foreground">{r.likelihood}% likely</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-foreground">Repair: {r.severity === "high" ? "Activate automation to address this risk" : "Monitor and review next week"}</span>
                      </div>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1"><ArrowRight className="w-3 h-3" />Act</Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Likelihood</span>
                      <Progress value={r.likelihood} className="h-1 flex-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}