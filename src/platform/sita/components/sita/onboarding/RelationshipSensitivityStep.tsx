// ═══════════════════════════════════════════════════════════════
// SITA OS — Relationship Sensitivity Step
// People vs tasks focus preference (Req #5)
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Users, ListChecks, ArrowLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    key: "people",
    icon: Users,
    title: "Help me keep up with important people",
    desc: "Surface who needs attention, remind me to follow up with key relationships, track communication gaps.",
    changes: "SITA will track relationship health, surface follow-up reminders, and prioritize people-related tasks.",
  },
  {
    key: "tasks",
    icon: ListChecks,
    title: "Focus mostly on tasks and commitments",
    desc: "Keep me on track with deadlines, priorities, and getting things done — less relationship tracking.",
    changes: "SITA will prioritize task completion, deadlines, and operational efficiency over relationship signals.",
  },
];

interface RelationshipSensitivityStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function RelationshipSensitivityStep({ selected, onSelect, onNext, onPrev }: RelationshipSensitivityStepProps) {
  const selectedOption = OPTIONS.find(o => o.key === selected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Relationship Focus</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">People or tasks?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Should SITA help you stay connected with people, or focus on getting things done?
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={cn(
              "w-full rounded-xl border p-5 text-left transition-all duration-200",
              selected === opt.key
                ? "border-primary/50 bg-primary/8"
                : "border-border bg-card hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", selected === opt.key ? "bg-primary/15" : "bg-secondary")}>
                <opt.icon className={cn("h-5 w-5", selected === opt.key ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </div>
              {selected === opt.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0 mt-0.5"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Show what changes */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4"
        >
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">This changes</p>
          <p className="text-[11px] text-muted-foreground">{selectedOption.changes}</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          Continue <ChevronRight className="inline h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
