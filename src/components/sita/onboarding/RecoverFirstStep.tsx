import { motion } from "framer-motion";
import { UserCheck, DollarSign, Calendar, Home, Target, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { key: "missed-followup", icon: UserCheck, title: "A missed follow-up", desc: "Find someone who needs a reply." },
  { key: "bill-payment", icon: DollarSign, title: "A bill or payment", desc: "Surface anything due soon." },
  { key: "weekly-schedule", icon: Calendar, title: "This week's schedule", desc: "Get clarity on what's ahead." },
  { key: "household-coordination", icon: Home, title: "Household coordination", desc: "Sync responsibilities." },
  { key: "clearer-priorities", icon: Target, title: "A clearer priorities view", desc: "See what matters most right now." },
];

interface RecoverFirstStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function RecoverFirstStep({ selected, onSelect, onNext, onPrev }: RecoverFirstStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">What should SITA help you recover first?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">This creates instant value the moment you enter.</p>
      </div>

      <div className="space-y-3">
        {options.map(o => (
          <button key={o.key} onClick={() => onSelect(o.key)}
            className={cn("w-full rounded-xl border p-4 text-left transition-all duration-200",
              selected === o.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20")}>
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", selected === o.key ? "bg-primary/15" : "bg-secondary")}>
                <o.icon className={cn("h-4 w-4", selected === o.key ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{o.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
              </div>
              {selected === o.key && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        ))}
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
