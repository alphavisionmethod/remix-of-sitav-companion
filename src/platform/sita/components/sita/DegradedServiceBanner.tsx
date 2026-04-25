// ═══════════════════════════════════════════════════════════════
// SITA OS — Degraded Service Banner
// Per-service degradation communication
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, X, CheckCircle } from "lucide-react";
import { getStateCopy } from "@/lib/ux-trust/microcopy-system";

export interface DegradedService {
  id: string;
  name: string;
  status: "degraded" | "partial" | "down";
  limitedFeatures?: string[];
  workingFeatures?: string[];
  retryable?: boolean;
  onRetry?: () => void;
}

interface DegradedServiceBannerProps {
  services: DegradedService[];
  onDismiss?: (serviceId: string) => void;
  className?: string;
}

const STATUS_STYLES = {
  degraded: { bg: "bg-amber-500/5", border: "border-amber-500/20", icon: "text-amber-400" },
  partial: { bg: "bg-amber-500/5", border: "border-amber-500/20", icon: "text-amber-400" },
  down: { bg: "bg-destructive/5", border: "border-destructive/30", icon: "text-destructive" },
} as const;

export function DegradedServiceBanner({ services, onDismiss, className }: DegradedServiceBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    onDismiss?.(id);
  }, [onDismiss]);

  const visible = services.filter(s => !dismissed.has(s.id));
  if (visible.length === 0) return null;

  return (
    <div className={cn("space-y-1.5", className)} role="status" aria-label="Service health">
      {visible.map(service => {
        const style = STATUS_STYLES[service.status];
        const copy = getStateCopy("degraded", { service: service.name });

        return (
          <div
            key={service.id}
            className={cn(
              "flex items-start gap-2.5 px-3 py-2 rounded-md border text-xs",
              style.bg, style.border
            )}
          >
            <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", style.icon)} />

            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-foreground">{copy.title}</p>
              <p className="text-muted-foreground">{copy.description}</p>

              {service.limitedFeatures && service.limitedFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground">Limited:</span>
                  {service.limitedFeatures.map((f, i) => (
                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400">{f}</span>
                  ))}
                </div>
              )}

              {service.workingFeatures && service.workingFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] text-muted-foreground">Working:</span>
                  {service.workingFeatures.map((f, i) => (
                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-trust-safe/10 text-trust-safe flex items-center gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5" />{f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {service.retryable && service.onRetry && (
                <button
                  onClick={service.onRetry}
                  className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Retry"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => handleDismiss(service.id)}
                className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
