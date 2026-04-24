// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Holographic Boardroom
// Translucent 3D ring of advisor portraits that hovers over the
// active app when "convene the board" is invoked.
// CSS-only 3D — no three.js dependency to keep payload lean.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSpatialFeatures } from "@/lib/sita-spatial/feature-flags";
import { logSpatialEvent } from "@/lib/sita-spatial/spatial-events";

const ADVISORS = [
  { id: "business", name: "Business", color: "hsl(210 80% 55%)" },
  { id: "finance", name: "Finance", color: "hsl(130 55% 50%)" },
  { id: "concierge", name: "Concierge", color: "hsl(265 55% 55%)" },
  { id: "security", name: "Security", color: "hsl(0 70% 55%)" },
  { id: "operations", name: "Operations", color: "hsl(38 85% 55%)" },
  { id: "investment", name: "Investment", color: "hsl(180 60% 50%)" },
];

export function SitaHolographicBoardroom() {
  const [features] = useSpatialFeatures();
  const [active, setActive] = useState(false);
  const [topic, setTopic] = useState<string>("");

  useEffect(() => {
    const open = (e: Event) => {
      const detail = (e as CustomEvent<{ topic?: string }>).detail;
      setTopic(detail?.topic ?? "Strategic review");
      setActive(true);
      void logSpatialEvent("boardroom_convened", { topic: detail?.topic });
    };
    const close = () => {
      setActive(false);
      void logSpatialEvent("boardroom_dismissed", {});
    };
    window.addEventListener("sita-boardroom:convene", open);
    window.addEventListener("sita-boardroom:dismiss", close);
    return () => {
      window.removeEventListener("sita-boardroom:convene", open);
      window.removeEventListener("sita-boardroom:dismiss", close);
    };
  }, []);

  if (!features.boardroom) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[950] pointer-events-auto"
          style={{ background: "radial-gradient(circle at center, hsl(0 0% 0% / 0.5), hsl(0 0% 0% / 0.85))" }}
          onClick={() => setActive(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setActive(false); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.12)] text-[hsl(0_0%_100%/0.7)] flex items-center justify-center backdrop-blur-xl"
            aria-label="Dismiss boardroom"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.4)]">Sita · Holographic Boardroom</div>
            <div className="mt-1 text-base font-semibold text-[hsl(0_0%_100%/0.9)]">{topic}</div>
          </div>

          {/* Advisor ring */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "900px" }}>
            <div
              className="relative"
              style={{
                width: 320,
                height: 320,
                transformStyle: "preserve-3d",
                animation: "sita-board-rotate 30s linear infinite",
              }}
            >
              {ADVISORS.map((a, i) => {
                const angle = (i / ADVISORS.length) * Math.PI * 2;
                const radius = 160;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                    className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-[10px] font-semibold backdrop-blur-md"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${x}px, 0px, ${z}px)`,
                      background: `radial-gradient(circle at center, ${a.color} 0%, hsl(0 0% 0% / 0.6) 80%)`,
                      border: `1px solid ${a.color}`,
                      boxShadow: `0 0 30px ${a.color}, inset 0 0 20px ${a.color}`,
                      color: "hsl(0 0% 100% / 0.95)",
                    }}
                  >
                    {a.name}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[10px] text-[hsl(0_0%_100%/0.4)]">
            Decisions surface as Action Plans. Click anywhere to dismiss.
          </div>

          <style>{`
            @keyframes sita-board-rotate {
              from { transform: rotateY(0deg); }
              to { transform: rotateY(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
