// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot Handoff Transition
// Cinematic: mark shrinks to top-left, title slides left,
// setup card fades center, constellation persists as ambient bg
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.webp";

interface BootHandoffTransitionProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

export function BootHandoffTransition({ onComplete, reducedMotion = false }: BootHandoffTransitionProps) {
  const [step, setStep] = useState<"gather" | "morph" | "settle" | "fade">("gather");

  // Constellation nodes for ambient background
  const nodes = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r = 120 + (((i * 7 + 3) % 11) / 11) * 80;
      out.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return out;
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep("morph"), reducedMotion ? 50 : 400),
      setTimeout(() => setStep("settle"), reducedMotion ? 100 : 1000),
      setTimeout(() => setStep("fade"), reducedMotion ? 150 : 1800),
      setTimeout(onComplete, reducedMotion ? 200 : 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, reducedMotion]);

  const dur = reducedMotion ? 0.05 : undefined;
  const ease = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div
      className="fixed inset-0 z-[200] select-none overflow-hidden"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* ── Persistent constellation — fades to ambient ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: step === "fade" ? 0 : step === "settle" ? 0.3 : 0.6,
        }}
        transition={{ duration: dur ?? 1.2 }}
      >
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          width="600" height="600" viewBox="-300 -300 600 600"
        >
          {nodes.map((n, i) => {
            const next = nodes[(i + 1) % nodes.length];
            return (
              <line
                key={`l-${i}`}
                x1={n.x} y1={n.y} x2={next.x} y2={next.y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
              />
            );
          })}
          {nodes.map((n, i) => (
            <circle key={`n-${i}`} cx={n.x} cy={n.y} r={1.5} fill="rgba(255,255,255,0.2)" />
          ))}
        </svg>
      </motion.div>

      {/* ── SITA mark — shrinks from center to top-left corner ── */}
      <motion.div
        className="absolute z-20"
        initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={
          step === "gather"
            ? { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1 }
            : { top: "24px", left: "24px", x: "0%", y: "0%", scale: 0.45 }
        }
        transition={{ duration: dur ?? 0.7, ease }}
      >
        <img src={logo} alt="SITA" width={88} height={88} loading="lazy" className="h-[88px] w-[88px] rounded-2xl" />
      </motion.div>

      {/* ── Title — slides to left panel area ── */}
      <motion.div
        className="absolute z-20"
        initial={{ opacity: 0, left: "50%", top: "58%", x: "-50%" }}
        animate={
          step === "gather"
            ? { opacity: 0, left: "50%", top: "58%", x: "-50%" }
            : step === "morph"
              ? { opacity: 1, left: "80px", top: "100px", x: "0%" }
              : { opacity: step === "fade" ? 0 : 1, left: "80px", top: "100px", x: "0%" }
        }
        transition={{ duration: dur ?? 0.6, ease }}
      >
        <p
          className="text-[20px] font-semibold tracking-tight"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          Welcome to SITA OS
        </p>
        <p
          className="text-[13px] mt-1"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Your environment is ready
        </p>
      </motion.div>

      {/* ── Setup card — fades into center area ── */}
      <motion.div
        className="absolute z-20"
        style={{ left: "50%", top: "50%", x: "-50%", y: "-50%", width: 380 }}
        initial={{ opacity: 0, y: 20 }}
        animate={
          step === "settle" || step === "fade"
            ? { opacity: step === "fade" ? 0 : 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        transition={{ duration: dur ?? 0.5, ease }}
      >
        <div
          className="rounded-2xl border p-8"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Skeleton content cards */}
          <div className="space-y-4">
            <div className="h-3 w-32 rounded bg-white/8" />
            <div className="h-3 w-48 rounded bg-white/5" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-16 rounded-xl border"
                  style={{
                    borderColor: "rgba(255,255,255,0.04)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <div className="h-8 w-24 rounded-lg bg-white/6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Right preview area — trust note ── */}
      <motion.div
        className="absolute z-20"
        style={{ right: 80, top: 100, width: 220 }}
        initial={{ opacity: 0, x: 16 }}
        animate={
          step === "settle"
            ? { opacity: 1, x: 0 }
            : step === "fade"
              ? { opacity: 0, x: 0 }
              : { opacity: 0, x: 16 }
        }
        transition={{ duration: dur ?? 0.5, delay: step === "settle" ? 0.15 : 0, ease }}
      >
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div className="h-2 w-2 rounded-full mb-3" style={{ background: "rgba(120,220,120,0.5)" }} />
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
            System secured and verified. Your environment is being personalized.
          </p>
        </div>
      </motion.div>

      {/* ── Full-screen fade to transparent at end ── */}
      <motion.div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ backgroundColor: "#0A0A0A" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === "fade" ? 1 : 0 }}
        transition={{ duration: dur ?? 0.6 }}
      />
    </div>
  );
}
