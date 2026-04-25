// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot Accessibility Shortcut
// Floating button available from first screen
// Large text, high contrast, reduced motion
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Type, Contrast, Zap, X } from "lucide-react";

export type A11yOption = "large-text" | "high-contrast" | "reduced-motion";

interface BootAccessibilityShortcutProps {
  activeOptions: A11yOption[];
  onToggle: (option: A11yOption) => void;
}

const OPTIONS: { id: A11yOption; label: string; icon: typeof Type }[] = [
  { id: "large-text", label: "Larger text", icon: Type },
  { id: "high-contrast", label: "High contrast", icon: Contrast },
  { id: "reduced-motion", label: "Reduce motion", icon: Zap },
];

export function BootAccessibilityShortcut({ activeOptions, onToggle }: BootAccessibilityShortcutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[210] flex flex-col items-end gap-2">
      {/* Options panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border p-3 space-y-1.5 mb-1"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(20,20,20,0.95)",
              backdropFilter: "blur(20px)",
              minWidth: 180,
            }}
          >
            <p
              className="text-[10px] font-medium tracking-wide uppercase mb-2 px-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Accessibility
            </p>
            {OPTIONS.map(opt => {
              const active = activeOptions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => onToggle(opt.id)}
                  className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  }}
                >
                  <opt.icon
                    className="h-3.5 w-3.5"
                    style={{ color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
                  />
                  <span
                    className="text-[11px] flex-1 text-left"
                    style={{ color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}
                  >
                    {opt.label}
                  </span>
                  {active && (
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-label="Accessibility options"
      >
        {open ? (
          <X className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
        ) : (
          <Accessibility className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
        )}
      </button>
    </div>
  );
}
