// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Gesture Layer
// Mounts the gesture engine when enabled and renders subtle
// activation pulses when a gesture fires.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startGestureEngine,
  stopGestureEngine,
  onGesture,
  type GestureKind,
} from "@/lib/sita-spatial/gesture-engine";
import { useSpatialFeatures } from "@/lib/sita-spatial/feature-flags";

interface Pulse {
  id: string;
  kind: GestureKind;
  x: number;
  y: number;
}

export function SitaGestureLayer() {
  const [features] = useSpatialFeatures();
  const [pulses, setPulses] = useState<Pulse[]>([]);

  useEffect(() => {
    if (!features.gesture) {
      stopGestureEngine();
      return;
    }
    void startGestureEngine();
    const off = onGesture((kind, meta) => {
      const id = `${kind}-${meta.t}`;
      setPulses((p) => [...p, { id, kind, x: meta.x * window.innerWidth, y: meta.y * window.innerHeight }]);
      setTimeout(() => setPulses((p) => p.filter((q) => q.id !== id)), 800);

      // Map gestures to OS actions
      if (kind === "palm_up") {
        window.dispatchEvent(new CustomEvent("sita:open"));
      } else if (kind === "swipe_away") {
        window.dispatchEvent(new CustomEvent("sita-nudge:dismiss-current"));
      } else if (kind === "air_tap" || kind === "pinch") {
        const el = document.elementFromPoint(meta.x * window.innerWidth, meta.y * window.innerHeight) as HTMLElement | null;
        el?.click?.();
      }
    });
    return () => {
      off();
      stopGestureEngine();
    };
  }, [features.gesture]);

  if (!features.gesture) return null;

  return (
    <div className="fixed inset-0 z-[900] pointer-events-none">
      <AnimatePresence>
        {pulses.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-12 h-12 rounded-full border-2 border-[hsl(265_55%_60%)] -translate-x-1/2 -translate-y-1/2"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
