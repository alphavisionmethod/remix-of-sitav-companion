// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Formation Canvas (Enhanced)
// Evolves background visuals based on emotional arc phase.
// Performance-tier aware: disabled on low, reduced blur on medium.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { EmotionalPhaseMetadata } from "@/lib/setup/emotional-arc";

interface AmbientFormationCanvasProps {
  primaryHue?: string;
  secondaryHue?: string;
  emotionalPhase?: EmotionalPhaseMetadata;
  performanceTier?: "low" | "medium" | "high";
}

export function AmbientFormationCanvas({
  primaryHue: legacyPrimary,
  secondaryHue: legacySecondary,
  emotionalPhase,
  performanceTier = "high",
}: AmbientFormationCanvasProps) {
  const reduced = useReducedMotion();

  const { primary, secondary, tertiaryOpacity } = useMemo(() => {
    if (!emotionalPhase) {
      return {
        primary: legacyPrimary || "hsl(265 55% 58% / 0.04)",
        secondary: legacySecondary || "hsl(38 85% 58% / 0.03)",
        tertiaryOpacity: 0,
      };
    }

    const { ambientHue, ambientSaturation, warmth, energy } = emotionalPhase;
    const baseOpacity = 0.02 + warmth * 0.04;
    const secHue = (ambientHue + 60) % 360;

    return {
      primary: `hsl(${ambientHue} ${ambientSaturation}% 58% / ${baseOpacity.toFixed(3)})`,
      secondary: `hsl(${secHue} ${Math.max(ambientSaturation - 15, 20)}% 58% / ${(baseOpacity * 0.7).toFixed(3)})`,
      tertiaryOpacity: energy > 0.6 ? energy * 0.02 : 0,
    };
  }, [emotionalPhase, legacyPrimary, legacySecondary]);

  const blurPrimary = performanceTier === "medium" ? "blur-[80px]" : "blur-[120px]";
  const blurSecondary = performanceTier === "medium" ? "blur-[60px]" : "blur-[100px]";
  const blurTertiary = performanceTier === "medium" ? "blur-[100px]" : "blur-[140px]";

  // Skip rendering on low performance tier or reduced motion
  if (reduced || performanceTier === "low") return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        key={primary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className={`absolute top-1/4 left-1/4 h-96 w-96 rounded-full ${blurPrimary}`}
        style={{ background: primary }}
      />
      <motion.div
        key={secondary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className={`absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full ${blurSecondary}`}
        style={{ background: secondary }}
      />
      {tertiaryOpacity > 0 && emotionalPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full ${blurTertiary}`}
          style={{ background: `hsl(${(emotionalPhase.ambientHue + 180) % 360} 30% 50% / ${tertiaryOpacity.toFixed(3)})` }}
        />
      )}
    </div>
  );
}
