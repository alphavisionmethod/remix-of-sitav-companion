import { motion } from "framer-motion";
import { Zap, Sparkles, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Choose your setup style</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">How deep do you want to go right now?</p>
      </div>

      <div className="space-y-3">
        {styles.map((s, i) => (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn(
              "w-full rounded-2xl border p-5 text-left transition-all duration-200 group",
              selected === s.key
                ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10"
                : "border-border bg-card hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn("rounded-xl p-3 transition-colors", selected === s.key ? "bg-primary/15" : "bg-secondary")}>
                <s.icon className={cn("h-5 w-5", selected === s.key ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{s.title}</p>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{s.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button
          onClick={onNext}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
