// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Choose Primary Operating Mode
// Use-case-first selection — not apps, but life areas
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Briefcase, DollarSign, Layers, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (mode: string) => void;
  onBack: () => void;
  step: number;
  total: number;
}

const MODES = [
  {
    id: "personal",
    icon: User,
    title: "Personal Life",
    desc: "Tasks, routines, scheduling, and everyday follow-through.",
    examples: ["Morning routines", "Task management", "Appointment tracking"],
    color: "hsl(var(--primary))",
  },
  {
    id: "family",
    icon: Users,
    title: "Family & Household",
    desc: "Shared calendars, reminders, logistics, and household coordination.",
    examples: ["Shared calendars", "Grocery lists", "School schedules"],
    color: "hsl(var(--accent))",
  },
  {
    id: "business",
    icon: Briefcase,
    title: "Business & Operator",
    desc: "Leads, workflows, follow-up, customers, and operating rhythm.",
    examples: ["Lead follow-up", "Client pipeline", "Revenue tracking"],
    color: "hsl(var(--sita-purple))",
  },
  {
    id: "money",
    icon: DollarSign,
    title: "Money & Financial Control",
    desc: "Budgets, bills, obligations, visibility, and financial guidance.",
    examples: ["Bill calendar", "Budget health", "Subscription audits"],
    color: "hsl(152 55% 48%)",
  },
  {
    id: "everything",
    icon: Layers,
    title: "Everything Together",
    desc: "A full operating environment across life, money, family, and work.",
    examples: ["Cross-domain insights", "Unified calendar", "Full control"],
    color: "hsl(var(--primary))",
  },
];

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupOperatingMode({ onNext, onBack, step, total }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-3xl mx-auto">
      <StepBar step={step} total={total} />

      <motion.h2 {...fadeIn} transition={{ delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
        What should SITA help you run first?
      </motion.h2>
      <motion.p {...fadeIn} transition={{ delay: 0.15 }}
        className="text-sm text-muted-foreground mb-8">
        Choose the world SITA should organize around first. You can always expand later.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODES.map((mode, i) => (
          <motion.button
            key={mode.id}
            {...fadeIn}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => setSelected(mode.id)}
            className={cn(
              "relative rounded-2xl border p-5 text-left transition-all duration-300 group",
              selected === mode.id
                ? "border-primary/40 bg-primary/6 shadow-lg shadow-primary/5"
                : "border-border/30 bg-card/40 hover:border-border/60 hover:bg-card/60"
            )}
          >
            {/* Selection indicator */}
            {selected === mode.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            )}

            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-colors",
              selected === mode.id ? "bg-primary/15" : "bg-secondary/40"
            )}>
              <mode.icon className={cn("h-5 w-5", selected === mode.id ? "text-primary" : "text-muted-foreground")} />
            </div>

            <p className="text-sm font-semibold text-foreground mb-1">{mode.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mode.desc}</p>

            {/* Examples */}
            <AnimatePresence>
              {selected === mode.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {mode.examples.map(ex => (
                    <p key={ex} className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-primary/40" />
                      {ex}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className={cn(
            "rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
            selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
          )}>
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
