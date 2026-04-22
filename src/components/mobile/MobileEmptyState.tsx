// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Empty & Error State Components
// Canonical primitives for zero-data and failure states on mobile.
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, type ReactNode } from "react";

interface MobileEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function MobileEmptyState({ icon, title, description, action }: MobileEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in-50 duration-300">
      <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        {icon ?? <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 h-8 text-xs rounded-xl"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface MobileErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "network" | "generic";
}

export function MobileErrorState({
  title,
  message,
  onRetry,
  variant = "generic",
}: MobileErrorStateProps) {
  const isNetwork = variant === "network";
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in-50 duration-300">
      <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        {isNetwork ? (
          <WifiOff className="h-6 w-6 text-destructive" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-destructive" />
        )}
      </div>
      <h3 className="text-sm font-semibold mb-1">
        {title ?? (isNetwork ? "Connection Lost" : "Something went wrong")}
      </h3>
      <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
        {message ?? (isNetwork
          ? "Check your internet connection and try again."
          : "We couldn't load this data. Please try again.")}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 h-8 text-xs rounded-xl gap-1.5"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}

// ── Per-Section Inline Error with Retry + Skeleton ────────────

interface MobileSectionErrorProps {
  /** Section display name (e.g. "Pulse", "Accounts") */
  section: string;
  /** Refetch function for this specific section */
  onRetry: () => Promise<unknown> | void;
  /** The skeleton component to show while retrying */
  skeleton: ReactNode;
  /** Optional custom message */
  message?: string;
}

export function MobileSectionError({
  section,
  onRetry,
  skeleton,
  message,
}: MobileSectionErrorProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await onRetry();
    } catch {
      // error will be reflected by the hook's error state
    } finally {
      setRetrying(false);
    }
  }, [onRetry]);

  if (retrying) {
    return <>{skeleton}</>;
  }

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-destructive/20 bg-destructive/5 animate-in fade-in-50 duration-200">
      <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-4 w-4 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">
          Couldn't load {section}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {message ?? "Tap retry to try again."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] rounded-lg gap-1 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={handleRetry}
      >
        <RefreshCw className="h-2.5 w-2.5" />
        Retry
      </Button>
    </div>
  );
}