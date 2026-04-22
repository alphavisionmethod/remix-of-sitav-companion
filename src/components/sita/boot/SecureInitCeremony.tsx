// ═══════════════════════════════════════════════════════════════
// SITA OS — 2.2 Secure System Initialization Ceremony
// Encryption prep, integrity, privacy baseline, recovery readiness
// Calm, premium, trust-visible — no technical anxiety
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, RotateCcw, Check, ChevronDown } from "lucide-react";

// ── Types ───────────────────────────────────────────────────

type SecureStage = "encryption" | "integrity" | "privacy" | "recovery";
type StageStatus = "pending" | "active" | "complete";

interface SecureStageState {
  stage: SecureStage;
  status: StageStatus;
  label: string;
  sub: string;
  icon: typeof Shield;
}

interface SecureInitCeremonyProps {
  /** Called when all stages complete */
  onComplete: () => void;
  /** If true, plays reduced-motion version */
  reducedMotion?: boolean;
}

// ── Stage definitions ───────────────────────────────────────

const STAGE_DEFS: Omit<SecureStageState, "status">[] = [
  {
    stage: "encryption",
    label: "Storage Protection",
    sub: "Protecting data on this device",
    icon: Lock,
  },
  {
    stage: "integrity",
    label: "System Verification",
    sub: "Confirming system foundation is intact",
    icon: Shield,
  },
  {
    stage: "privacy",
    label: "Privacy Baseline",
    sub: "Starting with thoughtful defaults",
    icon: Eye,
  },
  {
    stage: "recovery",
    label: "Recovery Readiness",
    sub: "Preparing safe recovery options",
    icon: RotateCcw,
  },
];

const STAGE_DURATION = 1800; // ms per stage

// ── Trust explainer cards ───────────────────────────────────

const TRUST_CARDS = [
  {
    title: "Device protection",
    body: "Your environment is prepared with built-in storage protection and secure access controls.",
  },
  {
    title: "Privacy baseline",
    body: "SITA begins with careful defaults designed to keep your information protected and your control clear.",
  },
  {
    title: "Recovery readiness",
    body: "A recovery path is being prepared so your environment stays protected even if something goes wrong.",
  },
];

// ── Security formation SVG — abstract geometry resolving ────

function SecurityFormation({ progress }: { progress: number }) {
  // 4 concentric rings that resolve from soft to stable
  const rings = [
    { r: 30, label: "core" },
    { r: 55, label: "integrity" },
    { r: 80, label: "privacy" },
    { r: 105, label: "recovery" },
  ];

  // Shield nodes that stabilize
  const nodeCount = 12;
  const stableNodes = Math.floor(progress * nodeCount);

  return (
    <svg width="280" height="280" viewBox="-140 -140 280 280" className="mx-auto">
      {/* Rings — resolve progressively */}
      {rings.map((ring, i) => {
        const ringProgress = Math.min(1, Math.max(0, (progress - i * 0.2) / 0.3));
        return (
          <motion.circle
            key={ring.label}
            cx={0}
            cy={0}
            r={ring.r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={ringProgress > 0.5 ? 1 : 0.5}
            strokeDasharray={ringProgress > 0.8 ? "none" : "4 8"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: ringProgress * 0.6,
              scale: 0.9 + ringProgress * 0.1,
            }}
            transition={{ duration: 1.2, delay: i * 0.15 }}
          />
        );
      })}

      {/* Shield nodes */}
      {Array.from({ length: nodeCount }).map((_, i) => {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const r = 65 + (i % 3) * 20;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const isStable = i < stableNodes;

        return (
          <motion.circle
            key={`sn-${i}`}
            cx={x}
            cy={y}
            r={isStable ? 2 : 1}
            fill={isStable ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isStable ? [0.3, 0.6, 0.3] : 0.08,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Center shield glyph */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: progress > 0.3 ? 0.5 : 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <path
          d="M0-18 L14-6 L10 14 L0 18 L-10 14 L-14-6 Z"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {progress > 0.7 && (
          <motion.path
            d="M-5 2 L-1 6 L6-4"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.g>
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────

export function SecureInitCeremony({ onComplete, reducedMotion = false }: SecureInitCeremonyProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const stages: SecureStageState[] = useMemo(
    () =>
      STAGE_DEFS.map((d, i) => ({
        ...d,
        status: i < activeIdx ? "complete" : i === activeIdx ? "active" : "pending",
      })),
    [activeIdx]
  );

  const progress = Math.min(1, activeIdx / STAGE_DEFS.length);
  const allDone = activeIdx >= STAGE_DEFS.length;

  // Auto-advance stages
  useEffect(() => {
    if (allDone) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIdx(i => i + 1), STAGE_DURATION);
    return () => clearTimeout(t);
  }, [activeIdx, allDone, onComplete]);

  const currentStage = stages[Math.min(activeIdx, STAGE_DEFS.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[200] select-none"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-[2s]"
        style={{
          width: 500,
          height: 500,
          background: `radial-gradient(circle, rgba(255,255,255,${0.01 + progress * 0.02}) 0%, transparent 70%)`,
        }}
      />

      {/* ── Three-zone layout ── */}
      <div className="h-full flex items-center justify-center">
        <div className="flex items-start gap-12 max-w-5xl w-full px-8">
          {/* LEFT — Title & reassurance */}
          <div className="flex-1 max-w-xs pt-8">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[22px] font-semibold tracking-tight mb-3"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Securing your system
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[13px] leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Protection, recovery, and privacy are being prepared for your environment
            </motion.p>

            {/* Active stage indicator */}
            <AnimatePresence mode="wait">
              {!allDone && (
                <motion.div
                  key={currentStage.stage}
                  initial={reducedMotion ? {} : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <currentStage.icon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {currentStage.label}
                    </p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {currentStage.sub}
                    </p>
                  </div>
                </motion.div>
              )}

              {allDone && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <Check className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                    System secured
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage progress dots */}
            <div className="flex items-center gap-2 mt-6">
              {stages.map((s, i) => (
                <div
                  key={s.stage}
                  className="h-1 flex-1 rounded-full transition-all duration-700"
                  style={{
                    backgroundColor:
                      s.status === "complete"
                        ? "rgba(255,255,255,0.25)"
                        : s.status === "active"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.05)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* CENTER — Security formation graphic */}
          <div className="flex-1 flex items-center justify-center">
            <SecurityFormation progress={progress} />
          </div>

          {/* RIGHT — Trust explainer cards */}
          <div className="flex-1 max-w-xs pt-8 space-y-3">
            {TRUST_CARDS.map((card, i) => {
              const visible = i <= activeIdx;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: visible ? 1 : 0,
                    y: visible ? 0 : 8,
                  }}
                  transition={{ duration: 0.4, delay: visible ? 0.1 : 0 }}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <p className="text-[12px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {card.title}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {card.body}
                  </p>
                </motion.div>
              );
            })}

            {/* Advanced disclosure */}
            <div className="pt-2">
              <button
                onClick={() => setShowAdvanced(o => !o)}
                className="flex items-center gap-1.5 text-[10px] tracking-wide transition-colors"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                <span>View technical details</span>
                <motion.span
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-2.5 w-2.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-2 rounded-lg border p-3 space-y-1.5"
                      style={{
                        borderColor: "rgba(255,255,255,0.04)",
                        background: "rgba(255,255,255,0.01)",
                      }}
                    >
                      {stages.map(s => (
                        <div key={s.stage} className="flex items-center gap-2">
                          {s.status === "complete" ? (
                            <Check className="h-2.5 w-2.5" style={{ color: "rgba(255,255,255,0.4)" }} />
                          ) : s.status === "active" ? (
                            <div className="h-2.5 w-2.5 rounded-full border border-white/20 border-t-white/50 animate-spin" />
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-white/8" />
                          )}
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {s.label}
                          </span>
                          <span className="text-[9px] ml-auto" style={{ color: "rgba(255,255,255,0.15)" }}>
                            {s.status === "complete" ? "Done" : s.status === "active" ? "In progress" : "Queued"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
