import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  FlaskConical, Users, Mail, Clock, AlertTriangle, CheckCircle, GitBranch,
  ArrowRight, Shield, Brain, MessageSquare, Eye, Phone, DollarSign,
  ArrowDown, Zap, Target, XCircle, RefreshCw
} from "lucide-react";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const simulation = {
  name: "Stale Lead Recovery (48hr Advanced)",
  status: "ready_to_simulate",
  trustLevel: "L2 — Draft for review",
  audience: {
    total: 42,
    segments: [
      { name: "Cold leads (value <$500)", count: 12, channel: "SMS + email" },
      { name: "Warm leads no follow-up (>$500)", count: 18, channel: "Personalized email + callback" },
      { name: "Hot leads stalled (>$2,000)", count: 8, channel: "Email + immediate callback + manager alert" },
      { name: "VIP leads (>$5,000)", count: 4, channel: "Personal outreach + approval required" },
    ],
    exclusions: [
      { reason: "Opted out of email (3 contacts)", count: 3 },
      { reason: "Already in active deal stage (2 contacts)", count: 2 },
      { reason: "Received campaign email <24hrs ago (5 contacts — fatigue guard)", count: 5 },
    ],
    netAudience: 32,
  },
  steps: [
    { step: "Trigger: Lead stale >48hrs with no scheduled next step", affected: 42, expected: "42 leads enter flow", timing: "Immediate", risk: "none" },
    { step: "Exclusion check: opt-outs, active deals, fatigue guard", affected: 32, expected: "10 excluded by safety rules", timing: "Immediate", risk: "none" },
    { step: "Segment: Value + source + warmth score", affected: 32, expected: "4 segments created", timing: "Immediate", risk: "none" },
    { step: "Enrich: Pull CRM history, last activity, relationship warmth", affected: 32, expected: "32 records enriched", timing: "~2 seconds/record", risk: "low" },
    { step: "Draft emails: AI-personalized recovery email per segment", affected: 32, expected: "4 email variants generated", timing: "~10 seconds", risk: "low" },
    { step: "Approval gate: VIP leads ($5K+) require manual review", affected: 4, expected: "4 emails queued for your review", timing: "Paused until approved", risk: "none" },
    { step: "Send emails: Personalized recovery to 28 auto-approved leads", affected: 28, expected: "~26 delivered (93% deliverability), ~20 opened (71%)", timing: "Staggered over 2 hours", risk: "low" },
    { step: "Create callback tasks for warm/hot leads", affected: 22, expected: "22 tasks created for sales team", timing: "Immediate after send", risk: "none" },
    { step: "Wait 24 hours", affected: 28, expected: "Monitoring for responses", timing: "24hr delay", risk: "none" },
    { step: "Branch: Email opened?", affected: 28, expected: "~20 opened, ~8 not opened", timing: "Check at 24hr mark", risk: "none" },
    { step: "YES path: Send SMS follow-up with booking link", affected: 20, expected: "~19 delivered, ~13 read (68%)", timing: "Immediate", risk: "low" },
    { step: "NO path: Try different subject line + escalate to manager", affected: 8, expected: "8 re-attempted, 8 manager alerts", timing: "Immediate", risk: "medium" },
    { step: "Update pipeline: Move re-engaged leads to 'Active'", affected: "~15", expected: "Pipeline updated with receipt", timing: "After any positive response", risk: "none" },
  ],
  risks: [
    { risk: "3 leads have opted out of SMS — they'll be excluded automatically from SMS step", severity: "low", mitigation: "Built into exclusion rules" },
    { risk: "Email fatigue: 5 of these leads received a campaign email yesterday", severity: "medium", mitigation: "Fatigue guard will delay their entry by 24hrs" },
    { risk: "2 leads are in active deal stage — automation may conflict with sales rep actions", severity: "high", mitigation: "These contacts will be excluded; sales rep notified" },
    { risk: "4 VIP leads (>$5K) will receive AI-drafted email — quality must be verified", severity: "high", mitigation: "Approval gate requires your review before sending" },
    { risk: "SMS delivery to 3 contacts may fail (carrier issues flagged in past)", severity: "low", mitigation: "Fallback to email reminder if SMS fails" },
    { risk: "Manager escalation for 8 non-openers may overwhelm sales team", severity: "medium", mitigation: "Rate-limited to max 3 escalations per manager per day" },
  ],
  impact: {
    estimatedRecovery: "$12,400",
    expectedConversions: "8-14 leads re-engaged",
    expectedCallbacks: "6-10 calls booked",
    expectedRevenue: "$8,200 - $14,800",
    timeToComplete: "48 hours (full cycle)",
    confidenceRange: "72-85%",
  },
  edgeCases: [
    { case: "Lead responds to email before callback scheduled", handling: "Auto-cancel callback task, update status to 'Responded'" },
    { case: "Lead books appointment independently via website", handling: "Exit automation immediately, tag as 'self-rebooked'" },
    { case: "SMS delivery fails for a contact", handling: "Fallback to email reminder within 2 hours" },
    { case: "Lead replies with negative sentiment", handling: "Pause automation, flag for human review, notify sales owner" },
    { case: "Lead is already in another active automation", handling: "Priority check: current automation takes precedence if higher priority" },
    { case: "Sales rep manually contacts lead during automation", handling: "Detect manual activity via CRM log, pause automation, notify rep" },
    { case: "Email bounces (invalid address)", handling: "Mark contact for data cleanup, remove from sequence, create task" },
  ],
  policyCheck: {
    maxEmailsPerContact: { limit: 3, thisWeek: 1, status: "within_limit" },
    maxSMSPerContact: { limit: 2, thisWeek: 0, status: "within_limit" },
    businessHoursOnly: { enabled: true, status: "compliant" },
    consentVerified: { status: "all_contacts_consented" },
    fatigueProtection: { status: "5_contacts_delayed_24hrs" },
    approvalRequired: { status: "4_VIP_leads_require_approval" },
  },
};

export default function AutomationSimLab() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-purple-400" />Automation Simulation Lab
        </h1>
        <p className="text-muted-foreground">Preview who's affected, messages, timing, risks, edge cases, and policy compliance before activating</p>
      </div>

      <Card className="bg-card/50 border-primary/20 border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Simulating: <span className="text-primary">{simulation.name}</span></p>
              <p className="text-xs text-muted-foreground">Preview mode — no actions will be taken until you activate · Trust: {simulation.trustLevel}</p>
            </div>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">Simulation Ready</Badge>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="overview">Audience & Impact</TabsTrigger>
          <TabsTrigger value="steps">Steps ({simulation.steps.length})</TabsTrigger>
          <TabsTrigger value="risks">Risks ({simulation.risks.length})</TabsTrigger>
          <TabsTrigger value="edges">Edge Cases ({simulation.edgeCases.length})</TabsTrigger>
          <TabsTrigger value="policy">Policy Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Audience */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" />Audience Affected</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div><p className="text-2xl font-bold text-foreground">{simulation.audience.total}</p><p className="text-[10px] text-muted-foreground">Total matched</p></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div><p className="text-2xl font-bold text-amber-400">-{simulation.audience.total - simulation.audience.netAudience}</p><p className="text-[10px] text-muted-foreground">Excluded (safety)</p></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div><p className="text-2xl font-bold text-emerald-400">{simulation.audience.netAudience}</p><p className="text-[10px] text-muted-foreground">Net audience</p></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Segments:</p>
                {simulation.audience.segments.map((seg) => (
                  <div key={seg.name} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                    <span className="text-xs text-foreground">{seg.name}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">{seg.channel}</Badge>
                      <span className="text-xs font-medium text-foreground">{seg.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Exclusions (safety rules):</p>
                {simulation.audience.exclusions.map((ex) => (
                  <div key={ex.reason} className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3 w-3 text-amber-400" />{ex.reason}</div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-emerald-400" />Expected Impact</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              {Object.entries(simulation.impact).map(([key, value]) => (
                <div key={key} className="p-3 rounded bg-background/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm font-bold text-foreground">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-2">
          {simulation.steps.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm text-foreground">{s.step}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>Affected: <span className="text-foreground">{s.affected}</span></span>
                  <span>Expected: <span className="text-foreground">{s.expected}</span></span>
                  <span>Timing: {s.timing}</span>
                  {s.risk !== "none" && <Badge variant={s.risk === "high" ? "destructive" : "secondary"} className="text-[10px]">{s.risk} risk</Badge>}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-2">
          {simulation.risks.map((r, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-foreground">{r.risk}</p>
                  <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[10px] flex-shrink-0 ml-2">{r.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-400" />Mitigation: {r.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="edges" className="space-y-2">
          {simulation.edgeCases.map((e, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-3">
                <p className="text-sm text-foreground mb-1 font-medium">{e.case}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" />Handling: {e.handling}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="policy" className="space-y-2">
          {Object.entries(simulation.policyCheck).map(([key, value]) => (
            <Card key={key} className="bg-card/50 border-border/50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  {"limit" in value && <p className="text-xs text-muted-foreground">Limit: {String((value as Record<string, unknown>).limit)} · This week: {String((value as Record<string, unknown>).thisWeek)}</p>}
                </div>
                <Badge className={`text-[10px] ${String((value as Record<string, unknown>).status || "").includes("within") || String((value as Record<string, unknown>).status || "").includes("compliant") || String((value as Record<string, unknown>).status || "").includes("consented") ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{String((value as Record<string, unknown>).status || "").replace(/_/g, ' ')}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" />Approve & Activate</button>
        <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Edit Flow</button>
        <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Re-simulate with Changes</button>
        <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Export Simulation Report</button>
      </div>
    </motion.div>
  );
}
