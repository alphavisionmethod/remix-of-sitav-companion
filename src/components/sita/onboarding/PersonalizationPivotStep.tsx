// ═══════════════════════════════════════════════════════════════
// SITA OS — Personalization Pivot Step (Screen P1)
// Emotional transition from system setup → personal environment shaping
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Zap, Layers, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const AMBIENT_LABELS = [
  { text: "Your priorities", delay: 0.8 },
  { text: "Your support style", delay: 1.4 },
  { text: "Your active domains", delay: 2.0 },
  { text: "Your advisors", delay: 2.6 },
  { text: "Your first workflows", delay: 3.2 },
];

interface PersonalizationPivotStepProps {
  onNext: () => void;
  onPrev: () => void;
  onRequestFast?: () => void;
  onRequestDeep?: () => void;
}

export function PersonalizationPivotStep({ onNext, onPrev, onRequestFast, onRequestDeep }: PersonalizationPivotStepProps) {
  const [showLearn, setShowLearn] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Left — Title & guidance */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Environment Shaping</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-2xl sm:text-3xl font-bold text-foreground leading-tight"
          >
            Let's shape this around you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground mt-3 max-w-md"
          >
            We'll start with what matters most right now — and refine as SITA learns with you.
          </motion.p>

          {/* Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start"
          >
            <button
              onClick={onRequestFast}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Zap className="h-3 w-3" /> I'd like a faster setup
            </button>
            <button
              onClick={onRequestDeep}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Layers className="h-3 w-3" /> I want the deeper setup
            </button>
            <button
              onClick={() => setShowLearn(!showLearn)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <BookOpen className="h-3 w-3" /> Learn how this works
            </button>
          </motion.div>

          {showLearn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                SITA will ask a few questions about your life, work, and preferences.
                Every answer shapes your environment — from your desktop layout to how advisors communicate.
                You can skip anything and refine later. Nothing is permanent.
              </p>
            </motion.div>
          )}
        </div>

        {/* Right — Ambient environment preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 max-w-xs w-full"
        >
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ opacity: [0.03, 0.08, 0.03] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 left-0 right-0 h-24 rounded-t-2xl"
                style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.1), transparent)" }}
              />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-4">
                Your environment is forming
              </div>

              {AMBIENT_LABELS.map((label) => (
                <motion.div
                  key={label.text}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: label.delay, duration: 0.5 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span className="text-xs text-foreground/70">{label.text}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: label.delay + 0.3, duration: 1.2 }}
                    className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.8 }}
                className="mt-4 pt-3 border-t border-border/30"
              >
                <p className="text-[10px] text-primary/70 italic">
                  Shifting from device setup → life setup…
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between mt-8"
      >
        <button
          onClick={onPrev}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
