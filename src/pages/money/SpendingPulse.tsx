import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ShoppingCart,
  CreditCard, Home, Car, Utensils, Wifi, Heart, Zap, ArrowUpRight, ArrowDownRight, Shield
} from "lucide-react";

type PulseState = "all-normal" | "review-needed" | "attention";

interface SpendingCategory {
  id: string;
  name: string;
  icon: typeof DollarSign;
  thisWeek: number;
  lastWeek: number;
  average: number;
  transactions: number;
  flagged: boolean;
  flagReason?: string;
}

interface RecurringChange {
  id: string;
  name: string;
  previousAmount: number;
  newAmount: number;
  changeType: "increase" | "decrease" | "new";
  confidence: number;
}

const DEMO_CATEGORIES: SpendingCategory[] = [
  { id: "sc1", name: "Groceries", icon: ShoppingCart, thisWeek: 287, lastWeek: 245, average: 260, transactions: 4, flagged: false },
  { id: "sc2", name: "Dining", icon: Utensils, thisWeek: 182, lastWeek: 95, average: 110, transactions: 6, flagged: true, flagReason: "65% above 90-day average" },
  { id: "sc3", name: "Transport", icon: Car, thisWeek: 68, lastWeek: 72, average: 70, transactions: 3, flagged: false },
  { id: "sc4", name: "Housing", icon: Home, thisWeek: 0, lastWeek: 2100, average: 2100, transactions: 0, flagged: false },
  { id: "sc5", name: "Subscriptions", icon: Wifi, thisWeek: 45, lastWeek: 38, average: 38, transactions: 2, flagged: true, flagReason: "New charge detected: $7/mo streaming service" },
  { id: "sc6", name: "Health", icon: Heart, thisWeek: 120, lastWeek: 0, average: 30, transactions: 1, flagged: true, flagReason: "Unusual one-time charge — pharmacy $120" },
];

const DEMO_RECURRING_CHANGES: RecurringChange[] = [
  { id: "rc1", name: "Cloud storage plan", previousAmount: 9.99, newAmount: 12.99, changeType: "increase", confidence: 0.95 },
  { id: "rc2", name: "New streaming service", previousAmount: 0, newAmount: 7.99, changeType: "new", confidence: 0.88 },
  { id: "rc3", name: "Gym membership", previousAmount: 49, newAmount: 39, changeType: "decrease", confidence: 0.92 },
];

const stateConfig: Record<PulseState, { bg: string; icon: typeof CheckCircle; label: string; description: string }> = {
  "all-normal": { bg: "bg-chart-2/10 border-chart-2/20", icon: CheckCircle, label: "All Normal", description: "Spending patterns are within expected ranges." },
  "review-needed": { bg: "bg-amber-500/10 border-amber-500/20", icon: AlertTriangle, label: "Review Needed", description: "Some categories need your attention." },
  attention: { bg: "bg-destructive/10 border-destructive/20", icon: AlertTriangle, label: "Attention", description: "Unusual spending detected in multiple categories." },
};

const SpendingPulse = () => {
  const flaggedCount = DEMO_CATEGORIES.filter(c => c.flagged).length;
  const pulseState: PulseState = flaggedCount >= 3 ? "attention" : flaggedCount > 0 ? "review-needed" : "all-normal";
  const state = stateConfig[pulseState];
  const StateIcon = state.icon;

  const totalThisWeek = useMemo(() => DEMO_CATEGORIES.reduce((sum, c) => sum + c.thisWeek, 0), []);
  const totalLastWeek = useMemo(() => DEMO_CATEGORIES.reduce((sum, c) => sum + c.lastWeek, 0), []);
  const weekChange = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek * 100) : 0;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Spending Pulse"
        subtitle="Do I need to care? — Pattern-aware spending awareness"
      />

      {/* Pulse State Banner */}
      <motion.div
        className={`flex items-center gap-3 rounded-2xl border p-4 ${state.bg}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StateIcon className={`h-6 w-6 shrink-0 ${
          pulseState === "all-normal" ? "text-chart-2" : pulseState === "review-needed" ? "text-amber-500" : "text-destructive"
        }`} />
        <div>
          <p className="text-sm font-semibold text-foreground">{state.label}</p>
          <p className="text-xs text-muted-foreground">{state.description}</p>
        </div>
      </motion.div>

      {/* Weekly Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "This Week", value: `$${totalThisWeek.toLocaleString()}`, color: "text-foreground" },
          { label: "Last Week", value: `$${totalLastWeek.toLocaleString()}`, color: "text-muted-foreground" },
          { label: "Change", value: `${weekChange >= 0 ? "+" : ""}${weekChange.toFixed(0)}%`, color: weekChange > 15 ? "text-destructive" : weekChange < -5 ? "text-chart-2" : "text-foreground" },
          { label: "Flags", value: flaggedCount, color: flaggedCount > 0 ? "text-amber-500" : "text-chart-2" },
        ].map(s => (
          <GlassCard key={s.label} glow="none" className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Category Breakdown */}
      <GlassCard glow="none" className="p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Category Breakdown</p>
        <div className="space-y-3">
          {DEMO_CATEGORIES.map((cat, i) => {
            const pctChange = cat.average > 0 ? ((cat.thisWeek - cat.average) / cat.average * 100) : 0;
            const CatIcon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${cat.flagged ? "bg-amber-500/5 border border-amber-500/15" : "bg-secondary/15"}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="rounded-lg bg-secondary/50 p-2 shrink-0">
                  <CatIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold text-foreground">{cat.name}</p>
                    <span className="text-[9px] text-muted-foreground">{cat.transactions} txns</span>
                  </div>
                  {cat.flagged && cat.flagReason && (
                    <p className="text-[9px] text-amber-500 font-medium mt-0.5">{cat.flagReason}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-foreground">${cat.thisWeek}</p>
                  <div className="flex items-center justify-end gap-0.5">
                    {pctChange > 5 ? (
                      <ArrowUpRight className="h-3 w-3 text-destructive" />
                    ) : pctChange < -5 ? (
                      <ArrowDownRight className="h-3 w-3 text-chart-2" />
                    ) : null}
                    <span className={`text-[9px] font-medium ${
                      pctChange > 15 ? "text-destructive" : pctChange < -5 ? "text-chart-2" : "text-muted-foreground"
                    }`}>
                      {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(0)}% vs avg
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Recurring Pattern Changes */}
      <GlassCard glow="primary" intensity="subtle" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">Recurring Pattern Changes</p>
        </div>
        <div className="space-y-2">
          {DEMO_RECURRING_CHANGES.map((change) => (
            <div
              key={change.id}
              className="flex items-center gap-3 rounded-xl border border-border/20 bg-secondary/15 px-3 py-2.5"
            >
              <div className={`rounded-lg p-1.5 ${
                change.changeType === "increase" ? "bg-destructive/10" : change.changeType === "new" ? "bg-amber-500/10" : "bg-chart-2/10"
              }`}>
                {change.changeType === "increase" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                ) : change.changeType === "new" ? (
                  <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-chart-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">{change.name}</p>
                <p className="text-[9px] text-muted-foreground">
                  {change.changeType === "new"
                    ? `New: $${change.newAmount}/mo`
                    : `$${change.previousAmount} → $${change.newAmount}/mo`}
                </p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">
                {Math.round(change.confidence * 100)}% confidence
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default SpendingPulse;
