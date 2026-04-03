import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  value: number; // 0-100
  label?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const getSemanticColor = (v: number) => {
  if (v >= 80) return "bg-[hsl(var(--trust-safe))]";
  if (v >= 60) return "bg-[hsl(var(--sita-gold))]";
  if (v >= 40) return "bg-[hsl(var(--trust-review))]";
  return "bg-[hsl(var(--destructive))]";
};

const getSemanticLabel = (v: number) => {
  if (v >= 90) return "Very High";
  if (v >= 70) return "High";
  if (v >= 50) return "Moderate";
  if (v >= 30) return "Low";
  return "Very Low";
};

export const ConfidenceBar = ({ value, label, size = "md", showValue = true, className }: ConfidenceBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-[11px] font-medium text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-[11px] font-semibold text-foreground tabular-nums">
              {clamped}% <span className="text-muted-foreground font-normal">— {getSemanticLabel(clamped)}</span>
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-secondary/60 overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", getSemanticColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
