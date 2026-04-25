// ═══════════════════════════════════════════════════════════════
// SITA OS — NeedsDataExplainer (Wave 1.1 canonical home)
// Convenience wrapper around the canonical PremiumEmptyState
// for the highest-frequency admin "no signals fired in window" state.
//
// NOT a new empty-state primitive. Pure composition.
//
// Previously at src/components/primitives/feedback/NeedsDataExplainer.tsx.
// That path now contains a deprecated re-export shim.
// ═══════════════════════════════════════════════════════════════
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NeedsDataExplainerProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    variant?: "primary" | "secondary";
  }>;
  tip?: string;
  className?: string;
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