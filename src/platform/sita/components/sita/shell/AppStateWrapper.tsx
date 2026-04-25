// ═══════════════════════════════════════════════════════════════
// SITA OS — App State Wrapper
// Standardized loading, empty, and error states for all window apps
// ═══════════════════════════════════════════════════════════════

import { type ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS, SPACE } from "@/platform/design-system/app-window-system";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

type AppState = "loading" | "empty" | "ready" | "error";

interface AppStateWrapperProps {
  state?: AppState;
  children: ReactNode;
  accentGradient?: string;
  emptyIcon?: React.ElementType;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  loadingDelay?: number;
  className?: string;
}

function ShimmerSkeleton({ accentGradient }: { accentGradient?: string }) {
  return (
    <div className="p-6 space-y-4 animate-pulse" style={{ padding: SPACE.section }}>
      {/* Title shimmer */}
      <div className="h-4 w-2/5 rounded-lg bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)]" />
      {/* Content shimmers */}
      <div className="space-y-3">
        <div className="h-3 w-full rounded-md bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)]" />
        <div className="h-3 w-4/5 rounded-md bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)]" />
        <div className="h-3 w-3/5 rounded-md bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)]" />
      </div>
      {/* Card shimmer */}
      <div className="h-20 w-full rounded-xl bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_0%/0.04)] dark:border-[hsl(0_0%_100%/0.04)]" />
      {/* Accent bar at bottom */}
      {accentGradient && (
        <div className={cn("h-1 w-1/3 rounded-full bg-gradient-to-r opacity-30", accentGradient)} />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon = Inbox, title, message, action }: { icon?: React.ElementType; title?: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.06)] flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-[hsl(0_0%_0%/0.2)] dark:text-[hsl(0_0%_100%/0.2)]" />
      </div>
      <p className={cn(APP_TYPE.title, "text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)] mb-1")}>
        {title || "Nothing here yet"}
      </p>
      <p className={cn(APP_TYPE.body, "text-[hsl(0_0%_0%/0.4)] dark:text-[hsl(0_0%_100%/0.4)] max-w-[240px]")}>
        {message || "Content will appear here when available."}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[hsl(0_70%_55%/0.08)] flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-[hsl(0_70%_55%)]" />
      </div>
      <p className={cn(APP_TYPE.title, "text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)] mb-1")}>
        Something went wrong
      </p>
      <p className={cn(APP_TYPE.body, "text-[hsl(0_0%_0%/0.4)] dark:text-[hsl(0_0%_100%/0.4)] max-w-[260px] mb-4")}>
        {message || "An unexpected error occurred. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(APP_COMPONENTS.button.base, APP_COMPONENTS.button.primary, "flex items-center gap-1.5")}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function AppStateWrapper({
  state = "ready",
  children,
  accentGradient,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  errorMessage,
  onRetry,
  loadingDelay = 300,
  className,
}: AppStateWrapperProps) {
  const [showLoading, setShowLoading] = useState(state === "loading");

  useEffect(() => {
    if (state === "loading") {
      setShowLoading(true);
    } else {
      const t = setTimeout(() => setShowLoading(false), 80);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Content fade-in */}
      <div
        className="transition-opacity duration-200"
        style={{ opacity: state === "ready" ? 1 : 0, pointerEvents: state === "ready" ? "auto" : "none" }}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {showLoading && state === "loading" && (
        <div className="absolute inset-0">
          <ShimmerSkeleton accentGradient={accentGradient} />
        </div>
      )}

      {/* Empty state */}
      {state === "empty" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />
        </div>
      )}

      {/* Error state */}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ErrorState message={errorMessage} onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
