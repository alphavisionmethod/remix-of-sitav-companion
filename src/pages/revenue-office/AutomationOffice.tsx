import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Zap, Play, Pause, AlertTriangle, CheckCircle, TrendingUp, Users, Mail, Phone,
  FileText, Star, RefreshCw, ShieldCheck, Clock, ArrowRight, Activity, BarChart3,
  DollarSign, Target, Eye, XCircle, Settings, Workflow, Brain, Shield, Lightbulb,
  MessageSquare, UserPlus, Heart, Package, ArrowUpRight, Layers, Globe, Calendar,
  GitBranch, Send, Award, Glasses, HandMetal
} from "lucide-react";
import {
  DEMO_activeAutomations, DEMO_advisorRecommendations, DEMO_atRiskAutomations,
  DEMO_automationStats, DEMO_leakRepairOpportunities,
  DEMO_AUTOMATION_SURFACE_MAP, DEMO_AUTOMATION_OS_CONNECTIONS,
  DEMO_AUTOMATION_QUALITY_SCORES, DEMO_SHADOW_BOARD, DEMO_PROMISES
} from "@/data/seed/revenue-office";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

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

const levelBadgeColors: Record<string, string> = {
  "L4": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "L3": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "L2": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "L1": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "None": "bg-red-500/10 text-red-400 border-red-500/20",
};

const safetyColors: Record<string, string> = {
  "Safe to automate": "bg-emerald-500/10 text-emerald-400",
  "Review recommended": "bg-amber-500/10 text-amber-400",
  "Needs redesign": "bg-red-500/10 text-red-400",
  "Human only": "bg-purple-500/10 text-purple-400",
};

const promiseStatusColors: Record<string, string> = {
  overdue: "bg-red-500/10 text-red-400",
  due_today: "bg-amber-500/10 text-amber-400",
  on_track: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
};

export default function AutomationOffice() {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Automation Office
          </h1>
          <p className="text-muted-foreground">Commercial automation command center — build, simulate, approve, monitor, and repair automations with advisor intelligence</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/revenue-office/automation/policy")} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />Policies
          </button>
          <button onClick={() => navigate("/revenue-office/automation/builder")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />New Automation
          </button>
        </div>
      </div>

      <AutomationSubNav />

      {/* Stats Band */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(isDemoMode ? DEMO_automationStats : [] as typeof DEMO_automationStats).map((s) => (
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
        <TabsList className="bg-card/50 flex-wrap">
          <TabsTrigger value="overview">Boardroom</TabsTrigger>
          <TabsTrigger value="surface">Surface Map</TabsTrigger>
          <TabsTrigger value="active">Active ({(isDemoMode ? DEMO_activeAutomations : [] as typeof DEMO_activeAutomations).length})</TabsTrigger>
          <TabsTrigger value="atRisk">At Risk ({(isDemoMode ? DEMO_atRiskAutomations : [] as typeof DEMO_atRiskAutomations).length})</TabsTrigger>
          <TabsTrigger value="advisors">Advisor Recs ({(isDemoMode ? DEMO_advisorRecommendations : [] as typeof DEMO_advisorRecommendations).length})</TabsTrigger>
          <TabsTrigger value="leaks">Leak Repair ({(isDemoMode ? DEMO_leakRepairOpportunities : [] as typeof DEMO_leakRepairOpportunities).length})</TabsTrigger>
          <TabsTrigger value="quality">Quality Scoring</TabsTrigger>
          <TabsTrigger value="shadow">Shadow Board</TabsTrigger>
          <TabsTrigger value="promises">Promises ({(isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).filter(p => p.status !== "completed").length})</TabsTrigger>
          <TabsTrigger value="osmap">OS Map</TabsTrigger>
        </TabsList>

        {/* BOARDROOM TAB */}
        <TabsContent value="overview" className="space-y-4">
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

        {/* AUTOMATION SURFACE COVERAGE MAP TAB */}
        <TabsContent value="surface" className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Commercial Automation Engine — Surface Coverage</p>
                <p className="text-xs text-muted-foreground">All 10 automatable business domains with current level (L1–L4), sub-capability coverage, estimated value, and gaps. Build missing automations directly from here.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "Domains Covered", value: `${(isDemoMode ? DEMO_AUTOMATION_SURFACE_MAP : [] as typeof DEMO_AUTOMATION_SURFACE_MAP).filter(d => d.currentLevel !== "None").length}/10`, color: "text-emerald-400" },
              { label: "Average Coverage", value: `${Math.round((isDemoMode ? DEMO_AUTOMATION_SURFACE_MAP : [] as typeof DEMO_AUTOMATION_SURFACE_MAP).reduce((a, d) => a + d.coveragePct, 0) / (isDemoMode ? DEMO_AUTOMATION_SURFACE_MAP : [] as typeof DEMO_AUTOMATION_SURFACE_MAP).length)}%`, color: "text-blue-400" },
              { label: "Total Estimated Value", value: "$127K/mo", color: "text-primary" },
            ].map((m) => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {(isDemoMode ? DEMO_AUTOMATION_SURFACE_MAP : [] as typeof DEMO_AUTOMATION_SURFACE_MAP).map((domain) => (
              <Card key={domain.domain} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <domain.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{domain.domain}</p>
                        <p className="text-[10px] text-muted-foreground">{domain.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[10px] border ${levelBadgeColors[domain.currentLevel]}`}>
                        {domain.currentLevel === "None" ? "Not Automated" : `Level ${domain.currentLevel}`}
                      </Badge>
                      <span className={`text-sm font-bold ${domain.coveragePct >= 80 ? "text-emerald-400" : domain.coveragePct >= 50 ? "text-amber-400" : "text-red-400"}`}>{domain.coveragePct}%</span>
                    </div>
                  </div>

                  <Progress value={domain.coveragePct} className="h-1.5 mb-3" />

                  <div className="grid md:grid-cols-2 gap-2 mb-3">
                    {domain.subCapabilities.map((sub) => (
                      <div key={sub.name} className={`p-2 rounded-lg border text-xs flex items-center justify-between ${sub.automated ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/10 border-border/30"}`}>
                        <div className="flex items-center gap-2">
                          {sub.automated ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          <span className={sub.automated ? "text-foreground" : "text-muted-foreground"}>{sub.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[8px]">{sub.level}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Est. value: <span className="text-emerald-400 font-medium">{domain.estimatedValue}</span></span>
                      <span>Active automations: <span className="text-foreground">{domain.activeAutomations}</span></span>
                      {domain.gaps.length > 0 && (
                        <span className="text-amber-400">{domain.gaps.length} gaps</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {domain.gaps.length > 0 && (
                        <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-[10px] font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3" />Build Missing
                        </button>
                      )}
                      <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px]">View Health</button>
                    </div>
                  </div>

                  {domain.gaps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {domain.gaps.map((gap) => (
                        <Badge key={gap} variant="outline" className="text-[10px] text-amber-400 border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-colors">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ACTIVE AUTOMATIONS TAB */}
        <TabsContent value="active" className="space-y-3">
          {(isDemoMode ? DEMO_activeAutomations : [] as typeof DEMO_activeAutomations).map((a) => (
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
          {(isDemoMode ? DEMO_atRiskAutomations : [] as typeof DEMO_atRiskAutomations).map((a) => (
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
          {(isDemoMode ? DEMO_advisorRecommendations : [] as typeof DEMO_advisorRecommendations).map((r, i) => (
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
              <p className="text-xs text-muted-foreground">from {(isDemoMode ? DEMO_leakRepairOpportunities : [] as typeof DEMO_leakRepairOpportunities).length} automation gaps across the customer journey</p>
            </CardContent>
          </Card>
          {(isDemoMode ? DEMO_leakRepairOpportunities : [] as typeof DEMO_leakRepairOpportunities).map((leak, i) => (
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

        {/* AUTOMATION QUALITY SCORING TAB */}
        <TabsContent value="quality" className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Automation Quality Scoring</p>
                <p className="text-xs text-muted-foreground">Every automation is scored across 7 dimensions: data completeness, template quality, consent readiness, edge-case coverage, failure history, advisor confidence, and business impact. Only automations scoring above 80 are recommended for L3+ trust.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Safe to Automate", value: (isDemoMode ? DEMO_AUTOMATION_QUALITY_SCORES : [] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Safe to automate").length, color: "text-emerald-400" },
              { label: "Review Recommended", value: (isDemoMode ? DEMO_AUTOMATION_QUALITY_SCORES : [] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Review recommended").length, color: "text-amber-400" },
              { label: "Needs Redesign", value: (isDemoMode ? DEMO_AUTOMATION_QUALITY_SCORES : [] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Needs redesign").length, color: "text-red-400" },
              { label: "Human Only", value: (isDemoMode ? DEMO_AUTOMATION_QUALITY_SCORES : [] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Human only").length, color: "text-purple-400" },
            ].map(m => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(isDemoMode ? DEMO_AUTOMATION_QUALITY_SCORES : [] as typeof DEMO_AUTOMATION_QUALITY_SCORES).map((q) => (
            <Card key={q.automation} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{q.automation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[10px] ${safetyColors[q.safetyLevel]}`}>{q.safetyLevel}</Badge>
                      <Badge variant="outline" className="text-[10px]">Trust: {q.trustLevel}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${q.score >= 80 ? "text-emerald-400" : q.score >= 60 ? "text-amber-400" : "text-red-400"}`}>{q.score}</p>
                    <p className="text-[10px] text-muted-foreground">quality score</p>
                  </div>
                </div>
                <Progress value={q.score} className="h-2 mb-3" />
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { label: "Data", value: q.dataCompleteness },
                    { label: "Template", value: q.templateQuality },
                    { label: "Consent", value: q.consentReadiness },
                    { label: "Edge Cases", value: q.edgeCoverage },
                    { label: "History", value: q.failureHistory },
                    { label: "Advisor", value: q.advisorConfidence },
                    { label: "Impact", value: q.businessImpact },
                  ].map(d => (
                    <div key={d.label} className="text-center p-1.5 rounded bg-background/50 border border-border/20">
                      <p className={`text-xs font-bold ${d.value >= 80 ? "text-emerald-400" : d.value >= 60 ? "text-amber-400" : "text-red-400"}`}>{d.value}%</p>
                      <p className="text-[8px] text-muted-foreground">{d.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AUTOMATION SHADOW BOARD TAB */}
        <TabsContent value="shadow" className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Glasses className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Automation Shadow Board</p>
                <p className="text-xs text-muted-foreground">Compare what automation would have done vs. what humans actually did. Identify where automations should be promoted, downgraded, or where human judgment outperforms.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "Automation Better", value: (isDemoMode ? DEMO_SHADOW_BOARD : [] as typeof DEMO_SHADOW_BOARD).filter(s => s.betterOutcome === "automation").length, color: "text-emerald-400" },
              { label: "Human Better", value: (isDemoMode ? DEMO_SHADOW_BOARD : [] as typeof DEMO_SHADOW_BOARD).filter(s => s.betterOutcome === "human").length, color: "text-purple-400" },
              { label: "Promotion Candidates", value: (isDemoMode ? DEMO_SHADOW_BOARD : [] as typeof DEMO_SHADOW_BOARD).filter(s => s.promotionRecommendation.includes("Promote")).length, color: "text-blue-400" },
            ].map(m => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(isDemoMode ? DEMO_SHADOW_BOARD : [] as typeof DEMO_SHADOW_BOARD).map((s, i) => (
            <Card key={i} className={`bg-card/50 ${s.betterOutcome === "automation" ? "border-emerald-500/20" : "border-purple-500/20"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.automation}</p>
                    <p className="text-[10px] text-muted-foreground">{s.period}</p>
                  </div>
                  <Badge className={`text-[10px] ${s.betterOutcome === "automation" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"}`}>
                    {s.betterOutcome === "automation" ? "🤖 Automation wins" : "👤 Human wins"}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">What automation would have done</p>
                    <p className="text-xs text-foreground">{s.autoWouldHaveDone}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide mb-1">What human actually did</p>
                    <p className="text-xs text-foreground">{s.humanActuallyDid}</p>
                  </div>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/20 mb-2">
                  <p className="text-[10px] text-muted-foreground"><span className="font-medium text-foreground">Divergence:</span> {s.divergence}</p>
                </div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-foreground flex items-start gap-1"><Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />{s.promotionRecommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PROMISE TRACKER TAB */}
        <TabsContent value="promises" className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <HandMetal className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Promise Tracker</p>
                <p className="text-xs text-muted-foreground">Track every promise made to a lead or client — follow-ups, quotes, onboarding, callbacks. Alerts and automations ensure trust fulfillment so nothing falls through the cracks.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Overdue", value: (isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).filter(p => p.status === "overdue").length, color: "text-red-400" },
              { label: "Due Today", value: (isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).filter(p => p.status === "due_today").length, color: "text-amber-400" },
              { label: "On Track", value: (isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).filter(p => p.status === "on_track").length, color: "text-blue-400" },
              { label: "Completed", value: (isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).filter(p => p.status === "completed").length, color: "text-emerald-400" },
            ].map(m => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(isDemoMode ? DEMO_PROMISES : [] as typeof DEMO_PROMISES).map((p) => (
            <Card key={p.id} className={`bg-card/50 ${p.status === "overdue" ? "border-red-500/30" : p.status === "due_today" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.contact}</p>
                    <p className="text-xs text-muted-foreground">{p.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${promiseStatusColors[p.status]}`}>{p.status.replace(/_/g, " ")}</Badge>
                    {p.daysOverdue > 0 && <span className="text-xs text-red-400 font-medium">{p.daysOverdue}d overdue</span>}
                  </div>
                </div>
                <p className="text-xs text-foreground mb-2">{p.promise}</p>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Promised: {p.promisedAt}</span>
                  <span>Deadline: {p.deadline}</span>
                  <span>Channel: <span className="text-foreground">{p.channel}</span></span>
                  {p.automation && <Badge variant="outline" className="text-[8px]">{p.automation}</Badge>}
                </div>
                {p.status !== "completed" && (
                  <div className="mt-2 pt-2 border-t border-border/20 flex gap-2">
                    <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-[10px] font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" />Fulfill Now
                    </button>
                    {!p.automation && (
                      <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px]">
                        Create Automation
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AUTOMATION OS MAP TAB */}
        <TabsContent value="osmap" className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Layers className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Automation Operating System — Interconnection Map</p>
                <p className="text-xs text-muted-foreground">How your business automations connect across CRM, Booking, Quotes, Campaigns, Retention, and Reputation with live data flow indicators.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(isDemoMode ? DEMO_AUTOMATION_OS_CONNECTIONS : [] as typeof DEMO_AUTOMATION_OS_CONNECTIONS).map((conn) => (
              <Card key={conn.from + conn.to} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">{conn.from}</Badge>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <Badge variant="outline" className="text-[10px] font-semibold">{conn.to}</Badge>
                  </div>
                  <p className="text-xs text-foreground mb-1">{conn.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className={conn.status === "active" ? "text-emerald-400" : conn.status === "partial" ? "text-amber-400" : "text-red-400"}>● {conn.status}</span>
                    <span>{conn.dataFlow}</span>
                    {conn.automationsCount > 0 && <span>{conn.automationsCount} automations</span>}
                  </div>
                  {conn.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {conn.triggers.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[8px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" />Governance Layers</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-3">
              {[
                { layer: "Policy Engine", desc: "Trust levels, escalation rules, fatigue guards", status: "Active", color: "border-emerald-500/30" },
                { layer: "Approval Chain", desc: "Human review for L2+, dual approval for L4 high-impact", status: "Active", color: "border-emerald-500/30" },
                { layer: "Receipt System", desc: "Every automated action generates immutable proof receipt", status: "Active", color: "border-emerald-500/30" },
                { layer: "Rollback Engine", desc: "Undo capability for L3/L4 actions within 24hr window", status: "Ready", color: "border-blue-500/30" },
              ].map((l) => (
                <div key={l.layer} className={`p-3 rounded-lg bg-background/50 border ${l.color}`}>
                  <p className="text-xs font-semibold text-foreground">{l.layer}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{l.desc}</p>
                  <Badge variant="outline" className="text-[8px]">{l.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}