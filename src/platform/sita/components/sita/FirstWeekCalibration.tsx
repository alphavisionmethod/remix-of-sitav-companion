// ═══════════════════════════════════════════════════════════════
// SITA OS — First-Week Calibration Loop (Req #10)
// Gentle banner system for day-1, day-3, day-7 check-ins
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, RefreshCw, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fromTable } from "@/lib/supabase-helpers";
import { cn } from "@/lib/utils";

interface CalibrationCheckpoint {
  key: string;
  dayOffset: number;
  title: string;
  question: string;
  options: { key: string; label: string; icon: typeof ThumbsUp }[];
}

const CHECKPOINTS: CalibrationCheckpoint[] = [
  {
    key: "day-1-pulse",
    dayOffset: 1,
    title: "Your first day",
    question: "How was your first experience with SITA?",
    options: [
      { key: "great", label: "Feeling good", icon: ThumbsUp },
      { key: "neutral", label: "Still exploring", icon: Minus },
      { key: "confused", label: "Need more help", icon: ThumbsDown },
    ],
  },
  {
    key: "day-3-refinement",
    dayOffset: 3,
    title: "Quick check-in",
    question: "Is SITA helping with the right things?",
    options: [
      { key: "yes", label: "Yes, it's helpful", icon: ThumbsUp },
      { key: "somewhat", label: "Somewhat", icon: Minus },
      { key: "adjust", label: "Needs adjustment", icon: RefreshCw },
    ],
  },
  {
    key: "week-1-reset",
    dayOffset: 7,
    title: "Weekly reset",
    question: "After a week, how does your support style feel?",
    options: [
      { key: "perfect", label: "Just right", icon: ThumbsUp },
      { key: "less", label: "Too much", icon: Minus },
      { key: "more", label: "Want more", icon: Sparkles },
    ],
  },
];

export function FirstWeekCalibration() {
  const { user } = useAuth();
  const [activeCheckpoint, setActiveCheckpoint] = useState<CalibrationCheckpoint | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkCalibration = async () => {
      // Get user's onboarding completion date from profiles
      const { data: profile } = await fromTable("profiles")
        .select("created_at")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const daysSinceSetup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Get already completed/dismissed checkpoints
      const { data: existing } = await fromTable("calibration_checkpoints")
        .select("checkpoint_key, dismissed, response")
        .eq("user_id", user.id);

      const completedKeys = new Set((existing || []).map(e => e.checkpoint_key));

      // Find first eligible checkpoint
      for (const cp of CHECKPOINTS) {
        if (daysSinceSetup >= cp.dayOffset && !completedKeys.has(cp.key)) {
          setActiveCheckpoint(cp);
          break;
        }
      }
    };

    checkCalibration();
  }, [user]);

  const handleResponse = useCallback(async (responseKey: string) => {
    if (!user || !activeCheckpoint) return;

    await fromTable("calibration_checkpoints").upsert({
      user_id: user.id,
      checkpoint_key: activeCheckpoint.key,
      response: { answer: responseKey } as never,
      dismissed: false,
    }, { onConflict: "user_id,checkpoint_key" });

    // If user wants adjustment, persist to user_memory
    if (responseKey === "adjust" || responseKey === "more" || responseKey === "less") {
      await fromTable("user_memory").upsert({
        user_id: user.id,
        key: "calibration_feedback",
        value: JSON.stringify({ checkpoint: activeCheckpoint.key, answer: responseKey, at: new Date().toISOString() }),
        category: "preference",
        source: "calibration-loop",
        confidence: 0.9,
        confirmed: true,
        sensitivity: "low",
      }, { onConflict: "user_id,key" });
    }

    setResponded(true);
    setTimeout(() => {
      setActiveCheckpoint(null);
      setResponded(false);
    }, 2000);
  }, [user, activeCheckpoint]);

  const handleDismiss = useCallback(async () => {
    if (!user || !activeCheckpoint) return;

    await fromTable("calibration_checkpoints").upsert({
      user_id: user.id,
      checkpoint_key: activeCheckpoint.key,
      dismissed: true,
      response: {} as never,
    }, { onConflict: "user_id,checkpoint_key" });

    setDismissed(true);
    setTimeout(() => setActiveCheckpoint(null), 300);
  }, [user, activeCheckpoint]);

  if (!activeCheckpoint || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
      >
        <div className="rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {activeCheckpoint.title}
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Question */}
          <div className="px-5 pb-2">
            <p className="text-sm font-medium text-foreground">{activeCheckpoint.question}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              SITA is still learning you — your feedback refines everything
            </p>
          </div>

          {/* Options */}
          {!responded ? (
            <div className="px-5 pb-4 flex gap-2">
              {activeCheckpoint.options.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleResponse(opt.key)}
                  className={cn(
                    "flex-1 rounded-xl border border-border bg-secondary/30 p-3 text-center",
                    "hover:border-primary/30 hover:bg-primary/5 transition-all"
                  )}
                >
                  <opt.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 pb-4"
            >
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
                <MessageCircle className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-foreground font-medium">Thanks — SITA is adjusting</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
