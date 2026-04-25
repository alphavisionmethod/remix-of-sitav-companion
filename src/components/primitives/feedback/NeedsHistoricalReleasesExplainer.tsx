// ═══════════════════════════════════════════════════════════════
// SITA OS — NeedsHistoricalReleasesExplainer
// Convenience wrapper around the canonical PremiumEmptyState
// for first-release / historical-comparison boards.
//
// NOT a new empty-state primitive. Pure composition.
// ═══════════════════════════════════════════════════════════════
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import type { LucideIcon } from "lucide-react";

export interface NeedsHistoricalReleasesExplainerProps {
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
}

export function NeedsHistoricalReleasesExplainer({
  title,
  description,
  icon,
  actions,
  tip,
  className,
}: NeedsHistoricalReleasesExplainerProps) {
  return (
    <PremiumEmptyState
      variant="first-use"
      icon={icon}
      title={title}
      description={description}
      actions={actions}
      tip={tip}
      className={className}
    />
  );
}

export default NeedsHistoricalReleasesExplainer;
