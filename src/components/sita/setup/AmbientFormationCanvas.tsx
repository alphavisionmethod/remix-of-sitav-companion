// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Formation Canvas (Enhanced)
// Evolves background visuals based on emotional arc phase.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { EmotionalPhaseMetadata } from "@/lib/setup/emotional-arc";

interface AmbientFormationCanvasProps {
  /** Direct HSL color for primary glow (legacy mode) */
  primaryHue?: string;
  /** Direct HSL color for secondary glow (legacy mode) */
  secondaryHue?: string;
  /** Emotional phase metadata — when provided, overrides primaryHue/secondaryHue */
  emotionalPhase?: EmotionalPhaseMetadata;
}

export function AmbientFormationCanvas({
  primaryHue: legacyPrimary,
  secondaryHue: legacySecondary,
  emotionalPhase,
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
    const secondaryHue = (ambientHue + 60) % 360;
    const tertiaryHue = (ambientHue + 180) % 360;

    return {
      primary: `hsl(${ambientHue} ${ambientSaturation}% 58% / ${baseOpacity.toFixed(3)})`,
      secondary: `hsl(${secondaryHue} ${Math.max(ambientSaturation - 15, 20)}% 58% / ${(baseOpacity * 0.7).toFixed(3)})`,
      tertiaryOpacity: energy > 0.6 ? energy * 0.02 : 0,
    };
  }, [emotionalPhase, legacyPrimary, legacySecondary]);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        key={primary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: primary }}
      />
      <motion.div
        key={secondary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
        style={{ background: secondary }}
      />
      {tertiaryOpacity > 0 && emotionalPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full blur-[140px]"
          style={{ background: `hsl(${(emotionalPhase.ambientHue + 180) % 360} 30% 50% / ${tertiaryOpacity.toFixed(3)})` }}
        />
      )}
    </div>
  );
}
