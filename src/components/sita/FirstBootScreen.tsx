// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium First Boot Screen
// State-driven power-on sequence: calm, secure, luxury entry
// ═══════════════════════════════════════════════════════════════

import { useReducer, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";

// ── State Machine ───────────────────────────────────────────

type BootPhase =
  | "POWER_ON"
  | "BLACK_HOLD"
  | "MARK_REVEAL"
  | "SECURE_INIT"
  | "INTEGRITY_VERIFY"
  | "WORKSPACE_PREP"
  | "TRUSTED_SERVICES"
  | "FINALIZING"
  | "READY_FOR_HANDOFF"
  | "RECOVERY_MODE";

interface BootState {
  phase: BootPhase;
  messageIndex: number;
  failed: boolean;
}

type BootAction =
  | { type: "ADVANCE" }
  | { type: "FAIL" }
  | { type: "RETRY" };

const PHASE_ORDER: BootPhase[] = [
  "POWER_ON",
  "BLACK_HOLD",
  "MARK_REVEAL",
  "SECURE_INIT",
  "INTEGRITY_VERIFY",
  "WORKSPACE_PREP",
  "TRUSTED_SERVICES",
  "FINALIZING",
  "READY_FOR_HANDOFF",
];

const STATUS_MESSAGES: Record<string, string> = {
  SECURE_INIT: "Starting secure environment",
  INTEGRITY_VERIFY: "Verifying system integrity",
  WORKSPACE_PREP: "Preparing your workspace",
  TRUSTED_SERVICES: "Initializing trusted services",
  FINALIZING: "Finalizing startup",
};

// Minimum hold duration per phase (ms)
const PHASE_DURATIONS: Record<BootPhase, number> = {
  POWER_ON: 100,
  BLACK_HOLD: 350,
  MARK_REVEAL: 900,
  SECURE_INIT: 1500,
  INTEGRITY_VERIFY: 1500,
  WORKSPACE_PREP: 1400,
  TRUSTED_SERVICES: 1200,
  FINALIZING: 800,
  READY_FOR_HANDOFF: 900,
  RECOVERY_MODE: 0,
};

function bootReducer(state: BootState, action: BootAction): BootState {
  switch (action.type) {
    case "ADVANCE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx < 0 || idx >= PHASE_ORDER.length - 1) return state;
      const next = PHASE_ORDER[idx + 1];
      const msgIdx = Object.keys(STATUS_MESSAGES).indexOf(next);
      return { ...state, phase: next, messageIndex: msgIdx >= 0 ? msgIdx : state.messageIndex };
    }
    case "FAIL":
      return { ...state, phase: "RECOVERY_MODE", failed: true };
    case "RETRY":
      return { phase: "POWER_ON", messageIndex: 0, failed: false };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

interface FirstBootScreenProps {
  onComplete: () => void;
}

export function FirstBootScreen({ onComplete }: FirstBootScreenProps) {
  const [state, dispatch] = useReducer(bootReducer, {
    phase: "POWER_ON",
    messageIndex: 0,
    failed: false,
  });

  const { phase } = state;

  // Phase auto-advance timer
  useEffect(() => {
    if (phase === "RECOVERY_MODE") return;

    if (phase === "READY_FOR_HANDOFF") {
      const t = setTimeout(onComplete, PHASE_DURATIONS.READY_FOR_HANDOFF);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => dispatch({ type: "ADVANCE" }), PHASE_DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Timeout failsafe — if stuck for 15s total, offer recovery
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase !== "READY_FOR_HANDOFF" && phase !== "RECOVERY_MODE") {
        dispatch({ type: "FAIL" });
      }
    }, 15000);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = useCallback(() => dispatch({ type: "RETRY" }), []);
  const handleContinue = useCallback(() => onComplete(), [onComplete]);

  const showMark = PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf("MARK_REVEAL") && phase !== "RECOVERY_MODE";
  const showStatus = !!STATUS_MESSAGES[phase];
  const isHandoff = phase === "READY_FOR_HANDOFF";
  const currentMessage = STATUS_MESSAGES[phase] || "";

  // Reduced motion check
  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Recovery Mode ──
  if (phase === "RECOVERY_MODE") {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{ backgroundColor: "#0A0A0A" }}>
        <img src={logo} alt="SITA" className="h-[88px] w-[88px] rounded-2xl opacity-40 mb-8" />
        <p className="text-[15px] font-medium mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
          Secure startup requires attention
        </p>
        <p className="text-[13px] mb-8 max-w-xs text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
          We could not verify part of this environment.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRetry}
            className="border-border/50 bg-transparent text-foreground hover:bg-white/5">
            Retry startup
          </Button>
          <Button variant="outline" onClick={handleContinue}
            className="border-border/50 bg-transparent text-foreground hover:bg-white/5">
            Continue to recovery
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Boot Sequence ──
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: "#0A0A0A" }}
      role="status"
      aria-label="SITA OS starting up"
    >
      {/* Subtle radial ambient behind mark */}
      {showMark && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* SITA Mark */}
      <AnimatePresence>
        {showMark && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{
              opacity: isHandoff ? 0.5 : 1,
              scale: 1,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", damping: 30, stiffness: 200, duration: 0.85 }
            }
            className="relative"
          >
            <img
              src={logo}
              alt="SITA"
              className="h-[88px] w-[88px] rounded-2xl"
              style={{
                animation: !prefersReducedMotion && !isHandoff
                  ? "sita-breathe 3.5s ease-in-out infinite"
                  : "none",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Message */}
      <div className="h-8 mt-6 flex items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {showStatus && !isHandoff && (
            <motion.p
              key={currentMessage}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
              className="text-[13px] font-normal tracking-wide"
              style={{
                color: "rgba(255,255,255,0.65)",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {currentMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Breathing glow keyframes */}
      <style>{`
        @keyframes sita-breathe {
          0%, 100% {
            box-shadow: 0 0 40px 0 rgba(255, 255, 255, 0.06);
          }
          50% {
            box-shadow: 0 0 60px 4px rgba(255, 255, 255, 0.12);
          }
        }
      `}</style>
    </div>
  );
}
