// ═══════════════════════════════════════════════════════════════
// SITA OS — Chapter Transition Controller
// Cinematic bridge animations between major setup phase groups.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ChapterName } from "@/lib/setup/emotional-arc";
import { CHAPTER_ORDER } from "@/lib/setup/emotional-arc";
import { cn } from "@/lib/utils";

interface ChapterTransitionProps {
  fromChapter: ChapterName;
  toChapter: ChapterName;
  onComplete: () => void;
  /** Duration in ms — defaults to 1500 */
  duration?: number;
}

const CHAPTER_META: Record<ChapterName, {
  subtitle: string;
  hue: number;
}> = {
  Awakening:       { subtitle: "Preparing your environment",       hue: 265 },
  Foundation:      { subtitle: "Building the basics",              hue: 210 },
  Identity:        { subtitle: "Connecting your world",            hue: 250 },
  Personalization: { subtitle: "Making it yours",                  hue: 280 },
  Intelligence:    { subtitle: "Calibrating intelligence",         hue: 255 },
  Activation:      { subtitle: "Bringing everything online",       hue: 38 },
  Arrival:         { subtitle: "Your environment is ready",        hue: 32 },
};

export function ChapterTransition({ fromChapter, toChapter, onComplete, duration = 1500 }: ChapterTransitionProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const meta = CHAPTER_META[toChapter];
  const toIndex = CHAPTER_ORDER.indexOf(toChapter);

  useEffect(() => {
    const d = reduced ? 300 : duration;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 200);
    }, d);
    return () => clearTimeout(timer);
  }, [duration, onComplete, reduced]);

  if (reduced) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190] flex items-center justify-center bg-background/90"
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Chapter {toIndex + 1} of {CHAPTER_ORDER.length}
              </p>
              <p className="text-lg font-display font-bold text-foreground">{toChapter}</p>
              <p className="text-xs text-muted-foreground mt-1">{meta.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[190] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#0B0D10" }}
        >
          {/* Horizontal wipe */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
            transition={{ duration: duration / 1000, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ background: `hsl(${meta.hue} 40% 15% / 0.4)` }}
          />

          {/* Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full blur-[100px]"
            style={{ background: `hsl(${meta.hue} 50% 50% / 0.1)` }}
          />

          {/* Chapter info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10 text-center space-y-2"
          >
            {/* Chapter progress dots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {CHAPTER_ORDER.map((ch, i) => (
                <div key={ch} className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i < toIndex ? "w-6 bg-primary/60" :
                  i === toIndex ? "w-8 bg-primary" :
                  "w-4 bg-muted/40"
                )} />
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Chapter {toIndex + 1}
            </p>
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">{toChapter}</h2>
            <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
