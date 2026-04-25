// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Entry Ceremony
// Cinematic transition when entering the boardroom
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Shield, Brain, Users } from "lucide-react";

interface BoardroomEntryCeremonyProps {
  boardroomType: string;
  onComplete: () => void;
}

export function BoardroomEntryCeremony({ boardroomType, onComplete }: BoardroomEntryCeremonyProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),    // Ring pulse
      setTimeout(() => setPhase(2), 800),    // Text appears
      setTimeout(() => setPhase(3), 1800),   // Icons animate in
      setTimeout(() => setPhase(4), 2800),   // Fade out
      setTimeout(() => onComplete(), 3400),  // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[hsl(0_0%_3%)]"
        >
          {/* Pulsing accent ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: phase >= 1 ? [1, 1.2, 1] : 0, opacity: phase >= 1 ? [0.3, 0.6, 0.3] : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[300px] h-[300px] rounded-full border-2 border-[hsl(265_55%_58%/0.4)]"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: phase >= 1 ? [0.8, 1, 0.8] : 0, opacity: phase >= 1 ? [0.2, 0.4, 0.2] : 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute w-[400px] h-[400px] rounded-full border border-[hsl(38_85%_58%/0.2)]"
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: phase >= 1 ? 1 : 0, rotate: phase >= 1 ? 0 : -180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(280_50%_50%)] flex items-center justify-center shadow-2xl shadow-[hsl(265_55%_58%/0.3)]"
            >
              <BarChart3 className="h-8 w-8 text-white" />
            </motion.div>

            {/* Typewriter text */}
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <TypewriterText text="Boardroom session starting..." className="text-lg font-display font-bold text-[hsl(0_0%_90%)] tracking-wide" />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[11px] text-[hsl(0_0%_45%)] mt-2 uppercase tracking-[0.2em]"
                >
                  {boardroomType.replace(/-/g, " ")}
                </motion.p>
              </motion.div>
            )}

            {/* Advisor icons animate in */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                {[
                  { icon: Brain, label: "Advisors", color: "hsl(265 55% 58%)" },
                  { icon: Shield, label: "Trust", color: "hsl(152 55% 48%)" },
                  { icon: Users, label: "Council", color: "hsl(38 85% 58%)" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.15, type: "spring" }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}22` }}>
                      <item.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-[9px] text-[hsl(0_0%_40%)] uppercase tracking-wider">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(265_55%_58%/0.05)] blur-[120px]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Typewriter Effect ──
function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[2px] h-[1em] bg-[hsl(265_55%_58%)] ml-0.5 align-middle"
      />
    </p>
  );
}
