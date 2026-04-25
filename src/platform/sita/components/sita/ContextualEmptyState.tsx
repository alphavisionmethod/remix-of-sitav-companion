// Re-export for backward compatibility
// Use EmptyState with variant="contextual" directly in new code
import type { ContextualEmptyStateConfig } from "@/lib/ux-trust/contextual-empty-states";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

interface ContextualEmptyStateProps {
  config: ContextualEmptyStateConfig;
  className?: string;
}

export function ContextualEmptyState({ config, className }: ContextualEmptyStateProps) {
  return (
    <EmptyState
      variant="contextual"
      icon={config.icon}
      title={config.title}
      description={config.description}
      tip={config.tip}
      actions={config.actions.map((a) => ({ label: a.label, to: a.to }))}
      className={className}
    />
  );
}
