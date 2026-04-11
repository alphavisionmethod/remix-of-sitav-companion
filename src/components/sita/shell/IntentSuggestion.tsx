// ═══════════════════════════════════════════════════════════════
// NovaOS — Intent-Aware Suggestion Pill
// Appears after 5s idle with context-based suggestions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, X } from "lucide-react";
import type { ContinuityContext, ShellNotificationDigest } from "./useShellState";

interface IntentSuggestionProps {
  continuity?: ContinuityContext;
  notifications?: ShellNotificationDigest;
  visible?: boolean;
  onAction?: (action: string) => void;
}

const IDLE_DELAY = 5000;

export function IntentSuggestion({
  continuity,
  notifications,
  visible = true,
  onAction,
}: IntentSuggestionProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const suggestion = useMemo(() => {
    if (notifications && notifications.approvals > 0) {
      return { text: `${notifications.approvals} approval${notifications.approvals > 1 ? "s" : ""} waiting — review now?`, action: "approvals" };
    }
    if (continuity?.pendingDrafts && continuity.pendingDrafts > 0) {
      return { text: `${continuity.pendingDrafts} unfinished draft${continuity.pendingDrafts > 1 ? "s" : ""} — continue?`, action: "drafts" };
    }
    if (continuity?.unfinishedWorkflows && continuity.unfinishedWorkflows > 0) {
      return { text: `Resume your last workflow?`, action: "workflow" };
    }
    if (continuity?.lastWorkspace) {
      return { text: `Back to ${continuity.lastWorkspace}?`, action: "workspace" };
    }
    // Default ambient suggestion
    const hour = new Date().getHours();
    if (hour < 10) return { text: "Good morning — check today's agenda?", action: "agenda" };
    if (hour >= 17) return { text: "Wind down — review today's summary?", action: "summary" };
    return { text: "Open recent project?", action: "recent" };
  }, [continuity, notifications]);

  // Idle detection
  useEffect(() => {
    if (!visible || dismissed) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      setShow(false);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(true), IDLE_DELAY);
    };

    resetIdle();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("click", resetIdle);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("click", resetIdle);
    };
  }, [visible, dismissed]);

  const handleClick = useCallback(() => {
    onAction?.(suggestion.action);
    setDismissed(true);
    setShow(false);
  }, [onAction, suggestion.action]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    setShow(false);
  }, []);

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-[hsl(0_0%_100%/0.10)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.16)] transition-colors duration-200 shadow-lg shadow-[hsl(0_0%_0%/0.1)]">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(265_60%_70%)]" />
            <span className="text-xs font-medium text-[hsl(0_0%_100%/0.7)] group-hover:text-[hsl(0_0%_100%/0.9)] transition-colors">
              {suggestion.text}
            </span>
            <ArrowRight className="w-3 h-3 text-[hsl(0_0%_100%/0.3)] group-hover:text-[hsl(0_0%_100%/0.6)] transition-colors" />
            <button
              onClick={handleDismiss}
              className="ml-1 p-0.5 rounded-full hover:bg-[hsl(0_0%_100%/0.1)] transition-colors"
              aria-label="Dismiss suggestion"
            >
              <X className="w-3 h-3 text-[hsl(0_0%_100%/0.3)]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
