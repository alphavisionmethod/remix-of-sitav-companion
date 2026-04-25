// ═══════════════════════════════════════════════════════════════
// SITA OS — NeedsTimeWindowExplainer
// Convenience wrapper around the canonical PremiumEmptyState
// for boards whose data is still accumulating across a rolling window.
//
// NOT a new empty-state primitive. Pure composition.
// ═══════════════════════════════════════════════════════════════
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import type { LucideIcon } from "lucide-react";

export interface NeedsTimeWindowExplainerProps {
  title: string;
  description: string;
  /** e.g. "2 of 7 days collected" — shown literally inside description if not provided in copy. */
  windowProgress?: string;
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

export function NeedsTimeWindowExplainer({
  title,
  description,
  windowProgress,
  icon,
  actions,
  tip,
  className,
}: NeedsTimeWindowExplainerProps) {
  const composedDescription = windowProgress
    ? `${description} (${windowProgress})`
    : description;
  return (
    <PremiumEmptyState
      variant="demo-preview"
      icon={icon}
      title={title}
      description={composedDescription}
      actions={actions}
      tip={tip}
      className={className}
    />
  );
}

export default NeedsTimeWindowExplainer;
