// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Money Rituals
// Guided financial ceremonies for sustained money health
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { DomainHeader } from "@/platform/sita/components/sita/primitives/DomainHeader";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import {
  Calendar, CheckCircle, Circle, Clock, RotateCcw, CreditCard, Receipt,
  Shield, DollarSign, Briefcase, FileText, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { MoneyRitual, RitualStep } from "@/packages/finance-contracts/advanced-intelligence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const ritualIcons: Record<string, typeof Calendar> = {
  "weekly-reset": RotateCcw, "month-close": Calendar, "bill-planning": Receipt,
  "debt-check": CreditCard, "subscription-cleanup": Shield,
  "founder-separation": Briefcase, "tax-reserve": FileText,
};

const defaultRituals: MoneyRitual[] = [
  {
    id: "weekly-reset", name: "Weekly Financial Reset", frequency: "weekly",
    description: "Review spending, check budgets, plan the week ahead", estimatedMinutes: 15,
    nextDue: new Date(Date.now() + 2 * 86400000).toISOString(),
    lastCompleted: new Date(Date.now() - 5 * 86400000).toISOString(),
    steps: [
      { id: "w1", label: "Review last 7 days of transactions", description: "Check for anything miscategorized or unexpected", completed: false },
      { id: "w2", label: "Check budget envelope pacing", description: "Are any categories ahead or behind?", completed: false },
      { id: "w3", label: "Review safe-to-spend", description: "How much discretionary room for the week?", completed: false },
      { id: "w4", label: "Check upcoming bills", description: "Any bills due in the next 7 days?", completed: false },
      { id: "w5", label: "Set intention for the week", description: "One financial goal for this week", completed: false },
    ],
  },
  {
    id: "month-close", name: "Month Close Ceremony", frequency: "monthly",
    description: "Close the month, review performance, set next month's plan", estimatedMinutes: 30,
    nextDue: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    steps: [
      { id: "m1", label: "Review monthly income vs plan", description: "Did all expected income arrive?", completed: false },
      { id: "m2", label: "Check budget performance", description: "Which categories were over/under?", completed: false },
      { id: "m3", label: "Review debt progress", description: "How much principal was paid down?", completed: false },
      { id: "m4", label: "Check reserve contributions", description: "Did reserves grow as planned?", completed: false },
      { id: "m5", label: "Update net worth snapshot", description: "Record month-end net worth", completed: false },
      { id: "m6", label: "Set next month's priorities", description: "Top 3 financial priorities", completed: false },
    ],
  },
  {
    id: "bill-planning", name: "Bill Planning Ritual", frequency: "monthly",
    description: "Map out all upcoming bills and ensure coverage", estimatedMinutes: 10,
    nextDue: new Date(Date.now() + 5 * 86400000).toISOString(),
    steps: [
      { id: "b1", label: "List all bills due next 30 days", description: "Include recurring and one-time", completed: false },
      { id: "b2", label: "Verify account balances cover bills", description: "Ensure no shortfalls", completed: false },
      { id: "b3", label: "Check auto-pay status", description: "All critical bills on auto-pay?", completed: false },
    ],
  },
  {
    id: "debt-check", name: "Debt Check Ritual", frequency: "monthly",
    description: "Review all debt, interest, and payoff progress", estimatedMinutes: 15,
    nextDue: new Date(Date.now() + 10 * 86400000).toISOString(),
    steps: [
      { id: "d1", label: "Review all debt balances", description: "Note any changes", completed: false },
      { id: "d2", label: "Check interest charges this month", description: "Total interest drag", completed: false },
      { id: "d3", label: "Review payoff plan progress", description: "On track with strategy?", completed: false },
      { id: "d4", label: "Check credit utilization", description: "Below 30%?", completed: false },
    ],
  },
  {
    id: "subscription-cleanup", name: "Subscription Cleanup", frequency: "quarterly",
    description: "Audit all subscriptions for waste, duplicates, and downgrades", estimatedMinutes: 20,
    nextDue: new Date(Date.now() + 30 * 86400000).toISOString(),
    steps: [
      { id: "s1", label: "List all active subscriptions", description: "Include forgotten ones", completed: false },
      { id: "s2", label: "Check usage for each", description: "When did you last use it?", completed: false },
      { id: "s3", label: "Identify duplicates", description: "Multiple tools for same purpose?", completed: false },
      { id: "s4", label: "Cancel or downgrade waste", description: "Take action on flagged items", completed: false },
    ],
  },
  {
    id: "founder-separation", name: "Founder Cash Separation", frequency: "monthly",
    description: "Verify personal and business finances are properly separated", estimatedMinutes: 15,
    nextDue: new Date(Date.now() + 7 * 86400000).toISOString(),
    steps: [
      { id: "f1", label: "Review cross-entity transactions", description: "Any personal charges on business?", completed: false },
      { id: "f2", label: "Check owner draw consistency", description: "Stable and planned?", completed: false },
      { id: "f3", label: "Verify reimbursements submitted", description: "No outstanding personal expenses", completed: false },
    ],
  },
  {
    id: "tax-reserve", name: "Tax Reserve Ritual", frequency: "quarterly",
    description: "Ensure tax reserves are on track for quarterly payments", estimatedMinutes: 10,
    nextDue: new Date(Date.now() + 14 * 86400000).toISOString(),
    steps: [
      { id: "t1", label: "Calculate YTD tax liability estimate", description: "Based on current income", completed: false },
      { id: "t2", label: "Check tax reserve balance", description: "On track for quarterly payment?", completed: false },
      { id: "t3", label: "Verify deductible receipts documented", description: "All receipts uploaded?", completed: false },
    ],
  },
];

const MoneyRituals = () => {
  const [expandedRitual, setExpandedRitual] = useState<string | null>(null);
  const [stepState, setStepState] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setStepState(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getCompletedCount = (ritual: MoneyRitual) =>
    ritual.steps.filter(s => stepState[s.id]).length;

  const totalSteps = defaultRituals.reduce((s, r) => s + r.steps.length, 0);
  const completedSteps = Object.values(stepState).filter(Boolean).length;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Money Rituals" subtitle="Guided financial ceremonies for sustained money health" />
<div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Active Rituals" value={defaultRituals.length} icon={Sparkles} sub="Guided ceremonies" />
        <KPITile label="Steps Completed" value={`${completedSteps}/${totalSteps}`} icon={CheckCircle} sub="This session" />
        <KPITile label="Time Investment" value={`${defaultRituals.reduce((s, r) => s + r.estimatedMinutes, 0)} min`} icon={Clock} sub="Total per cycle" />
      </div>

      <SitaSectionHeader title="Your Financial Rituals" />
      <div className="space-y-3">
        {defaultRituals.map(ritual => {
          const Icon = ritualIcons[ritual.id] || Calendar;
          const completed = getCompletedCount(ritual);
          const total = ritual.steps.length;
          const isExpanded = expandedRitual === ritual.id;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          const daysUntilDue = Math.max(0, Math.ceil((new Date(ritual.nextDue).getTime() - Date.now()) / 86400000));

          return (
            <SitaCard key={ritual.id} hover={false} className="overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedRitual(isExpanded ? null : ritual.id)}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${progress === 100 ? "bg-trust-verified/10" : "bg-primary/10"}`}>
                    <Icon className={`h-4 w-4 ${progress === 100 ? "text-trust-verified" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-semibold text-foreground">{ritual.name}</p>
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5 capitalize">{ritual.frequency}</span>
                      {progress === 100 && <TrustBadge level="verified" label="Complete" size="sm" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{ritual.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">{completed}/{total}</p>
                    <p className={`text-[10px] ${daysUntilDue <= 2 ? "text-urgency-high" : "text-muted-foreground"}`}>
                      {daysUntilDue === 0 ? "Due today" : `Due in ${daysUntilDue}d`}
                    </p>
                  </div>
                </div>
                <ConfidenceBar value={progress} label="Progress" size="sm" className="mt-3" />
              </div>

              {isExpanded && (
                <motion.div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{ritual.estimatedMinutes} minutes
                  </p>
                  {ritual.steps.map(step => {
                    const isDone = stepState[step.id];
                    return (
                      <div key={step.id} onClick={() => toggleStep(step.id)}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${isDone ? "bg-trust-verified/5 border border-trust-verified/20" : "bg-secondary/30 hover:bg-secondary/50"}`}>
                        {isDone
                          ? <CheckCircle className="h-4 w-4 text-trust-verified mt-0.5 shrink-0" />
                          : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        }
                        <div>
                          <p className={`text-xs font-medium ${isDone ? "text-trust-verified line-through" : "text-foreground"}`}>{step.label}</p>
                          <p className="text-[10px] text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </SitaCard>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MoneyRituals;
