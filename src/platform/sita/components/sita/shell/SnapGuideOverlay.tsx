// ═══════════════════════════════════════════════════════════════
// SITA OS — Snap Guide Overlay
// Visual indicator for window snap zones during drag
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { getSnapGuideStyles } from "@/platform/sita/hooks/useWindowSnap";
import { AnimatePresence, motion } from "framer-motion";

interface SnapGuideOverlayProps {
  guide: { x: number; y: number; width: number; height: number } | null;
}

export function SnapGuideOverlay({ guide }: SnapGuideOverlayProps) {
  return (
    <AnimatePresence>
      {guide && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={getSnapGuideStyles(guide)}
        />
      )}
    </AnimatePresence>
  );
}
