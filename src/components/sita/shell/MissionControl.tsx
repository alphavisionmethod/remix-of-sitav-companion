// ═══════════════════════════════════════════════════════════════
// NovaOS — Mission Control
// Zoomed-out window overview with click-to-focus
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { DEPTH_LAYERS, NOVA_MOTION } from "@/lib/design-system/nova-os";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import type { ReactNode } from "react";

interface WindowInfo {
  id: string;
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  width?: number;
  zIndex: number;
  minimized?: boolean;
}

interface MissionControlProps {
  isOpen: boolean;
  windows: WindowInfo[];
  onSelectWindow: (id: string) => void;
  onClose: () => void;
}

export function MissionControl({ isOpen, windows, onSelectWindow, onClose }: MissionControlProps) {
  const visibleWindows = windows.filter(w => !w.minimized);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: NOVA_MOTION.duration.standard }}
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: DEPTH_LAYERS.overlay }}
          onClick={onClose}
        >
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-[hsl(0_0%_0%/0.65)] backdrop-blur-md" />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative z-10 mb-8 text-center"
          >
            <h2 className="text-lg font-medium text-[hsl(0_0%_100%/0.8)] tracking-wide">
              Mission Control
            </h2>
            <p className="text-xs text-[hsl(0_0%_100%/0.4)] mt-1">
              {visibleWindows.length > 0
                ? `${visibleWindows.length} open window${visibleWindows.length > 1 ? "s" : ""}`
                : "No windows open"}
            </p>
          </motion.div>

          {/* Window thumbnails */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 px-8 max-w-4xl">
            {visibleWindows.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-12"
              >
                <Layers className="h-12 w-12 text-[hsl(0_0%_100%/0.2)]" />
                <p className="text-sm text-[hsl(0_0%_100%/0.35)]">
                  No windows open — launch an app from the Dock
                </p>
              </motion.div>
            ) : (
              visibleWindows.map((w, i) => (
                <motion.button
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWindow(w.id);
                  }}
                  className={cn(
                    "relative rounded-xl overflow-hidden cursor-pointer",
                    "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-lg",
                    "border border-[hsl(0_0%_100%/0.12)]",
                    "shadow-xl shadow-[hsl(0_0%_0%/0.3)]",
                    "hover:border-[hsl(210_80%_60%/0.5)]",
                    "transition-colors duration-200"
                  )}
                  style={{ width: 220, height: 150 }}
                >
                  {/* Mini preview — shows content at reduced scale */}
                  <div className="w-full h-full overflow-hidden pointer-events-none">
                    <div className="origin-top-left" style={{ transform: "scale(0.4)", width: 550 }}>
                      {/* Title bar replica */}
                      <div className="h-10 flex items-center px-3 gap-2 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.05)]">
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_60%)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(45_80%_55%)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(130_55%_48%)]" />
                        <span className="ml-2 text-xs text-[hsl(0_0%_100%/0.6)]">{w.title}</span>
                      </div>
                      {/* Content preview */}
                      <div className="p-2 opacity-60">{w.component}</div>
                    </div>
                  </div>

                  {/* Title label */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-[hsl(0_0%_0%/0.6)] to-transparent">
                    <span className="text-xs font-medium text-[hsl(0_0%_100%/0.9)]">{w.title}</span>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-8 text-[10px] text-[hsl(0_0%_100%/0.25)] tracking-wider uppercase"
          >
            Press F3 or click anywhere to exit
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
