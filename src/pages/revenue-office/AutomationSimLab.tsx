import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Users, Mail, Clock, AlertTriangle, CheckCircle, GitBranch, ArrowRight } from "lucide-react";

const simulation = {
  name: "Stale Lead Recovery",
  audience: { total: 42, segments: ["Cold leads (18)", "Warm leads no follow-up (24)"] },
  steps: [
    { step: "Trigger: Lead stale >48hrs", affected: 42, expected: "42 leads enter flow" },
    { step: "Condition: Value > $500", yesBranch: 24, noBranch: 18, expected: "24 high-value, 18 standard" },
    { step: "Send recovery email (high-value)", affected: 24, expected: "~22 delivered, ~18 opened (75%)" },
    { step: "Wait 2 hours", affected: 24, expected: "Timing optimized for business hours" },
    { step: "Assign callback task", affected: 24, expected: "Tasks created for sales team" },
    { step: "Send SMS (standard)", affected: 18, expected: "~17 delivered, ~12 read (67%)" },
  ],
  risks: [
    { risk: "3 leads have opted out of SMS — they'll be excluded automatically", severity: "low" },
    { risk: "Email fatigue: 8 of these leads received a campaign email yesterday", severity: "medium" },
    { risk: "2 leads are in active deal stage — automation may conflict with sales rep actions", severity: "high" },
  ],
  impact: { estimatedRecovery: "$8,200", expectedConversions: "6-10 leads", timeToComplete: "48hrs" },
  edgeCases: [
    "Lead responds to email before callback — task should auto-cancel",
    "Lead books appointment independently — should exit automation",
    "SMS delivery fails — fallback to email reminder",
  ],
};

export default function AutomationSimLab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Simulation Lab</h1>
        <p className="text-muted-foreground">Preview who's affected, messages, timing, risks, and edge cases before activating</p>
      </div>

      <Card className="bg-card/50 border-primary/20 border">
        <CardContent className="p-4 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-purple-400" />
          <div>
            <p className="text-sm font-medium text-foreground">Simulating: <span className="text-primary">{simulation.name}</span></p>
            <p className="text-xs text-muted-foreground">Preview mode — no actions will be taken until you activate</p>
          </div>
        </CardContent>
      </Card>

      {/* Audience Preview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" />Audience Affected</CardTitle></CardHeader>
        <CardContent>
          <p className="text-lg font-bold text-foreground mb-2">{simulation.audience.total} contacts</p>
          <div className="flex gap-2">
            {simulation.audience.segments.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step Preview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4 text-emerald-400" />Step-by-Step Preview</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {simulation.steps.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-sm text-foreground">{s.step}</span>
              </div>
              <span className="text-xs text-muted-foreground">{s.expected}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risks */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" />Risks & Warnings</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {simulation.risks.map((r, i) => (
            <div key={i} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
              <span className="text-xs text-foreground">{r.risk}</span>
              <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edge Cases */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Edge Cases Detected</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {simulation.edgeCases.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-foreground"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />{e}</div>
          ))}
        </CardContent>
      </Card>

      {/* Impact Estimate */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Estimated Impact</p>
          <div className="flex gap-6 text-sm">
            <span className="text-muted-foreground">Recovery: <span className="text-emerald-400 font-medium">{simulation.impact.estimatedRecovery}</span></span>
            <span className="text-muted-foreground">Conversions: <span className="text-foreground font-medium">{simulation.impact.expectedConversions}</span></span>
            <span className="text-muted-foreground">Duration: <span className="text-foreground font-medium">{simulation.impact.timeToComplete}</span></span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" />Approve & Activate</button>
        <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Edit Flow</button>
        <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Re-simulate</button>
      </div>
    </motion.div>
  );
}
