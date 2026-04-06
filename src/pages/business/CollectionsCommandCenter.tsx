// ═══════════════════════════════════════════════════════════════
// SITA OS — Collections Command Center
// Escalation ladders, aging buckets, automated chase sequences
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { motion } from "framer-motion";
import {
  DollarSign, AlertTriangle, Clock, CheckCircle, ArrowRight, Zap,
  Send, Phone, Mail, MessageSquare, Shield, TrendingUp, TrendingDown,
  BarChart3, Users, FileText, ChevronRight, Timer, Ban, Scale, ArrowUpRight
} from "lucide-react";
import { useCollectionsAccounts } from "@/hooks/use-domain-data";
import type { CollectionsAccount } from "@/hooks/useDomainMockData";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";

// ── Types ───────────────────────────────────────────────────────


interface ChaseStep {
  step: number;
  dayAfterDue: number;
  action: string;
  channel: "email" | "phone" | "sms" | "letter" | "legal";
  template: string;
  icon: typeof Mail;
  escalationLevel: 0 | 1 | 2 | 3 | 4;
  autoExecute: boolean;
  requiresApproval: boolean;
}

// ── Chase Sequence Definition ───────────────────────────────────

const CHASE_SEQUENCE: ChaseStep[] = [
  { step: 1, dayAfterDue: 1, action: "Friendly reminder email", channel: "email", template: "friendly-reminder", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 2, dayAfterDue: 7, action: "Second reminder with invoice attached", channel: "email", template: "second-reminder", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 3, dayAfterDue: 14, action: "Phone call follow-up", channel: "phone", template: "phone-script-friendly", icon: Phone, escalationLevel: 1, autoExecute: false, requiresApproval: false },
  { step: 4, dayAfterDue: 21, action: "Urgent payment request", channel: "email", template: "urgent-request", icon: Mail, escalationLevel: 1, autoExecute: true, requiresApproval: true },
  { step: 5, dayAfterDue: 30, action: "Final notice before escalation", channel: "email", template: "final-notice", icon: AlertTriangle, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 6, dayAfterDue: 45, action: "Executive escalation call", channel: "phone", template: "executive-call", icon: Phone, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 7, dayAfterDue: 60, action: "Payment plan offer", channel: "email", template: "payment-plan-offer", icon: DollarSign, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 8, dayAfterDue: 75, action: "Formal demand letter", channel: "letter", template: "demand-letter", icon: FileText, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 9, dayAfterDue: 90, action: "Collections agency referral review", channel: "legal", template: "agency-referral", icon: Scale, escalationLevel: 4, autoExecute: false, requiresApproval: true },
];

// ── Mock Data ───────────────────────────────────────────────────


// ── Helpers ──────────────────────────────────────────────────────

const formatCents = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const bucketColor: Record<string, string> = {
  "current": "bg-trust-safe/10 text-trust-safe",
  "1-30": "bg-accent/10 text-accent",
  "31-60": "bg-urgency-high/10 text-urgency-high",
  "61-90": "bg-destructive/10 text-destructive",
  "90+": "bg-destructive/15 text-destructive",
};

const statusColor: Record<string, string> = {
  "active": "bg-primary/10 text-primary",
  "promised": "bg-trust-safe/10 text-trust-safe",
  "disputed": "bg-accent/10 text-accent",
  "escalated": "bg-destructive/10 text-destructive",
  "recovered": "bg-trust-verified/10 text-trust-verified",
  "written-off": "bg-muted text-muted-foreground",
};

const escalationLabel = ["Level 0 — Friendly", "Level 1 — Firm", "Level 2 — Urgent", "Level 3 — Formal", "Level 4 — Legal"];

// ── Sub-Views ───────────────────────────────────────────────────

const AgingBuckets = ({ accounts }: { accounts: CollectionsAccount[] }) => {
  const buckets = useMemo(() => {
    const b = { "current": [] as CollectionsAccount[], "1-30": [] as CollectionsAccount[], "31-60": [] as CollectionsAccount[], "61-90": [] as CollectionsAccount[], "90+": [] as CollectionsAccount[] };
    accounts.forEach(a => b[a.agingBucket]?.push(a));
    return b;
  }, [accounts]);

  const bucketTotals = Object.entries(buckets).map(([key, accs]) => ({
    bucket: key,
    count: accs.length,
    totalCents: accs.reduce((s, a) => s + a.amountCents, 0),
  }));

  return (
    <div className="space-y-5">
      {/* Aging bar visualization */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Aging Distribution</h3>
        <div className="flex gap-1 h-10 rounded-lg overflow-hidden">
          {bucketTotals.map((b) => {
            const totalAll = bucketTotals.reduce((s, x) => s + x.totalCents, 0);
            const pct = totalAll > 0 ? (b.totalCents / totalAll) * 100 : 0;
            if (pct === 0) return null;
            const colors: Record<string, string> = { "current": "bg-trust-safe", "1-30": "bg-accent", "31-60": "bg-urgency-high", "61-90": "bg-destructive/80", "90+": "bg-destructive" };
            return (
              <div key={b.bucket} className={`${colors[b.bucket]} flex items-center justify-center transition-all`} style={{ width: `${Math.max(pct, 5)}%` }}>
                <span className="text-[9px] font-bold text-white drop-shadow-sm">{b.bucket}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {bucketTotals.map((b) => (
            <div key={b.bucket} className="text-center">
              <p className="text-xs font-medium text-foreground">{formatCents(b.totalCents)}</p>
              <p className="text-[10px] text-muted-foreground">{b.bucket} days · {b.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account list by aging */}
      {Object.entries(buckets).filter(([, accs]) => accs.length > 0).map(([bucket, accs]) => (
        <div key={bucket} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${bucketColor[bucket]}`}>{bucket} days</span>
            <span className="text-xs text-muted-foreground">{accs.length} accounts · {formatCents(accs.reduce((s, a) => s + a.amountCents, 0))}</span>
          </div>
          {accs.map((acc, i) => (
            <motion.div key={acc.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <AccountRow account={acc} />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

const AccountRow = ({ account }: { account: CollectionsAccount }) => (
  <SitaCard className="p-4" hover>
    <div className="flex items-center gap-4">
      {/* Risk indicator */}
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
        account.riskScore >= 80 ? "bg-destructive/10 text-destructive" :
        account.riskScore >= 50 ? "bg-urgency-high/10 text-urgency-high" :
        account.riskScore >= 25 ? "bg-accent/10 text-accent" :
        "bg-trust-safe/10 text-trust-safe"
      }`}>
        {account.riskScore}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{account.customerName}</p>
          <span className="text-[10px] font-mono text-muted-foreground">{account.invoiceNumber}</span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${statusColor[account.status]}`}>{account.status}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {account.agingDays}d overdue</span>
          <span className="flex items-center gap-1"><Send className="h-3 w-3" /> Step {account.currentStep}/{account.totalSteps}</span>
          {account.promisedPayDate && <span className="flex items-center gap-1 text-trust-safe"><CheckCircle className="h-3 w-3" /> Promised {account.promisedPayDate}</span>}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-foreground">{formatCents(account.amountCents)}</p>
        <p className="text-[10px] text-muted-foreground">{escalationLabel[account.escalationLevel]?.split("—")[0]}</p>
      </div>
    </div>
  </SitaCard>
);

const EscalationLadder = () => (
  <div className="space-y-5">
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Chase Sequence — 9-Step Escalation Ladder</h3>
      <p className="text-xs text-muted-foreground mb-5">Automated progression with approval gates at critical steps</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {CHASE_SEQUENCE.map((step, i) => {
            const StepIcon = step.icon;
            const levelColors = ["bg-trust-safe/10 text-trust-safe", "bg-accent/10 text-accent", "bg-urgency-high/10 text-urgency-high", "bg-destructive/10 text-destructive", "bg-destructive/15 text-destructive"];
            const channelIcons: Record<string, typeof Mail> = { email: Mail, phone: Phone, sms: MessageSquare, letter: FileText, legal: Scale };
            const ChannelIcon = channelIcons[step.channel] || Mail;

            return (
              <motion.div key={step.step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="relative flex items-start gap-4 pl-1"
              >
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${levelColors[step.escalationLevel]}`}>
                  <StepIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card p-3.5 hover:shadow-card-hover transition-all">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">STEP {step.step}</span>
                      <span className="text-[10px] text-muted-foreground">Day +{step.dayAfterDue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {step.autoExecute && <span className="rounded-full bg-trust-safe/10 px-2 py-0.5 text-[9px] font-medium text-trust-safe flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Auto</span>}
                      {step.requiresApproval && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Approval</span>}
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground flex items-center gap-1"><ChannelIcon className="h-2.5 w-2.5" /> {step.channel}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1.5">{step.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{escalationLabel[step.escalationLevel]}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const ActiveChases = ({ accounts }: { accounts: CollectionsAccount[] }) => {
  const activeAccounts = accounts.filter(a => a.chaseSequenceActive);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Active Sequences" value={String(activeAccounts.length)} sub={`${accounts.filter(a => !a.chaseSequenceActive).length} paused`} icon={Send} />
        <KPITile label="Awaiting Approval" value={String(activeAccounts.filter(a => CHASE_SEQUENCE[a.currentStep - 1]?.requiresApproval).length)} sub="Steps needing your OK" icon={Shield} />
        <KPITile label="Next Actions Today" value={String(activeAccounts.filter(a => a.currentStep <= 3).length)} sub="Auto-executing soon" icon={Zap} />
      </div>

      <div className="space-y-2">
        {activeAccounts.sort((a, b) => b.riskScore - a.riskScore).map((acc, i) => {
          const currentChaseStep = CHASE_SEQUENCE[acc.currentStep - 1];
          const nextStep = CHASE_SEQUENCE[acc.currentStep];
          return (
            <motion.div key={acc.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SitaCard className="p-4" hover>
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    acc.riskScore >= 80 ? "bg-destructive/10 text-destructive" :
                    acc.riskScore >= 50 ? "bg-urgency-high/10 text-urgency-high" :
                    "bg-accent/10 text-accent"
                  }`}>
                    {acc.riskScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{acc.customerName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">{acc.invoiceNumber}</span>
                      <span className="text-sm font-bold text-foreground">{formatCents(acc.amountCents)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${(acc.currentStep / acc.totalSteps) * 100}%`,
                          background: acc.riskScore >= 80 ? "hsl(var(--destructive))" : acc.riskScore >= 50 ? "hsl(var(--urgency-high))" : "hsl(var(--accent))",
                        }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">Step {acc.currentStep}/{acc.totalSteps}</span>
                    </div>

                    {/* Current & next step */}
                    <div className="mt-2 flex items-center gap-4 text-[11px]">
                      {currentChaseStep && (
                        <span className="flex items-center gap-1 text-foreground">
                          <CheckCircle className="h-3 w-3 text-trust-safe" /> Last: {currentChaseStep.action}
                        </span>
                      )}
                    </div>
                    {nextStep && (
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <span className="text-primary font-medium">Next: {nextStep.action}</span>
                        {nextStep.requiresApproval && <span className="rounded-full bg-primary/10 px-1.5 py-px text-[9px] text-primary">Needs approval</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {nextStep?.requiresApproval ? (
                      <button className="rounded-lg gradient-sita px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                        Approve Next
                      </button>
                    ) : (
                      <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors">
                        View Details
                      </button>
                    )}
                    <button className="rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                      Pause
                    </button>
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const CollectionsInsights = ({ accounts }: { accounts: CollectionsAccount[] }) => {
  const totalOutstanding = accounts.reduce((s, a) => s + a.amountCents, 0);
  const avgAging = accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.agingDays, 0) / accounts.length) : 0;
  const atRisk = accounts.filter(a => a.riskScore >= 70);
  const promised = accounts.filter(a => a.status === "promised");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Outstanding" value={formatCents(totalOutstanding)} sub={`${accounts.length} invoices`} icon={DollarSign} trend="down" />
        <KPITile label="Avg Aging" value={`${avgAging}d`} sub="Days past due" icon={Clock} />
        <KPITile label="At Risk" value={String(atRisk.length)} sub={formatCents(atRisk.reduce((s, a) => s + a.amountCents, 0))} icon={AlertTriangle} trend="down" />
        <KPITile label="Promised" value={String(promised.length)} sub={formatCents(promised.reduce((s, a) => s + a.amountCents, 0))} icon={CheckCircle} trend="up" />
      </div>

      {/* Risk heatmap */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Risk Heatmap</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Low Risk (0-25)", accounts: accounts.filter(a => a.riskScore < 25), color: "border-trust-safe/30 bg-trust-safe/5" },
            { label: "Medium (25-50)", accounts: accounts.filter(a => a.riskScore >= 25 && a.riskScore < 50), color: "border-accent/30 bg-accent/5" },
            { label: "High (50-75)", accounts: accounts.filter(a => a.riskScore >= 50 && a.riskScore < 75), color: "border-urgency-high/30 bg-urgency-high/5" },
            { label: "Critical (75+)", accounts: accounts.filter(a => a.riskScore >= 75), color: "border-destructive/30 bg-destructive/5" },
          ].map((group) => (
            <div key={group.label} className={`rounded-xl border ${group.color} p-3`}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{group.accounts.length}</p>
              <p className="text-[10px] text-muted-foreground">{formatCents(group.accounts.reduce((s, a) => s + a.amountCents, 0))}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">AI Recommendations</h3>
        <div className="space-y-2">
          {[
            { icon: AlertTriangle, color: "text-destructive", title: "Escalate NovaTech to collections agency", desc: "$22,000 outstanding for 83 days. Payment plan rejected." },
            { icon: Phone, color: "text-urgency-high", title: "Call TechVentures today", desc: "No response to final notice. Executive call needed before formal demand." },
            { icon: CheckCircle, color: "text-trust-safe", title: "Sarah Chen likely to pay on time", desc: "Promised payment by Apr 10. History suggests reliability." },
            { icon: DollarSign, color: "text-accent", title: "Offer Premier Digital a 5% early-pay discount", desc: "24 days overdue but low risk. Discount could accelerate payment." },
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
              <rec.icon className={`h-4 w-4 ${rec.color} mt-0.5 shrink-0`} />
              <div>
                <p className="text-sm font-medium text-foreground">{rec.title}</p>
                <p className="text-[11px] text-muted-foreground">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────

const CollectionsCommandCenter = () => {
  const { data: collectionsData = [] } = useCollectionsAccounts();

  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "aging", label: "Aging Buckets" },
    { key: "escalation", label: "Escalation Ladder" },
    { key: "chases", label: "Active Chases" },
  ];

   return (
    <div className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="Collections Command Center"
        subtitle="Track overdue receivables, manage escalation sequences, and recover revenue automatically"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {collectionsData.filter(a => a.riskScore >= 70).length} Critical
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary flex items-center gap-1">
              <Send className="h-3 w-3" /> {collectionsData.filter(a => a.chaseSequenceActive).length} Active Chases
            </span>
          </div>
        }
      />
      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === "overview" && <CollectionsInsights accounts={collectionsData} />}
      {activeTab === "aging" && <AgingBuckets accounts={collectionsData} />}
      {activeTab === "escalation" && <EscalationLadder />}
      {activeTab === "chases" && <ActiveChases accounts={collectionsData} />}

      <LiveAdvisorCard
        advisor="business"
        intent="escalation_strategy"
        demoName="Escalation Intelligence"
        demoRole="Collections Advisor"
        demoConfidence="High"
        demoRecommendation="NovaTech ($22K, 83d overdue) has rejected payment plans — consider collections agency referral. Sarah Chen promised payment by Apr 10 — set a verification reminder."
        demoReasoning="Based on escalation ladder progression, payment promise tracking, and risk score analysis."
      />
    </div>
  );
};

export default CollectionsCommandCenter;
