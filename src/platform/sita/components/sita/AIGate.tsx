// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Degraded State Component
// Shows when AI features are unavailable/degraded
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIHealth, getAIStatusMessage, type AIHealthStatus } from "@/platform/governance/hooks/use-ai-health";

interface AIGateProps {
  children: React.ReactNode;
  /** Show degraded state inline instead of blocking content */
  inline?: boolean;
  /** Custom fallback when AI is unavailable */
  fallback?: React.ReactNode;
}

/** 
 * Wraps AI-dependent content and shows degraded state when AI is unavailable.
 * Use this around any component that requires AI to function.
 */
export function AIGate({ children, inline = false, fallback }: AIGateProps) {
  const { data: health, isLoading, refetch, isFetching } = useAIHealth();

  if (isLoading) {
    return inline ? (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking AI...
      </span>
    ) : (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Checking AI runtime status...</span>
      </div>
    );
  }

  const status = health?.status || "unknown";

  if (status === "healthy") {
    return <>{children}</>;
  }

  if (status === "degraded") {
    return (
      <>
        <AIDegradedBanner health={health} onRetry={() => refetch()} isRetrying={isFetching} />
        {children}
      </>
    );
  }

  // unavailable or unknown
  if (fallback) return <>{fallback}</>;

  return (
    <AIUnavailableState health={health} onRetry={() => refetch()} isRetrying={isFetching} />
  );
}

export function AIDegradedBanner({ health, onRetry, isRetrying }: { health?: AIHealthStatus; onRetry?: () => void; isRetrying?: boolean }) {
  const message = getAIStatusMessage(health);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
      <p className="text-sm text-yellow-300 flex-1">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} disabled={isRetrying} className="shrink-0">
          <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  );
}

export function AIUnavailableState({ health, onRetry, isRetrying }: { health?: AIHealthStatus; onRetry?: () => void; isRetrying?: boolean }) {
  const message = getAIStatusMessage(health);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <XCircle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">AI Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      </div>
      {!health?.checks.api_key_present && (
        <p className="text-xs text-muted-foreground">
          AI provider configuration is required. Contact your administrator.
        </p>
      )}
      {!health?.checks.budget_ok && (
        <p className="text-xs text-yellow-400">
          AI credits exhausted. Add funds in Settings → Workspace → Usage.
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          Retry
        </Button>
      )}
    </div>
  );
}
