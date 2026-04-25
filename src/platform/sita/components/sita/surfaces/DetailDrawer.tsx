// ═══════════════════════════════════════════════════════════════
// SITA OS — Detail Drawer (Surface Level 3)
// Slide-from-right panel with layered shadows + domain pacing
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useCallback, type ReactNode } from "react";
import { getDomainSpring } from "@/platform/design-system/sita-design-tokens";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  domain?: DomainId;
  width?: string;
  className?: string;
}

export function DetailDrawer({ isOpen, onClose, title, children, domain = "business", width = "w-[400px] max-w-[85vw]", className }: DetailDrawerProps) {
  const spring = getDomainSpring(domain);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[hsl(0_0%_0%/0.40)] backdrop-blur-[2px] z-50"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={spring}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50",
              width,
              "bg-[hsl(0_0%_14%)] border-l border-[hsl(0_0%_100%/0.10)]",
              "shadow-[0_0_32px_hsl(0_0%_0%/0.30),-4px_0_16px_hsl(0_0%_0%/0.15)]",
              "flex flex-col overflow-hidden",
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(0_0%_100%/0.06)] shrink-0">
                <h3 className="text-[14px] font-medium text-[hsl(0_0%_90%)]">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)] transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
