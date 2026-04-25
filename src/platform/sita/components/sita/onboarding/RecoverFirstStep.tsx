import { motion } from "framer-motion";
import { UserCheck, DollarSign, Calendar, Home, Target } from "lucide-react";
import { SetupStageHeader, StageTransitionController, TrustInfoCard } from "@/platform/sita/components/sita/setup";

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
      <SetupStageHeader
        title="What should SITA help you recover first?"
        subtitle="This creates instant value the moment you enter."
      />

      <div className="space-y-3">
        {options.map(o => (
          <TrustInfoCard
            key={o.key}
            icon={o.icon}
            title={o.title}
            description={o.desc}
            selected={selected === o.key}
            onClick={() => onSelect(o.key)}
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
