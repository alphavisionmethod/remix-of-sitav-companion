// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Cash Allocation AI
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
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
  bills: "bg-urgency-high", "tax-reserve": "bg-[hsl(var(--sita-gold))]",
  "emergency-reserve": "bg-primary", "debt-payoff": "bg-destructive",
  "sinking-funds": "bg-trust-verified", "payroll-reserve": "bg-accent",
  discretionary: "bg-[hsl(var(--trust-safe))]", investments: "bg-[hsl(var(--primary))]",
  "expansion-reserve": "bg-[hsl(var(--sita-gold))]",
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
  const StrategyIcon = meta.icon;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Cash Allocation AI" subtitle="Intelligent cash distribution across your financial priorities" />
      <DemoModeBadge />

      <div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Available Cash" value={`$${(plan.availableCashCents / 100).toLocaleString()}`} icon={DollarSign} />
        <KPITile label="Allocated" value={`$${(plan.totalAllocatedCents / 100).toLocaleString()}`} icon={PieChart} />
        <KPITile label="Unallocated" value={`$${(plan.unallocatedCents / 100).toLocaleString()}`} icon={Zap} />
      </div>

      {/* Strategy Selector */}
      <SitaSectionHeader title="Allocation Strategy" />
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(strategyMeta) as AllocationStrategy[]).map(s => {
          const m = strategyMeta[s];
          const Icon = m.icon;
          const isActive = strategy === s;
          return (
            <SitaCard key={s} hover onClick={() => setStrategy(s)}
              className={`p-4 cursor-pointer transition-all ${isActive ? "ring-2 ring-primary bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.description}</p>
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      {/* Allocation Breakdown */}
      <SitaCard hover={false} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <StrategyIcon className="h-4 w-4 text-primary" />
          <SitaCardTitle sub={`$${(plan.availableCashCents / 100).toLocaleString()} distributed across ${plan.allocations.length} buckets`}>
            {meta.label} Allocation
          </SitaCardTitle>
          <TrustBadge level="verified" label="Deterministic" size="sm" className="ml-auto" />
        </div>

        {/* Stacked Bar */}
        <div className="flex h-6 rounded-full overflow-hidden mb-4">
          {plan.allocations.filter(a => a.amountCents > 0).map(a => (
            <div key={a.bucket} className={`${bucketColors[a.bucket] || "bg-muted"} transition-all`}
              style={{ width: `${a.percentOfTotal}%` }} title={`${a.label}: ${a.percentOfTotal}%`} />
          ))}
        </div>

        <div className="space-y-2">
          {plan.allocations.filter(a => a.amountCents > 0).map(a => (
            <div key={a.bucket} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2.5">
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
      </SitaCard>

      <LiveAdvisorCard
        advisor="money" intent="cash_allocation"
        demoName="Cash Allocator Advisor" demoRole="Distribution Intelligence" demoConfidence="High"
        demoRecommendation={`${meta.label} plan allocates $${(plan.totalAllocatedCents / 100).toLocaleString()} across ${plan.allocations.length} buckets. Bills ($${(plan.allocations[0]?.amountCents / 100 || 0).toLocaleString()}) covered first.`}
        demoReasoning="Priority-weighted allocation: obligations → protection → growth. All numbers are deterministic."
      />
    </motion.div>
  );
};

export default CashAllocator;
