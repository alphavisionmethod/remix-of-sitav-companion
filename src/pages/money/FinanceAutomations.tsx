import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useState } from "react";
import {
  Zap, Play, Pause, AlertCircle, Lightbulb, Clock, Shield, CheckCircle2,
  ArrowRight, BarChart3, RefreshCw, DollarSign, Bell, FileText, CreditCard, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AutoStatus = "active" | "suggested" | "paused" | "failed";
type TrustLevel = "full" | "threshold" | "approval-required" | "draft-only";

interface FinanceAutomation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: AutoStatus;
  trustLevel: TrustLevel;
  lastRun?: string;
  nextRun?: string;
  runsTotal: number;
  proofCount: number;
  savingsPerMonth?: number;
  conditions: string[];
  failReason?: string;
}

const DEMO_AUTOMATIONS: FinanceAutomation[] = [
  { id: "FA01", name: "Weekly Bill Review Prep", description: "Prepares a summary of upcoming bills every Monday morning for review.", trigger: "Every Monday 8am", status: "active", trustLevel: "full", lastRun: "Apr 7", nextRun: "Apr 14", runsTotal: 23, proofCount: 23, conditions: ["All bill sources connected", "Review window > 3 days"] },
  { id: "FA02", name: "Overdue Invoice Reminder Drafts", description: "Drafts reminder emails for invoices overdue by 3+ days. Awaits approval before sending.", trigger: "Daily at 9am", status: "active", trustLevel: "approval-required", lastRun: "Apr 10", nextRun: "Apr 11", runsTotal: 45, proofCount: 38, conditions: ["Invoice > 3 days overdue", "No reminder in last 5 days"] },
  { id: "FA03", name: "Auto-Pay Bills Under $200", description: "Automatically pays recurring bills under the threshold from designated account.", trigger: "On bill due date", status: "active", trustLevel: "threshold", lastRun: "Apr 8", runsTotal: 67, proofCount: 67, savingsPerMonth: 0, conditions: ["Bill < $200", "Recurring bill", "Sufficient balance"] },
  { id: "FA04", name: "Recurring Charge Change Alert", description: "Alerts when a subscription or recurring charge changes by more than 10%.", trigger: "On charge detection", status: "active", trustLevel: "full", lastRun: "Apr 3", runsTotal: 8, proofCount: 8, conditions: ["Change > 10%", "Recurring charge identified"] },
  { id: "FA05", name: "Reserve Pressure Alert", description: "Warns when projected spending may drop reserves below safety threshold.", trigger: "Daily projection", status: "active", trustLevel: "full", lastRun: "Apr 10", runsTotal: 12, proofCount: 12, conditions: ["Reserve < 80% target", "Projected outflow > inflow"] },
  { id: "FA06", name: "Subscription Waste Review", description: "Monthly review prompt for underused subscriptions with cancel suggestions.", trigger: "1st of month", status: "suggested", trustLevel: "draft-only", runsTotal: 0, proofCount: 0, savingsPerMonth: 89, conditions: ["Usage data available", "Subscription > 60 days old"] },
  { id: "FA07", name: "Grouped Payment Planning", description: "Groups similar-date obligations into a single payment plan for weekly execution.", trigger: "Every Friday", status: "suggested", trustLevel: "approval-required", runsTotal: 0, proofCount: 0, conditions: ["3+ bills in same week", "Combined < daily limit"] },
  { id: "FA08", name: "Category Auto-Assignment", description: "Automatically categorizes transactions based on learned merchant patterns.", trigger: "On new transaction", status: "paused", trustLevel: "full", lastRun: "Mar 15", runsTotal: 234, proofCount: 210, conditions: ["Merchant pattern confidence > 90%"] },
  { id: "FA09", name: "Tax Document Collection", description: "Quarterly scan for tax-relevant documents and receipts, creates collection summary.", trigger: "Quarterly", status: "suggested", trustLevel: "draft-only", runsTotal: 0, proofCount: 0, conditions: ["Tax tracking enabled", "Receipt sources connected"] },
  { id: "FA10", name: "High-Value Payment Approval", description: "Routes payments above $500 for explicit approval with impact preview.", trigger: "On payment > $500", status: "failed", trustLevel: "approval-required", lastRun: "Apr 2", runsTotal: 5, proofCount: 3, failReason: "Approval routing service timeout", conditions: ["Payment > $500", "Not auto-pay eligible"] },
];

const STATUS_ICONS: Record<AutoStatus, typeof Zap> = {
  active: Play,
  suggested: Lightbulb,
  paused: Pause,
  failed: AlertCircle,
};

const TRUST_LABELS: Record<TrustLevel, string> = {
  full: "Fully Automated",
  threshold: "Threshold-Based",
  "approval-required": "Needs Approval",
  "draft-only": "Draft Only",
};

const TRUST_BADGE_LEVEL: Record<TrustLevel, "verified" | "review" | "degraded" | "blocked"> = {
  full: "verified",
  threshold: "review",
  "approval-required": "degraded",
  "draft-only": "blocked",
};

const FinanceAutomations = () => {
  const [tab, setTab] = useState("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tab === "all" ? DEMO_AUTOMATIONS : DEMO_AUTOMATIONS.filter(a => a.status === tab);
  const selected = DEMO_AUTOMATIONS.find(a => a.id === selectedId);

  const activeCount = DEMO_AUTOMATIONS.filter(a => a.status === "active").length;
  const suggestedCount = DEMO_AUTOMATIONS.filter(a => a.status === "suggested").length;
  const totalRuns = DEMO_AUTOMATIONS.reduce((s, a) => s + a.runsTotal, 0);
  const totalProofs = DEMO_AUTOMATIONS.reduce((s, a) => s + a.proofCount, 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Finance Automations"
        subtitle="Trust-aware rules that handle routine financial work"
        actions={<SitaButton variant="accent" size="sm"><Zap className="h-3.5 w-3.5" /> Create Rule</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Rules" value={activeCount} icon={Play} sub="Running automatically" />
        <KPITile label="Suggested" value={suggestedCount} icon={Lightbulb} sub="Ready to enable" />
        <KPITile label="Total Runs" value={totalRuns} icon={RefreshCw} sub="All time" />
        <KPITile label="Proof Generated" value={totalProofs} icon={Shield} sub="Verified receipts" />
      </div>

      <SitaTabs
        tabs={[
          { key: "active", label: "Active", count: activeCount },
          { key: "suggested", label: "Suggested", count: suggestedCount },
          { key: "paused", label: "Paused", count: DEMO_AUTOMATIONS.filter(a => a.status === "paused").length },
          { key: "failed", label: "Failed", count: DEMO_AUTOMATIONS.filter(a => a.status === "failed").length },
          { key: "all", label: "All", count: DEMO_AUTOMATIONS.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={`space-y-2 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {filtered.length === 0 ? (
            <EmptyState icon={Zap} title="No automations here" description="Try another tab or create a new rule" />
          ) : filtered.map((auto) => {
            const Icon = STATUS_ICONS[auto.status];
            return (
              <SitaCard
                key={auto.id}
                lane={auto.status === "failed" ? "action" : auto.status === "suggested" ? "opportunity" : undefined}
                className={`p-4 cursor-pointer transition-all ${selectedId === auto.id ? "ring-2 ring-primary/40" : ""}`}
                onClick={() => setSelectedId(auto.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${auto.status === "active" ? "bg-trust-verified/10 text-trust-verified" : auto.status === "failed" ? "bg-urgency-high/10 text-urgency-high" : "bg-secondary/50 text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{auto.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{auto.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <TrustBadge level={TRUST_BADGE_LEVEL[auto.trustLevel]} label={TRUST_LABELS[auto.trustLevel]} size="sm" />
                      <span className="text-[10px] text-muted-foreground">{auto.trigger}</span>
                      {auto.lastRun && <span className="text-[10px] text-muted-foreground">· Last: {auto.lastRun}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground">{auto.runsTotal} runs</p>
                    <p className="text-xs text-muted-foreground">{auto.proofCount} proofs</p>
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SitaCard hover={false} className="p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-foreground">{selected.name}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Trigger</span><p className="font-semibold">{selected.trigger}</p></div>
                  <div><span className="text-muted-foreground text-xs">Trust Level</span>
                    <TrustBadge level={TRUST_BADGE_LEVEL[selected.trustLevel]} label={TRUST_LABELS[selected.trustLevel]} size="sm" />
                  </div>
                  <div><span className="text-muted-foreground text-xs">Total Runs</span><p className="font-semibold">{selected.runsTotal}</p></div>
                  <div><span className="text-muted-foreground text-xs">Proofs</span><p className="font-semibold">{selected.proofCount}</p></div>
                  {selected.nextRun && <div><span className="text-muted-foreground text-xs">Next Run</span><p className="font-semibold">{selected.nextRun}</p></div>}
                  {selected.savingsPerMonth !== undefined && selected.savingsPerMonth > 0 && <div><span className="text-muted-foreground text-xs">Est. Savings</span><p className="font-semibold text-trust-verified">${selected.savingsPerMonth}/mo</p></div>}
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">Conditions</p>
                  <div className="space-y-1">
                    {selected.conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-trust-verified shrink-0" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {selected.failReason && (
                  <div className="rounded-xl bg-urgency-high/10 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-urgency-high mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Failure Reason</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{selected.failReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulation preview */}
                <div className="rounded-xl bg-accent/10 p-3">
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Simulation Preview</p>
                      <p className="text-xs text-muted-foreground mt-0.5">If triggered now: {selected.description.split(".")[0].toLowerCase()}.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selected.status === "active" && <SitaButton variant="outline" size="sm"><Pause className="h-3 w-3" /> Pause</SitaButton>}
                  {selected.status === "paused" && <SitaButton variant="accent" size="sm"><Play className="h-3 w-3" /> Resume</SitaButton>}
                  {selected.status === "suggested" && <SitaButton variant="accent" size="sm"><Play className="h-3 w-3" /> Enable</SitaButton>}
                  {selected.status === "failed" && <SitaButton variant="accent" size="sm"><RefreshCw className="h-3 w-3" /> Retry</SitaButton>}
                  <SitaButton variant="ghost" size="sm"><BarChart3 className="h-3 w-3" /> History</SitaButton>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Recent Runs</p>
                  <div className="space-y-1.5">
                    {selected.lastRun ? (
                      <>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-trust-verified" />
                          {selected.lastRun} — Completed successfully
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-trust-verified" />
                          Proof receipt generated
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No runs yet</p>
                    )}
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveAdvisorCard
        advisor="money"
        intent="finance_automations"
        demoName="Automation Advisor"
        demoRole="Financial Efficiency"
        demoConfidence="High"
        demoRecommendation={`${activeCount} rules active with ${totalRuns} total runs. ${suggestedCount} new rules suggested based on your financial patterns.`}
        demoReasoning="Analyzing transaction patterns, bill schedules, and approval history to recommend trust-appropriate automations."
      />
    </motion.div>
  );
};

export default FinanceAutomations;
