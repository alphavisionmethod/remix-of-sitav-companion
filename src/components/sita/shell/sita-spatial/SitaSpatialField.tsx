// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Spatial Field
// Cmd+Shift+Space toggles a curved depth-plane projection of all
// open windows. Drag with Shift+wheel to push windows in Z.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpatialFeatures } from "@/lib/sita-spatial/feature-flags";
import { logSpatialEvent } from "@/lib/sita-spatial/spatial-events";

export function SitaSpatialField() {
  const [features] = useSpatialFeatures();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!features.spatial) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "Space") {
        e.preventDefault();
        setActive((v) => {
          void logSpatialEvent(v ? "spatial_exit" : "spatial_enter", {});
          return !v;
        });
      } else if (e.key === "Escape" && active) {
        setActive(false);
        void logSpatialEvent("spatial_exit", { via: "escape" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [features.spatial, active]);

  useEffect(() => {
    document.body.dataset.sitaSpatial = active ? "on" : "off";
    return () => {
      delete document.body.dataset.sitaSpatial;
    };
  }, [active]);

  if (!features.spatial) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-[940] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, hsl(220 30% 5% / 0.2), hsl(220 30% 2% / 0.7))",
          }}
        >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="px-4 py-2 rounded-full bg-[hsl(0_0%_8%/0.7)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.08)] text-[10px] text-[hsl(0_0%_100%/0.7)]">
              Spatial Workspace · Esc to exit
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
