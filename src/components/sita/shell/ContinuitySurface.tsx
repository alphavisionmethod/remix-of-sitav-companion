// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuity Surface
// Glassmorphic widget showing time-aware greeting + resume context
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, FileText, Workflow } from "lucide-react";
import type { ContinuityContext, DesktopState } from "./useShellState";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface ContinuitySurfaceProps {
  continuity: ContinuityContext;
  desktopState: DesktopState;
  hasWindows: boolean;
}

export function ContinuitySurface({ continuity, desktopState, hasWindows }: ContinuitySurfaceProps) {
  const [idle, setIdle] = useState(false);
  const [greeting] = useState(getGreeting);

  // Auto-hide after 10s idle
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 10000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, []);

  const showContinuity = desktopState === "returning" && continuity.lastWorkspace;
  const hasPending = continuity.pendingDrafts > 0 || continuity.unfinishedWorkflows > 0;
  const hasChanges = continuity.whatChanged.length > 0;

  // Don't render if nothing to show
  if (desktopState === "offline" || desktopState === "focus") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: idle || hasWindows ? 0 : 1, y: idle || hasWindows ? 8 : 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-8 left-8 z-10 max-w-[320px] pointer-events-auto"
    >
      <div className="rounded-2xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_0%/0.35)] backdrop-blur-2xl shadow-[0_8px_32px_hsl(0_0%_0%/0.3)] p-5">
        {/* Greeting */}
        <p className="text-[15px] font-medium text-[hsl(0_0%_100%/0.9)] mb-1">
          {greeting}
        </p>

        {/* Resume context */}
        {showContinuity && (
          <button className="flex items-center gap-2 mt-3 group cursor-pointer">
            <ArrowRight className="w-3.5 h-3.5 text-[hsl(210_80%_65%/0.8)] group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[13px] text-[hsl(0_0%_100%/0.6)] group-hover:text-[hsl(0_0%_100%/0.85)] transition-colors">
              Resume <span className="text-[hsl(0_0%_100%/0.8)] font-medium">{continuity.lastWorkspace}</span>
            </span>
          </button>
        )}

        {/* Pending items */}
        {hasPending && (
          <div className="flex items-center gap-3 mt-3 text-[12px] text-[hsl(0_0%_100%/0.5)]">
            {continuity.pendingDrafts > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {continuity.pendingDrafts} draft{continuity.pendingDrafts > 1 ? "s" : ""}
              </span>
            )}
            {continuity.unfinishedWorkflows > 0 && (
              <span className="flex items-center gap-1">
                <Workflow className="w-3 h-3" />
                {continuity.unfinishedWorkflows} in progress
              </span>
            )}
          </div>
        )}

        {/* What changed */}
        {hasChanges && (
          <div className="mt-3 flex items-start gap-1.5">
            <Clock className="w-3 h-3 text-[hsl(0_0%_100%/0.4)] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[hsl(0_0%_100%/0.4)] leading-relaxed">
              {continuity.whatChanged.slice(0, 2).join(" · ")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
