import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Panel — mid-sized grouped section primitive.
 * Use for interactive grouped UI (settings groups, filter panels, etc.).
 * Class: PRIMITIVE.
 */
export interface PanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, description, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
          <div className="min-w-0">
            {title && <h3 className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
