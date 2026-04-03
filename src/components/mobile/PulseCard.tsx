import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PulseCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  accent?: "green" | "amber" | "red" | "purple";
}

const accentMap = {
  green: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  amber: "bg-[hsl(var(--trust-review))]/10 text-[hsl(var(--trust-review))]",
  red: "bg-destructive/10 text-destructive",
  purple: "bg-primary/10 text-primary",
};

export const PulseCard = ({ icon: Icon, label, value, trend, accent = "purple" }: PulseCardProps) => (
  <div className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-3">
    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", accentMap[accent])}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
    {trend && (
      <span className={cn(
        "text-[10px] font-medium",
        trend === "up" ? "text-[hsl(var(--trust-safe))]" : trend === "down" ? "text-destructive" : "text-muted-foreground"
      )}>
        {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
      </span>
    )}
  </div>
);
