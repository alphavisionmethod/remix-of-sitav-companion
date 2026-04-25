import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { SetupStageHeader } from "@/platform/sita/components/sita/setup/SetupStageHeader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { FinancialPriority } from "./types";

const PRIORITIES: { key: FinancialPriority; label: string }[] = [
  { key: "control_spending", label: "Control spending" },
  { key: "understand_flows", label: "Understand where money goes" },
  { key: "build_reserves", label: "Build reserves" },
  { key: "reduce_debt", label: "Reduce debt" },
  { key: "avoid_bill_stress", label: "Avoid bill stress" },
  { key: "separate_biz_personal", label: "Separate business & personal" },
  { key: "tax_readiness", label: "Improve tax readiness" },
  { key: "household_money", label: "Manage shared household money" },
  { key: "plan_goals", label: "Plan future goals" },
];

interface Props {
  selected: FinancialPriority[];
  onToggle: (p: FinancialPriority) => void;
  onContinue: () => void;
}

export function FinancialPrioritiesStep({ selected, onToggle, onContinue }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Financial Priorities" subtitle="What matters most right now? Select all that apply." icon={Target} />

      <div className="flex flex-wrap gap-2">
        {PRIORITIES.map((p, i) => {
          const active = selected.includes(p.key);
          return (
            <motion.button
              key={p.key}
              initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.03 }}
              onClick={() => onToggle(p.key)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
                active
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/30"
              )}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        disabled={selected.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
