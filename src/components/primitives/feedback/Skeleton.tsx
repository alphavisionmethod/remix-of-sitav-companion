import { cn } from "@/lib/utils";

/**
 * Skeleton — canonical loading placeholder primitive.
 * Class: PRIMITIVE.
 */
export interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

const ROUNDED: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm:   "rounded-sm",
  md:   "rounded-md",
  lg:   "rounded-lg",
  xl:   "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-muted/40",
        ROUNDED[rounded],
        className
      )}
    />
  );
}
