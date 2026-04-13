// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Cash Allocation AI
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { DollarSign, PieChart, Shield, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { computeCashAllocations } from "@/lib/services/finance-os/cash-allocator.service";
import type { AllocationStrategy } from "@/packages/finance-contracts/advanced-intelligence";

const strategyMeta: Record<AllocationStrategy, { label: string; description: string; icon: typeof Shield }> = {
  conservative: { label: "Conservative", description: "Safety-first — maximize reserves and protection", icon: Shield },
  balanced: { label: "Balanced", description: "Even split between safety and growth", icon: PieChart },
  aggressive: { label: "Aggressive", description: "Growth-first — maximize debt payoff and investments", icon: TrendingUp },
};

const bucketColors: Record<string, string> = {
  bills: "bg-[hsl(0_70%_55%)]", "tax-reserve": "bg-[hsl(38_85%_58%)]",
  "emergency-reserve": "bg-primary", "debt-payoff": "bg-destructive",
  "sinking-funds": "bg-[hsl(152_55%_48%)]", "payroll-reserve": "bg-accent",
  discretionary: "bg-[hsl(152_55%_48%)]", investments: "bg-primary",
  "expansion-reserve": "bg-[hsl(38_85%_58%)]",
};

const CashAllocator = () => {
  const [strategy, setStrategy] = useState<AllocationStrategy>("balanced");

  const plans = useMemo(() => computeCashAllocations({
    availableCashCents: 850000, billsDueCents: 320000,
    taxOwedCents: 165000, taxReservedCents: 95000,
    emergencyTargetCents: 500000, emergencyCurrentCents: 225000,
    debtBalanceCents: 4800000, debtMinimumCents: 42000,
    sinkingFundTargetCents: 200000, sinkingFundCurrentCents: 80000,
    payrollNeededCents: 0, payrollReservedCents: 0,
  }), []);

  const plan = plans[strategy];
  const meta = strategyMeta[strategy];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageTruthBanner />

      <HeroCard
        title="CASH ALLOCATION AI"
        metric={`$${(plan.totalAllocatedCents / 100).toLocaleString()}`}
        subtitle={`${meta.label} — distributed across ${plan.allocations.length} buckets`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(152 55% 48%)"
        icon={<PieChart className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatusCard label="Available Cash" status="healthy" lastChecked={`$${(plan.availableCashCents / 100).toLocaleString()}`} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatusCard label="Allocated" status="healthy" lastChecked={`$${(plan.totalAllocatedCents / 100).toLocaleString()}`} icon={<PieChart className="h-3.5 w-3.5" />} />
        <StatusCard label="Unallocated" status={plan.unallocatedCents > 0 ? "degraded" : "healthy"} lastChecked={`$${(plan.unallocatedCents / 100).toLocaleString()}`} icon={<Zap className="h-3.5 w-3.5" />} />
      </div>

      {/* Strategy Selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(strategyMeta) as AllocationStrategy[]).map(s => {
          const m = strategyMeta[s];
          const Icon = m.icon;
          const isActive = strategy === s;
          return (
            <button key={s} onClick={() => setStrategy(s)}
              className={`rounded-xl border p-4 text-left transition-all micro-press ${isActive ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] hover:bg-[hsl(0_0%_100%/0.03)]"}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Allocation Breakdown */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
        {/* Stacked Bar */}
        <div className="flex h-6 rounded-full overflow-hidden mb-4">
          {plan.allocations.filter(a => a.amountCents > 0).map(a => (
            <div key={a.bucket} className={`${bucketColors[a.bucket] || "bg-muted"} transition-all`}
              style={{ width: `${a.percentOfTotal}%` }} title={`${a.label}: ${a.percentOfTotal}%`} />
          ))}
        </div>

        <div className="space-y-2">
          {plan.allocations.filter(a => a.amountCents > 0).map(a => (
            <div key={a.bucket} className="flex items-center gap-3 rounded-lg bg-[hsl(0_0%_100%/0.02)] px-3 py-2.5 micro-hover-lift">
              <div className={`h-3 w-3 rounded-full ${bucketColors[a.bucket] || "bg-muted"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.reasoning}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">${(a.amountCents / 100).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{a.percentOfTotal}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ModuleAdvisorInsight
        advisorName="Cash Allocator Advisor"
        domain="finance"
        insight={`${meta.label} plan allocates $${(plan.totalAllocatedCents / 100).toLocaleString()} across ${plan.allocations.length} buckets. Bills covered first.`}
        confidence={95}
      />
    </motion.div>
  );
};

export default CashAllocator;
