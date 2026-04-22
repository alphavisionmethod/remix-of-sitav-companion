import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SpendingCategoryPane } from "@/components/money/SpendingCategoryPane";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ShoppingCart,
  CreditCard, Home, Car, Utensils, Wifi, Heart, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// New design system
import { HeroCard, QueueCard, StatusCard, ActionCard } from "@/components/sita/cards";
import { FreshnessBadge, UrgencyBadge } from "@/components/sita/badges";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

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
  { id: "rc1", name: "Cloud storage plan", previousAmount: 9.99, newAmount: 12.99, changeType: "increase" as const },
  { id: "rc2", name: "New streaming service", previousAmount: 0, newAmount: 7.99, changeType: "new" as const },
  { id: "rc3", name: "Gym membership", previousAmount: 49, newAmount: 39, changeType: "decrease" as const },
];

const SpendingPulse = () => {
  const { isDemoMode } = useDataMode();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const flaggedCount = DEMO_CATEGORIES.filter(c => c.flagged).length;
  const pulseState: PulseState = flaggedCount >= 3 ? "attention" : flaggedCount > 0 ? "review-needed" : "all-normal";

  const totalThisWeek = useMemo(() => (isDemoMode ? DEMO_CATEGORIES : [] as typeof DEMO_CATEGORIES).reduce((sum, c) => sum + c.thisWeek, 0), []);
  const totalLastWeek = useMemo(() => (isDemoMode ? DEMO_CATEGORIES : [] as typeof DEMO_CATEGORIES).reduce((sum, c) => sum + c.lastWeek, 0), []);
  const weekChange = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek * 100) : 0;

  const selectedCategory = DEMO_CATEGORIES.find(c => c.id === selectedId) || null;

  const listPane = (
    <div className="p-3 space-y-3">
{/* Pulse State */}
      <StatusCard
        label={pulseState === "all-normal" ? "All Normal" : pulseState === "review-needed" ? "Review Needed" : "Attention Required"}
        status={pulseState === "all-normal" ? "healthy" : pulseState === "review-needed" ? "degraded" : "down"}
        lastChecked={`${flaggedCount} categories flagged`}
        icon={pulseState === "all-normal" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <AppSurface level={1} className="p-2.5 text-center">
          <p className="text-[10px] text-[hsl(0_0%_50%)] uppercase tracking-wider">This Week</p>
          <p className="text-[14px] font-bold text-[hsl(0_0%_90%)] tabular-nums">${totalThisWeek}</p>
        </AppSurface>
        <AppSurface level={1} className="p-2.5 text-center">
          <p className="text-[10px] text-[hsl(0_0%_50%)] uppercase tracking-wider">Last Week</p>
          <p className="text-[14px] font-bold text-[hsl(0_0%_60%)] tabular-nums">${totalLastWeek}</p>
        </AppSurface>
        <AppSurface level={1} className="p-2.5 text-center">
          <p className="text-[10px] text-[hsl(0_0%_50%)] uppercase tracking-wider">Change</p>
          <p className={cn("text-[14px] font-bold tabular-nums", weekChange > 15 ? "text-[hsl(0_70%_55%)]" : weekChange < -5 ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_85%)]")}>
            {weekChange >= 0 ? "+" : ""}{weekChange.toFixed(0)}%
          </p>
        </AppSurface>
      </div>

      {/* Category List */}
      <ListReveal>
        {(isDemoMode ? DEMO_CATEGORIES : [] as typeof DEMO_CATEGORIES).map((cat) => {
          const pctChange = cat.average > 0 ? ((cat.thisWeek - cat.average) / cat.average * 100) : 0;
          const CatIcon = cat.icon;
          return (
            <ListRevealItem key={cat.id}>
              <button
                onClick={() => setSelectedId(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  selectedId === cat.id
                    ? "bg-[hsl(265_55%_58%/0.12)] border border-[hsl(265_55%_58%/0.25)]"
                    : cat.flagged
                    ? "bg-[hsl(38_85%_58%/0.06)] border border-[hsl(38_85%_58%/0.12)]"
                    : "bg-[hsl(0_0%_100%/0.03)] border border-transparent hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
              >
                <div className="rounded-lg bg-[hsl(0_0%_100%/0.06)] p-2 shrink-0">
                  <CatIcon className="h-4 w-4 text-[hsl(0_0%_60%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold text-[hsl(0_0%_85%)]">{cat.name}</p>
                    <span className="text-[9px] text-[hsl(0_0%_45%)]">{cat.transactions} txns</span>
                  </div>
                  {cat.flagged && cat.flagReason && (
                    <p className="text-[9px] text-[hsl(38_85%_58%)] font-medium mt-0.5">{cat.flagReason}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-[hsl(0_0%_90%)] tabular-nums">${cat.thisWeek}</p>
                  <div className="flex items-center justify-end gap-0.5">
                    {pctChange > 5 ? <ArrowUpRight className="h-3 w-3 text-[hsl(0_70%_55%)]" /> : pctChange < -5 ? <ArrowDownRight className="h-3 w-3 text-[hsl(152_55%_48%)]" /> : null}
                    <span className={cn("text-[9px] font-medium tabular-nums", pctChange > 15 ? "text-[hsl(0_70%_55%)]" : pctChange < -5 ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_50%)]")}>
                      {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </button>
            </ListRevealItem>
          );
        })}
      </ListReveal>

      {/* Recurring Changes */}
      <QueueCard
        title="RECURRING CHANGES"
        items={(isDemoMode ? DEMO_RECURRING : [] as typeof DEMO_RECURRING).map(c => ({
          id: c.id,
          label: c.name,
          meta: c.changeType === "new" ? `New: $${c.newAmount}/mo` : `$${c.previousAmount} → $${c.newAmount}`,
          urgency: c.changeType === "increase" ? "high" as const : c.changeType === "new" ? "normal" as const : "low" as const,
        }))}
      />
    </div>
  );

  const detailPane = selectedCategory ? (
    <div className="p-4">
      <SpendingCategoryPane category={selectedCategory} />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <TrendingUp className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select a category to view details</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selectedId}
        defaultSplit={45}
      />
    </div>
  );
};

export default SpendingPulse;
