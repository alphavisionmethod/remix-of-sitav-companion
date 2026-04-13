import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ModuleWorkspace } from "@/components/sita/domain-shared/ModuleWorkspace";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { SpendingCategoryPane } from "@/components/money/SpendingCategoryPane";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ShoppingCart,
  CreditCard, Home, Car, Utensils, Wifi, Heart, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const DEMO_CATEGORIES: SpendingCategory[] = [
  { id: "sc1", name: "Groceries", icon: ShoppingCart, thisWeek: 287, lastWeek: 245, average: 260, transactions: 4, flagged: false },
  { id: "sc2", name: "Dining", icon: Utensils, thisWeek: 182, lastWeek: 95, average: 110, transactions: 6, flagged: true, flagReason: "65% above 90-day average" },
  { id: "sc3", name: "Transport", icon: Car, thisWeek: 68, lastWeek: 72, average: 70, transactions: 3, flagged: false },
  { id: "sc4", name: "Housing", icon: Home, thisWeek: 0, lastWeek: 2100, average: 2100, transactions: 0, flagged: false },
  { id: "sc5", name: "Subscriptions", icon: Wifi, thisWeek: 45, lastWeek: 38, average: 38, transactions: 2, flagged: true, flagReason: "New charge detected: $7/mo streaming service" },
  { id: "sc6", name: "Health", icon: Heart, thisWeek: 120, lastWeek: 0, average: 30, transactions: 1, flagged: true, flagReason: "Unusual one-time charge — pharmacy $120" },
];

const DEMO_RECURRING = [
  { id: "rc1", name: "Cloud storage plan", previousAmount: 9.99, newAmount: 12.99, changeType: "increase" as const, confidence: 0.95 },
  { id: "rc2", name: "New streaming service", previousAmount: 0, newAmount: 7.99, changeType: "new" as const, confidence: 0.88 },
  { id: "rc3", name: "Gym membership", previousAmount: 49, newAmount: 39, changeType: "decrease" as const, confidence: 0.92 },
];

const SpendingPulse = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const flaggedCount = DEMO_CATEGORIES.filter(c => c.flagged).length;
  const pulseState: PulseState = flaggedCount >= 3 ? "attention" : flaggedCount > 0 ? "review-needed" : "all-normal";

  const totalThisWeek = useMemo(() => DEMO_CATEGORIES.reduce((sum, c) => sum + c.thisWeek, 0), []);
  const totalLastWeek = useMemo(() => DEMO_CATEGORIES.reduce((sum, c) => sum + c.lastWeek, 0), []);
  const weekChange = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek * 100) : 0;

  const selectedCategory = DEMO_CATEGORIES.find(c => c.id === selectedId) || null;

  const listContent = (
    <div className="space-y-3">
      {/* Pulse State Banner */}
      <div className={cn("flex items-center gap-3 rounded-xl border p-3",
        pulseState === "all-normal" ? "bg-chart-2/10 border-chart-2/20" : pulseState === "review-needed" ? "bg-amber-500/10 border-amber-500/20" : "bg-destructive/10 border-destructive/20"
      )}>
        {pulseState === "all-normal" ? <CheckCircle className="h-5 w-5 text-chart-2" /> : <AlertTriangle className={cn("h-5 w-5", pulseState === "review-needed" ? "text-amber-500" : "text-destructive")} />}
        <div>
          <p className="text-xs font-semibold text-foreground">{pulseState === "all-normal" ? "All Normal" : pulseState === "review-needed" ? "Review Needed" : "Attention"}</p>
          <p className="text-[10px] text-muted-foreground">{flaggedCount} categories flagged</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-secondary/20 p-2 text-center"><p className="text-[10px] text-muted-foreground">This Week</p><p className="font-bold text-sm">${totalThisWeek}</p></div>
        <div className="rounded-lg bg-secondary/20 p-2 text-center"><p className="text-[10px] text-muted-foreground">Last Week</p><p className="font-bold text-sm text-muted-foreground">${totalLastWeek}</p></div>
        <div className="rounded-lg bg-secondary/20 p-2 text-center"><p className="text-[10px] text-muted-foreground">Change</p><p className={cn("font-bold text-sm", weekChange > 15 ? "text-destructive" : weekChange < -5 ? "text-chart-2" : "text-foreground")}>{weekChange >= 0 ? "+" : ""}{weekChange.toFixed(0)}%</p></div>
      </div>

      {/* Category List */}
      {DEMO_CATEGORIES.map((cat, i) => {
        const pctChange = cat.average > 0 ? ((cat.thisWeek - cat.average) / cat.average * 100) : 0;
        const CatIcon = cat.icon;
        return (
          <motion.div key={cat.id}
            onClick={() => setSelectedId(cat.id)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
              selectedId === cat.id ? "bg-primary/10 border border-primary/20" : cat.flagged ? "bg-amber-500/5 border border-amber-500/15" : "bg-secondary/15 border border-transparent hover:bg-secondary/30"
            )}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="rounded-lg bg-secondary/50 p-2 shrink-0"><CatIcon className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold text-foreground">{cat.name}</p>
                <span className="text-[9px] text-muted-foreground">{cat.transactions} txns</span>
              </div>
              {cat.flagged && cat.flagReason && <p className="text-[9px] text-amber-500 font-medium mt-0.5">{cat.flagReason}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] font-bold text-foreground">${cat.thisWeek}</p>
              <div className="flex items-center justify-end gap-0.5">
                {pctChange > 5 ? <ArrowUpRight className="h-3 w-3 text-destructive" /> : pctChange < -5 ? <ArrowDownRight className="h-3 w-3 text-chart-2" /> : null}
                <span className={cn("text-[9px] font-medium", pctChange > 15 ? "text-destructive" : pctChange < -5 ? "text-chart-2" : "text-muted-foreground")}>
                  {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Recurring Changes */}
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 mt-2">
        <p className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> Recurring Changes</p>
        {DEMO_RECURRING.map(change => (
          <div key={change.id} className="flex items-center gap-2 py-1.5">
            {change.changeType === "increase" ? <TrendingUp className="h-3 w-3 text-destructive" /> : change.changeType === "new" ? <CreditCard className="h-3 w-3 text-amber-500" /> : <TrendingDown className="h-3 w-3 text-chart-2" />}
            <span className="text-[10px] flex-1">{change.name}</span>
            <span className="text-[10px] text-muted-foreground">{change.changeType === "new" ? `New: $${change.newAmount}/mo` : `$${change.previousAmount} → $${change.newAmount}`}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DemoModeBadge />
      <ModuleWorkspace
        domain="finance"
        title="Spending Pulse"
        icon={TrendingUp}
        list={listContent}
        detail={<SpendingCategoryPane category={selectedCategory} />}
        detailActive={!!selectedId}
        onCloseDetail={() => setSelectedId(null)}
        advisor={
          <DomainAdvisorCard
            domain="finance"
            insights={[
              { id: "sp-1", text: `Dining is 65% above your 90-day average — consider reviewing recent charges`, confidence: 88 },
              { id: "sp-2", text: "New streaming subscription detected ($7.99/mo) — review if intended", confidence: 82, action: "Review", onAction: () => setSelectedId("sc5") },
            ]}
          />
        }
      />
    </motion.div>
  );
};

export default SpendingPulse;
