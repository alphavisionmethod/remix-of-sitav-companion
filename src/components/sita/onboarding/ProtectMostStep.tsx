import { motion } from "framer-motion";
import {
  UserCheck, DollarSign, Home, Calendar, Target, Heart,
  Users, FileText, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const options = [
  { key: "leads-clients", icon: UserCheck, label: "Leads & clients" },
  { key: "cash-bills", icon: DollarSign, label: "Cash & bills" },
  { key: "household", icon: Home, label: "Household responsibilities" },
  { key: "appointments", icon: Calendar, label: "Appointments & commitments" },
  { key: "long-term-goals", icon: Target, label: "Long-term goals" },
  { key: "peace-of-mind", icon: Heart, label: "Peace of mind" },
  { key: "team-followthrough", icon: Users, label: "Team follow-through" },
  { key: "important-documents", icon: FileText, label: "Important documents" },
];

interface ProtectMostStepProps {
  selected: string[];
  onToggle: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ProtectMostStep({ selected, onToggle, onNext, onPrev }: ProtectMostStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">What should SITA protect most?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">SITA isn't just organizing — it's protecting what matters.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map(o => {
          const active = selected.includes(o.key);
          return (
            <button
              key={o.key}
              onClick={() => onToggle(o.key)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all duration-200 relative group",
                active ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20"
              )}
            >
              {active && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
              <o.icon className={cn("h-5 w-5 mb-2", active ? "text-primary" : "text-muted-foreground")} />
              <p className="text-xs font-semibold text-foreground">{o.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={onNext}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
