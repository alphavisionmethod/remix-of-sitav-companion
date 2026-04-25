// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical State Renderer
// Maps ProductState to the correct visual treatment.
// Use this instead of ad-hoc loading/empty/error blocks.
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import type { ProductState } from "@/platform/product/state-grammar";
import { STATE_VISUAL_MAP } from "@/platform/experience/state-visual-grammar";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { AlertTriangle, Inbox, Lock, ShieldOff, WifiOff, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateRendererProps {
  state: ProductState;
  /** Rendered when state is "ready" */
  children: ReactNode;
  /** Use section-level skeleton instead of full-page */
  inline?: boolean;
  /** Custom empty state title */
  emptyTitle?: string;
  /** Custom empty state description */
  emptyDescription?: string;
  /** Custom empty state action */
  emptyAction?: ReactNode;
  /** Custom error message */
  errorMessage?: string;
  /** Retry callback for error states */
  onRetry?: () => void;
  className?: string;
}

const STATE_ICONS: Partial<Record<ProductState, typeof Inbox>> = {
  empty: Inbox,
  error: AlertTriangle,
  blocked: ShieldOff,
  "permission-required": Lock,
  offline: WifiOff,
  maintenance: Wrench,
};

export function StateRenderer({
  state,
  children,
  inline = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorMessage,
  onRetry,
  className,
}: StateRendererProps) {
  if (state === "ready") return <>{children}</>;

  const visual = STATE_VISUAL_MAP[state];

  // Loading states
  if (state === "loading") {
    return inline ? <SectionSkeleton /> : <PageSkeleton />;
  }

  // Recovery / degraded — show children with banner
  if (state === "degraded" || state === "recovering" || state === "stale-data" || state === "attention-required") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
          visual.colorToken === "warning" && "border-destructive/20 bg-destructive/5 text-destructive",
          visual.colorToken === "info" && "border-primary/20 bg-primary/5 text-primary",
          visual.colorToken === "accent" && "border-primary/20 bg-primary/5 text-primary",
        )}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage ?? `${state.replace(/-/g, " ")} — some features may be limited.`}</span>
        </div>
        {children}
      </div>
    );
  }

  // All other non-ready states: empty, error, blocked, permission-required, offline, etc.
  const Icon = STATE_ICONS[state] ?? Inbox;
  return (
    <EmptyState
      variant="default"
      icon={Icon}
      title={emptyTitle ?? visual.state.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
      description={emptyDescription ?? `This surface is currently in "${state}" state.`}
      action={emptyAction}
      className={className}
    />
  );
}