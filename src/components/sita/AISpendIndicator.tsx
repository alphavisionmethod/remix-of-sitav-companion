import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, ChevronUp, TrendingUp, Brain, FileText, Workflow, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "@/contexts/DataModeContext";

interface SpendCategory {
  label: string;
  amount: number;
  icon: typeof Zap;
  percentage: number;
}

const DEMO_SPEND = {
  budget: 50,
  spent: 4.32,
  categories: [
    { label: "Advising", amount: 2.15, icon: Brain, percentage: 50 },
    { label: "Automations", amount: 0.92, icon: Workflow, percentage: 21 },
    { label: "Simulations", amount: 0.85, icon: TrendingUp, percentage: 20 },
    { label: "Document OCR", amount: 0.40, icon: FileText, percentage: 9 },
  ] as SpendCategory[],
  forecast: 8.50,
};

export const AISpendIndicator = () => {
  const [expanded, setExpanded] = useState(false);

  const { data: liveSpend } = useQuery({
    queryKey: ["ai-spend-summary", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await supabase.from("ai_usage_ledger").select("estimated_cost_usd").eq("user_id", user!.id);
      const totalSpent = (data ?? []).reduce((sum, r) => sum + (Number(r.estimated_cost_usd) || 0), 0);
      return { budget: 50, spent: totalSpent, categories: DEMO_SPEND.categories, forecast: totalSpent * 2.5 };
    },
  });

  const { budget, spent, categories, forecast } = isDemoMode ? DEMO_SPEND : (liveSpend ?? DEMO_SPEND);
  const pct = Math.round((spent / budget) * 100);
  const barColor = pct <= 50 ? "bg-trust-safe" : pct <= 80 ? "bg-accent" : "bg-destructive";
  const textColor = pct <= 50 ? "text-trust-safe" : pct <= 80 ? "text-accent" : "text-destructive";

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="hidden sm:flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
        title="AI Spend"
      >
        <Zap className={cn("h-3 w-3", textColor)} />
        <span className={cn("font-semibold", textColor)}>${spent.toFixed(2)}</span>
        <span className="text-muted-foreground/60">/ ${budget}</span>
        <div className="w-12 h-1.5 rounded-full bg-secondary ml-1 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border bg-card shadow-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">This Month's AI Spend</p>
                <button onClick={() => setExpanded(false)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Budget bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={cn("text-lg font-display font-bold", textColor)}>${spent.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">of ${budget.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", barColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  ${(budget - spent).toFixed(2)} remaining · Forecast: ${forecast.toFixed(2)} ({Math.round((forecast / budget) * 100)}%)
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</p>
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.label} className="flex items-center gap-2.5">
                      <CatIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-foreground">{cat.label}</span>
                          <span className="text-[11px] font-medium text-foreground">${cat.amount.toFixed(2)}</span>
                        </div>
                        <div className="h-1 rounded-full bg-secondary mt-0.5 overflow-hidden">
                          <div className="h-full rounded-full bg-primary/40" style={{ width: `${cat.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground w-7 text-right">{cat.percentage}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
                  Set Budget
                </button>
                <button className="flex-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
