import { motion } from "framer-motion";
import { Gauge, TrendingDown, RotateCcw, TrendingUp, Rocket, Sword, ShieldCheck, Building2, Users, Flame } from "lucide-react";
import { SetupStageHeader } from "@/platform/sita/components/sita/setup/SetupStageHeader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { OperatingMode } from "./types";

const MODES: { key: OperatingMode; icon: typeof Gauge; label: string; desc: string }[] = [
  { key: "stable", icon: Gauge, label: "Stable", desc: "Things are predictable and calm" },
  { key: "tightening", icon: TrendingDown, label: "Tightening", desc: "Need to reduce spending soon" },
  { key: "recovery", icon: RotateCcw, label: "Recovery", desc: "Rebuilding from a setback" },
  { key: "growth", icon: TrendingUp, label: "Growth", desc: "Income is growing, investing in future" },
  { key: "expansion", icon: Rocket, label: "Expansion", desc: "Scaling business or major life change" },
  { key: "debt_attack", icon: Sword, label: "Debt Attack", desc: "Aggressively paying down debt" },
  { key: "tax_protection", icon: ShieldCheck, label: "Tax Protection", desc: "Preparing for tax obligations" },
  { key: "founder_conservation", icon: Building2, label: "Founder Conservation", desc: "Preserving business runway" },
  { key: "household_protection", icon: Users, label: "Household Protection", desc: "Protecting shared finances" },
  { key: "launch", icon: Flame, label: "Launch Mode", desc: "Starting something new" },
];

interface Props {
  selected: OperatingMode;
  onSelect: (mode: OperatingMode) => void;
  onContinue: () => void;
}

export function OperatingModeStep({ selected, onSelect, onContinue }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Operating Mode" subtitle="What best describes your current financial season?" icon={Gauge} />

      <div className="grid grid-cols-2 gap-2">
        {MODES.map((m, i) => {
          const active = selected === m.key;
          return (
            <motion.button
              key={m.key}
              initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.03 }}
              onClick={() => onSelect(m.key)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                active ? "border-primary/50 bg-primary/8 shadow-md shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <m.icon className={cn("h-4 w-4 mb-1", active ? "text-primary" : "text-muted-foreground")} />
              <p className="text-xs font-semibold text-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
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
