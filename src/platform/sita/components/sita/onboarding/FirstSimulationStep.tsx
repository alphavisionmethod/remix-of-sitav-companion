import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Brain, Play, Check, FileText, ChevronRight } from "lucide-react";

const steps = [
  { icon: AlertTriangle, title: "Issue detected", desc: "A client hasn't responded in 11 days — follow-up likely overdue.", color: "text-[hsl(var(--trust-alert))]" },
  { icon: Brain, title: "Advisor recommendation", desc: "Business Advisor suggests a gentle check-in email with context.", color: "text-primary" },
  { icon: Play, title: "Simulate", desc: "SITA shows you the draft and projected outcome before acting.", color: "text-accent" },
  { icon: Check, title: "Approve", desc: "You approve. SITA sends the follow-up and schedules a reminder.", color: "text-[hsl(var(--trust-safe))]" },
  { icon: FileText, title: "Proof logged", desc: "Action recorded: who approved, what happened, outcome tracked.", color: "text-primary" },
];

interface FirstSimulationStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function FirstSimulationStep({ onNext, onPrev }: FirstSimulationStepProps) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current >= steps.length) { setDone(true); return; }
    const timer = setTimeout(() => setCurrent(c => c + 1), 3000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">See SITA in action</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Detect → Advise → Simulate → Approve → Prove
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0.3, scale: 0.97 }}
            animate={{
              opacity: i <= current ? 1 : 0.3,
              scale: i === current ? 1.02 : 1,
            }}
            transition={{ duration: 0.4 }}
            className={`rounded-xl border p-4 transition-all ${
              i < current
                ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5"
                : i === current
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${i <= current ? "bg-primary/10" : "bg-secondary"}`}>
                {i < current ? (
                  <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                ) : (
                  <s.icon className={`h-4 w-4 ${i === current ? s.color : "text-muted-foreground"}`} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          animate={{ width: `${Math.min((current / steps.length) * 100, 100)}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={onNext}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
          {done ? "Continue" : "Skip"} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
