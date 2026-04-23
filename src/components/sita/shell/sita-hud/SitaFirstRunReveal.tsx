// ═══════════════════════════════════════════════════════════════
// SITA OS — First-run Sita reveal (Phase A)
// ═══════════════════════════════════════════════════════════════
// Plays once per device the first time a user lands on the
// desktop. Cinematic 6-second sequence:
//   0.0s  black-out + soft bloom
//   0.5s  orb materialises in the centre
//   1.5s  ring of light expands outward
//   3.0s  caption: "I'm Sita."
//   4.0s  sub-caption: "Say 'Hey Sita' anytime."
//   5.5s  fade out — orb flies to bottom-right where it will live.
//
// • Persists completion in localStorage (pb_sita_reveal_v1).
// • Skipped automatically if user has prefers-reduced-motion.
// • Click anywhere or press Esc to skip early.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const KEY = "pb_sita_reveal_v1";

function alreadyShown(): boolean {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return true; }
}

function markShown() {
  try { window.localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
}

export function SitaFirstRunReveal() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't auto-play on SSR / second visit / reduced-motion users.
    if (alreadyShown()) return;
    if (reduced) { markShown(); return; }
    // Wait one frame so it doesn't fight the boot splash.
    const id = window.setTimeout(() => setShow(true), 200);
    return () => window.clearTimeout(id);
  }, [reduced]);

  const dismiss = useCallback(() => {
    markShown();
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const auto = window.setTimeout(dismiss, 6000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(auto);
      window.removeEventListener("keydown", onKey);
    };
  }, [show, dismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="sita-reveal"
          role="dialog"
          aria-label="Welcome to Sita"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          onClick={dismiss}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/85 backdrop-blur-xl cursor-pointer"
        >
          {/* Bloom */}
          <motion.div
            className="absolute h-[640px] w-[640px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.45) 0%, transparent 65%)",
              filter: "blur(40px)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.9, 0.6, 0.7, 0], scale: [0.6, 1.05, 1, 1.1, 1.4] }}
            transition={{ duration: 5.8, ease: [0.22, 1, 0.36, 1], times: [0, 0.15, 0.45, 0.75, 1] }}
          />

          {/* Expanding ring */}
          <motion.div
            className="absolute rounded-full border"
            style={{ borderColor: "hsl(var(--primary) / 0.6)" }}
            initial={{ width: 60, height: 60, opacity: 0 }}
            animate={{
              width: [60, 480, 720],
              height: [60, 480, 720],
              opacity: [0, 0.6, 0],
            }}
            transition={{ duration: 2.2, delay: 1.2, ease: "easeOut" }}
          />

          {/* Orb core */}
          <motion.div
            className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-white/15 backdrop-blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, hsl(var(--primary) / 0.85) 0%, transparent 65%)",
              boxShadow:
                "0 12px 60px -12px hsl(var(--primary) / 0.7), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sparkles className="h-10 w-10 text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.9)]" />
          </motion.div>

          {/* Captions */}
          <motion.h1
            className="relative text-center text-3xl font-light tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
          >
            I'm <span className="font-semibold text-primary">Sita</span>.
          </motion.h1>
          <motion.p
            className="relative mt-3 text-center text-sm tracking-wide text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.6 }}
          >
            Say <span className="font-medium text-foreground">"Hey Sita"</span> anytime.
          </motion.p>

          {/* Skip hint */}
          <motion.div
            className="absolute bottom-10 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 0.5 }}
          >
            Tap to continue
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
