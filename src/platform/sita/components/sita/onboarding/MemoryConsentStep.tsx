import { motion } from "framer-motion";
import { Brain, Settings, Shield, Lock, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const remembers = [
  "Your preferences and patterns",
  "Important recurring obligations",
  "Key people and contexts",
  "Behavioral insights over time",
];

const controls = [
  "All permissions and approvals",
  "Memory corrections and deletions",
  "Connected system access",
  "Autonomy level changes",
];

const levels = [
  { key: "essential", icon: Lock, title: "Essential only", desc: "Minimum memory — just what's needed to function." },
  { key: "balanced", icon: Shield, title: "Balanced", desc: "SITA remembers enough to be genuinely helpful." },
  { key: "full", icon: Brain, title: "Full context", desc: "Deep memory — SITA learns your patterns over time." },
];

interface MemoryConsentStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MemoryConsentStep({ selected, onSelect, onNext, onPrev }: MemoryConsentStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">What SITA remembers</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">This is about trust, not terms and conditions.</p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">What SITA remembers</p>
          </div>
          {remembers.map(r => (
            <div key={r} className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-xs text-muted-foreground">{r}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
            <p className="text-xs font-semibold text-foreground">What stays under your control</p>
          </div>
          {controls.map(c => (
            <div key={c} className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))] shrink-0" />
              <p className="text-xs text-muted-foreground">{c}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Memory level */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Choose memory depth</p>
        {levels.map(l => (
          <button key={l.key} onClick={() => onSelect(l.key)}
            className={cn("w-full rounded-xl border p-3 text-left transition-all duration-200",
              selected === l.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20")}>
            <div className="flex items-center gap-3">
              <l.icon className={cn("h-4 w-4", selected === l.key ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">{l.desc}</p>
              </div>
              {selected === l.key && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
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
