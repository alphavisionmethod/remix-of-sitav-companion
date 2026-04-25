// ═══════════════════════════════════════════════════════════════
// SITA OS — App Switcher (Alt+Tab)
// Floating horizontal strip with window previews + keyboard nav
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { APP_ACCENTS } from "@/platform/design-system/app-window-system";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";

const APP_ICONS: Record<string, string> = {
  finder: "📁", settings: "⚙️", notes: "📝", terminal: "⌨️",
  calendar: "📅", weather: "🌤️", "nova-terminal": "💻",
  "system-monitor": "📊", "music-player": "🎵", calculator: "🧮",
  "photo-viewer": "🖼️", "code-editor": "🔧", "mail-client": "✉️",
  "maps-app": "🗺️",
};

export function AppSwitcher() {
  const wm = useWindowManagerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const altDown = useRef(false);

  const windows = wm?.windows ?? [];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Alt") {
      altDown.current = true;
    }

    if (e.altKey && e.key === "Tab") {
      e.preventDefault();
      if (!isOpen && windows.length > 1) {
        setIsOpen(true);
        setSelectedIndex(1); // Start at second window (first is current)
      } else if (isOpen) {
        setSelectedIndex(prev => (prev + (e.shiftKey ? -1 : 1) + windows.length) % windows.length);
      }
    }

    // Arrow keys when open
    if (isOpen) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % windows.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + windows.length) % windows.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectAndClose();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
  }, [isOpen, windows.length]);

  const selectAndClose = useCallback(() => {
    if (windows[selectedIndex]) {
      wm?.focusWindow(windows[selectedIndex].id);
    }
    setIsOpen(false);
  }, [wm, windows, selectedIndex]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Alt") {
      altDown.current = false;
      if (isOpen) {
        selectAndClose();
      }
    }
  }, [isOpen, selectAndClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  if (windows.length < 2) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{
              zIndex: DEPTH_LAYERS.menuBar + 50,
              background: "hsl(0 0% 0% / 0.35)",
              backdropFilter: "blur(12px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          {/* Switcher strip */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-5 py-4"
            style={{
              zIndex: DEPTH_LAYERS.menuBar + 51,
              background: "hsl(0 0% 12% / 0.82)",
              backdropFilter: "blur(40px) saturate(1.6)",
              borderRadius: 20,
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 30px 80px hsl(0 0% 0% / 0.5)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            {windows.map((win, i) => {
              const accent = APP_ACCENTS[win.id] || APP_ACCENTS.default;
              const isSelected = i === selectedIndex;
              return (
                <motion.button
                  key={win.id}
                  onClick={() => { setSelectedIndex(i); selectAndClose(); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150",
                    isSelected
                      ? "bg-[hsl(0_0%_100%/0.12)] ring-2 ring-[hsl(210_80%_60%/0.6)]"
                      : "hover:bg-[hsl(0_0%_100%/0.05)]"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Window preview card */}
                  <div
                    className={cn(
                      "w-28 h-20 rounded-lg overflow-hidden relative",
                      "bg-[hsl(0_0%_18%)] border border-[hsl(0_0%_100%/0.06)]"
                    )}
                  >
                    {/* Accent strip */}
                    <div className={cn("h-1 w-full bg-gradient-to-r", accent)} />
                    {/* Simulated content lines */}
                    <div className="p-2 space-y-1">
                      <div className="h-1 w-3/4 rounded bg-[hsl(0_0%_100%/0.1)]" />
                      <div className="h-1 w-full rounded bg-[hsl(0_0%_100%/0.06)]" />
                      <div className="h-1 w-1/2 rounded bg-[hsl(0_0%_100%/0.06)]" />
                      <div className="h-1 w-2/3 rounded bg-[hsl(0_0%_100%/0.04)]" />
                    </div>
                    {win.minimized && (
                      <div className="absolute inset-0 bg-[hsl(0_0%_0%/0.5)] flex items-center justify-center">
                        <span className="text-[9px] text-[hsl(0_0%_100%/0.5)]">Minimized</span>
                      </div>
                    )}
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-1.5 max-w-28">
                    <span className="text-[14px]">{APP_ICONS[win.id] || "📱"}</span>
                    <span className={cn(
                      "text-[11px] truncate",
                      isSelected ? "text-[hsl(0_0%_100%/0.95)] font-medium" : "text-[hsl(0_0%_100%/0.55)]"
                    )}>
                      {win.title}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
