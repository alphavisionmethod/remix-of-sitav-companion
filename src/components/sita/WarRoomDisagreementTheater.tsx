// ═══════════════════════════════════════════════════════════════
// SITA OS — War Room Disagreement Theater (Enhanced)
// Cinematic split-screen debate with live tension meter,
// animated evidence reveals, and dramatic resolution
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Brain, AlertTriangle, ChevronRight, Swords, Zap, Shield, Eye } from "lucide-react";

interface AdvisorPosition {
  name: string;
  domain: string;
  color: string;
  position: string;
  reasoning: string;
  confidence: number;
  evidence: string[];
}

interface WarRoomDisagreementTheaterProps {
  topic: string;
  sideA: AdvisorPosition;
  sideB: AdvisorPosition;
  resolution?: string;
  className?: string;
}

function TensionMeter({ valueA, valueB }: { valueA: number; valueB: number }) {
  const total = valueA + valueB;
  const ratioA = (valueA / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono uppercase tracking-wider text-[hsl(0_0%_40%)]">Tension Index</span>
        <motion.span
          className="text-[9px] font-mono font-bold text-[hsl(38_85%_58%)]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.abs(valueA - valueB)}% DIVERGENCE
        </motion.span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-[hsl(0_0%_10%)]">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-l-full"
          style={{ background: `linear-gradient(90deg, hsl(210, 60%, 55%), hsl(210, 60%, 45%))` }}
          initial={{ width: 0 }}
          animate={{ width: `${ratioA}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full rounded-r-full"
          style={{ background: `linear-gradient(90deg, hsl(152, 55%, 38%), hsl(152, 55%, 48%))` }}
          initial={{ width: 0 }}
          animate={{ width: `${100 - ratioA}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        />
        {/* Center clash point */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[hsl(38_85%_58%)] border-2 border-[hsl(0_0%_3%)] z-10"
          style={{ left: `calc(${ratioA}% - 8px)` }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

function DebateSide({ advisor, side, delay }: { advisor: AdvisorPosition; side: "left" | "right"; delay: number }) {
  const [evidenceRevealed, setEvidenceRevealed] = useState(0);

  useEffect(() => {
    const timers = advisor.evidence.map((_, i) =>
      setTimeout(() => setEvidenceRevealed(i + 1), 800 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [advisor.evidence]);

  return (
    <motion.div
      initial={{ x: side === "left" ? -40 : 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className="p-5 space-y-4"
    >
      {/* Advisor header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center border"
          style={{
            background: `${advisor.color}15`,
            borderColor: `${advisor.color}30`,
            boxShadow: `0 0 20px ${advisor.color}20`,
          }}
          animate={{ boxShadow: [`0 0 15px ${advisor.color}10`, `0 0 25px ${advisor.color}25`, `0 0 15px ${advisor.color}10`] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="h-5 w-5" style={{ color: advisor.color }} />
        </motion.div>
        <div>
          <p className="text-[13px] font-bold text-[hsl(0_0%_90%)]">{advisor.name}</p>
          <p className="text-[9px] font-mono text-[hsl(0_0%_40%)] uppercase tracking-[0.2em]">{advisor.domain}</p>
        </div>
      </div>

      {/* Position card */}
      <motion.div
        className="rounded-lg p-4 border-l-[3px]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.3 }}
        style={{
          background: `${advisor.color}08`,
          borderLeftColor: advisor.color,
          transformOrigin: "top",
        }}
      >
        <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{advisor.position}</p>
        <p className="text-[11px] text-[hsl(0_0%_50%)] mt-2 leading-relaxed">{advisor.reasoning}</p>
      </motion.div>

      {/* Confidence bar with animated fill */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[hsl(0_0%_35%)]">Conviction</span>
          <motion.span
            className="text-[11px] font-mono font-bold"
            style={{ color: advisor.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            {advisor.confidence}%
          </motion.span>
        </div>
        <div className="h-2 bg-[hsl(0_0%_10%)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${advisor.color}80, ${advisor.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${advisor.confidence}%` }}
            transition={{ duration: 0.8, delay: delay + 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Evidence cards — staggered reveal */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" style={{ color: advisor.color }} />
          <span className="text-[9px] font-mono text-[hsl(0_0%_35%)] uppercase tracking-wider font-bold">
            Evidence ({advisor.evidence.length})
          </span>
        </div>
        <AnimatePresence>
          {advisor.evidence.slice(0, evidenceRevealed).map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: side === "left" ? -16 : 16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              className="flex items-start gap-2 rounded-md px-2.5 py-1.5 bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)]"
            >
              <Zap className="h-3 w-3 shrink-0 mt-0.5" style={{ color: advisor.color }} />
              <span className="text-[10px] text-[hsl(0_0%_55%)]">{e}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function WarRoomDisagreementTheater({ topic, sideA, sideB, resolution, className }: WarRoomDisagreementTheaterProps) {
  const [showResolution, setShowResolution] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResolution(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("rounded-xl border border-[hsl(38_85%_58%/0.2)] bg-[hsl(0_0%_3%)] overflow-hidden", className)}>
      {/* Header with clash animation */}
      <div className="relative flex items-center gap-3 px-5 py-3 border-b border-[hsl(0_0%_100%/0.04)] bg-[hsl(38_85%_58%/0.03)]">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Swords className="h-4 w-4 text-[hsl(38_85%_58%)]" />
        </motion.div>
        <div>
          <span className="text-[11px] font-mono font-bold text-[hsl(0_0%_85%)] tracking-wider uppercase">
            Disagreement Theater
          </span>
          <span className="text-[10px] text-[hsl(0_0%_40%)] ml-3">— {topic}</span>
        </div>
        <motion.div
          className="ml-auto flex items-center gap-1.5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-[hsl(38_85%_58%)]" />
          <span className="text-[8px] font-mono text-[hsl(38_85%_58%)]">ACTIVE DEBATE</span>
        </motion.div>
      </div>

      {/* Tension Meter */}
      <div className="px-5 py-3 border-b border-[hsl(0_0%_100%/0.03)]">
        <TensionMeter valueA={sideA.confidence} valueB={sideB.confidence} />
      </div>

      {/* Split Debate View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[hsl(0_0%_100%/0.04)]">
        <DebateSide advisor={sideA} side="left" delay={0} />
        <DebateSide advisor={sideB} side="right" delay={0.15} />
      </div>

      {/* Resolution — cinematic reveal */}
      <AnimatePresence>
        {resolution && showResolution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border-t border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.03)]"
          >
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-[hsl(152_55%_48%/0.1)] border border-[hsl(152_55%_48%/0.2)] flex items-center justify-center shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Eye className="h-4 w-4 text-[hsl(152_55%_48%)]" />
                </motion.div>
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[hsl(152_55%_48%)]">
                    Synthesized Resolution
                  </p>
                  <motion.p
                    className="text-[12px] text-[hsl(0_0%_70%)] mt-1 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {resolution}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
