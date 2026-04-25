import { motion } from "framer-motion";
import { Sun, Clock, Moon, BarChart3, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetupStageHeader, StageTransitionController, TrustInfoCard } from "@/components/sita/setup";

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
      <SetupStageHeader
        title="How should SITA support your rhythm?"
        subtitle="SITA is a living operating system with rituals, not a static dashboard."
      />

      <div className="space-y-3">
        {rituals.map(r => (
          <TrustInfoCard
            key={r.key}
            icon={r.icon}
            title={r.title}
            description={r.desc}
            selected={selected.includes(r.key)}
            onClick={() => onToggle(r.key)}
          />
        ))}
      </div>

      <StageTransitionController
        onPrev={onPrev}
        onNext={onNext}
        canAdvance={true}
      />
    </motion.div>
  );
}
