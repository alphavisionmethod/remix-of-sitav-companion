// ═══════════════════════════════════════════════════════════════
// SITA OS — NeedsDataExplainer
// Convenience wrapper around the canonical PremiumEmptyState
// for the highest-frequency admin "no signals fired in window" state.
//
// NOT a new empty-state primitive. Pure composition.
// ═══════════════════════════════════════════════════════════════
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NeedsDataExplainerProps {
  /** Operator-grade title (specific, not generic). */
  title: string;
  /** Why-empty + what-populates-it copy. */
  description: string;
  /** Optional Lucide icon override. Defaults to PremiumEmptyState's `no-data` default. */
  icon?: LucideIcon;
  /** Operator next-step actions. */
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    variant?: "primary" | "secondary";
  }>;
  /** Optional one-line operator tip. */
  tip?: string;
  /** Optional className passthrough. */
  className?: string;
  /** Children (e.g. wrapping <Link> for navigation actions). */
  children?: ReactNode;
}

export function NeedsDataExplainer({
  title,
  description,
  icon,
  actions,
  tip,
  className,
}: NeedsDataExplainerProps) {
  return (
    <PremiumEmptyState
      variant="no-data"
      icon={icon}
      title={title}
      description={description}
      actions={actions}
      tip={tip}
      className={className}
    />
  );
}

export default NeedsDataExplainer;
