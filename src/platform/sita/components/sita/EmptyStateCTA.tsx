// Re-export for backward compatibility
// Use EmptyState with variant="cta" directly in new code
import { type LucideIcon } from "lucide-react";
import { EmptyState, type EmptyStateAction } from "./EmptyState";

interface EmptyStateCTAProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: Array<{
    label: string;
    onClick?: () => void;
    to?: string;
    variant?: "primary" | "secondary";
    icon?: LucideIcon;
  }>;
  tip?: string;
  mode?: "demo" | "live";
}

export const EmptyStateCTA = ({ icon, title, description, actions, tip, mode }: EmptyStateCTAProps) => (
  <EmptyState
    variant="cta"
    icon={icon}
    title={title}
    description={description}
    actions={actions as EmptyStateAction[]}
    tip={tip}
    mode={mode}
  />
);
