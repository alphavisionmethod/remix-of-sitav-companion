import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Play, Pause, AlertTriangle, CheckCircle, TrendingUp, Users, Mail, Phone, FileText, Star, RefreshCw, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

const automationStats = [
  { label: "Active Automations", value: "24", icon: Play, color: "text-emerald-400" },
  { label: "Paused", value: "3", icon: Pause, color: "text-amber-400" },
  { label: "Actions This Week", value: "847", icon: Zap, color: "text-blue-400" },
  { label: "Revenue Recovered", value: "$18,400", icon: TrendingUp, color: "text-purple-400" },
];

const activeAutomations = [
  { name: "Stale Lead Recovery", status: "active", triggers: 42, success: 78, category: "Lead Recovery", level: "Auto-run", icon: Users },
  { name: "No-Show Rescue", status: "active", triggers: 18, success: 61, category: "Booking", level: "Draft for review", icon: Phone },
  { name: "Post-Service Review Request", status: "active", triggers: 35, success: 84, category: "Reputation", level: "Auto-run", icon: Star },
  { name: "Quote Follow-up (5-day)", status: "active", triggers: 12, success: 67, category: "Sales", level: "Auto-run", icon: FileText },
  { name: "Onboarding Welcome Flow", status: "active", triggers: 28, success: 92, category: "Onboarding", level: "Auto-run", icon: Mail },
  { name: "Churn Prevention Check-in", status: "active", triggers: 8, success: 50, category: "Retention", level: "AI suggests", icon: RefreshCw },
];

const advisorRecommendations = [
  { advisor: "CRM Advisor", recommendation: "12 warm leads have no next step — create a follow-up automation", impact: "$8,200", confidence: 87 },
  { advisor: "Booking Advisor", recommendation: "No-show rate at 18% — add SMS reminder 1hr before appointments", impact: "+22% show rate", confidence: 82 },
  { advisor: "Retention Advisor", recommendation: "34 clients inactive 60+ days — launch reactivation sequence", impact: "$12,400", confidence: 65 },
  { advisor: "Revenue Ops Advisor", recommendation: "Quote reminders not sent after 3 days — enable quote expiry flow", impact: "$4,800", confidence: 91 },
];

const issues = [
  { automation: "Nurture Sequence B", issue: "3 emails bouncing — deliverability at 94%", severity: "medium" },
  { automation: "Lead Assignment", issue: "Owner not assigned for 5 leads — rule mismatch", severity: "high" },
  { automation: "Upsell After Delivery", issue: "Low engagement — 8% open rate vs 24% benchmark", severity: "medium" },
];

const levelColors: Record<string, string> = {
  "Auto-run": "bg-emerald-500/10 text-emerald-400",
  "Draft for review": "bg-blue-500/10 text-blue-400",
  "AI suggests": "bg-purple-500/10 text-purple-400",
};

export default function AutomationOffice() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Office</h1>
        <p className="text-muted-foreground">Commercial automation command — build, simulate, approve, monitor, and repair automations with advisor intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {automationStats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-foreground">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advisor Recommendations */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="h-5 w-5 text-amber-400" />Advisor Automation Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {advisorRecommendations.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">{r.advisor}</Badge>
                  <span className="text-xs text-muted-foreground">{r.confidence}% confidence</span>
                </div>
                <p className="text-sm text-foreground">{r.recommendation}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs text-emerald-400 font-medium">{r.impact}</span>
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Generate</button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Automations */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Play className="h-5 w-5 text-emerald-400" />Active Automations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {activeAutomations.map((a) => (
            <div key={a.name} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{a.name}</span>
                  <Badge className={`${levelColors[a.level]} text-[10px]`}>{a.level}</Badge>
                </div>
                <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Triggered: {a.triggers}x this week</span>
                <span>Success rate: <span className={a.success >= 70 ? "text-emerald-400" : "text-amber-400"}>{a.success}%</span></span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Issues */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-amber-400" />Automation Issues</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {issues.map((issue, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{issue.automation}</p>
                <p className="text-xs text-muted-foreground">{issue.issue}</p>
              </div>
              <Badge variant={issue.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{issue.severity}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Automation Levels */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-blue-400" />Automation Trust Levels</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          {[
            { level: "L1 — Suggest Only", desc: "SITA detects and suggests actions", count: 6, color: "border-purple-500/30" },
            { level: "L2 — Draft & Prepare", desc: "SITA drafts, user reviews before sending", count: 8, color: "border-blue-500/30" },
            { level: "L3 — Act Under Rules", desc: "SITA executes within approved policies", count: 7, color: "border-emerald-500/30" },
            { level: "L4 — Semi-Autonomous", desc: "Bounded operations with escalation", count: 3, color: "border-amber-500/30" },
          ].map((l) => (
            <div key={l.level} className={`p-3 rounded-lg bg-background/50 border ${l.color}`}>
              <p className="text-xs font-semibold text-foreground mb-1">{l.level}</p>
              <p className="text-[11px] text-muted-foreground mb-2">{l.desc}</p>
              <p className="text-xs text-muted-foreground">{l.count} automations</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
