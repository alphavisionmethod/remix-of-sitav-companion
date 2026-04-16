// ═══════════════════════════════════════════════════════════════
// SITA OS — Cognitive Load Guard
// Suppresses non-critical UI when attention load is high
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Brain, Eye } from "lucide-react";
import { shouldSuppressNonCritical } from "@/lib/ux-trust/ux-principles";

interface CognitiveLoadGuardProps {
  /** Current cognitive load score (0-100) */
  cognitiveLoad: number;
  /** Is user in focus mode? */
  isFocusMode?: boolean;
  /** Content to guard — hidden when overloaded */
  children: ReactNode;
  /** Priority: "critical" content is never hidden */
  priority?: "critical" | "normal" | "low";
  /** Fallback shown when content is suppressed */
  fallback?: ReactNode;
  className?: string;
}

export function CognitiveLoadGuard({
  cognitiveLoad,
  isFocusMode = false,
  children,
  priority = "normal",
  fallback,
  className,
}: CognitiveLoadGuardProps) {
  const [overridden, setOverridden] = useState(false);

  const shouldSuppress = useMemo(() => {
    if (priority === "critical") return false;
    if (overridden) return false;
    if (priority === "low" && cognitiveLoad > 50) return true;
    return shouldSuppressNonCritical(cognitiveLoad, isFocusMode);
  }, [cognitiveLoad, isFocusMode, priority, overridden]);

  if (!shouldSuppress) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 border border-border/30", className)}>
      <Brain className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">
        {cognitiveLoad >= 90
          ? "Focus mode suggested — some elements hidden to reduce load"
          : "Some elements hidden to help you focus"}
      </span>
      <button
        onClick={() => setOverridden(true)}
        className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors shrink-0"
      >
        <Eye className="h-3 w-3" />
        Show
      </button>
    </div>
  );
}
