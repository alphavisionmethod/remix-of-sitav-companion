import { motion } from "framer-motion";
import { LayoutGrid, List, Zap, Bot } from "lucide-react";
import { SetupStageHeader } from "@/components/sita/setup/SetupStageHeader";
import { Switch } from "@/components/ui/switch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { BudgetStyle } from "./types";

const STYLES: { key: BudgetStyle; icon: typeof LayoutGrid; title: string; desc: string }[] = [
  { key: "envelope", icon: LayoutGrid, title: "Envelope Budgeting", desc: "Allocate every dollar to a purpose" },
  { key: "category", icon: List, title: "Category Budgeting", desc: "Set monthly limits per category" },
  { key: "lightweight", icon: Zap, title: "Lightweight Tracking", desc: "Just track — no strict budgets" },
  { key: "advisor_guided", icon: Bot, title: "Advisor-Guided", desc: "Let SITA suggest and manage budgets" },
];

interface Props {
  budgetStyle: BudgetStyle;
  rollover: boolean;
  sinkingFunds: boolean;
  onChange: (patch: Partial<{ budgetStyle: BudgetStyle; rollover: boolean; sinkingFunds: boolean }>) => void;
  onContinue: () => void;
}

export function BudgetStyleStep({ budgetStyle, rollover, sinkingFunds, onChange, onContinue }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Budget Style" subtitle="How do you want to manage your money?" icon={LayoutGrid} />

      <div className="space-y-2">
        {STYLES.map((s, i) => {
          const active = budgetStyle === s.key;
          return (
            <motion.button
              key={s.key}
              initial={reduced ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.05 }}
              onClick={() => onChange({ budgetStyle: s.key })}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all flex items-start gap-3",
                active ? "border-primary/50 bg-primary/8 shadow-md shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <div className={cn("rounded-lg p-2", active ? "bg-primary/15" : "bg-secondary")}>
                <s.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Allow rollover between months?</span>
          <Switch checked={rollover} onCheckedChange={(v) => onChange({ rollover: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Use sinking funds?</span>
          <Switch checked={sinkingFunds} onCheckedChange={(v) => onChange({ sinkingFunds: v })} />
        </div>
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Continue
      </button>
    </div>
  );
}
