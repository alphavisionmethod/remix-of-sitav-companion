// ═══════════════════════════════════════════════════════════════
// SITA OS — Screen 2: Secure Foundation Initialization
// Standalone phase: encryption, integrity, privacy baseline, recovery
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, RotateCcw, Check, ChevronDown, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type SecureStage = "checking" | "encryption" | "integrity" | "privacy" | "recovery";
type StageState = "pending" | "active" | "complete" | "degraded" | "blocked";

interface StageDefinition {
  id: SecureStage;
  label: string;
  description: string;
  icon: typeof Shield;
  trustCard: { title: string; body: string };
}

const STAGES: StageDefinition[] = [
  {
    id: "checking",
    label: "System Check",
    description: "Verifying hardware capabilities",
    icon: Shield,
    trustCard: { title: "Hardware verification", body: "Confirming your device supports the security features SITA needs to protect your environment." },
  },
  {
    id: "encryption",
    label: "Storage Protection",
    description: "Protecting data on this device",
    icon: Lock,
    trustCard: { title: "Device protection", body: "Your environment is prepared with built-in storage protection and secure access controls." },
  },
  {
    id: "integrity",
    label: "System Verification",
    description: "Confirming system foundation is intact",
    icon: Shield,
    trustCard: { title: "Foundation integrity", body: "SITA verifies the system foundation is unmodified and trustworthy before continuing." },
  },
  {
    id: "privacy",
    label: "Privacy Baseline",
    description: "Starting with thoughtful defaults",
    icon: Eye,
    trustCard: { title: "Privacy baseline", body: "SITA begins with careful defaults designed to keep your information protected and your control clear." },
  },
  {
    id: "recovery",
    label: "Recovery Readiness",
    description: "Preparing safe recovery options",
    icon: RotateCcw,
    trustCard: { title: "Recovery readiness", body: "A recovery path is being prepared so your environment stays protected even if something goes wrong." },
  },
];

const STAGE_DURATION = 1600;

function SecurityFormation({ progress }: { progress: number }) {
  const rings = [
    { r: 28, label: "core" },
    { r: 50, label: "integrity" },
    { r: 72, label: "privacy" },
    { r: 94, label: "recovery" },
  ];
  const nodeCount = 12;
  const stableNodes = Math.floor(progress * nodeCount);

  return (
    <svg width="240" height="240" viewBox="-120 -120 240 240" className="mx-auto">
      {rings.map((ring, i) => {
        const rp = Math.min(1, Math.max(0, (progress - i * 0.18) / 0.3));
        return (
          <motion.circle key={ring.label} cx={0} cy={0} r={ring.r} fill="none"
            stroke="rgba(255,255,255,0.04)" strokeWidth={rp > 0.5 ? 1 : 0.5}
            strokeDasharray={rp > 0.8 ? "none" : "4 8"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: rp * 0.6, scale: 0.9 + rp * 0.1 }}
            transition={{ duration: 1.2, delay: i * 0.15 }} />
        );
      })}
      {Array.from({ length: nodeCount }).map((_, i) => {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const r = 55 + (i % 3) * 18;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const stable = i < stableNodes;
        return (
          <motion.circle key={i} cx={x} cy={y} r={stable ? 2 : 1}
            fill={stable ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
            initial={{ opacity: 0 }}
            animate={{ opacity: stable ? [0.3, 0.6, 0.3] : 0.08 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
        );
      })}
      <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: progress > 0.3 ? 0.5 : 0, scale: 1 }} transition={{ duration: 1 }}>
        <path d="M0-18 L14-6 L10 14 L0 18 L-10 14 L-14-6 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinejoin="round" />
        {progress > 0.7 && (
          <motion.path d="M-5 2 L-1 6 L6-4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        )}
      </motion.g>
    </svg>
  );
}

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function SecureFoundationStep({ onNext, onPrev }: Props) {
  const reduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [degradedStages, setDegradedStages] = useState<Set<string>>(new Set());

  const stages = useMemo(() =>
    STAGES.map((d, i) => ({
      ...d,
      state: degradedStages.has(d.id)
        ? "degraded" as StageState
        : i < activeIdx ? "complete" as StageState
        : i === activeIdx ? "active" as StageState
        : "pending" as StageState,
    })),
    [activeIdx, degradedStages]
  );

  const progress = Math.min(1, activeIdx / STAGES.length);
  const allDone = activeIdx >= STAGES.length;

  useEffect(() => {
    if (allDone) {
      const t = setTimeout(onNext, 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIdx(i => i + 1), STAGE_DURATION);
    return () => clearTimeout(t);
  }, [activeIdx, allDone, onNext]);

  const currentStage = stages[Math.min(activeIdx, STAGES.length - 1)];

  return (
    <div className="fixed inset-0 z-[200] select-none" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all"
        style={{ width: 500, height: 500, transitionDuration: "2000ms", background: `radial-gradient(circle, rgba(255,255,255,${0.01 + progress * 0.02}) 0%, transparent 70%)` }} />

      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 max-w-5xl w-full px-6 lg:px-8">
          {/* LEFT — Title & stage indicator */}
          <div className="flex-1 max-w-xs pt-4 lg:pt-8">
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-xl lg:text-[22px] font-semibold tracking-tight mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              Securing your system
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[13px] leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
              Protection, recovery, and privacy are being prepared for your environment
            </motion.p>

            <AnimatePresence mode="wait">
              {!allDone && (
                <motion.div key={currentStage.id} initial={reduced ? {} : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <currentStage.icon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{currentStage.label}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{currentStage.description}</p>
                  </div>
                </motion.div>
              )}
              {allDone && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Check className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>System secured</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage progress dots */}
            <div className="flex items-center gap-2 mt-6">
              {stages.map(s => (
                <div key={s.id} className="h-1 flex-1 rounded-full transition-all duration-700"
                  style={{ backgroundColor: s.state === "complete" ? "rgba(255,255,255,0.25)" : s.state === "active" ? "rgba(255,255,255,0.15)" : s.state === "degraded" ? "rgba(255,180,80,0.3)" : "rgba(255,255,255,0.05)" }} />
              ))}
            </div>

            {/* Degraded warning */}
            {degradedStages.size > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(255,180,80,0.06)", border: "1px solid rgba(255,180,80,0.15)" }}>
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "rgba(255,180,80,0.7)" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,180,80,0.6)" }}>
                  Some features are running with limited hardware support. SITA will continue with software-based protection.
                </p>
              </motion.div>
            )}
          </div>

          {/* CENTER — Security formation */}
          <div className="flex-1 flex items-center justify-center hidden md:flex">
            <SecurityFormation progress={progress} />
          </div>

          {/* RIGHT — Trust cards */}
          <div className="flex-1 max-w-xs pt-4 lg:pt-8 space-y-3">
            {stages.map((s, i) => {
              const visible = i <= activeIdx;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
                  transition={{ duration: 0.4, delay: visible ? 0.1 : 0 }}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-[12px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{s.trustCard.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>{s.trustCard.body}</p>
                </motion.div>
              );
            })}

            {/* View technical details */}
            <div className="pt-2">
              <button onClick={() => setShowAdvanced(o => !o)}
                className="flex items-center gap-1.5 text-[10px] tracking-wide transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>
                <span>View technical details</span>
                <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-2.5 w-2.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-2 rounded-lg border p-3 space-y-1.5" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
                      {stages.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          {s.state === "complete" ? <Check className="h-2.5 w-2.5" style={{ color: "rgba(255,255,255,0.4)" }} />
                            : s.state === "active" ? <div className="h-2.5 w-2.5 rounded-full border border-white/20 border-t-white/50 animate-spin" />
                            : s.state === "degraded" ? <AlertTriangle className="h-2.5 w-2.5" style={{ color: "rgba(255,180,80,0.5)" }} />
                            : <div className="h-2.5 w-2.5 rounded-full bg-white/8" />}
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                          <span className="text-[9px] ml-auto" style={{ color: "rgba(255,255,255,0.15)" }}>
                            {s.state === "complete" ? "Done" : s.state === "active" ? "In progress" : s.state === "degraded" ? "Limited" : "Queued"}
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
