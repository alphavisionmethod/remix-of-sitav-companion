import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Workflow, Plus, Zap, GitBranch, Clock, Users, Mail, MessageSquare, CheckCircle,
  AlertTriangle, ArrowDown, Settings, Phone, FileText, Shield, Star,
  UserPlus, Heart, Target, Eye, Play, Pause, RefreshCw, Brain, ShieldCheck,
  Package, Send, ArrowRight, Layers, DollarSign, ChevronDown, Activity, Calendar
} from "lucide-react";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const sampleNodes = [
  { id: 1, type: "trigger", label: "Lead enters 'Stale' status (>48hrs no contact)", icon: Zap, color: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  { id: 2, type: "condition", label: "Lead value > $500 AND source = organic/referral?", icon: GitBranch, color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { id: 3, type: "action", label: "Enrich lead: pull CRM history, last activity, relationship warmth", icon: Users, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 4, type: "delay", label: "Wait 2 hours (respect business hours)", icon: Clock, color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
  { id: 5, type: "action", label: "Draft personalized recovery email using AI (tone: warm, professional)", icon: Mail, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 6, type: "approval", label: "Require review if lead value > $2,000", icon: ShieldCheck, color: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  { id: 7, type: "action", label: "Send recovery email", icon: Send, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 8, type: "action", label: "Create callback task for sales owner", icon: Phone, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 9, type: "delay", label: "Wait 24 hours", icon: Clock, color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
  { id: 10, type: "condition", label: "Email opened within 24hrs?", icon: GitBranch, color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { id: 11, type: "action", label: "YES: Send SMS follow-up with booking link", icon: MessageSquare, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 12, type: "action", label: "NO: Try different subject line + escalate to manager", icon: AlertTriangle, color: "bg-red-500/10 border-red-500/30 text-red-400" },
  { id: 13, type: "stop", label: "Update pipeline stage → 'Re-engaged' + generate receipt", icon: CheckCircle, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
];

const nodeTypes = [
  { type: "Triggers", icon: Zap, items: [
    "Form submitted", "Lead stage changed", "Appointment booked", "Appointment completed",
    "Quote sent", "Quote viewed", "Quote accepted", "Payment received", "Payment failed",
    "Tag added/removed", "Inactivity detected (N days)", "Review submitted",
    "Email opened/clicked", "SMS replied", "Pipeline stage changed",
    "Customer health changed", "Churn risk detected", "Deal won/lost",
    "Onboarding milestone reached", "Service delivered", "Subscription renewed/cancelled",
  ]},
  { type: "Conditions", icon: GitBranch, items: [
    "Lead value threshold", "Segment membership", "Email engagement level",
    "Time since last contact", "Appointment outcome", "Pipeline stage",
    "Customer lifetime value", "Relationship warmth score", "Source/channel",
    "Product/service purchased", "Consent/opt-in status", "Business hours check",
    "Automation fatigue check", "A/B split (50/50, 70/30, etc.)",
  ]},
  { type: "Actions", icon: Zap, items: [
    "Send email (template/AI-generated)", "Send SMS", "Create task", "Update CRM record",
    "Move pipeline stage", "Assign owner", "Generate quote/proposal",
    "Request review", "Add/remove tag", "Add to campaign/sequence",
    "Remove from campaign/sequence", "Create booking link", "Schedule appointment",
    "Generate PDF proposal", "Log communication", "Update customer health",
    "Create internal note", "Trigger webhook", "Send Slack/Teams notification",
  ]},
  { type: "Controls", icon: Settings, items: [
    "Wait/Delay (minutes/hours/days)", "Wait until (specific time/day)",
    "Branch (if/else)", "A/B split test", "Multi-path branch",
    "Stop condition", "Escalate to human", "Require approval",
    "Retry on failure (max N)", "Fallback path", "Loop (repeat N times)",
    "Rate limit (max N per contact per period)", "Fatigue guard",
  ]},
];

const GENERATE_TEMPLATES = [
  { label: "Lead Recovery (48hr stale)", icon: Users, desc: "Detect stale leads → enrich → personalized outreach → escalate", domain: "Lead Recovery" },
  { label: "No-Show Rescue + Rebook", icon: Calendar, desc: "Missed appointment → rescue SMS → rebook link → follow-up call task", domain: "Booking" },
  { label: "Quote Follow-Up (3/5/7)", icon: FileText, desc: "Quote sent → view tracking → reminder cadence → expiry alert → human escalate", domain: "Quotes" },
  { label: "Post-Call Follow-Up", icon: Phone, desc: "Call completed → log outcome → draft follow-up → send quote/booking → receipt", domain: "Calling" },
  { label: "Churn Prevention Check-In", icon: Heart, desc: "Health score drop → outreach → offer retention deal → escalate if no response", domain: "Retention" },
  { label: "Review Request (Happy Client)", icon: Star, desc: "Service completed → satisfaction check → request review → thank → harvest testimonial", domain: "Reputation" },
  { label: "Onboarding Welcome (7-step)", icon: UserPlus, desc: "New client → welcome email → intake form → kickoff booking → milestone tracking", domain: "Onboarding" },
  { label: "Reactivation Campaign (90-day)", icon: RefreshCw, desc: "Inactive 90d → segment → personalized reactivation → special offer → follow-up", domain: "Retention" },
  { label: "Upsell After Delivery", icon: Package, desc: "Service delivered → wait period → suggest upgrade → draft proposal → booking link", domain: "Offers/Upsells" },
  { label: "Revenue Leak Auto-Repair", icon: AlertTriangle, desc: "Leak detected → classify → draft fix workflow → simulate → approve → deploy → monitor", domain: "Leak Repair" },
];

export default function AutomationBuilder() {
  const [trustLevel, setTrustLevel] = useState("draft_review");
  const [showGenerate, setShowGenerate] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />Automation Builder
          </h1>
          <p className="text-muted-foreground">Visual workflow editor — triggers, conditions, actions, timing, approvals, escalations, and branching</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Load Template</button>
          <div className="relative">
            <button onClick={() => setShowGenerate(!showGenerate)} className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />Generate from Advisor<ChevronDown className="h-3 w-3" />
            </button>
            {showGenerate && (
              <div className="absolute right-0 top-full mt-1 w-96 bg-card border border-border/50 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
                <div className="p-3 border-b border-border/30">
                  <p className="text-xs font-semibold text-foreground">Generate Automation from Template</p>
                  <p className="text-[10px] text-muted-foreground">Pre-built flows recommended by advisors — click to generate a full workflow</p>
                </div>
                {GENERATE_TEMPLATES.map((t) => (
                  <button key={t.label} onClick={() => setShowGenerate(false)} className="w-full p-3 text-left hover:bg-primary/5 transition-colors border-b border-border/10 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <t.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs font-medium text-foreground">{t.label}</span>
                      <Badge variant="outline" className="text-[8px] ml-auto">{t.domain}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-5">{t.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />New Automation</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-blue-400" />Node Palette</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
              {nodeTypes.map((nt) => (
                <div key={nt.type}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><nt.icon className="h-3 w-3" />{nt.type}</p>
                  <div className="flex flex-wrap gap-1">
                    {nt.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" />Human-AI Boundary Control</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: "human_only", label: "Human only", desc: "No automated actions — manual execution" },
                { value: "suggest", label: "AI suggests, user does", desc: "SITA recommends, you decide" },
                { value: "draft_review", label: "Draft for review", desc: "SITA drafts, you approve before sending" },
                { value: "prepare_approve", label: "AI prepares, human approves", desc: "Full prep including timing, you authorize" },
                { value: "auto_rules", label: "Auto-run under rules", desc: "Executes within your policy boundaries" },
                { value: "escalate_high", label: "Escalate before high-impact", desc: "Auto-runs but pauses for approval on high-value actions" },
              ].map((level) => (
                <label key={level.value} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${trustLevel === level.value ? "bg-primary/5 border border-primary/20" : "hover:bg-background/50"}`}>
                  <input type="radio" name="trust" value={level.value} checked={trustLevel === level.value} onChange={() => setTrustLevel(level.value)} className="accent-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{level.label}</p>
                    <p className="text-[10px] text-muted-foreground">{level.desc}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Automation Settings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Max actions per contact per day</p>
                <input type="number" defaultValue={3} className="w-full p-2 rounded bg-background border border-border/50 text-sm text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fatigue protection</p>
                <select className="w-full p-2 rounded bg-background border border-border/50 text-sm text-foreground">
                  <option>Pause after 3 unopened messages</option>
                  <option>Pause after 5 unopened messages</option>
                  <option>No fatigue protection</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Business hours only</p>
                <select className="w-full p-2 rounded bg-background border border-border/50 text-sm text-foreground">
                  <option>Yes — 9am to 6pm local time</option>
                  <option>Yes — 8am to 8pm local time</option>
                  <option>No — send anytime</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Retry policy</p>
                <select className="w-full p-2 rounded bg-background border border-border/50 text-sm text-foreground">
                  <option>Retry up to 3 times with 1hr delay</option>
                  <option>Retry once after 30 min</option>
                  <option>No retries — fail silently</option>
                  <option>No retries — escalate to human</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center + Right: Visual Flow */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Workflow className="h-4 w-4 text-blue-400" />Stale Lead Recovery Flow — Advanced</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                  <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">{sampleNodes.length} nodes</Badge>
                  <Badge className="bg-purple-500/10 text-purple-400 text-[10px]">Trust: L2</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-2">
                {sampleNodes.map((node, i) => (
                  <div key={node.id}>
                    <div className={`p-3 rounded-lg border ${node.color} flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity group`}>
                      <node.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{node.label}</p>
                        <p className="text-[10px] opacity-60">{node.type} node</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button className="p-1 rounded bg-background/50 text-[10px]">Edit</button>
                        <button className="p-1 rounded bg-background/50 text-[10px]">×</button>
                      </div>
                    </div>
                    {i < sampleNodes.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-xs flex items-center gap-1"><Plus className="h-3 w-3" />Add Node</button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Save Draft</button>
                  <button className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" />Simulate</button>
                  <button className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2"><Play className="h-4 w-4" />Activate</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post-Activation Monitoring Preview */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-blue-400" />Post-Activation Monitoring</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Health Monitor", desc: "Auto-linked to Automation Health — real-time success/failure tracking", icon: Activity, link: "View Health →" },
                { label: "Receipt Generation", desc: "Every execution generates immutable proof receipt with full audit trail", icon: Shield, link: "View Receipts →" },
                { label: "Rollback Path", desc: "Undo capability within 24hr window — reverse CRM changes, unsend messages", icon: RefreshCw, link: "Configure →" },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium text-foreground">{m.label}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{m.desc}</p>
                  <button className="text-[10px] text-primary font-medium">{m.link}</button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advisor Preview */}
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Advisor Analysis of This Automation</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 rounded bg-background/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">CRM Advisor</p>
                  <p className="text-xs text-foreground">Good trigger choice. Consider adding a warmth-score check — cold leads may need different messaging than warm ones who simply went quiet.</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Revenue Ops Advisor</p>
                  <p className="text-xs text-foreground">The approval step for &gt;$2K deals is smart. Consider also adding an approval for leads with existing open quotes to avoid conflicting messages.</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Campaign Advisor</p>
                  <p className="text-xs text-foreground">The 2-hour delay is good. Email 4 open rates drop 40% in existing nurture — test a different subject line approach here.</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Retention Advisor</p>
                  <p className="text-xs text-foreground">For the escalation path (no email open), consider a personal video message instead of just a different subject line. Higher re-engagement rate.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
