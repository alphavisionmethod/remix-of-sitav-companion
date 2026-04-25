// Re-export for backward compatibility
// Use EmptyState with variant="card" directly in new code
export { EmptyState as EmptyStateCard } from "./EmptyState";
export type { EmptyStateProps as EmptyStateCardProps } from "./EmptyState";

// Adapter: maps old EmptyStateCard props to unified EmptyState
import { type LucideIcon } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface LegacyEmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaPath?: string;
  onAction?: () => void;
}

export const LegacyEmptyStateCard = ({ icon, title, description, ctaLabel, ctaPath, onAction }: LegacyEmptyStateCardProps) => (
  <EmptyState
    variant="card"
    icon={icon}
    title={title}
    description={description}
    actionLabel={ctaLabel}
    ctaPath={ctaPath}
    onAction={onAction}
  />
);
