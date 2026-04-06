import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, Lock, AlertTriangle, Users, Zap, Settings,
  Mail, Phone, FileText, DollarSign, Calendar, Brain, Clock, Target,
  CheckCircle, XCircle, Eye
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const policies = [
  { category: "Email & SMS Sending", icon: Mail, rules: [
    { rule: "Max 3 emails per contact per week", status: "active", violations: 0 },
    { rule: "Max 2 SMS per contact per week", status: "active", violations: 0 },
    { rule: "No SMS before 9am or after 8pm (contact local time)", status: "active", violations: 0 },
    { rule: "No email on weekends unless tagged 'time-sensitive'", status: "active", violations: 0 },
    { rule: "Opt-out contacts excluded from ALL automated sequences", status: "active", violations: 0 },
    { rule: "Fatigue detection: pause if >3 unopened emails in a row", status: "active", violations: 2 },
    { rule: "Unsubscribe link required in all marketing emails", status: "active", violations: 0 },
    { rule: "Deliverability below 95% triggers automatic pause + alert", status: "active", violations: 1 },
  ]},
  { category: "Lead & CRM Actions", icon: Users, rules: [
    { rule: "Auto-assignment only during business hours (9am-6pm)", status: "active", violations: 0 },
    { rule: "Lead stage changes require confirmation if deal value >$5,000", status: "active", violations: 0 },
    { rule: "Bulk operations (>50 contacts) require approval before execution", status: "active", violations: 0 },
    { rule: "VIP leads (>$5,000) always require human review before outreach", status: "active", violations: 0 },
    { rule: "Lead data enrichment limited to verified sources only", status: "active", violations: 0 },
    { rule: "Contact merging requires manual confirmation", status: "active", violations: 0 },
  ]},
  { category: "Financial Actions", icon: DollarSign, rules: [
    { rule: "Quotes >$10,000 require manual review before sending", status: "active", violations: 0 },
    { rule: "Discount >15% requires Decision Theater approval", status: "active", violations: 0 },
    { rule: "Auto-invoicing disabled (manual trigger only)", status: "active", violations: 0 },
    { rule: "Payment retry max 3 attempts with 24hr intervals", status: "active", violations: 0 },
    { rule: "Refund processing always requires human approval", status: "active", violations: 0 },
    { rule: "Custom pricing requires manager override", status: "active", violations: 0 },
  ]},
  { category: "Booking & Calendar", icon: Calendar, rules: [
    { rule: "No auto-booking outside defined availability windows", status: "active", violations: 0 },
    { rule: "No-show rescue limited to 1 SMS + 1 email per contact per event", status: "active", violations: 0 },
    { rule: "Double-booking prevention enforced across all calendars", status: "active", violations: 0 },
    { rule: "Appointment reminders: 24hr + 1hr before (configurable)", status: "active", violations: 0 },
    { rule: "Buffer time between appointments enforced (15 min default)", status: "active", violations: 0 },
  ]},
  { category: "Content & AI Generation", icon: Brain, rules: [
    { rule: "AI-generated emails require review before first use of new template", status: "active", violations: 0 },
    { rule: "AI tone must match brand voice settings (warm, professional)", status: "active", violations: 0 },
    { rule: "No AI-generated content for legal, financial, or health claims", status: "active", violations: 0 },
    { rule: "AI draft quality check: minimum confidence score 80% before auto-send", status: "active", violations: 0 },
    { rule: "Personalization tokens verified before send (no blank fields)", status: "active", violations: 1 },
  ]},
  { category: "Escalation & Safety", icon: Shield, rules: [
    { rule: "High-impact automations require simulation before activation", status: "active", violations: 0 },
    { rule: "Failed automation retries capped at 3 with exponential backoff", status: "active", violations: 0 },
    { rule: "Negative sentiment detected → pause automation, escalate to human", status: "active", violations: 0 },
    { rule: "All L4 automations generate detailed receipts and weekly summaries", status: "active", violations: 0 },
    { rule: "Emergency pause: any automation can be halted instantly by any team member", status: "active", violations: 0 },
    { rule: "Automation changes require changelog entry and reason", status: "active", violations: 0 },
    { rule: "Rollback available for all actions within 72 hours", status: "active", violations: 0 },
    { rule: "Over-firing detection: pause if >2x normal trigger volume in 1hr", status: "active", violations: 0 },
  ]},
];

const trustLevels = [
  { level: "L1 — Suggest Only", automations: 6, pct: 25, desc: "SITA observes and recommends — no automated actions taken. User decides everything.", icon: Eye, color: "border-purple-500/30" },
  { level: "L2 — Draft & Prepare", automations: 8, pct: 33, desc: "SITA drafts messages, prepares workflows, generates quotes. User reviews and approves before anything executes.", icon: FileText, color: "border-blue-500/30" },
  { level: "L3 — Act Under Rules", automations: 7, pct: 29, desc: "SITA executes within approved policy boundaries automatically. All actions logged with receipts.", icon: CheckCircle, color: "border-emerald-500/30" },
  { level: "L4 — Semi-Autonomous", automations: 3, pct: 13, desc: "Bounded commercial operations with mandatory receipts, weekly summaries, and human escalation for high-impact decisions.", icon: Zap, color: "border-amber-500/30" },
];

const humanVsAI = [
  { domain: "Lead outreach (cold)", recommendation: "Human only", reason: "Cold outreach should always be personal and carefully considered" },
  { domain: "Lead follow-up (warm)", recommendation: "AI drafts, human reviews", reason: "Speed matters but personalization quality must be high" },
  { domain: "Appointment reminders", recommendation: "Full automation", reason: "Standard messages, low risk, high value" },
  { domain: "No-show rescue", recommendation: "Auto-run under rules", reason: "Time-sensitive, standard process, SMS + email" },
  { domain: "Quote generation", recommendation: "AI prepares, human approves", reason: "Financial accuracy and client relationship require human eye" },
  { domain: "Quote follow-up", recommendation: "Auto-run under rules", reason: "Standard cadence, low risk" },
  { domain: "Onboarding sequences", recommendation: "Full automation", reason: "Structured process, tested content, critical timing" },
  { domain: "Churn intervention", recommendation: "AI suggests, human executes", reason: "Requires relationship judgment and personal touch" },
  { domain: "Review requests", recommendation: "Auto-run under rules", reason: "Timing is key, standard process" },
  { domain: "Pricing changes", recommendation: "Human only", reason: "Strategic decision with broad impact" },
  { domain: "Campaign launches", recommendation: "Decision Theater review", reason: "High impact, needs advisor input and simulation" },
  { domain: "Internal task creation", recommendation: "Full automation", reason: "Low risk, high efficiency gain" },
];

export default function AutomationPolicy() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-400" />Automation Policy Center</h1>
        <p className="text-muted-foreground">Trust boundaries, safety rules, human-AI controls, escalation policies, and compliance governance</p>
      </div>

      {/* Trust Level Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-emerald-400" />Trust Level Distribution</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          {trustLevels.map((t) => (
            <div key={t.level} className={`p-3 rounded-lg bg-background/50 border ${t.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <t.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">{t.level}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{t.desc}</p>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-[10px]">{t.automations} automations</Badge>
                <span className="text-xs text-muted-foreground">{t.pct}%</span>
              </div>
              <Progress value={t.pct} className="h-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Human vs AI Boundary */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-primary" />Human vs AI Boundary Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {humanVsAI.map((item) => (
            <div key={item.domain} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-xs text-foreground font-medium">{item.domain}</span>
                <span className="text-[10px] text-muted-foreground ml-3">{item.reason}</span>
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

      {/* Policy Rules by Category */}
      {policies.map((p) => (
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
                  {r.violations > 0 && <span className="text-[10px] text-amber-400">{r.violations} violation{r.violations > 1 ? "s" : ""}</span>}
                  <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
