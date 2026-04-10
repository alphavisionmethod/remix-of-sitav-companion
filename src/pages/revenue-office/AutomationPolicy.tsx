import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield, ShieldCheck, Lock, AlertTriangle, Users, Zap, Settings,
  Mail, Phone, FileText, DollarSign, Calendar, Brain, Clock, Target,
  CheckCircle, XCircle, Eye, ArrowRight, BarChart3, RefreshCw
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_humanVsAI, DEMO_policies, DEMO_trustLevels } from "@/lib/demo-data/revenue-office";

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

export default function AutomationPolicy() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("trust");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-400" />Automation Policy Center</h1>
        <p className="text-muted-foreground">Trust boundaries, safety rules, escalation policies, compliance checks, and audit trail</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Trust Policies", v: DEMO_trustLevels.length, c: "text-emerald-400" },
          { l: "Escalation Rules", v: ESCALATION_RULES.length, c: "text-amber-400" },
          { l: "Compliance Checks", v: COMPLIANCE_CHECKS.length, c: "text-blue-400" },
          { l: "Violations (7d)", v: DEMO_policies.reduce((a, p) => a + p.rules.reduce((s, r) => s + r.violations, 0), 0), c: "text-red-400" },
          { l: "Audit Events (48h)", v: AUDIT_LOG.length, c: "text-foreground" },
        ].map(m => (
          <Card key={m.l} className="bg-card/50 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="trust"><Shield className="h-3.5 w-3.5 mr-1" />Trust Levels</TabsTrigger>
          <TabsTrigger value="escalation"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Escalation Rules</TabsTrigger>
          <TabsTrigger value="compliance"><CheckCircle className="h-3.5 w-3.5 mr-1" />Compliance</TabsTrigger>
          <TabsTrigger value="boundary"><Brain className="h-3.5 w-3.5 mr-1" />Human vs AI</TabsTrigger>
          <TabsTrigger value="audit"><Eye className="h-3.5 w-3.5 mr-1" />Audit Log</TabsTrigger>
        </TabsList>

        {/* Trust Levels */}
        <TabsContent value="trust" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-4 gap-3">
            {DEMO_trustLevels.map((t) => (
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

          {DEMO_policies.map((p) => (
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
                  {c.status === "passing" ? <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
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
              {DEMO_humanVsAI.map((item) => (
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