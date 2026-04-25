import { motion } from "framer-motion";
import { Bell, BellRing, Sliders, Zap, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const styles = [
  { key: "urgent-only", icon: Bell, title: "Only urgent", desc: "SITA stays quiet unless something is critical." },
  { key: "important-urgent", icon: BellRing, title: "Important and urgent", desc: "Surface things that matter, hold the rest." },
  { key: "balanced", icon: Sliders, title: "Balanced", desc: "A steady stream of useful nudges without overwhelm." },
  { key: "highly-proactive", icon: Zap, title: "Highly proactive", desc: "SITA actively reaches out with ideas, warnings, and opportunities." },
];

interface InterruptionStyleStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function InterruptionStyleStep({ selected, onSelect, onNext, onPrev }: InterruptionStyleStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">When should SITA interrupt you?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">This makes SITA feel premium, not annoying.</p>
      </div>

      <div className="space-y-3">
        {styles.map(s => (
          <button key={s.key} onClick={() => onSelect(s.key)}
            className={cn("w-full rounded-xl border p-4 text-left transition-all duration-200",
              selected === s.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20")}>
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", selected === s.key ? "bg-primary/15" : "bg-secondary")}>
                <s.icon className={cn("h-4 w-4", selected === s.key ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              {selected === s.key && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        ))}
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
