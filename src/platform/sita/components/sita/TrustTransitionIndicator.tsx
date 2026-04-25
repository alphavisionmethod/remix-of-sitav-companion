// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Transition Indicator
// Shows when data transitions from demo→live or live→demo
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Database, FlaskConical } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function TrustTransitionIndicator() {
  const { isDemoMode } = useDataMode();
  const prevModeRef = useRef(isDemoMode);
  const [transition, setTransition] = useState<"to-live" | "to-demo" | null>(null);

  useEffect(() => {
    if (prevModeRef.current !== isDemoMode) {
      setTransition(isDemoMode ? "to-demo" : "to-live");
      const timer = setTimeout(() => setTransition(null), 4000);
      prevModeRef.current = isDemoMode;
      return () => clearTimeout(timer);
    }
  }, [isDemoMode]);

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg border ${
            transition === "to-live"
              ? "bg-trust-safe/10 text-trust-safe border-trust-safe/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            {transition === "to-live" ? (
              <>
                <FlaskConical className="h-3.5 w-3.5" />
                <ArrowRight className="h-3 w-3" />
                <Database className="h-3.5 w-3.5" />
                <span>Switched to live data</span>
              </>
            ) : (
              <>
                <Database className="h-3.5 w-3.5" />
                <ArrowRight className="h-3 w-3" />
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Switched to demo data</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
