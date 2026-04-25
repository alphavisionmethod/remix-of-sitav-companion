import { Shield } from "lucide-react";
import { StatusBadge, type StatusSize } from "./StatusBadge";

/**
 * TrustBadge — canonical trust state indicator.
 * Composes StatusBadge with trust-specific tone mapping.
 * Class: PRIMITIVE.
 */
export type TrustState = "verified" | "pending" | "failed" | "unknown";

const TRUST_LABELS: Record<TrustState, string> = {
  verified: "Verified",
  pending:  "Pending",
  failed:   "Failed",
  unknown:  "Unknown",
};

const TRUST_TONES: Record<TrustState, "verified" | "pending" | "failed" | "muted"> = {
  verified: "verified",
  pending:  "pending",
  failed:   "failed",
  unknown:  "muted",
};

export interface TrustBadgeProps {
  state: TrustState;
  size?: StatusSize;
  showIcon?: boolean;
  label?: string;
  className?: string;
}

export function TrustBadge({ state, size = "sm", showIcon = true, label, className }: TrustBadgeProps) {
  return (
    <StatusBadge
      tone={TRUST_TONES[state]}
      size={size}
      icon={showIcon ? <Shield className="h-3 w-3" /> : undefined}
      className={className}
    >
      {label ?? TRUST_LABELS[state]}
    </StatusBadge>
  );
}
