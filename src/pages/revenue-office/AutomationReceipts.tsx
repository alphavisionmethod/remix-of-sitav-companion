import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Receipt, CheckCircle, Users, Mail, Phone, FileText, Clock, Undo2,
  AlertTriangle, Shield, Eye, DollarSign, MessageSquare, Star, UserPlus,
  Heart, Target, RefreshCw, Brain, ArrowRight
} from "lucide-react";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_receipts = [
  { time: "14 min ago", automation: "Stale Lead Recovery", action: "Sent recovery email to 24 leads", contacts: 24, approvedBy: "Auto-run (L3)", outcome: "22 delivered, 2 bounced, 8 opened so far", rollback: true, category: "Lead Recovery", impact: "$8,200 at risk", details: { emailVariants: 3, segmentsUsed: ["warm", "hot"], exclusions: 3, fatigueDelays: 5 } },
  { time: "45 min ago", automation: "Post-Call Follow-up", action: "Generated 3 follow-up emails from call notes, created 3 callback tasks", contacts: 3, approvedBy: "Draft reviewed → User approved", outcome: "3 emails sent, 2 opened, 1 replied", rollback: true, category: "Sales", impact: "$7,500 pipeline", details: { aiGenerated: true, callsProcessed: 3, quotesTriggered: 1 } },
  { time: "1 hr ago", automation: "No-Show Rescue", action: "Sent SMS to 3 no-show contacts with rebook link", contacts: 3, approvedBy: "Auto-run (L3)", outcome: "3 delivered, 1 rebooked within 20min", rollback: true, category: "Booking", impact: "$2,400 recovered", details: { channelUsed: "SMS", rebookRate: "33%" } },
  { time: "2 hrs ago", automation: "Quote Follow-up (Day 3)", action: "Sent reminder to 8 prospects with open quotes", contacts: 8, approvedBy: "Auto-run (L3)", outcome: "8 delivered, 5 opened, 2 viewed quote again", rollback: true, category: "Sales", impact: "$18,400 in quotes", details: { quoteValues: "$2,300 avg", viewTracking: true } },
  { time: "3 hrs ago", automation: "VIP Lead Recovery", action: "4 VIP leads ($5K+) — emails drafted and queued for your review", contacts: 4, approvedBy: "Awaiting approval (L2)", outcome: "Pending your review in approval queue", rollback: false, category: "Lead Recovery", impact: "$22,000 at risk", details: { requiresApproval: true, vipThreshold: "$5,000" } },
  { time: "4 hrs ago", automation: "Post-Service Review", action: "Requested review from 12 clients after service delivery", contacts: 12, approvedBy: "Auto-run (L3)", outcome: "12 sent, 4 reviews submitted (3 × 5-star, 1 × 4-star)", rollback: false, category: "Reputation", impact: "+4 reviews", details: { avgRating: 4.75, platforms: ["Google", "Trustpilot"] } },
  { time: "6 hrs ago", automation: "Welcome Onboarding", action: "Sent welcome package to 5 new clients (step 1 of 7)", contacts: 5, approvedBy: "Auto-run (L3)", outcome: "5 delivered, 5 opened, 3 completed intake form", rollback: false, category: "Onboarding", impact: "5 new clients", details: { step: "1/7", intakeCompleted: 3 } },
  { time: "8 hrs ago", automation: "Lead Assignment Engine", action: "Assigned 15 leads to sales team based on rules", contacts: 15, approvedBy: "Jane (manual review — rule fix)", outcome: "15 assigned, 2 re-routed after rule correction", rollback: true, category: "Operations", impact: "15 leads routed", details: { ruleFixed: true, reassigned: 2 } },
  { time: "12 hrs ago", automation: "Churn Prevention", action: "Sent check-in to 8 at-risk clients (60+ days inactive)", contacts: 8, approvedBy: "AI Draft → User approved", outcome: "8 sent, 3 responded, 1 booked call", rollback: true, category: "Retention", impact: "$3,100 at risk", details: { responseRate: "38%", callsBooked: 1 } },
  { time: "1 day ago", automation: "Reactivation Campaign", action: "Launched 3-step reactivation for 34 dormant contacts (step 1)", contacts: 34, approvedBy: "Decision Theater → Approved", outcome: "Step 1: 32 delivered, 14 opened, 4 clicked", rollback: true, category: "Growth", impact: "$2,800 potential", details: { step: "1/3", decisionTheaterUsed: true } },
  { time: "1 day ago", automation: "Upsell After Delivery", action: "Sent personalized upsell to 6 clients post-delivery", contacts: 6, approvedBy: "Auto-run (L3)", outcome: "6 sent, 2 opened, 1 clicked upsell link", rollback: true, category: "Growth", impact: "$3,400 potential", details: { aiPersonalized: true, caseStudyIncluded: true } },
  { time: "2 days ago", automation: "Failed Payment Retry", action: "Retried 4 failed payments (attempt 2 of 3)", contacts: 4, approvedBy: "Auto-run (L3)", outcome: "2 succeeded ($1,800), 2 still failing", rollback: false, category: "Revenue", impact: "$1,800 recovered", details: { recovered: 2, stillFailing: 2, totalValue: "$3,200" } },
];

const categoryIcons: Record<string, typeof Mail> = {
  "Lead Recovery": Users, Sales: FileText, Booking: Phone, Reputation: Star,
  Onboarding: UserPlus, Operations: Target, Retention: Heart, Growth: RefreshCw, Revenue: DollarSign,
};

export default function AutomationReceipts() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("all");
  const categories = ["all", ...Array.from(new Set(DEMO_receipts.map(r => r.category)))];

  const filtered = tab === "all" ? DEMO_receipts : DEMO_receipts.filter(r => r.category === tab);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-400" />Automation Receipts & History</h1>
        <p className="text-muted-foreground">Full audit trail — who created, what happened, which contacts affected, outcomes, approvals, and rollback options</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{DEMO_receipts.length}</p><p className="text-[10px] text-muted-foreground">Actions (48hrs)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{DEMO_receipts.reduce((a, r) => a + r.contacts, 0)}</p><p className="text-[10px] text-muted-foreground">Contacts Affected</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">{DEMO_receipts.filter(r => r.rollback).length}</p><p className="text-[10px] text-muted-foreground">Rollback Available</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">{DEMO_receipts.filter(r => r.approvedBy.includes("Awaiting")).length}</p><p className="text-[10px] text-muted-foreground">Pending Approval</p></CardContent></Card>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setTab(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${tab === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{cat}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => {
          const CatIcon = categoryIcons[r.category] || Mail;
          return (
            <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><CatIcon className="h-4 w-4 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground">{r.automation}</p>
                        <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                      </div>
                      <p className="text-xs text-foreground">{r.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">{r.time}</span>
                    {r.rollback && (
                      <button className="px-2 py-1 rounded text-[10px] bg-secondary text-secondary-foreground flex items-center gap-1 hover:bg-secondary/80"><Undo2 className="h-3 w-3" />Rollback</button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/20">
                  <div className="space-y-1 text-[10px]">
                    <p className="text-muted-foreground">Contacts: <span className="text-foreground font-medium">{r.contacts}</span></p>
                    <p className="text-muted-foreground">Approved by: <span className={`font-medium ${r.approvedBy.includes("Awaiting") ? "text-amber-400" : "text-foreground"}`}>{r.approvedBy}</span></p>
                    <p className="text-muted-foreground">Impact: <span className="text-emerald-400 font-medium">{r.impact}</span></p>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <p className="text-muted-foreground">Outcome: <span className="text-foreground">{r.outcome}</span></p>
                    {r.details.aiGenerated && <p className="text-purple-400">✦ AI-generated content</p>}
                    {r.details.requiresApproval && <p className="text-amber-400">⏳ Requires your approval</p>}
                    {r.details.decisionTheaterUsed && <p className="text-blue-400">🎭 Decision Theater reviewed</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
