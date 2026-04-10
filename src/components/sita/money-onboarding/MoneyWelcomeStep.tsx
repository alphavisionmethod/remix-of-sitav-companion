import { motion } from "framer-motion";
import { Wallet, Building2, Users, Layers } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader } from "@/components/sita/setup/SetupStageHeader";
import { cn } from "@/lib/utils";
import type { MoneyMode } from "./types";

const PATHS: { key: MoneyMode; icon: typeof Wallet; title: string; desc: string }[] = [
  { key: "personal", icon: Wallet, title: "Personal Money", desc: "Your personal finances, spending, savings, and goals" },
  { key: "founder", icon: Building2, title: "Founder / Business-Linked", desc: "Personal + business finances with boundary protection" },
  { key: "household", icon: Users, title: "Household / Shared", desc: "Shared finances with partner or family members" },
  { key: "hybrid", icon: Layers, title: "Hybrid", desc: "Personal, business, and household — all together" },
];

interface Props {
  selected: MoneyMode;
  onSelect: (mode: MoneyMode) => void;
  onContinue: () => void;
}

export function MoneyWelcomeStep({ selected, onSelect, onContinue }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader
        title="Let's shape your Money Office"
        subtitle="SITA will help model how your money actually works — personal, business, household, and future commitments"
        icon={Wallet}
      />

      <div className="space-y-2">
        {PATHS.map((p, i) => {
          const active = selected === p.key;
          return (
            <motion.button
              key={p.key}
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.06 }}
              whileHover={reduced ? {} : { scale: 1.015 }}
              whileTap={reduced ? {} : { scale: 0.985 }}
              onClick={() => onSelect(p.key)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all flex items-start gap-3",
                active
                  ? "border-primary/50 bg-primary/8 shadow-md shadow-primary/10"
                  : "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <div className={cn("rounded-lg p-2", active ? "bg-primary/15" : "bg-secondary")}>
                <p.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={onContinue}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        whileTap={reduced ? {} : { scale: 0.98 }}
      >
        Continue
      </motion.button>
    </div>
  );
}
