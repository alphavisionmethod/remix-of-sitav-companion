// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Incoming Handoff Banner
// Glassy toast that appears when another device hands off a task.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor, Check, X } from "lucide-react";
import { useSitaHandoff } from "@/lib/sita-spatial/useSitaHandoff";
import { useSpatialFeatures } from "@/lib/sita-spatial/feature-flags";

export function SitaHandoffBanner() {
  const [features] = useSpatialFeatures();
  const { incoming, accept, decline } = useSitaHandoff();

  // Auto-decline after 30s
  useEffect(() => {
    if (!incoming) return;
    const t = setTimeout(() => void decline(), 30_000);
    return () => clearTimeout(t);
  }, [incoming, decline]);

  if (!features.handoff) return null;

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[hsl(0_0%_8%/0.85)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.08)] shadow-2xl min-w-[320px] max-w-[420px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(265_55%_55%)] to-[hsl(210_80%_55%)] flex items-center justify-center shrink-0">
              {incoming.source_device.toLowerCase().includes("phone") ? (
                <Smartphone className="h-4 w-4 text-white" />
              ) : (
                <Monitor className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.85)]">
                Continue with Sita?
              </div>
              <div className="text-[10px] text-[hsl(0_0%_100%/0.55)] truncate">
                From {incoming.source_device}: {incoming.intent}
              </div>
            </div>
            <button
              onClick={() => void decline()}
              className="w-8 h-8 rounded-full bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_70%_55%/0.25)] text-[hsl(0_0%_100%/0.6)] flex items-center justify-center transition-colors"
              aria-label="Decline"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => void accept()}
              className="w-8 h-8 rounded-full bg-[hsl(130_55%_45%)] hover:bg-[hsl(130_55%_50%)] text-white flex items-center justify-center transition-colors"
              aria-label="Accept"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
