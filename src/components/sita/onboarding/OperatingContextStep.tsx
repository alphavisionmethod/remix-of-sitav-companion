// ═══════════════════════════════════════════════════════════════
// SITA OS — Operating Context Step
// Life stage / operating context detection (Req #2)
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Compass, ArrowLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTEXTS = [
  {
    key: "rebuilding",
    title: "Rebuilding structure",
    desc: "Recovering from a transition — getting systems and routines back in place.",
    tone: "SITA will prioritize stabilization and gentle structure.",
  },
  {
    key: "scaling",
    title: "Scaling something",
    desc: "Growing a business, project, or area of life — things are accelerating.",
    tone: "SITA will prioritize leverage, delegation, and keeping up.",
  },
  {
    key: "managing-complexity",
    title: "Managing complexity",
    desc: "Many things are running — the challenge is keeping it all coordinated.",
    tone: "SITA will prioritize visibility, triage, and reducing friction.",
  },
  {
    key: "regaining-control",
    title: "Trying to feel more in control",
    desc: "Things feel scattered or reactive — you want calm, clarity, and follow-through.",
    tone: "SITA will prioritize calm, recovery, and reducing overwhelm.",
  },
];

interface OperatingContextStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OperatingContextStep({ selected, onSelect, onNext, onPrev }: OperatingContextStepProps) {
  const selectedContext = CONTEXTS.find(c => c.key === selected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Your Reality</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Where are you right now?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps SITA understand whether to emphasize stability, growth, or recovery
        </p>
      </div>

      <div className="space-y-3">
        {CONTEXTS.map(ctx => (
          <button
            key={ctx.key}
            onClick={() => onSelect(ctx.key)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-all duration-200",
              selected === ctx.key
                ? "border-primary/50 bg-primary/8"
                : "border-border bg-card hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{ctx.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ctx.desc}</p>
              </div>
              {selected === ctx.key && (
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

      {/* Show what this changes */}
      {selectedContext && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4"
        >
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">How this shapes SITA</p>
          <p className="text-[11px] text-muted-foreground">{selectedContext.tone}</p>
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
