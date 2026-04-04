import { motion } from "framer-motion";
import { Sun, Clock, Moon, BarChart3, Calendar, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const rituals = [
  { key: "morning-pulse", icon: Sun, title: "Morning Pulse", desc: "Start the day with priorities, calendar, and anything that needs attention." },
  { key: "midday-catchup", icon: Clock, title: "Midday Catch-Up", desc: "Quick status at noon: progress, blockers, incoming items." },
  { key: "evening-closure", icon: Moon, title: "Evening Closure", desc: "Review what happened, close loops, and prepare for tomorrow." },
  { key: "weekly-boardroom", icon: BarChart3, title: "Weekly Boardroom", desc: "Full weekly operating review: actions, financials, decisions, proofs." },
  { key: "monthly-review", icon: Calendar, title: "Monthly Review", desc: "Deep review: trends, goals, revenue, trust health, and strategic decisions." },
];

interface RitualsStepProps {
  selected: string[];
  onToggle: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function RitualsStep({ selected, onToggle, onNext, onPrev }: RitualsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">How should SITA support your rhythm?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">SITA is a living operating system with rituals, not a static dashboard.</p>
      </div>

      <div className="space-y-3">
        {rituals.map(r => {
          const active = selected.includes(r.key);
          return (
            <button key={r.key} onClick={() => onToggle(r.key)}
              className={cn("w-full rounded-xl border p-4 text-left transition-all duration-200",
                active ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20")}>
              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2", active ? "bg-primary/15" : "bg-secondary")}>
                  <r.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
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
