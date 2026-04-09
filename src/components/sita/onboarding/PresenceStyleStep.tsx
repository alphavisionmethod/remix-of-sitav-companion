import { motion } from "framer-motion";
import { EyeOff, Eye, Zap, Mic, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const styles = [
  { key: "quiet", icon: EyeOff, title: "Quiet and mostly in the background", desc: "SITA works silently. You check in when you want." },
  { key: "present", icon: Eye, title: "Present when needed", desc: "SITA surfaces only when something matters." },
  { key: "proactive", icon: Zap, title: "More proactive", desc: "SITA anticipates needs and offers suggestions actively." },
  { key: "companion", icon: Mic, title: "Voice companion enabled", desc: "SITA becomes a persistent conversational presence." },
];

interface PresenceStyleStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PresenceStyleStep({ selected, onSelect, onNext, onPrev }: PresenceStyleStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">How would you like SITA to show up?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">SITA is an operating presence, not just a launcher.</p>
      </div>

      <div className="space-y-3">
        {styles.map(s => (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-all duration-200",
              selected === s.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20"
            )}
          >
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

      <p className="text-[10px] text-muted-foreground text-center pt-1">
        You can change how SITA shows up anytime in Settings → Presence.
      </p>

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
