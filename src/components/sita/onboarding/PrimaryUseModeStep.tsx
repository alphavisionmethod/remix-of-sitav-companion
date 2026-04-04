import { motion } from "framer-motion";
import { Heart, Users, Briefcase, DollarSign, Sparkles, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selected: string;
  onSelect: (mode: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MODES = [
  {
    key: "personal", icon: Heart, title: "Personal Life",
    desc: "Daily scheduling, health tracking, personal goals",
    gradient: "from-[hsl(345,65%,55%)] to-[hsl(345,65%,45%)]",
    examples: ["Morning & evening routines", "Personal task management", "Health & wellness tracking", "Goal progress"],
  },
  {
    key: "family", icon: Users, title: "Family / Household",
    desc: "Shared calendars, household tasks, family coordination",
    gradient: "from-[hsl(215,70%,55%)] to-[hsl(215,70%,45%)]",
    examples: ["Shared family calendar", "Chore & task distribution", "School & activity schedules", "Meal planning"],
  },
  {
    key: "business", icon: Briefcase, title: "Business / Operator",
    desc: "CRM, invoicing, client management, revenue tracking",
    gradient: "from-primary to-primary/80",
    examples: ["Client pipeline & CRM", "Invoice & payment tracking", "Revenue dashboards", "Team coordination"],
  },
  {
    key: "money", icon: DollarSign, title: "Money / Financial Control",
    desc: "Budgets, bills, investments, subscription management",
    gradient: "from-[hsl(var(--sita-gold))] to-[hsl(38,85%,48%)]",
    examples: ["Budget management", "Bill reminders & autopay", "Investment oversight", "Subscription tracking"],
  },
  {
    key: "full", icon: Sparkles, title: "Full SITA Experience",
    desc: "All modules active, maximum personalization",
    gradient: "from-primary via-[hsl(var(--sita-gold))] to-[hsl(var(--trust-safe))]",
    examples: ["Every domain active", "Full advisor council", "Maximum automation", "Complete oversight"],
  },
];

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

export function PrimaryUseModeStep({ selected, onSelect, onNext, onPrev }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-2xl mx-auto">

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mx-auto mb-4">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">What should SITA help you run first?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">Choose your primary mode. You can always expand later.</p>
      </motion.div>

      <div className="space-y-3">
        {MODES.map((mode, i) => {
          const isSelected = selected === mode.key;
          return (
            <motion.button key={mode.key}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ...spring }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(mode.key)}
              className={cn(
                "w-full rounded-2xl border p-5 text-left transition-all duration-300 relative overflow-hidden",
                isSelected
                  ? "border-primary/50 bg-primary/[0.06] shadow-lg shadow-primary/10"
                  : "border-border/30 bg-card/40 hover:border-primary/20 hover:bg-card/60",
                !isSelected && selected && "opacity-50"
              )}>
              <div className="flex items-start gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0",
                  isSelected ? mode.gradient : "from-secondary to-secondary/80",
                  isSelected && "shadow-primary/20"
                )}>
                  <mode.icon className={cn("h-6 w-6", isSelected ? "text-white" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{mode.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.1 }} className="mt-3 flex flex-wrap gap-1.5">
                      {mode.examples.map(ex => (
                        <span key={ex} className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] text-primary font-medium">
                          {ex}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shrink-0">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
              {isSelected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: "inset 0 0 40px hsl(265 55% 58% / 0.05)" }} />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={onNext} disabled={!selected}
          className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
            selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
