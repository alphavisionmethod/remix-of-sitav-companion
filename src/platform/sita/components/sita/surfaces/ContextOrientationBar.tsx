// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Orientation Bar
// Persistent strip: where am I, what changed, what can I do
// ═══════════════════════════════════════════════════════════════

import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";
import { useMemo } from "react";

interface QuickAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface ContextOrientationBarProps {
  domainLabel?: string;
  domainIcon?: React.ReactNode;
  pageLabel?: string;
  changesSummary?: string;
  dataState?: "fresh" | "stale" | "demo";
  quickActions?: QuickAction[];
  hidden?: boolean;
  className?: string;
}

const DATA_STATE_STYLES = {
  fresh: { label: "Live", className: "bg-trust-safe/10 text-trust-safe border-trust-safe/20" },
  stale: { label: "Stale", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  demo: { label: "Demo", className: "bg-sita-purple/10 text-sita-purple border-sita-purple/20" },
} as const;

export function ContextOrientationBar({
  domainLabel,
  domainIcon,
  pageLabel,
  changesSummary,
  dataState,
  quickActions,
  hidden = false,
  className,
}: ContextOrientationBarProps) {
  const location = useLocation();

  const resolvedPageLabel = useMemo(() => {
    if (pageLabel) return pageLabel;
    const path = location.pathname.split("/").filter(Boolean);
    return path[path.length - 1]?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "Home";
  }, [pageLabel, location.pathname]);

  if (hidden) return null;

  const stateStyle = dataState ? DATA_STATE_STYLES[dataState] : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 border-b border-border/40 bg-background/60 backdrop-blur-sm text-xs min-h-[32px]",
        className
      )}
      role="navigation"
      aria-label="Page orientation"
    >
      {/* Breadcrumb: domain > page */}
      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
        {domainIcon && <span className="h-3.5 w-3.5">{domainIcon}</span>}
        {domainLabel && (
          <>
            <span className="font-medium">{domainLabel}</span>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="font-semibold text-foreground">{resolvedPageLabel}</span>
      </div>

      {/* Data state badge */}
      {stateStyle && (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold border", stateStyle.className)}>
          {stateStyle.label}
        </span>
      )}

      {/* Changes summary */}
      {changesSummary && (
        <span className="text-muted-foreground ml-1 truncate max-w-48">
          {changesSummary}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick actions */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0">
          {quickActions.slice(0, 3).map((qa, i) => (
            <button
              key={i}
              onClick={qa.onClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              {qa.icon ?? <Sparkles className="h-3 w-3" />}
              {qa.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
