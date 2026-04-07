import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Zap, Play, Pause, AlertTriangle, CheckCircle, TrendingUp, Users, Mail, Phone,
  FileText, Star, RefreshCw, ShieldCheck, Clock, ArrowRight, Activity, BarChart3,
  DollarSign, Target, Eye, XCircle, Settings, Workflow, Brain, Shield, Lightbulb,
  MessageSquare, UserPlus, Heart, Package, ArrowUpRight, Layers
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_automationStats = [
  { label: "Active Automations", value: "24", delta: "+3 this week", icon: Play, color: "text-emerald-400" },
  { label: "Paused / Under Review", value: "5", delta: "2 need attention", icon: Pause, color: "text-amber-400" },
  { label: "Actions This Week", value: "1,247", delta: "+18% vs last week", icon: Zap, color: "text-blue-400" },
  { label: "Revenue Recovered", value: "$34,800", delta: "from leak repair", icon: DollarSign, color: "text-emerald-400" },
  { label: "Leads Rescued", value: "68", delta: "via recovery flows", icon: Users, color: "text-purple-400" },
  { label: "Automation Health", value: "94%", delta: "2 issues detected", icon: Activity, color: "text-blue-400" },
];

const DEMO_activeAutomations = [
  { name: "Stale Lead Recovery (48hr)", status: "active", triggers: 42, success: 78, contacts: 156, revenue: "$12,400", category: "Lead Recovery", level: "Auto-run (L3)", icon: Users, trend: "improving" },
  { name: "No-Show Rescue + Rebook", status: "active", triggers: 18, success: 61, contacts: 48, revenue: "$4,200", category: "Booking", level: "Draft for review (L2)", icon: Phone, trend: "stable" },
  { name: "Post-Service Review Request", status: "active", triggers: 35, success: 84, contacts: 220, revenue: "—", category: "Reputation", level: "Auto-run (L3)", icon: Star, trend: "improving" },
  { name: "Quote Follow-up (3/5/7 day)", status: "active", triggers: 12, success: 67, contacts: 34, revenue: "$8,900", category: "Sales", level: "Auto-run (L3)", icon: FileText, trend: "declining" },
  { name: "Welcome Onboarding (7-step)", status: "active", triggers: 28, success: 92, contacts: 112, revenue: "—", category: "Onboarding", level: "Auto-run (L3)", icon: UserPlus, trend: "improving" },
  { name: "Nurture Sequence (14-day)", status: "active", triggers: 89, success: 71, contacts: 340, revenue: "$6,800", category: "Nurture", level: "Auto-run (L3)", icon: Mail, trend: "stable" },
  { name: "Churn Prevention Check-in", status: "warning", triggers: 8, success: 50, contacts: 22, revenue: "$3,100", category: "Retention", level: "AI suggests (L1)", icon: Heart, trend: "declining" },
  { name: "Upsell After Delivery", status: "active", triggers: 14, success: 43, contacts: 38, revenue: "$5,600", category: "Growth", level: "Draft for review (L2)", icon: Package, trend: "stable" },
  { name: "Abandoned Checkout Recovery", status: "active", triggers: 22, success: 58, contacts: 64, revenue: "$7,200", category: "Sales", level: "Auto-run (L3)", icon: Target, trend: "improving" },
  { name: "Reactivation Campaign (90-day)", status: "active", triggers: 34, success: 38, contacts: 78, revenue: "$2,800", category: "Growth", level: "Draft for review (L2)", icon: RefreshCw, trend: "stable" },
];

const DEMO_atRiskAutomations = [
  { name: "Quote Follow-up (3/5/7 day)", issue: "Conversion rate dropped from 78% to 67% this week — possible message fatigue", severity: "medium", action: "Review messaging and timing" },
  { name: "Churn Prevention Check-in", issue: "Only 50% success — many clients not engaging with check-in emails", severity: "high", action: "Advisor suggests switching to SMS + personal call" },
  { name: "Lead Assignment Engine", issue: "5 leads unassigned due to rule mismatch — sales team missing warm leads", severity: "high", action: "Fix assignment rules for 'enterprise' segment" },
  { name: "Nurture Sequence B", issue: "3 emails bouncing, deliverability at 94% — below 97% threshold", severity: "medium", action: "Clean list and verify sending domain" },
  { name: "Upsell After Delivery", issue: "Low engagement — 8% open rate vs 24% benchmark", severity: "low", action: "Test new subject lines and timing" },
];

const DEMO_advisorRecommendations = [
  { advisor: "CRM Advisor", recommendation: "12 warm leads have no next step scheduled — create a follow-up automation to prevent drop-off", impact: "$8,200 at risk", confidence: 87, urgency: "high", autoType: "Lead Recovery" },
  { advisor: "Booking Advisor", recommendation: "No-show rate at 18% — add SMS reminder 1hr before appointments to improve show rate by ~22%", impact: "+22% show rate", confidence: 82, urgency: "medium", autoType: "Booking" },
  { advisor: "Retention Advisor", recommendation: "34 clients inactive 60+ days — launch reactivation sequence before they churn permanently", impact: "$12,400 at risk", confidence: 65, urgency: "high", autoType: "Retention" },
  { advisor: "Revenue Ops Advisor", recommendation: "Quote reminders not being sent after 3 days — enable quote expiry flow to recover stalled proposals", impact: "$4,800 at risk", confidence: 91, urgency: "medium", autoType: "Sales" },
  { advisor: "Funnel Advisor", recommendation: "Landing page → form conversion at 12% — create abandoned form recovery sequence for visitors who started but didn't complete", impact: "+35 leads/mo", confidence: 74, urgency: "medium", autoType: "Lead Recovery" },
  { advisor: "Reputation Advisor", recommendation: "28 happy clients never asked for review — create post-delivery review request with 48hr delay", impact: "+12 reviews/mo", confidence: 88, urgency: "low", autoType: "Reputation" },
  { advisor: "Campaign Advisor", recommendation: "Nurture sequence engagement drops 40% at email 4 — create branch for disengaged contacts with different messaging", impact: "+18% nurture conversion", confidence: 70, urgency: "medium", autoType: "Nurture" },
  { advisor: "Chief Revenue Strategist", recommendation: "Your biggest automation gap is post-call follow-up — only 40% of discovery calls get a same-day follow-up. Automating this could recover $15K/mo", impact: "$15,000/mo", confidence: 78, urgency: "critical", autoType: "Sales" },
];

const DEMO_leakRepairOpportunities = [
  { leak: "Post-call follow-up gap", estimatedLoss: "$15,000/mo", contacts: 24, status: "no automation", fixDifficulty: "easy" },
  { leak: "Quote viewed but no response (>5 days)", estimatedLoss: "$8,400/mo", contacts: 18, status: "partial automation", fixDifficulty: "easy" },
  { leak: "Onboarding incomplete after 3 days", estimatedLoss: "$4,200/mo", contacts: 8, status: "no automation", fixDifficulty: "medium" },
  { leak: "Happy clients never asked for review", estimatedLoss: "reputation cost", contacts: 28, status: "no automation", fixDifficulty: "easy" },
  { leak: "Dormant leads (30-60 days)", estimatedLoss: "$12,400/mo", contacts: 34, status: "no automation", fixDifficulty: "medium" },
  { leak: "Failed payment retry", estimatedLoss: "$2,100/mo", contacts: 6, status: "no automation", fixDifficulty: "easy" },
];

const DEMO_businessStageAutomations = [
  { stage: "Awareness", automations: 4, coverage: 72, gaps: ["Abandoned form recovery", "Social engagement follow-up"] },
  { stage: "Consideration", automations: 6, coverage: 85, gaps: ["Competitor comparison sends"] },
  { stage: "Conversion", automations: 5, coverage: 68, gaps: ["Post-call follow-up", "Quote objection handling"] },
  { stage: "Onboarding", automations: 3, coverage: 78, gaps: ["Milestone celebration", "Satisfaction pulse at day 7"] },
  { stage: "Retention", automations: 4, coverage: 55, gaps: ["Anniversary recognition", "Usage drop detection", "Renewal warmup"] },
  { stage: "Advocacy", automations: 2, coverage: 40, gaps: ["Referral program", "Case study request", "Community invitation"] },
];

const levelColors: Record<string, string> = {
  "Auto-run (L3)": "bg-emerald-500/10 text-emerald-400",
  "Draft for review (L2)": "bg-blue-500/10 text-blue-400",
  "AI suggests (L1)": "bg-purple-500/10 text-purple-400",
  "Semi-autonomous (L4)": "bg-amber-500/10 text-amber-400",
};

const trendColors: Record<string, string> = {
  improving: "text-emerald-400",
  stable: "text-blue-400",
  declining: "text-red-400",
};

const urgencyColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400",
  high: "bg-amber-500/10 text-amber-400",
  medium: "bg-blue-500/10 text-blue-400",
  low: "bg-muted text-muted-foreground",
};

export default function AutomationOffice() {
  const { isDemoMode } = useDataMode();
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Automation Office
          </h1>
          <p className="text-muted-foreground">Commercial automation command center — build, simulate, approve, monitor, and repair automations with advisor intelligence</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />Policies
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />New Automation
          </button>
        </div>
      </div>

      {/* Stats Band */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {DEMO_automationStats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="overview">Boardroom</TabsTrigger>
          <TabsTrigger value="active">Active ({DEMO_activeAutomations.length})</TabsTrigger>
          <TabsTrigger value="atRisk">At Risk ({DEMO_atRiskAutomations.length})</TabsTrigger>
          <TabsTrigger value="advisors">Advisor Recs ({DEMO_advisorRecommendations.length})</TabsTrigger>
          <TabsTrigger value="leaks">Leak Repair ({DEMO_leakRepairOpportunities.length})</TabsTrigger>
          <TabsTrigger value="stages">By Stage</TabsTrigger>
        </TabsList>

        {/* BOARDROOM TAB */}
        <TabsContent value="overview" className="space-y-4">
          {/* Chief Strategist Alert */}
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Chief Revenue Strategist Summary</p>
                <p className="text-xs text-muted-foreground mb-2">Your automation system is performing at <span className="text-emerald-400 font-medium">94% health</span> but has <span className="text-amber-400 font-medium">3 critical gaps</span> costing an estimated <span className="text-red-400 font-medium">$35,600/mo</span> in leaked revenue.</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-red-500/10 text-red-400 text-[10px]">Post-call follow-up gap: $15K/mo</Badge>
                  <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">Stalled quotes: $8.4K/mo</Badge>
                  <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">Dormant leads: $12.4K/mo</Badge>
                </div>
                <p className="text-xs text-foreground mt-2">Recommendation: <span className="text-primary">Generate post-call follow-up automation first</span> — highest ROI, easiest to implement.</p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Impact Summary */}
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Revenue Protected", value: "$34,800", desc: "by active automations this month", color: "text-emerald-400", icon: Shield },
              { label: "Revenue at Risk", value: "$35,600", desc: "from automation gaps", color: "text-red-400", icon: AlertTriangle },
              { label: "Leads Rescued", value: "68", desc: "via recovery automations", color: "text-blue-400", icon: Users },
              { label: "Automation ROI", value: "14.2x", desc: "return on automation effort", color: "text-purple-400", icon: TrendingUp },
            ].map((m) => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Level Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-400" />Automation Trust Level Distribution</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-3">
              {[
                { level: "L1 — Suggest Only", desc: "SITA detects and recommends — no automated actions taken", count: 6, pct: 25, color: "border-purple-500/30" },
                { level: "L2 — Draft & Prepare", desc: "SITA drafts content, user reviews before any execution", count: 8, pct: 33, color: "border-blue-500/30" },
                { level: "L3 — Act Under Rules", desc: "SITA executes within approved policy boundaries automatically", count: 7, pct: 29, color: "border-emerald-500/30" },
                { level: "L4 — Semi-Autonomous", desc: "Bounded operations with mandatory receipts and human escalation", count: 3, pct: 13, color: "border-amber-500/30" },
              ].map((l) => (
                <div key={l.level} className={`p-3 rounded-lg bg-background/50 border ${l.color}`}>
                  <p className="text-xs font-semibold text-foreground mb-1">{l.level}</p>
                  <p className="text-[11px] text-muted-foreground mb-2">{l.desc}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{l.count} automations</Badge>
                    <span className="text-xs text-muted-foreground">{l.pct}%</span>
                  </div>
                  <Progress value={l.pct} className="h-1 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-400" />Quick Automation Actions</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-2">
              {[
                "Generate lead recovery workflow", "Generate no-show rescue flow", "Generate quote follow-up",
                "Generate onboarding sequence", "Generate review request flow", "Generate churn prevention",
                "Generate reactivation campaign", "Generate post-call follow-up", "Generate internal handoff",
              ].map((action) => (
                <button key={action} className="p-2.5 rounded-lg bg-background/50 border border-border/30 text-xs text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors text-left flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                  {action}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVE AUTOMATIONS TAB */}
        <TabsContent value="active" className="space-y-3">
          {DEMO_activeAutomations.map((a) => (
            <Card key={a.name} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><a.icon className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                        <Badge className={`${levelColors[a.level] || "bg-muted text-muted-foreground"} text-[10px]`}>{a.level}</Badge>
                        <span className={`text-[10px] ${trendColors[a.trend]}`}>● {a.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{a.revenue}</p>
                    <p className="text-[10px] text-muted-foreground">revenue impact</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/20">
                  <span>Triggered: <span className="text-foreground">{a.triggers}x</span> this week</span>
                  <span>Success: <span className={a.success >= 70 ? "text-emerald-400" : "text-amber-400"}>{a.success}%</span></span>
                  <span>Contacts: <span className="text-foreground">{a.contacts}</span></span>
                  <button className="ml-auto px-3 py-1 rounded bg-secondary text-secondary-foreground text-[10px] hover:bg-secondary/80">View Details</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AT RISK TAB */}
        <TabsContent value="atRisk" className="space-y-3">
          {DEMO_atRiskAutomations.map((a) => (
            <Card key={a.name} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <Badge variant={a.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{a.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{a.issue}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary">Suggested: {a.action}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-[10px] font-medium">Fix Now</button>
                    <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px]">Investigate</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ADVISOR RECOMMENDATIONS TAB */}
        <TabsContent value="advisors" className="space-y-3">
          {DEMO_advisorRecommendations.map((r, i) => (
            <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{r.advisor}</Badge>
                    <Badge className={`${urgencyColors[r.urgency]} text-[10px]`}>{r.urgency}</Badge>
                    <span className="text-[10px] text-muted-foreground">{r.confidence}% confidence</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{r.autoType}</Badge>
                </div>
                <p className="text-sm text-foreground mb-2">{r.recommendation}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">Impact: {r.impact}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Generate Automation</button>
                    <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-xs">Simulate First</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* LEAK REPAIR TAB */}
        <TabsContent value="leaks" className="space-y-3">
          <Card className="bg-card/50 border-red-500/20 border">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Total Estimated Revenue Leakage</p>
              <p className="text-2xl font-bold text-red-400">$42,100/mo</p>
              <p className="text-xs text-muted-foreground">from {DEMO_leakRepairOpportunities.length} automation gaps across the customer journey</p>
            </CardContent>
          </Card>
          {DEMO_leakRepairOpportunities.map((leak, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{leak.leak}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="text-red-400 font-medium">{leak.estimatedLoss}</span>
                    <span>{leak.contacts} contacts affected</span>
                    <Badge variant="secondary" className="text-[10px]">{leak.status}</Badge>
                    <span>Fix difficulty: <span className={leak.fixDifficulty === "easy" ? "text-emerald-400" : "text-amber-400"}>{leak.fixDifficulty}</span></span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium ml-4">Generate Fix</button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* BY STAGE TAB */}
        <TabsContent value="stages" className="space-y-3">
          {DEMO_businessStageAutomations.map((stage) => (
            <Card key={stage.stage} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">{stage.stage}</p>
                    <Badge variant="secondary" className="text-[10px]">{stage.automations} automations</Badge>
                  </div>
                  <span className={`text-sm font-bold ${stage.coverage >= 80 ? "text-emerald-400" : stage.coverage >= 60 ? "text-amber-400" : "text-red-400"}`}>{stage.coverage}% coverage</span>
                </div>
                <Progress value={stage.coverage} className="h-1.5 mb-2" />
                {stage.gaps.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Gaps:</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.gaps.map((gap) => (
                        <Badge key={gap} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">{gap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
