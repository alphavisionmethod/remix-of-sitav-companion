// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Trust, Autonomy & Approval Calibration
// Premium trust-spectrum with live behavior preview
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, MessageSquare, FlaskConical, ShieldCheck, Zap, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (data: { autonomyLevel: number; thresholds: Record<string, string> }) => void;
  onBack: () => void;
  step: number;
  total: number;
}

const AUTONOMY_LEVELS = [
  { level: 0, icon: Eye, title: "Observe Only", desc: "SITA watches and learns. No suggestions or actions.", behavior: "Silent monitoring, no outbound." },
  { level: 1, icon: MessageSquare, title: "Suggest", desc: "SITA offers recommendations. You decide everything.", behavior: "Insights surfaced, no actions taken." },
  { level: 2, icon: FlaskConical, title: "Simulate First", desc: "SITA drafts and simulates before proposing actions.", behavior: "Drafts shown, simulations available." },
  { level: 3, icon: ShieldCheck, title: "Ask Before Acting", desc: "SITA prepares actions but always asks first.", behavior: "Approval required for every action." },
  { level: 4, icon: Zap, title: "Handle Routine Tasks", desc: "Low-risk actions run automatically. You review via proof trail.", behavior: "Auto-handle low-risk, ask for high-impact." },
];

const THRESHOLD_CATEGORIES = [
  { id: "communication", label: "Sending messages", options: ["Always ask", "Auto-draft, don't send", "Auto-send low-priority"] },
  { id: "money", label: "Financial actions", options: ["Always ask", "Auto below $50", "Auto below $500"] },
  { id: "calendar", label: "Calendar changes", options: ["Always ask", "Auto-handle low-risk", "Full auto"] },
  { id: "reminders", label: "Reminders & nudges", options: ["Suggest only", "Auto-remind recurring", "Full auto"] },
];

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupTrustAutonomy({ onNext, onBack, step, total }: Props) {
  const [autonomyLevel, setAutonomyLevel] = useState(3);
  const [thresholds, setThresholds] = useState<Record<string, string>>({
    communication: "Always ask",
    money: "Always ask",
    calendar: "Auto-handle low-risk",
    reminders: "Auto-remind recurring",
  });

  const activeLevel = AUTONOMY_LEVELS[autonomyLevel];

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left — Controls */}
      <div className="flex-1 min-w-0">
        <StepBar step={step} total={total} />

        <motion.h2 {...fadeIn} transition={{ delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
          Choose how SITA should help
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.15 }}
          className="text-sm text-muted-foreground mb-8">
          You decide when SITA observes, suggests, simulates, asks, or acts.
        </motion.p>

        {/* Trust Spectrum */}
        <div className="space-y-2 mb-8">
          {AUTONOMY_LEVELS.map((level, i) => (
            <button key={level.level} onClick={() => setAutonomyLevel(i)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all duration-300 flex items-start gap-4",
                autonomyLevel === i
                  ? "border-primary/40 bg-primary/6 shadow-sm shadow-primary/5"
                  : "border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/50"
              )}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors",
                autonomyLevel === i ? "bg-primary/15" : "bg-secondary/30"
              )}>
                <level.icon className={cn("h-5 w-5", autonomyLevel === i ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{level.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
              </div>
              {autonomyLevel === i && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Threshold cards */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fine-tune by category</p>
          {THRESHOLD_CATEGORIES.map(cat => (
            <div key={cat.id} className="rounded-xl border border-border/30 bg-card/30 p-4">
              <p className="text-xs font-medium text-foreground mb-2">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.options.map(opt => (
                  <button key={opt} onClick={() => setThresholds(prev => ({ ...prev, [cat.id]: opt }))}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-[11px] transition-all",
                      thresholds[cat.id] === opt
                        ? "border-primary/40 bg-primary/10 text-foreground font-medium"
                        : "border-border/30 text-muted-foreground hover:text-foreground"
                    )}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
          <button onClick={() => onNext({ autonomyLevel, thresholds })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — Behavior Preview */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="lg:w-72 shrink-0 hidden lg:block">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What You'll Experience</p>

          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <activeLevel.icon className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">{activeLevel.title}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{activeLevel.behavior}</p>
            </div>

            <div className="space-y-2">
              {Object.entries(thresholds).map(([key, value]) => {
                const cat = THRESHOLD_CATEGORIES.find(c => c.id === key);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{cat?.label}</span>
                    <span className="text-[11px] text-foreground font-medium">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/20">
            <p className="text-[11px] text-muted-foreground/60">
              You can change these anytime from Settings → Trust & Autonomy.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
