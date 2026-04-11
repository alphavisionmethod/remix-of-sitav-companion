// ═══════════════════════════════════════════════════════════════
// NovaOS — Command Layer (Signature Feature)
// Hold Meta key for 500ms to reveal all system actions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, FolderOpen, Settings, Layout, Monitor,
  Bell, Lock, Moon, Wifi, HardDrive,
  FileText, Download, Trash2, Plus,
  Command, ArrowUp, CornerDownLeft,
} from "lucide-react";

interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  category: string;
}

const ACTIONS: CommandAction[] = [
  // Navigation
  { id: "search", label: "Search", shortcut: "⌘K", icon: Search, category: "Navigation" },
  { id: "finder", label: "Finder", shortcut: "⌘F", icon: FolderOpen, category: "Navigation" },
  { id: "settings", label: "Settings", shortcut: "⌘,", icon: Settings, category: "Navigation" },
  { id: "mission", label: "Mission Control", shortcut: "F3", icon: Layout, category: "Navigation" },
  // Files
  { id: "new-folder", label: "New Folder", shortcut: "⇧⌘N", icon: Plus, category: "Files" },
  { id: "documents", label: "Documents", icon: FileText, category: "Files" },
  { id: "downloads", label: "Downloads", icon: Download, category: "Files" },
  { id: "trash", label: "Trash", icon: Trash2, category: "Files" },
  // System
  { id: "display", label: "Display", icon: Monitor, category: "System" },
  { id: "notifications", label: "Notifications", icon: Bell, category: "System" },
  { id: "lock", label: "Lock Screen", shortcut: "⌘⇧L", icon: Lock, category: "System" },
  { id: "network", label: "Network", icon: Wifi, category: "System" },
  { id: "storage", label: "Storage", icon: HardDrive, category: "System" },
  { id: "appearance", label: "Appearance", icon: Moon, category: "System" },
];

const CATEGORIES = ["Navigation", "Files", "System"];
const HOLD_DURATION = 500;

interface CommandLayerProps {
  onAction?: (actionId: string) => void;
}

export function CommandLayer({ onAction }: CommandLayerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let isHolding = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" && !isHolding && !e.repeat) {
        isHolding = true;
        holdTimer = setTimeout(() => {
          setIsVisible(true);
        }, HOLD_DURATION);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        isHolding = false;
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        setIsVisible(false);
      }
    };

    // Also dismiss on any other key press (Meta+K should open command palette, not this)
    const handleOtherKey = (e: KeyboardEvent) => {
      if (e.key !== "Meta" && isHolding) {
        isHolding = false;
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        setIsVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleOtherKey);

    return () => {
      if (holdTimer) clearTimeout(holdTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleOtherKey);
    };
  }, []);

  const handleAction = useCallback((actionId: string) => {
    onAction?.(actionId);
    setIsVisible(false);
  }, [onAction]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[hsl(0_0%_0%/0.70)] backdrop-blur-md" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-3xl px-8"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-8 justify-center">
              <div className="px-2 py-1 rounded-md bg-[hsl(0_0%_100%/0.15)] border border-[hsl(0_0%_100%/0.1)]">
                <Command className="w-4 h-4 text-[hsl(0_0%_100%/0.6)]" />
              </div>
              <span className="text-sm font-medium text-[hsl(0_0%_100%/0.5)]">
                Command Layer — release to dismiss
              </span>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-3 gap-6">
              {CATEGORIES.map(cat => (
                <div key={cat}>
                  <h3 className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(0_0%_100%/0.35)] mb-3">
                    {cat}
                  </h3>
                  <div className="space-y-1">
                    {ACTIONS.filter(a => a.category === cat).map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(0_0%_100%/0.10)] transition-colors duration-150 group"
                        >
                          <Icon className="w-4 h-4 text-[hsl(0_0%_100%/0.5)] group-hover:text-[hsl(0_0%_100%/0.8)] transition-colors" />
                          <span className="text-sm text-[hsl(0_0%_100%/0.7)] group-hover:text-[hsl(0_0%_100%/0.95)] transition-colors flex-1 text-left">
                            {action.label}
                          </span>
                          {action.shortcut && (
                            <span className="text-[10px] font-mono text-[hsl(0_0%_100%/0.25)] group-hover:text-[hsl(0_0%_100%/0.4)] transition-colors">
                              {action.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
