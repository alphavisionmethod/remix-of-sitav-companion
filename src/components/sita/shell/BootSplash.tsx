// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot Splash with Kernel Log Waterfall
// Cinematic boot sequence with real service boot log entries
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { ServiceManager, type ServiceLogEntry } from "@/platform/nova-sdk/services/service-manager";
import logo from "@/assets/logo.webp";

interface BootSplashProps {
  onComplete: () => void;
}

const SESSION_KEY = "sita-boot-splash-shown";

export function BootSplash({ onComplete }: BootSplashProps) {
  const [phase, setPhase] = useState<"logo" | "waterfall" | "done">("logo");
  const [visibleLogs, setVisibleLogs] = useState<ServiceLogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const bootLogs = useRef<ServiceLogEntry[]>([]);
  const alreadyShown = useRef(sessionStorage.getItem(SESSION_KEY) === "true");

  useEffect(() => {
    if (alreadyShown.current) {
      onComplete();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "true");

    // Phase 1: Logo for 1.2s
    const logoTimer = setTimeout(() => {
      setPhase("waterfall");
      // Get boot log
      const logs = [...(ServiceManager.getBootLog?.() ?? [])];
      bootLogs.current = logs.length > 0 ? logs : [
        { serviceId: "FileSystemService", status: "ok", timestampMs: 12, message: "FileSystemService ready" },
        { serviceId: "WindowServer", status: "ok", timestampMs: 8, message: "WindowServer ready" },
        { serviceId: "InputService", status: "ok", timestampMs: 5, message: "InputService ready" },
        { serviceId: "NotificationService", status: "ok", timestampMs: 3, message: "NotificationService ready" },
        { serviceId: "SettingsService", status: "ok", timestampMs: 15, message: "SettingsService ready" },
      ];

      // Stagger log entries
      bootLogs.current.forEach((log, i) => {
        setTimeout(() => {
          setVisibleLogs(prev => [...prev, log]);
          setProgress((i + 1) / bootLogs.current.length * 100);
        }, i * 350);
      });

      // Complete after all logs
      setTimeout(() => {
        setPhase("done");
        setTimeout(onComplete, 600);
      }, bootLogs.current.length * 350 + 800);
    }, 1200);

    return () => clearTimeout(logoTimer);
  }, [onComplete]);

  if (alreadyShown.current) return null;

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{
            zIndex: DEPTH_LAYERS.menuBar + 100,
            background: "hsl(0 0% 3%)",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.img
              src={logo}
              alt="SITA"
              className="h-16 w-16 rounded-2xl"
              animate={phase === "logo" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.span
              className="text-[18px] font-light tracking-[0.3em] text-[hsl(0_0%_100%/0.7)] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              SITA OS
            </motion.span>
          </motion.div>

          {/* Progress bar */}
          {phase === "waterfall" && (
            <motion.div
              className="w-64 h-1 rounded-full bg-[hsl(0_0%_100%/0.08)] overflow-hidden mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[hsl(210_80%_55%)] to-[hsl(265_60%_55%)]"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </motion.div>
          )}

          {/* Kernel log waterfall */}
          {phase === "waterfall" && (
            <div className="w-80 max-h-48 overflow-hidden font-mono">
              <AnimatePresence>
                {visibleLogs.map((log, i) => (
                  <motion.div
                    key={`${log.serviceId}-${i}`}
                    className="flex items-center gap-2 py-0.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <span className={log.status === "ok" ? "text-[hsl(140_60%_50%)]" : "text-[hsl(0_70%_55%)]"}>
                      {log.status === "ok" ? "✓" : "✗"}
                    </span>
                    <span className="text-[11px] text-[hsl(0_0%_100%/0.5)]">
                      {log.serviceId}
                    </span>
                    <span className="text-[10px] text-[hsl(0_0%_100%/0.25)] ml-auto">
                      {log.timestampMs.toFixed(0)}ms
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Loading text */}
          <motion.span
            className="text-[11px] text-[hsl(0_0%_100%/0.25)] mt-6"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {phase === "logo" ? "Initializing kernel..." : "Starting services..."}
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
