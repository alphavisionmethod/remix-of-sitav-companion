import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { StatusCard } from "@/components/sita/cards";
import { useState } from "react";
import {
  Zap, Play, Pause, AlertCircle, Lightbulb, Clock, Shield, CheckCircle2,
  ArrowRight, BarChart3, RefreshCw, DollarSign, Bell, FileText, CreditCard, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataMode } from "@/contexts/DataModeContext";

type AutoStatus = "active" | "suggested" | "paused" | "failed";
type TrustLevel = "full" | "threshold" | "approval-required" | "draft-only";

interface FinanceAutomation {
  id: string; name: string; description: string; trigger: string; status: AutoStatus;
  trustLevel: TrustLevel; lastRun?: string; nextRun?: string; runsTotal: number;
  proofCount: number; savingsPerMonth?: number; conditions: string[]; failReason?: string;
}

const DEMO_AUTOMATIONS: FinanceAutomation[] = [
  { id: "FA01", name: "Weekly Bill Review Prep", description: "Prepares a summary of upcoming bills every Monday morning for review.", trigger: "Every Monday 8am", status: "active", trustLevel: "full", lastRun: "Apr 7", nextRun: "Apr 14", runsTotal: 23, proofCount: 23, conditions: ["All bill sources connected", "Review window > 3 days"] },
  { id: "FA02", name: "Overdue Invoice Reminder Drafts", description: "Drafts reminder emails for invoices overdue by 3+ days.", trigger: "Daily at 9am", status: "active", trustLevel: "approval-required", lastRun: "Apr 10", nextRun: "Apr 11", runsTotal: 45, proofCount: 38, conditions: ["Invoice > 3 days overdue", "No reminder in last 5 days"] },
  { id: "FA03", name: "Auto-Pay Bills Under $200", description: "Automatically pays recurring bills under the threshold.", trigger: "On bill due date", status: "active", trustLevel: "threshold", lastRun: "Apr 8", runsTotal: 67, proofCount: 67, savingsPerMonth: 0, conditions: ["Bill < $200", "Recurring bill", "Sufficient balance"] },
  { id: "FA04", name: "Recurring Charge Change Alert", description: "Alerts when a subscription or recurring charge changes by more than 10%.", trigger: "On charge detection", status: "active", trustLevel: "full", lastRun: "Apr 3", runsTotal: 8, proofCount: 8, conditions: ["Change > 10%", "Recurring charge identified"] },
  { id: "FA05", name: "Reserve Pressure Alert", description: "Warns when projected spending may drop reserves below safety threshold.", trigger: "Daily projection", status: "active", trustLevel: "full", lastRun: "Apr 10", runsTotal: 12, proofCount: 12, conditions: ["Reserve < 80% target", "Projected outflow > inflow"] },
  { id: "FA06", name: "Subscription Waste Review", description: "Monthly review prompt for underused subscriptions.", trigger: "1st of month", status: "suggested", trustLevel: "draft-only", runsTotal: 0, proofCount: 0, savingsPerMonth: 89, conditions: ["Usage data available", "Subscription > 60 days old"] },
  { id: "FA07", name: "Grouped Payment Planning", description: "Groups similar-date obligations into a single payment plan.", trigger: "Every Friday", status: "suggested", trustLevel: "approval-required", runsTotal: 0, proofCount: 0, conditions: ["3+ bills in same week", "Combined < daily limit"] },
  { id: "FA08", name: "Category Auto-Assignment", description: "Automatically categorizes transactions based on learned merchant patterns.", trigger: "On new transaction", status: "paused", trustLevel: "full", lastRun: "Mar 15", runsTotal: 234, proofCount: 210, conditions: ["Merchant pattern confidence > 90%"] },
  { id: "FA09", name: "Tax Document Collection", description: "Quarterly scan for tax-relevant documents and receipts.", trigger: "Quarterly", status: "suggested", trustLevel: "draft-only", runsTotal: 0, proofCount: 0, conditions: ["Tax tracking enabled", "Receipt sources connected"] },
  { id: "FA10", name: "High-Value Payment Approval", description: "Routes payments above $500 for explicit approval.", trigger: "On payment > $500", status: "failed", trustLevel: "approval-required", lastRun: "Apr 2", runsTotal: 5, proofCount: 3, failReason: "Approval routing service timeout", conditions: ["Payment > $500", "Not auto-pay eligible"] },
];

const STATUS_HEALTH: Record<AutoStatus, "healthy" | "degraded" | "down" | "unknown"> = {
  active: "healthy", suggested: "unknown", paused: "degraded", failed: "down",
};

const TRUST_LABELS: Record<TrustLevel, string> = {
  full: "Fully Automated", threshold: "Threshold-Based", "approval-required": "Needs Approval", "draft-only": "Draft Only",
};

const FinanceAutomations = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tab === "all" ? DEMO_AUTOMATIONS : (isDemoMode ? DEMO_AUTOMATIONS : [] as typeof DEMO_AUTOMATIONS).filter(a => a.status === tab);
  const selected = DEMO_AUTOMATIONS.find(a => a.id === selectedId);

  const activeCount = DEMO_AUTOMATIONS.filter(a => a.status === "active").length;
  const suggestedCount = DEMO_AUTOMATIONS.filter(a => a.status === "suggested").length;
  const totalRuns = DEMO_AUTOMATIONS.reduce((s, a) => s + a.runsTotal, 0);
  const totalProofs = DEMO_AUTOMATIONS.reduce((s, a) => s + a.proofCount, 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="flex items-center justify-between">
        <div />
        <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[hsl(265_55%_52%)] transition-colors">
          <Zap className="h-3.5 w-3.5" /> Create Rule
        </button>
      </div>

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
          { key: "paused", label: "Paused", count: (isDemoMode ? DEMO_AUTOMATIONS : [] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "paused").length },
          { key: "failed", label: "Failed", count: (isDemoMode ? DEMO_AUTOMATIONS : [] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "failed").length },
          { key: "all", label: "All", count: (isDemoMode ? DEMO_AUTOMATIONS : [] as typeof DEMO_AUTOMATIONS).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={`space-y-2 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {filtered.length === 0 ? (
            <EmptyState icon={Zap} title="No automations here" description="Try another tab or create a new rule" />
          ) : filtered.map((auto) => (
            <div key={auto.id} className="micro-hover-lift cursor-pointer" onClick={() => setSelectedId(auto.id)}>
              <StatusCard
                label={auto.name}
                status={STATUS_HEALTH[auto.status]}
                lastChecked={auto.lastRun ? `Last: ${auto.lastRun}` : undefined}
                confidence={auto.proofCount > 0 ? Math.round((auto.proofCount / Math.max(auto.runsTotal, 1)) * 100) : undefined}
                className={selectedId === auto.id ? "ring-1 ring-[hsl(265_55%_58%/0.4)]" : ""}
              />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_90%)]"}>{selected.name}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]">✕</button>
                </div>
                <p className="text-sm text-[hsl(0_0%_60%)]">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Trigger</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.trigger}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Trust Level</span><p className="text-xs text-[hsl(0_0%_70%)]">{TRUST_LABELS[selected.trustLevel]}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Total Runs</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.runsTotal}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Proofs</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.proofCount}</p></div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[hsl(0_0%_85%)] mb-1.5">Conditions</p>
                  <div className="space-y-1">
                    {selected.conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[hsl(0_0%_60%)]">
                        <CheckCircle2 className="h-3 w-3 text-[hsl(152_55%_48%)] shrink-0" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {selected.failReason && (
                  <div className="rounded-xl bg-[hsl(0_70%_55%/0.08)] p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-[hsl(0_70%_55%)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[hsl(0_0%_90%)]">Failure Reason</p>
                        <p className="text-xs text-[hsl(0_0%_60%)] mt-0.5">{selected.failReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-[hsl(265_55%_58%/0.08)] p-3">
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-[hsl(265_55%_58%)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-[hsl(0_0%_90%)]">Simulation Preview</p>
                      <p className="text-xs text-[hsl(0_0%_60%)] mt-0.5">If triggered now: {selected.description.split(".")[0].toLowerCase()}.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selected.status === "active" && <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] px-3 py-1.5 text-xs text-[hsl(0_0%_70%)] hover:bg-[hsl(0_0%_100%/0.10)] transition-colors"><Pause className="h-3 w-3" /> Pause</button>}
                  {selected.status === "paused" && <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors"><Play className="h-3 w-3" /> Resume</button>}
                  {selected.status === "suggested" && <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors"><Play className="h-3 w-3" /> Enable</button>}
                  {selected.status === "failed" && <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(265_55%_58%/0.12)] px-3 py-1.5 text-xs text-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_58%/0.20)] transition-colors"><RefreshCw className="h-3 w-3" /> Retry</button>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ModuleAdvisorInsight
        advisorName="Automation Advisor"
        domain="finance"
        insight={`${activeCount} rules active with ${totalRuns} total runs. ${suggestedCount} new rules suggested based on your financial patterns.`}
        confidence={88}
      />
    </motion.div>
  );
};

export default FinanceAutomations;
