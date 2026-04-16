import { cn } from "@/lib/utils";
import type { ReactNode, HTMLAttributes } from "react";

/**
 * BaseCard — canonical card primitive.
 *
 * The single source of truth for bounded content containers.
 * All domain *Card components MUST compose this.
 *
 * Variants:
 *   - default   : standard surface
 *   - elevated  : higher elevation / shadow
 *   - glass     : translucent backdrop
 *   - flat      : minimal border, no shadow
 *
 * Class: PRIMITIVE — no domain logic, no service imports.
 */
export type BaseCardVariant = "default" | "elevated" | "glass" | "flat";
export type BaseCardPadding = "none" | "sm" | "md" | "lg";

export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BaseCardVariant;
  padding?: BaseCardPadding;
  interactive?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BaseCardVariant, string> = {
  default:  "bg-card border-border/50",
  elevated: "bg-card-elevated border-border/60 shadow-card",
  glass:    "bg-card/60 border-border/30 backdrop-blur-2xl",
  flat:     "bg-card/40 border-border/30",
};

const PADDING_CLASSES: Record<BaseCardPadding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-6",
};

export function BaseCard({
  variant = "default",
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: BaseCardProps) {
  return (
    <div
      role={interactive ? "button" : "article"}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "rounded-2xl border transition-all duration-200",
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        interactive && "cursor-pointer hover:border-border/80 hover:shadow-card-hover",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
