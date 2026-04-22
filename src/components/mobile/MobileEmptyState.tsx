// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Empty & Error State Components
// Canonical primitives for zero-data and failure states on mobile.
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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