// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium First Boot Screen
// Full 2.1 + 2.2 + 2.0.9 spec: hardware detection, secure init,
// accessibility, interactive handoff, recovery/interruption arch
// ═══════════════════════════════════════════════════════════════

import { useReducer, useEffect, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.webp";
import {
  HardwareDetectionPanel,
  type HardwareCheck,
  type HardwareCheckStatus,
} from "@/components/sita/boot/HardwareDetectionPanel";
import {
  BootRecoveryCard,
  type BootIssueKind,
} from "@/components/sita/boot/BootRecoveryCard";
import {
  BootAccessibilityShortcut,
  type A11yOption,
} from "@/components/sita/boot/BootAccessibilityShortcut";
import { SecureInitCeremony } from "@/components/sita/boot/SecureInitCeremony";
import { BootHandoffTransition } from "@/components/sita/boot/BootHandoffTransition";
import {
  persistBootState,
  loadPersistedBootState,
  clearPersistedBootState,
  getResumePhase,
  isNetworkAvailable,
  onNetworkChange,
  onVisibilityChange,
} from "@/components/sita/boot/bootStatePersistence";

// ── State Machine ───────────────────────────────────────────

type BootPhase =
  | "POWER_ON"
  | "BLACK_HOLD"
  | "MARK_REVEAL"
  | "HARDWARE_DETECT"
  | "SECURE_INIT"
  | "POST_SECURE"
  | "WORKSPACE_PREP"
  | "TRUSTED_SERVICES"
  | "FINALIZING"
  | "HANDOFF_TRANSITION"
  | "READY"
  | "RECOVERY_MODE";

interface BootState {
  phase: BootPhase;
  failed: boolean;
  issueKind: BootIssueKind;
  issueDetail?: string;
  networkLost: boolean;
  resumed: boolean;
}

type BootAction =
  | { type: "ADVANCE" }
  | { type: "JUMP_TO"; phase: BootPhase }
  | { type: "FAIL"; issueKind?: BootIssueKind; detail?: string }
  | { type: "RETRY" }
  | { type: "NETWORK_CHANGE"; online: boolean };

const PHASE_ORDER: BootPhase[] = [
  "POWER_ON",
  "BLACK_HOLD",
  "MARK_REVEAL",
  "HARDWARE_DETECT",
  "SECURE_INIT",
  "POST_SECURE",
  "WORKSPACE_PREP",
  "TRUSTED_SERVICES",
  "FINALIZING",
  "HANDOFF_TRANSITION",
  "READY",
];

const REASSURANCE: Partial<Record<BootPhase, { title: string; sub: string }>> = {
  HARDWARE_DETECT: { title: "Preparing", sub: "Checking device readiness" },
  POST_SECURE: { title: "Verified", sub: "System foundation confirmed" },
  WORKSPACE_PREP: { title: "Personalizing", sub: "Preparing your environment" },
  TRUSTED_SERVICES: { title: "Activating", sub: "Initializing trusted services" },
  FINALIZING: { title: "Arriving", sub: "A few moments more" },
};

const PHASE_DURATIONS: Record<BootPhase, number> = {
  POWER_ON: 100,
  BLACK_HOLD: 400,
  MARK_REVEAL: 900,
  HARDWARE_DETECT: 2200,
  SECURE_INIT: 0,
  POST_SECURE: 1000,
  WORKSPACE_PREP: 1400,
  TRUSTED_SERVICES: 1200,
  FINALIZING: 800,
  HANDOFF_TRANSITION: 0, // driven by BootHandoffTransition
  READY: 0,
  RECOVERY_MODE: 0,
};

function bootReducer(state: BootState, action: BootAction): BootState {
  switch (action.type) {
    case "ADVANCE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx < 0 || idx >= PHASE_ORDER.length - 1) return state;
      return { ...state, phase: PHASE_ORDER[idx + 1] };
    }
    case "JUMP_TO":
      return { ...state, phase: action.phase };
    case "FAIL":
      return {
        ...state,
        phase: "RECOVERY_MODE",
        failed: true,
        issueKind: action.issueKind || "generic",
        issueDetail: action.detail,
      };
    case "RETRY":
      return { phase: "POWER_ON", failed: false, issueKind: "generic", networkLost: false, resumed: false };
    case "NETWORK_CHANGE":
      return { ...state, networkLost: !action.online };
    default:
      return state;
  }
}

// ── Hardware checks ─────────────────────────────────────────

const HW_CHECK_DEFS: { id: string; label: string; detail: string }[] = [
  { id: "cpu", label: "Processor", detail: "Architecture verified" },
  { id: "memory", label: "Memory", detail: "Available" },
  { id: "storage", label: "Storage", detail: "Healthy" },
  { id: "display", label: "Display", detail: "Configured" },
  { id: "input", label: "Input devices", detail: "Detected" },
  { id: "network", label: "Network", detail: "Available" },
  { id: "security", label: "Security hardware", detail: "Ready" },
  { id: "boot", label: "Boot integrity", detail: "Verified" },
  { id: "recovery", label: "Recovery partition", detail: "Present" },
];

// ── Determine initial state (with resume support) ───────────

function getInitialState(): BootState {
  const persisted = loadPersistedBootState();
  if (persisted) {
    const resumePhase = getResumePhase(persisted);
    if (resumePhase && PHASE_ORDER.includes(resumePhase as BootPhase)) {
      return {
        phase: resumePhase as BootPhase,
        failed: false,
        issueKind: "generic",
        networkLost: !isNetworkAvailable(),
        resumed: true,
      };
    }
  }
  return {
    phase: "POWER_ON",
    failed: false,
    issueKind: "generic",
    networkLost: !isNetworkAvailable(),
    resumed: false,
  };
}

// ── Component ───────────────────────────────────────────────

interface FirstBootScreenProps {
  onComplete: () => void;
}

export function FirstBootScreen({ onComplete }: FirstBootScreenProps) {
  const [state, dispatch] = useReducer(bootReducer, undefined, getInitialState);
  const { phase } = state;
  const completeCalled = useRef(false);

  // Accessibility
  const [a11yOptions, setA11yOptions] = useState<A11yOption[]>([]);
  const toggleA11y = useCallback((opt: A11yOption) => {
    setA11yOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  }, []);

  const reducedMotion =
    a11yOptions.includes("reduced-motion") ||
    (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("boot-large-text", a11yOptions.includes("large-text"));
    el.classList.toggle("boot-high-contrast", a11yOptions.includes("high-contrast"));
    return () => { el.classList.remove("boot-large-text", "boot-high-contrast"); };
  }, [a11yOptions]);

  // Hardware checks
  const [hwChecks, setHwChecks] = useState<HardwareCheck[]>(
    HW_CHECK_DEFS.map(d => ({ ...d, status: "pending" as HardwareCheckStatus }))
  );

  useEffect(() => {
    if (phase !== "HARDWARE_DETECT") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    HW_CHECK_DEFS.forEach((def, i) => {
      timers.push(setTimeout(() => {
        setHwChecks(prev => prev.map(c => c.id === def.id ? { ...c, status: "checking" } : c));
      }, i * 180));
      timers.push(setTimeout(() => {
        setHwChecks(prev => prev.map(c => c.id === def.id ? { ...c, status: "passed", detail: def.detail } : c));
      }, i * 180 + 300));
    });
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // ── 2.0.9 Recovery: persist boot state on every phase change ──
  useEffect(() => {
    if (phase === "RECOVERY_MODE" || phase === "READY") return;
    persistBootState({
      phase,
      phaseTimestamp: Date.now(),
      hwChecksComplete: hwChecks.filter(c => c.status === "passed").map(c => c.id),
      a11yOptions,
      interrupted: false,
    });
  }, [phase, hwChecks, a11yOptions]);

  // ── 2.0.9 Recovery: network change listener ──
  useEffect(() => {
    return onNetworkChange(online => {
      dispatch({ type: "NETWORK_CHANGE", online });
    });
  }, []);

  // ── 2.0.9 Recovery: visibility change (tab hidden = potential interruption) ──
  useEffect(() => {
    return onVisibilityChange(hidden => {
      if (hidden && phase !== "READY" && phase !== "RECOVERY_MODE") {
        persistBootState({
          phase,
          phaseTimestamp: Date.now(),
          hwChecksComplete: hwChecks.filter(c => c.status === "passed").map(c => c.id),
          a11yOptions,
          interrupted: true,
          interruptionReason: "unknown",
        });
      }
    });
  }, [phase, hwChecks, a11yOptions]);

  // Phase auto-advance
  useEffect(() => {
    if (phase === "RECOVERY_MODE" || phase === "SECURE_INIT" || phase === "HANDOFF_TRANSITION") return;

    if (phase === "READY") {
      if (!completeCalled.current) {
        completeCalled.current = true;
        clearPersistedBootState();
        onComplete();
      }
      return;
    }

    const dur = PHASE_DURATIONS[phase];
    if (dur <= 0) return;

    const t = setTimeout(() => dispatch({ type: "ADVANCE" }), dur);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Failsafe — 35s
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase !== "READY" && phase !== "RECOVERY_MODE" && phase !== "HANDOFF_TRANSITION") {
        dispatch({ type: "FAIL", issueKind: "generic", detail: "Boot sequence timed out" });
      }
    }, 35000);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = useCallback(() => {
    completeCalled.current = false;
    setHwChecks(HW_CHECK_DEFS.map(d => ({ ...d, status: "pending" as HardwareCheckStatus })));
    dispatch({ type: "RETRY" });
  }, []);

  const handleContinueDegraded = useCallback(() => {
    completeCalled.current = true;
    clearPersistedBootState();
    onComplete();
  }, [onComplete]);

  const handleSecureInitComplete = useCallback(() => {
    dispatch({ type: "JUMP_TO", phase: "POST_SECURE" });
  }, []);

  const handleHandoffComplete = useCallback(() => {
    dispatch({ type: "JUMP_TO", phase: "READY" });
  }, []);

  // Derived
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const progressFraction = Math.max(0, phaseIdx / (PHASE_ORDER.length - 1));
  const showMark = phaseIdx >= PHASE_ORDER.indexOf("MARK_REVEAL") && phase !== "RECOVERY_MODE" && phase !== "SECURE_INIT" && phase !== "HANDOFF_TRANSITION";
  const reassurance = REASSURANCE[phase];
  const showHwPanel = phaseIdx >= PHASE_ORDER.indexOf("HARDWARE_DETECT") && phaseIdx <= PHASE_ORDER.indexOf("FINALIZING") && phase !== "SECURE_INIT";
  const textScale = a11yOptions.includes("large-text") ? 1.25 : 1;
  const highContrast = a11yOptions.includes("high-contrast");

  const JOURNEY_STAGES = ["Preparing", "Securing", "Verifying", "Personalizing", "Activating", "Arriving"];
  const stageIdx = Math.min(JOURNEY_STAGES.length - 1, Math.max(0, Math.floor(progressFraction * JOURNEY_STAGES.length)));

  const constellationNodes = useMemo(() => {
    // Scale node count by performance tier: low=8, medium=16, high=24
    const tier = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "low"
      : navigator.hardwareConcurrency <= 2 ? "low"
      : navigator.hardwareConcurrency <= 4 ? "medium" : "high";
    const count = tier === "low" ? 8 : tier === "medium" ? 16 : 24;
    const nodes: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 120 + (((i * 7 + 3) % 11) / 11) * 80;
      nodes.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, delay: i * 0.3 });
    }
    return nodes;
  }, []);
  const stableNodeCount = Math.floor(progressFraction * constellationNodes.length);

  // ══════════════════════════════════════════════════════════
  // RENDER BRANCHES
  // ══════════════════════════════════════════════════════════

  // ── Recovery Mode ──
  if (phase === "RECOVERY_MODE") {
    return (
      <>
        <BootRecoveryCard
          issueKind={state.issueKind}
          technicalDetail={state.issueDetail}
          statusCode={state.issueDetail ? "BOOT_TIMEOUT" : undefined}
          onRetry={handleRetry}
          onContinueDegraded={handleContinueDegraded}
        />
        <BootAccessibilityShortcut activeOptions={a11yOptions} onToggle={toggleA11y} />
      </>
    );
  }

  // ── 2.2 Secure Init Ceremony ──
  if (phase === "SECURE_INIT") {
    return (
      <>
        <SecureInitCeremony onComplete={handleSecureInitComplete} reducedMotion={reducedMotion} />
        <BootAccessibilityShortcut activeOptions={a11yOptions} onToggle={toggleA11y} />
      </>
    );
  }

  // ── Interactive Handoff Transition ──
  if (phase === "HANDOFF_TRANSITION") {
    return (
      <>
        <BootHandoffTransition onComplete={handleHandoffComplete} reducedMotion={reducedMotion} />
        <BootAccessibilityShortcut activeOptions={a11yOptions} onToggle={toggleA11y} />
      </>
    );
  }

  // ── Main Boot Sequence ──
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: highContrast ? "#000000" : "#0A0A0A" }}
      role="status"
      aria-label="SITA OS starting up"
    >
      {/* ── Network lost banner ── */}
      <AnimatePresence>
        {state.networkLost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 rounded-xl border px-4 py-2"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Network unavailable — setup will continue offline
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resumed notice ── */}
      <AnimatePresence>
        {state.resumed && phaseIdx <= PHASE_ORDER.indexOf("HARDWARE_DETECT") + 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
          >
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Resuming where you left off
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Constellation ── */}
      {!reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[2s]"
            style={{
              width: 600, height: 600,
              background: `radial-gradient(circle, rgba(255,255,255,${0.01 + progressFraction * 0.03}) 0%, transparent 70%)`,
            }}
          />
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            width="600" height="600" viewBox="-300 -300 600 600"
          >
            {constellationNodes.slice(0, stableNodeCount).map((node, i) => {
              const next = constellationNodes[(i + 1) % constellationNodes.length];
              if (i + 1 >= stableNodeCount) return null;
              return (
                <motion.line key={`l-${i}`}
                  x1={node.x} y1={node.y} x2={next.x} y2={next.y}
                  stroke={highContrast ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: node.delay * 0.15 }}
                />
              );
            })}
            {constellationNodes.map((node, i) => {
              const isStable = i < stableNodeCount;
              return (
                <motion.circle key={`n-${i}`}
                  cx={node.x} cy={node.y}
                  r={isStable ? 1.5 : 1}
                  fill={isStable ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isStable ? [0.2, 0.5, 0.2] : [0, 0.08, 0],
                    scale: isStable ? 1 : [0.8, 1, 0.8],
                  }}
                  transition={{ duration: isStable ? 3 : 4, repeat: Infinity, delay: node.delay * 0.1, ease: "easeInOut" }}
                />
              );
            })}
            <motion.circle cx={0} cy={0} r={40} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: progressFraction > 0.2 ? 0.6 : 0, scale: 1 }}
              transition={{ duration: 2 }}
            />
          </svg>
        </div>
      )}

      {/* Ambient glow */}
      {showMark && !reducedMotion && (
        <div className="absolute pointer-events-none"
          style={{
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* SITA Mark */}
      <AnimatePresence>
        {showMark && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 200, duration: 0.85 }}
            className="relative z-10"
          >
            <img src={logo} alt="SITA" width={88} height={88} loading="lazy" className="h-[88px] w-[88px] rounded-2xl"
              style={{ animation: !reducedMotion ? "sita-breathe 3.5s ease-in-out infinite" : "none" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassurance */}
      <div className="h-14 mt-6 flex flex-col items-center justify-center relative z-10" aria-live="polite">
        <AnimatePresence mode="wait">
          {reassurance && (
            <motion.div key={reassurance.title}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
              className="text-center"
            >
              <p className="font-medium tracking-wide"
                style={{ color: highContrast ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)", fontSize: 14 * textScale }}>
                {reassurance.title}
              </p>
              <p className="mt-1 tracking-wide"
                style={{ color: highContrast ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)", fontSize: 11 * textScale }}>
                {reassurance.sub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress rail */}
      {showMark && (
        <div className="mt-6 relative z-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {JOURNEY_STAGES.map((_, i) => (
              <div key={i} className="h-0.5 w-7 rounded-full transition-all duration-700"
                style={{
                  backgroundColor: i < stageIdx
                    ? highContrast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)"
                    : i === stageIdx ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={JOURNEY_STAGES[stageIdx]}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 * textScale }}>
              {JOURNEY_STAGES[stageIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Hardware panel */}
      <HardwareDetectionPanel checks={hwChecks} visible={showHwPanel} />

      {/* Accessibility */}
      <BootAccessibilityShortcut activeOptions={a11yOptions} onToggle={toggleA11y} />

      <style>{`
        @keyframes sita-breathe {
          0%, 100% { box-shadow: 0 0 40px 0 rgba(255, 255, 255, 0.06); }
          50% { box-shadow: 0 0 60px 4px rgba(255, 255, 255, 0.12); }
        }
      `}</style>
    </div>
  );
}
