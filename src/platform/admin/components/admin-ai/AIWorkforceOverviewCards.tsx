import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  alert?: boolean;
  className?: string;
}

export function AIWorkforceOverviewCard({ title, value, subtitle, icon, trend, trendValue, alert, className }: OverviewCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", alert && "border-destructive/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trendValue && (
              <span className={cn("text-xs font-medium", trend === "up" ? "text-emerald-500" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
