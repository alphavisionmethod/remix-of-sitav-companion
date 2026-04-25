import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Users, Briefcase, DollarSign, Sparkles, Check,
  Calendar, MessageSquare, Shield, Brain, Bell, BarChart3, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController } from "@/platform/sita/components/sita/setup";

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
    modules: [
      { name: "Schedule", icon: Calendar },
      { name: "Goals", icon: BarChart3 },
      { name: "Wellness", icon: Heart },
    ],
    advisors: ["Life Advisor", "Schedule Advisor"],
  },
  {
    key: "family", icon: Users, title: "Family / Household",
    desc: "Shared calendars, household tasks, family coordination",
    gradient: "from-[hsl(215,70%,55%)] to-[hsl(215,70%,45%)]",
    examples: ["Shared family calendar", "Chore & task distribution", "School & activity schedules", "Meal planning"],
    modules: [
      { name: "Family Calendar", icon: Calendar },
      { name: "Tasks", icon: Zap },
      { name: "Coordination", icon: Users },
    ],
    advisors: ["Family Advisor", "Schedule Advisor", "Money Advisor"],
  },
  {
    key: "business", icon: Briefcase, title: "Business / Operator",
    desc: "CRM, invoicing, client management, revenue tracking",
    gradient: "from-primary to-primary/80",
    examples: ["Client pipeline & CRM", "Invoice & payment tracking", "Revenue dashboards", "Team coordination"],
    modules: [
      { name: "CRM", icon: Briefcase },
      { name: "Revenue", icon: BarChart3 },
      { name: "Invoicing", icon: DollarSign },
    ],
    advisors: ["Business Advisor", "Revenue Advisor", "Productivity Advisor"],
  },
  {
    key: "money", icon: DollarSign, title: "Money / Financial Control",
    desc: "Budgets, bills, investments, subscription management",
    gradient: "from-[hsl(var(--sita-gold))] to-[hsl(38,85%,48%)]",
    examples: ["Budget management", "Bill reminders & autopay", "Investment oversight", "Subscription tracking"],
    modules: [
      { name: "Budgets", icon: DollarSign },
      { name: "Bills", icon: Bell },
      { name: "Investments", icon: BarChart3 },
    ],
    advisors: ["Money Advisor", "Budget Advisor"],
  },
  {
    key: "full", icon: Sparkles, title: "Full SITA Experience",
    desc: "All modules active, maximum personalization",
    gradient: "from-primary via-[hsl(var(--sita-gold))] to-[hsl(var(--trust-safe))]",
    examples: ["Every domain active", "Full advisor council", "Maximum automation", "Complete oversight"],
    modules: [
      { name: "All Modules", icon: Sparkles },
      { name: "Full AI", icon: Brain },
      { name: "Trust Center", icon: Shield },
    ],
    advisors: ["Full Advisory Council"],
  },
];

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

export function PrimaryUseModeStep({ selected, onSelect, onNext, onPrev }: Props) {
  const selectedMode = MODES.find(m => m.key === selected);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <SetupStageHeader
            icon={Sparkles}
            title="What should SITA help you run first?"
            subtitle="Choose your primary mode. You can always expand later."
          />
        </div>

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

        <StageTransitionController
          onPrev={onPrev}
          onNext={onNext}
          canAdvance={!!selected}
        />
      </div>

      {/* Right — Module Preview + Advisor Map */}
      <AnimatePresence mode="wait">
        {selectedMode && (
          <motion.div key={selectedMode.key}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={spring}
            className="lg:w-80 shrink-0 hidden lg:block space-y-4">

            {/* Active Modules */}
            <div className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Modules</p>
              <div className="space-y-2">
                {selectedMode.modules.map((mod, i) => (
                  <motion.div key={mod.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl bg-primary/[0.06] border border-primary/10 p-3">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.12, type: "spring", stiffness: 400 }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                      <mod.icon className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span className="text-sm font-medium text-foreground">{mod.name}</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 + 0.2 }}
                      className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Advisor Map */}
            <div className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Advisor Council</p>
              <div className="space-y-2">
                {selectedMode.advisors.map((adv, i) => (
                  <motion.div key={adv} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="flex items-center gap-2.5 rounded-xl bg-secondary/20 border border-border/20 p-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">{adv}</span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.4 }}
                      className="ml-auto text-[9px] text-[hsl(var(--trust-safe))] font-medium">
                      Active
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Desktop Preview Hint */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-center">
              <p className="text-[11px] text-muted-foreground">Your desktop will be optimized for</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{selectedMode.title}</p>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    className="w-6 rounded-sm bg-primary/20"
                    style={{ height: `${12 + Math.random() * 20}px`, originY: 1 }} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
