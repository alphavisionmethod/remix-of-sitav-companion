import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Shield, ShieldCheck, Lock, AlertTriangle, Users, Zap, Settings,
  Mail, Phone, FileText, DollarSign, Calendar, Brain, Clock, Target,
  CheckCircle, XCircle, Eye, ArrowRight, BarChart3, RefreshCw,
  BookOpen, ShieldOff, Pause, Undo2, Ban, HandMetal
} from "lucide-react";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { DEMO_humanVsAI, DEMO_policies, DEMO_trustLevels,
import { Typography } from "@/components/sita/Typography";
  DEMO_COMMERCIAL_CONSTITUTION, DEMO_NO_GUESS_RULES,
  DEMO_PAUSE_ROLLBACK, DEMO_HANDOFF_SIGNALS
} from "@/data/seed/revenue-office";


const ESCALATION_RULES = [
  { trigger: "Automation failure rate > 20%", action: "Pause automation, notify owner, create incident", severity: "critical" as const, lastTriggered: "Never", cooldown: "1hr" },
  { trigger: "Contact receives > 5 messages in 48hrs", action: "Activate fatigue circuit breaker, suppress non-critical", severity: "high" as const, lastTriggered: "3 days ago", cooldown: "48hr" },
  { trigger: "Financial action > $1,000", action: "Require human approval before execution", severity: "high" as const, lastTriggered: "Yesterday", cooldown: "None" },
  { trigger: "Bulk action affecting > 50 contacts", action: "Queue for review with Decision Theater preview", severity: "medium" as const, lastTriggered: "1 week ago", cooldown: "None" },
  { trigger: "Advisor confidence < 60%", action: "Flag recommendation as uncertain, suggest alternatives", severity: "low" as const, lastTriggered: "2 days ago", cooldown: "None" },
  { trigger: "New automation — first 48 hours", action: "Shadow mode — log actions but don't execute", severity: "medium" as const, lastTriggered: "Active now", cooldown: "48hr" },
];

const COMPLIANCE_CHECKS = [
  { check: "GDPR consent verification", status: "passing" as const, lastAudit: "Apr 8", coverage: 100, notes: "All contact forms include consent checkbox" },
  { check: "Unsubscribe link presence", status: "passing" as const, lastAudit: "Apr 8", coverage: 100, notes: "All email templates verified" },
  { check: "Data retention policy", status: "passing" as const, lastAudit: "Apr 5", coverage: 95, notes: "5% of legacy contacts missing retention date" },
  { check: "Opt-out honoring", status: "passing" as const, lastAudit: "Apr 8", coverage: 100, notes: "Instant suppression on unsubscribe" },
  { check: "Contact frequency limits", status: "warning" as const, lastAudit: "Apr 7", coverage: 88, notes: "3 contacts exceeded weekly limit" },
  { check: "PII handling in automations", status: "passing" as const, lastAudit: "Apr 6", coverage: 100, notes: "No PII exposed in logs" },
];

const AUDIT_LOG = [
  { time: "2hrs ago", user: "System", action: "Fatigue circuit breaker activated for Sarah Chen", category: "safety" },
  { time: "4hrs ago", user: "AI Advisor", action: "Recommended pausing Re-engagement Q2 — low ROI", category: "recommendation" },
  { time: "6hrs ago", user: "Admin", action: "Approved bulk send: Summer Accelerator to 340 contacts", category: "approval" },
  { time: "Yesterday", user: "System", action: "Quote > $5K auto-escalated for human review", category: "escalation" },
  { time: "Yesterday", user: "AI Advisor", action: "Auto-generated follow-up draft reviewed and sent", category: "execution" },
  { time: "2 days ago", user: "Admin", action: "Updated trust level: Booking confirmations → Level 3 (Auto-run)", category: "policy change" },
];

const constitutionCategoryColors: Record<string, string> = {
  "Contact Frequency": "border-blue-500/30",
  "Financial Controls": "border-amber-500/30",
  "VIP Protection": "border-purple-500/30",
  "Content Governance": "border-emerald-500/30",
  "Sentiment Protection": "border-red-500/30",
  "Compliance": "border-cyan-500/30",
};

const pauseStatusColors: Record<string, string> = {
  paused: "bg-amber-500/10 text-amber-400",
  quarantined: "bg-red-500/10 text-red-400",
  rollback_available: "bg-blue-500/10 text-blue-400",
  segment_disabled: "bg-purple-500/10 text-purple-400",
};

const handoffSeverityColors: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/5",
  high: "border-amber-500/30 bg-amber-500/5",
  medium: "border-blue-500/30 bg-blue-500/5",
};

export default function AutomationPolicy() {
  const [tab, setTab] = useState("trust");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div>
        <Typography role="appTitle" className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-400" />Automation Policy Center</Typography>
        <p className="text-muted-foreground">Trust boundaries, constitution, no-guess mode, pause/rollback, human handoff, safety rules, and audit trail</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Trust Policies", v: ([] as typeof DEMO_trustLevels).length, c: "text-emerald-400" },
          { l: "Constitution Rules", v: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).length, c: "text-blue-400" },
          { l: "No-Guess Rules", v: ([] as typeof DEMO_NO_GUESS_RULES).filter(r => r.enabled).length, c: "text-purple-400" },
          { l: "Paused/Quarantined", v: ([] as typeof DEMO_PAUSE_ROLLBACK).length, c: "text-amber-400" },
          { l: "Handoff Signals", v: ([] as typeof DEMO_HANDOFF_SIGNALS).length, c: "text-red-400" },
        ].map(m => (
          <Card key={m.l} className="bg-card/50 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="trust"><Shield className="h-3.5 w-3.5 mr-1" />Trust Levels</TabsTrigger>
          <TabsTrigger value="constitution"><BookOpen className="h-3.5 w-3.5 mr-1" />Constitution</TabsTrigger>
          <TabsTrigger value="noguess"><ShieldOff className="h-3.5 w-3.5 mr-1" />No-Guess Mode</TabsTrigger>
          <TabsTrigger value="pause"><Pause className="h-3.5 w-3.5 mr-1" />Pause / Rollback</TabsTrigger>
          <TabsTrigger value="handoff"><HandMetal className="h-3.5 w-3.5 mr-1" />Human Handoff</TabsTrigger>
          <TabsTrigger value="escalation"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Escalation</TabsTrigger>
          <TabsTrigger value="compliance"><CheckCircle className="h-3.5 w-3.5 mr-1" />Compliance</TabsTrigger>
          <TabsTrigger value="boundary"><Brain className="h-3.5 w-3.5 mr-1" />Human vs AI</TabsTrigger>
          <TabsTrigger value="audit"><Eye className="h-3.5 w-3.5 mr-1" />Audit Log</TabsTrigger>
        </TabsList>

        {/* Trust Levels */}
        <TabsContent value="trust" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-4 gap-3">
            {([] as typeof DEMO_trustLevels).map((t) => (
              <Card key={t.level} className={`bg-card/50 ${t.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <t.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">{t.level}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px]">{t.automations} automations</Badge>
                    <span className="text-xs text-muted-foreground">{t.pct}%</span>
                  </div>
                  <Progress value={t.pct} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>

          {([] as typeof DEMO_policies).map((p) => (
            <Card key={p.category} className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><p.icon className="h-4 w-4 text-blue-400" />{p.category}</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {p.rules.map((r, i) => (
                  <div key={i} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-foreground">{r.rule}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.violations > 0 && <span className="text-[10px] text-amber-400">{r.violations} violations</span>}
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{r.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* COMMERCIAL CONSTITUTION */}
        <TabsContent value="constitution" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Commercial Constitution</p>
                <p className="text-xs text-muted-foreground">Hard and soft rules that govern all automated commercial activity. These rules cannot be overridden by automations or advisors — they represent your business's non-negotiable operating principles.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "Hard Rules", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).filter(r => r.severity === "hard").length, color: "text-red-400" },
              { label: "Soft Rules", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).filter(r => r.severity === "soft").length, color: "text-amber-400" },
              { label: "Violations (7d)", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).reduce((a, r) => a + r.violations7d, 0), color: "text-red-400" },
            ].map(m => (
              <Card key={m.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {([] as typeof DEMO_COMMERCIAL_CONSTITUTION).map((r) => (
            <Card key={r.id} className={`bg-card/50 ${constitutionCategoryColors[r.category] || "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className={`h-4 w-4 ${r.severity === "hard" ? "text-red-400" : "text-amber-400"}`} />
                    <span className="text-sm font-medium text-foreground">{r.rule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                    <Badge className={`text-[10px] ${r.severity === "hard" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{r.severity}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className={r.enforced ? "text-emerald-400" : "text-red-400"}>
                    {r.enforced ? "✓ Enforced" : "✗ Not enforced"}
                  </span>
                  <span>Violations (7d): <span className={r.violations7d > 0 ? "text-red-400 font-medium" : "text-foreground"}>{r.violations7d}</span></span>
                  {r.lastViolation && <span className="text-amber-400">Last: {r.lastViolation}</span>}
                </div>
              </CardContent>
            </Card>
          ))}

          <button className="w-full p-3 rounded-lg border border-dashed border-primary/30 text-primary text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />Add Constitution Rule
          </button>
        </TabsContent>

        {/* NO-GUESS MODE */}
        <TabsContent value="noguess" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldOff className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">No-Guess Mode</p>
                <p className="text-xs text-muted-foreground">When enabled, the system will never infer, assume, or guess missing data. Every automated action requires verified facts. This prevents the most common sources of AI errors in business operations.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Blocked Actions (last 7 days): <span className="text-amber-400">{([] as typeof DEMO_NO_GUESS_RULES).reduce((a, r) => a + r.blockedActions7d, 0)}</span></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as typeof DEMO_NO_GUESS_RULES).map((r) => (
                <div key={r.id} className={`p-4 rounded-lg border ${r.enabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/10 border-border/30"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <Shield className={`h-4 w-4 flex-shrink-0 ${r.enabled ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.rule}</p>
                        <Badge variant="outline" className="text-[9px] mt-1">{r.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {r.blockedActions7d > 0 && (
                        <span className="text-[10px] text-amber-400">{r.blockedActions7d} blocked</span>
                      )}
                      <Switch checked={r.enabled} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAUSE / ROLLBACK / CONTAINMENT */}
        <TabsContent value="pause" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Pause className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Pause / Rollback / Containment Center</p>
                <p className="text-xs text-muted-foreground">Instantly pause, rollback, quarantine, or suppress automations. Every containment action is logged and receipted.</p>
              </div>
            </CardContent>
          </Card>

          {([] as typeof DEMO_PAUSE_ROLLBACK).length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-foreground">All automations are running normally</p>
              </CardContent>
            </Card>
          ) : (
            ([] as typeof DEMO_PAUSE_ROLLBACK).map((p) => (
              <Card key={p.automation} className={`bg-card/50 ${p.status === "quarantined" ? "border-red-500/30" : p.status === "rollback_available" ? "border-blue-500/30" : "border-amber-500/30"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.automation}</p>
                      <p className="text-[10px] text-muted-foreground">Paused by: {p.pausedBy} · {p.pausedAt}</p>
                    </div>
                    <Badge className={`text-[10px] ${pauseStatusColors[p.status]}`}>{p.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-xs text-foreground mb-3">{p.reason}</p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
                    <span>Affected contacts: <span className="text-foreground">{p.affectedContacts}</span></span>
                    <span>Pending actions: <span className={p.pendingActions > 0 ? "text-amber-400" : "text-foreground"}>{p.pendingActions}</span></span>
                  </div>
                  <div className="flex gap-2">
                    {p.canResume && (
                      <button className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />Resume
                      </button>
                    )}
                    {p.canRollback && (
                      <button className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium flex items-center gap-1">
                        <Undo2 className="h-3 w-3" />Rollback
                      </button>
                    )}
                    <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px]">View Details</button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* HUMAN HANDOFF DETECTION */}
        <TabsContent value="handoff" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <HandMetal className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Human Handoff Detection</p>
                <p className="text-xs text-muted-foreground">The smartest automation knows when to stop automating. These signals detect when a human should take over — angry clients, high-value opportunities, complex requests, compliance sensitivity, and ambiguous intent.</p>
              </div>
            </CardContent>
          </Card>

          {([] as typeof DEMO_HANDOFF_SIGNALS).map((h, i) => (
            <Card key={i} className={`bg-card/50 ${handoffSeverityColors[h.severity]}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.contact}</p>
                    <p className="text-xs text-muted-foreground">{h.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{h.severity}</Badge>
                    <span className="text-[10px] text-muted-foreground">{h.detectedAt}</span>
                  </div>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/20 mb-2">
                  <p className="text-xs text-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    {h.signal}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-[10px] text-muted-foreground mb-3">
                  <span>Automation: <span className="text-foreground">{h.currentAutomation}</span></span>
                  <span>Confidence: <span className="text-foreground">{h.confidence}%</span></span>
                </div>
                <p className="text-xs text-muted-foreground mb-1"><span className="font-medium text-foreground">Why:</span> {h.reason}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                  <p className="text-xs text-primary font-medium">{h.recommendedAction}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-[10px] font-medium">Route to Human</button>
                    <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px]">Override — Continue Auto</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Escalation Rules */}
        <TabsContent value="escalation" className="space-y-3 mt-4">
          {ESCALATION_RULES.map((e, i) => (
            <Card key={i} className={`bg-card/50 ${e.severity === "critical" ? "border-red-500/30" : e.severity === "high" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${e.severity === "critical" ? "text-red-400" : e.severity === "high" ? "text-amber-400" : "text-blue-400"}`} />
                    <span className="text-sm font-medium text-foreground">{e.trigger}</span>
                  </div>
                  <Badge variant={e.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{e.severity}</Badge>
                </div>
                <p className="text-xs text-foreground mb-2">{e.action}</p>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Last triggered: {e.lastTriggered}</span>
                  <span>Cooldown: {e.cooldown}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-3 mt-4">
          {COMPLIANCE_CHECKS.map((c, i) => (
            <Card key={i} className={`bg-card/50 ${c.status === "warning" ? "border-amber-500/30" : "border-border/50"}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {c.status === "passing" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.check}</p>
                    <p className="text-[10px] text-muted-foreground">{c.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground">{c.coverage}%</p>
                    <p className="text-[10px] text-muted-foreground">coverage</p>
                  </div>
                  <Badge className={`text-[10px] ${c.status === "passing" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{c.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Human vs AI */}
        <TabsContent value="boundary" className="space-y-3 mt-4">
          <Card className="bg-card/50 border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-primary" />Human vs AI Boundary Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {([] as typeof DEMO_humanVsAI).map((item) => (
                <div key={item.domain} className="p-3 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm text-foreground font-medium">{item.domain}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                  </div>
                  <Badge className={`text-[10px] ${
                    item.recommendation.includes("Human only") ? "bg-purple-500/10 text-purple-400" :
                    item.recommendation.includes("Full automation") ? "bg-emerald-500/10 text-emerald-400" :
                    item.recommendation.includes("Auto-run") ? "bg-blue-500/10 text-blue-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>{item.recommendation}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-2 mt-4">
          {AUDIT_LOG.map((entry, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    entry.category === "safety" ? "bg-red-400" :
                    entry.category === "escalation" ? "bg-amber-400" :
                    entry.category === "approval" ? "bg-emerald-400" :
                    entry.category === "policy change" ? "bg-purple-400" :
                    "bg-blue-400"
                  }`} />
                  <div>
                    <p className="text-xs text-foreground">{entry.action}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.user} · {entry.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] capitalize">{entry.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}