import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * EmptyState — canonical zero-data placeholder primitive.
 * Class: PRIMITIVE.
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-dashed border-border/50 bg-card/30",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
