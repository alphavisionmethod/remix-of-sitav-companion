import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Lock, AlertTriangle, Users, Zap, Settings } from "lucide-react";

const policies = [
  { category: "Email/SMS Sending", rules: [
    { rule: "Max 3 emails per contact per week", status: "active" },
    { rule: "No SMS before 9am or after 8pm (local time)", status: "active" },
    { rule: "Opt-out contacts excluded from all sequences", status: "active" },
    { rule: "Fatigue detection: pause if >3 unopened in row", status: "active" },
  ]},
  { category: "Lead & CRM Actions", rules: [
    { rule: "Auto-assignment only within business hours", status: "active" },
    { rule: "Lead stage changes require confirmation if deal value >$5,000", status: "active" },
    { rule: "Bulk operations (>50 contacts) require approval", status: "active" },
  ]},
  { category: "Financial Actions", rules: [
    { rule: "Quotes >$10,000 require manual review", status: "active" },
    { rule: "Discount >15% requires Decision Theater approval", status: "active" },
    { rule: "Auto-invoicing disabled (manual only)", status: "active" },
  ]},
  { category: "Booking & Calendar", rules: [
    { rule: "No auto-booking outside available hours", status: "active" },
    { rule: "No-show rescue limited to 1 attempt per contact", status: "active" },
    { rule: "Double-booking prevention enforced", status: "active" },
  ]},
  { category: "Escalation & Safety", rules: [
    { rule: "High-impact automations require simulation before activation", status: "active" },
    { rule: "Failed automation retries capped at 3", status: "active" },
    { rule: "Negative sentiment detected → pause automation, escalate to human", status: "active" },
    { rule: "All L4 automations generate receipts and weekly summaries", status: "active" },
  ]},
];

const trustLevels = [
  { level: "L1 — Suggest Only", automations: 6, desc: "SITA observes and recommends — no automated actions" },
  { level: "L2 — Draft & Prepare", automations: 8, desc: "SITA drafts content, user reviews before execution" },
  { level: "L3 — Act Under Rules", automations: 7, desc: "SITA executes within approved policy boundaries" },
  { level: "L4 — Semi-Autonomous", automations: 3, desc: "Bounded operations with mandatory receipts and escalation" },
];

export default function AutomationPolicy() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Policy Center</h1>
        <p className="text-muted-foreground">Trust boundaries, safety rules, escalation policies, and human-AI boundary controls</p>
      </div>

      {/* Trust Level Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-emerald-400" />Trust Level Distribution</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          {trustLevels.map((t) => (
            <div key={t.level} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <p className="text-xs font-semibold text-foreground mb-1">{t.level}</p>
              <p className="text-[11px] text-muted-foreground mb-2">{t.desc}</p>
              <Badge variant="secondary" className="text-[10px]">{t.automations} automations</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Policy Rules */}
      {policies.map((p) => (
        <Card key={p.category} className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" />{p.category}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {p.rules.map((r, i) => (
              <div key={i} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{r.rule}</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
