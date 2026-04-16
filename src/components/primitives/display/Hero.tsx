import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Hero — canonical top-of-surface identity primitive.
 * Class: PRIMITIVE.
 */
export interface HeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function Hero({ title, subtitle, eyebrow, actions, className }: HeroProps) {
  return (
    <header className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-xl sm:text-[1.75rem] font-bold tracking-[-0.025em] text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl tracking-[-0.01em]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </header>
  );
}
