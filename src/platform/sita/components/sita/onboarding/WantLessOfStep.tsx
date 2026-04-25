import { motion } from "framer-motion";
import {
  Brain, UserCheck, Users, DollarSign, Layers, ListTodo,
  Target, TrendingUp, BellOff, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SetupStageHeader, StageTransitionController } from "@/components/sita/setup";

const options = [
  { key: "forgetting", icon: Brain, label: "Forgetting things" },
  { key: "missed-followup", icon: UserCheck, label: "Missed follow-up" },
  { key: "family-chaos", icon: Users, label: "Family chaos" },
  { key: "money-stress", icon: DollarSign, label: "Money stress" },
  { key: "app-switching", icon: Layers, label: "App switching" },
  { key: "task-overload", icon: ListTodo, label: "Task overload" },
  { key: "unclear-priorities", icon: Target, label: "Unclear priorities" },
  { key: "dropped-opportunities", icon: TrendingUp, label: "Dropped opportunities" },
  { key: "reminders-no-closure", icon: BellOff, label: "Reminders without closure" },
];

interface WantLessOfStepProps {
  selected: string[];
  onToggle: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function WantLessOfStep({ selected, onToggle, onNext, onPrev }: WantLessOfStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <SetupStageHeader
        title="What do you want less of?"
        subtitle="Select everything that resonates. This shapes how SITA prioritizes."
      />

      <div className="grid grid-cols-3 gap-2">
        {options.map(o => {
          const active = selected.includes(o.key);
          return (
            <button
              key={o.key}
              onClick={() => onToggle(o.key)}
              className={cn(
                "rounded-xl border p-3 text-center transition-all duration-200 relative",
                active
                  ? "border-primary/50 bg-primary/8 shadow-sm"
                  : "border-border bg-card hover:border-primary/20"
              )}
            >
              {active && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
              <o.icon className={cn("h-5 w-5 mx-auto mb-1.5", active ? "text-primary" : "text-muted-foreground")} />
              <p className="text-[11px] font-medium text-foreground leading-tight">{o.label}</p>
            </button>
          );
        })}
      </div>

      <StageTransitionController
        onPrev={onPrev}
        onNext={onNext}
        canAdvance={true}
      />
    </motion.div>
  );
}
