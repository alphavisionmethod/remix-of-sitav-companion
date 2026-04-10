import { motion } from "framer-motion";
import { Network, Receipt, TrendingDown, Target, ShieldCheck, Users, Calculator, Banknote } from "lucide-react";
import { SetupStageHeader } from "@/components/sita/setup/SetupStageHeader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { StructureItem } from "./types";

const STRUCTURE_TYPES: { type: StructureItem["type"]; icon: typeof Receipt; label: string; desc: string }[] = [
  { type: "bill", icon: Receipt, label: "Fixed Bills", desc: "Rent, utilities, insurance" },
  { type: "recurring", icon: TrendingDown, label: "Recurring Expenses", desc: "Subscriptions, memberships" },
  { type: "debt", icon: TrendingDown, label: "Debt Payments", desc: "Loans, credit cards, mortgages" },
  { type: "goal", icon: Target, label: "Goals", desc: "Savings goals, future purchases" },
  { type: "reserve", icon: ShieldCheck, label: "Reserve Funds", desc: "Emergency, tax, business ops" },
  { type: "household_commitment", icon: Users, label: "Household Commitments", desc: "Shared obligations, family costs" },
  { type: "tax", icon: Calculator, label: "Tax Obligations", desc: "Estimated taxes, set-asides" },
  { type: "payroll_draw", icon: Banknote, label: "Payroll / Owner Draw", desc: "Business payroll or draws" },
];

interface Props {
  items: StructureItem[];
  onToggle: (type: StructureItem["type"]) => void;
  onContinue: () => void;
}

export function MoneyStructureStep({ items, onToggle, onContinue }: Props) {
  const reduced = useReducedMotion();
  const isEnabled = (t: StructureItem["type"]) => items.some((s) => s.type === t && s.enabled);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Money Structure" subtitle="What financial structures do you have? This builds your Money Twin." icon={Network} />

      <div className="space-y-2">
        {STRUCTURE_TYPES.map((s, i) => {
          const active = isEnabled(s.type);
          return (
            <motion.button
              key={s.type}
              initial={reduced ? {} : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.04 }}
              onClick={() => onToggle(s.type)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all flex items-center gap-3",
                active ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <s.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
              <div className={cn("h-4 w-4 rounded-full border-2 transition-colors", active ? "border-primary bg-primary" : "border-muted")} />
            </motion.button>
          );
        })}
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Continue
      </button>
    </div>
  );
}
