// ═══════════════════════════════════════════════════════════════
// App Shell Breadcrumb + Navigation History
// Shared breadcrumb trail with back/forward for all 3 app shells
// ═══════════════════════════════════════════════════════════════

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronRight as Forward, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  id: string;
  label: string;
}

interface AppShellBreadcrumbProps {
  appName: string;
  appColor: string;
  current: BreadcrumbItem;
  history: string[];
  historyIndex: number;
  onNavigate: (moduleKey: string) => void;
  onBack: () => void;
  onForward: () => void;
  className?: string;
}

export function AppShellBreadcrumb({
  appName, appColor, current, history, historyIndex,
  onNavigate, onBack, onForward, className,
}: AppShellBreadcrumbProps) {
  const canBack = historyIndex > 0;
  const canForward = historyIndex < history.length - 1;

  return (
    <div className={cn("flex items-center gap-1.5 min-w-0", className)}>
      {/* Back / Forward */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onBack}
          disabled={!canBack}
          className={cn(
            "p-0.5 rounded transition-colors",
            canBack ? "hover:bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_100%/0.4)]" : "text-[hsl(0_0%_100%/0.12)] cursor-default"
          )}
        >
          <ChevronLeft size={12} />
        </button>
        <button
          onClick={onForward}
          disabled={!canForward}
          className={cn(
            "p-0.5 rounded transition-colors",
            canForward ? "hover:bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_100%/0.4)]" : "text-[hsl(0_0%_100%/0.12)] cursor-default"
          )}
        >
          <Forward size={12} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-3 bg-[hsl(0_0%_100%/0.08)] shrink-0" />

      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        <button
          onClick={() => onNavigate("overview")}
          className="text-[10px] font-semibold shrink-0 transition-colors hover:text-[hsl(0_0%_100%/0.7)]"
          style={{ color: appColor }}
        >
          {appName}
        </button>
        <ChevronRight size={9} className="text-[hsl(0_0%_100%/0.15)] shrink-0" />
        <motion.span
          key={current.id}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] font-medium text-[hsl(0_0%_100%/0.6)] truncate"
        >
          {current.label}
        </motion.span>
      </div>
    </div>
  );
}

// ── Navigation history hook ──────────────────────────────────

export function useNavigationHistory(initialModule = "overview") {
  const historyRef = useRef<string[]>([initialModule]);
  const indexRef = useRef(0);

  const navigate = useCallback((moduleKey: string, setActive: (m: string) => void) => {
    // Trim forward history
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(moduleKey);
    indexRef.current = historyRef.current.length - 1;
    setActive(moduleKey);
  }, []);

  const goBack = useCallback((setActive: (m: string) => void) => {
    if (indexRef.current > 0) {
      indexRef.current--;
      setActive(historyRef.current[indexRef.current]);
    }
  }, []);

  const goForward = useCallback((setActive: (m: string) => void) => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      setActive(historyRef.current[indexRef.current]);
    }
  }, []);

  return {
    history: historyRef.current,
    historyIndex: indexRef.current,
    navigate,
    goBack,
    goForward,
  };
}
