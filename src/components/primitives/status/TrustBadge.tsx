// ═══════════════════════════════════════════════════════════════
// DEPRECATED — Re-exports from canonical sita/TrustBadge.
// The primitives barrel maintains this for backward compatibility.
// New code should import from "@/components/sita/TrustBadge".
// ═══════════════════════════════════════════════════════════════

export { TrustBadge } from "@/components/sita/TrustBadge";
export type { TrustLevel as TrustState } from "@/components/sita/TrustBadge";

export interface TrustBadgeProps {
  state: import("@/components/sita/TrustBadge").TrustLevel;
  size?: "sm" | "default";
  showIcon?: boolean;
  label?: string;
  className?: string;
}
