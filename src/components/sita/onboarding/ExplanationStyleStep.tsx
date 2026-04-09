import { motion } from "framer-motion";
import { MessageCircle, Sliders, BookOpen, Briefcase, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const styles = [
  { key: "simple", icon: MessageCircle, title: "Simple and calm", desc: "Short answers, no jargon. SITA speaks plainly." },
  { key: "balanced", icon: Sliders, title: "Balanced", desc: "Clear answers with enough context to understand why." },
  { key: "detailed", icon: BookOpen, title: "Detailed and strategic", desc: "Full reasoning, trade-offs, and alternative approaches." },
  { key: "executive", icon: Briefcase, title: "Executive / operator", desc: "Dense, data-rich, decision-ready. No hand-holding." },
];

interface ExplanationStyleStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ExplanationStyleStep({ selected, onSelect, onNext, onPrev }: ExplanationStyleStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">How should SITA explain things?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">This shapes every interaction — you can change it anytime.</p>
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

      {/* Show what this changes (Req #8) */}
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">This changes</p>
          <p className="text-[11px] text-muted-foreground">
            Summary length: <span className="text-foreground">{selected === "simple" ? "short" : selected === "detailed" ? "comprehensive" : selected === "executive" ? "dense, data-rich" : "balanced"}</span> · 
            Advisor tone: <span className="text-foreground">{selected === "simple" ? "plain, jargon-free" : selected === "executive" ? "decision-ready" : "clear with context"}</span> · 
            Boardroom detail: <span className="text-foreground">{selected === "detailed" || selected === "executive" ? "high" : "standard"}</span>
          </p>
        </motion.div>
      )}

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
