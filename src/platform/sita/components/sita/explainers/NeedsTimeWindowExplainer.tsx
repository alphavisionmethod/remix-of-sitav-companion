// ═══════════════════════════════════════════════════════════════
// SITA OS — NeedsTimeWindowExplainer (Wave 1.1 canonical home)
// ═══════════════════════════════════════════════════════════════
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import type { LucideIcon } from "lucide-react";

export interface NeedsTimeWindowExplainerProps {
  title: string;
  description: string;
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
