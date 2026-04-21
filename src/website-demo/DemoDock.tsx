import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_APPS, type DemoAppId } from "./demo-data";
import { AppIconRenderer } from "./AppIconRenderer";
import type { DockRect } from "./DemoWindowManager";

export interface MinimizedEntry { id: string; appId: DemoAppId; title: string }

interface Props {
  openApps: DemoAppId[];
  minimizedWindows: MinimizedEntry[];
  onLaunch: (id: DemoAppId) => void;
  onRestore: (id: string) => void;
  onDockRect?: (rect: DockRect) => void;
}

export function DemoDock({ openApps, minimizedWindows, onLaunch, onRestore, onDockRect }: Props) {
  const dockRef = useRef<HTMLDivElement>(null);

  const reportRect = useCallback(() => {
    if (!dockRef.current || !onDockRect) return;
    const r = dockRef.current.getBoundingClientRect();
    onDockRect({ x: r.x, y: r.y, w: r.width, h: r.height });
  }, [onDockRect]);

  useEffect(() => {
    reportRect();
    window.addEventListener("resize", reportRect);
    return () => window.removeEventListener("resize", reportRect);
  }, [reportRect]);

  // Also report after initial paint
  useEffect(() => { requestAnimationFrame(reportRect); }, [reportRect, openApps]);

  return (
    <div ref={dockRef}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-end gap-1.5 px-4 py-2 rounded-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(25,25,38,0.75), rgba(18,18,28,0.7))",
        backdropFilter: "blur(40px) saturate(1.5)",
        WebkitBackdropFilter: "blur(40px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)",
      }}>
      {/* App icons */}
      {DEMO_APPS.map((app) => {
        const isOpen = openApps.includes(app.id);
        return (
          <button key={app.id} onClick={() => onLaunch(app.id)}
            className="group flex flex-col items-center gap-0.5 transition-all hover:scale-125 hover:-translate-y-1 duration-200">
            <AppIconRenderer appId={app.id} size={44} />
            {isOpen && <div className="w-1 h-1 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.4)]" />}
          </button>
        );
      })}

      {/* Minimized window thumbnails */}
      <AnimatePresence>
        {minimizedWindows.length > 0 && (
          <>
            <div className="w-px h-8 bg-white/10 mx-1 self-center" />
            {minimizedWindows.map((mw) => (
              <motion.button
                key={mw.id}
                initial={{ scale: 0, opacity: 0, width: 0 }}
                animate={{ scale: 1, opacity: 1, width: 44 }}
                exit={{ scale: 0, opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => onRestore(mw.id)}
                className="flex flex-col items-center gap-0.5 overflow-hidden"
                title={`Restore ${mw.title}`}
              >
                <div className="w-11 h-11 rounded-xl border border-white/20 bg-white/[0.06] flex items-center justify-center relative overflow-hidden">
                  <AppIconRenderer appId={mw.appId} size={28} />
                  <div className="absolute inset-0 bg-white/[0.04]" />
                </div>
                <div className="w-1 h-1 rounded-full bg-amber-400/80" />
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}