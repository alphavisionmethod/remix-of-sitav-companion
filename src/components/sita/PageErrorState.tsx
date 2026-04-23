// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Page Error State
// Consistent error + retry for every page that fetches data.
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface PageErrorStateProps {
  /** The error message (optional — a generic message is shown if omitted) */
  message?: string;
  /** Call this to retry the failed query — typically `refetch` from useQuery/usePageData */
  onRetry?: () => void;
  /** "network" shows a WiFi icon, "generic" shows a warning triangle */
  variant?: "network" | "generic";
  /** Additional CSS class */
  className?: string;
  /** Page title context (shown in subtitle) */
  context?: string;
}

export function PageErrorState({
  message,
  onRetry,
  variant = "generic",
  className,
  context,
}: PageErrorStateProps) {
  const isNetwork = variant === "network";
  const Icon = isNetwork ? WifiOff : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        {isNetwork ? "Connection Lost" : "Something went wrong"}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-1">
        {message ??
          (isNetwork
            ? "Please check your internet connection and try again."
            : `We couldn't load ${context ? `the ${context}` : "this data"}. This may be a temporary issue.`)}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 gap-2 rounded-xl"
          onClick={() => onRetry()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground/50">
        If this persists, try refreshing the page or contact support.
      </p>
    </motion.div>
  );
}