import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UserCheck, DollarSign, Users, Shield, BarChart3, ChevronRight } from "lucide-react";

const vignettes = [
  {
    icon: UserCheck,
    title: "A lead recovered",
    description: "SITA detected a client who went silent 11 days ago. An advisor drafted the follow-up. Revenue preserved.",
    accent: "from-primary to-primary/60",
  },
  {
    icon: DollarSign,
    title: "A bill surfaced before it hurt",
    description: "A vendor invoice was heading toward a late fee. SITA flagged it, scheduled payment, and logged proof.",
    accent: "from-accent to-accent/60",
  },
  {
    icon: Users,
    title: "A family conflict resolved",
    description: "Two calendar events overlapped for your partner and child. SITA proposed a reschedule both accepted.",
    accent: "from-[hsl(var(--trust-safe))] to-[hsl(var(--trust-safe))]/60",
  },
  {
    icon: Shield,
    title: "An approval flow with proof",
    description: "A contractor requested budget access. SITA routed approval, verified identity, and recorded the decision.",
    accent: "from-primary to-accent",
  },
  {
    icon: BarChart3,
    title: "A boardroom summary",
    description: "Friday afternoon. SITA compiled the week: 4 actions completed, 2 pending approvals, $12K recovered, zero missed deadlines.",
    accent: "from-accent to-primary/60",
  },
];

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= vignettes.length) return;
    const timer = setTimeout(() => {
      if (current < vignettes.length - 1) setCurrent(c => c + 1);
      else setTimeout(onComplete, 1200);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, onComplete]);

  const v = vignettes[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto text-center space-y-8"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Why SITA feels different
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5"
        >
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${v.accent} shadow-lg`}>
            <v.icon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{v.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {vignettes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : i < current ? "w-2 bg-primary/40" : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onComplete}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
      >
        Skip intro <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
