// ═══════════════════════════════════════════════════════════════
// SITA OS — Hardware Detection Panel
// Advanced disclosure panel for boot-time hardware readiness
// Calm, elegant, never alarming — collapsed by default
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Minus, AlertTriangle } from "lucide-react";

export type HardwareCheckStatus = "pending" | "checking" | "passed" | "degraded" | "failed";

export interface HardwareCheck {
  id: string;
  label: string;
  detail?: string;
  status: HardwareCheckStatus;
}

interface HardwareDetectionPanelProps {
  checks: HardwareCheck[];
  visible: boolean;
}

const statusIcon = (status: HardwareCheckStatus) => {
  switch (status) {
    case "passed":
      return <Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" />;
    case "degraded":
      return <Minus className="h-3 w-3 text-[hsl(var(--warning,40_90%_60%))]" />;
    case "failed":
      return <AlertTriangle className="h-3 w-3 text-[hsl(var(--destructive))]" />;
    case "checking":
      return (
        <div className="h-3 w-3 rounded-full border border-foreground/20 border-t-foreground/50 animate-spin" />
      );
    default:
      return <div className="h-3 w-3 rounded-full bg-foreground/10" />;
  }
};

export function HardwareDetectionPanel({ checks, visible }: HardwareDetectionPanelProps) {
  const [open, setOpen] = useState(false);

  const summary = useMemo(() => {
    const total = checks.length;
    const done = checks.filter(c => c.status === "passed" || c.status === "degraded").length;
    const failed = checks.filter(c => c.status === "failed").length;
    return { total, done, failed };
  }, [checks]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 mt-10 w-full max-w-xs"
    >
      {/* Toggle button — calm, small */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mx-auto text-[11px] tracking-wide transition-colors duration-200 group"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        <span className="group-hover:text-white/50 transition-colors">
          View technical details
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl border p-4 space-y-2.5"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Device readiness
                </span>
                <span
                  className="text-[10px] tabular-nums"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {summary.done}/{summary.total} verified
                </span>
              </div>

              {/* Check rows */}
              {checks.map((check, i) => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="flex items-center gap-2.5"
                >
                  {statusIcon(check.status)}
                  <span
                    className="text-[11px] flex-1"
                    style={{
                      color:
                        check.status === "failed"
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {check.label}
                  </span>
                  {check.detail && (
                    <span
                      className="text-[10px]"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      {check.detail}
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Degraded note */}
              {summary.failed > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] mt-3 pt-2"
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  Some hardware checks could not be verified. Setup can continue with basic protection.
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
