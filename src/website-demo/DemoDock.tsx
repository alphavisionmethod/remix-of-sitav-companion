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
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-end gap-1 px-3 py-1.5 rounded-2xl"
      style={{ background: "rgba(20,20,30,0.65)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.1)" }}>
      {/* App icons */}
      {DEMO_APPS.map((app) => {
        const isOpen = openApps.includes(app.id);
        return (
          <button key={app.id} onClick={() => onLaunch(app.id)}
            className="group flex flex-col items-center gap-0.5 transition-transform hover:scale-125 duration-200">
            <AppIconRenderer appId={app.id} size={44} />
            {isOpen && <div className="w-1 h-1 rounded-full bg-white/70" />}
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