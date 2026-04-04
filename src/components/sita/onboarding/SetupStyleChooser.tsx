import { motion } from "framer-motion";
import { Zap, Sparkles, Settings } from "lucide-react";
import { SetupStageHeader, StageTransitionController, TrustInfoCard } from "@/components/sita/setup";

type SetupStyle = "express" | "guided" | "advanced";

const styles = [
  { key: "express" as const, icon: Zap, title: "Express Setup", time: "~5 minutes", desc: "Quick essentials — name, domains, trust level. Get started fast." },
  { key: "guided" as const, icon: Sparkles, title: "Guided Premium", time: "~10 minutes", desc: "Full personalization — priorities, rituals, protection preferences, and a live simulation." },
  { key: "advanced" as const, icon: Settings, title: "Advanced / Operator", time: "~15 minutes", desc: "Everything — household graph, memory consent, desktop composition, interruption style, and more." },
];

interface SetupStyleChooserProps {
  selected: SetupStyle;
  onSelect: (style: SetupStyle) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function SetupStyleChooser({ selected, onSelect, onNext, onPrev }: SetupStyleChooserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <SetupStageHeader
        title="Choose your setup style"
        subtitle="How deep do you want to go right now?"
      />

      <div className="space-y-3">
        {styles.map(s => (
          <TrustInfoCard
            key={s.key}
            icon={s.icon}
            title={`${s.title} (${s.time})`}
            description={s.desc}
            selected={selected === s.key}
            onClick={() => onSelect(s.key)}
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
