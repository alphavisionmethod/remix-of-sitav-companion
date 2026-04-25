// ═══════════════════════════════════════════════════════════════
// SITA OS — SlidePanel (Progressive Disclosure)
// Right-side animated drawer for detail views without leaving context
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: ReactNode;
  className?: string;
}

export function SlidePanel({ open, onClose, title, width = 400, children, className }: SlidePanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-[hsl(0_0%_0%/0.4)] backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: width + 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: width + 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{ width }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-[61] overflow-y-auto",
              "bg-[hsl(0_0%_7%)] border-l border-[hsl(0_0%_100%/0.08)]",
              "shadow-[−8px_0_32px_hsl(0_0%_0%/0.3)]",
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%/0.95)] backdrop-blur-md">
                <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] tracking-[-0.01em]">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
