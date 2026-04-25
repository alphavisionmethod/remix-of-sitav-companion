// ═══════════════════════════════════════════════════════════════
// SITA OS — ConnectorStateBadge (Wave 1.1 canonical home)
//
// Canonical chip for the 6-state connector lifecycle.
// Single source of truth replacing 4+ local color maps across
// OAuthRefreshHealthBoard, IntegrationsHome, CN01ConnectorRealityOverview,
// and CN05ConnectorHealthBoard.
//
// Class: PRIMITIVE.
//
// Previously at src/components/primitives/status/ConnectorStateBadge.tsx.
// That path now contains a deprecated re-export shim.
// ═══════════════════════════════════════════════════════════════
import { StatusBadge, type StatusSize } from "@/components/primitives/status/StatusBadge";
import {
  getConnectorStateMeta,
  normalizeConnectorState,
  type ConnectorState,
} from "@/lib/connectors/connector-state-grammar";
import { cn } from "@/lib/utils";

export interface ConnectorStateBadgeProps {
  /** Either a canonical ConnectorState or any DB-status string (will be normalized). */
  state: ConnectorState | string | null | undefined;
  size?: StatusSize;
  /** When true, renders as a dot-prefix chip. */
  dot?: boolean;
  /** Override label (defaults to canonical grammar label). */
  label?: string;
  className?: string;
}

export function ConnectorStateBadge({
  state,
  size = "sm",
  dot = true,
  label,
  className,
}: ConnectorStateBadgeProps) {
  const meta = getConnectorStateMeta(typeof state === "string" ? state : state ?? undefined);
  return (
    <StatusBadge
      tone={meta.tone}
      size={size}
      dot={dot}
      className={cn(className)}
    >
      {label ?? meta.label}
    </StatusBadge>
  );
}

export { normalizeConnectorState };
export type { ConnectorState };