import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { Headphones, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface SupportPressureCardProps {
  openIssues: number;
  criticalCount: number;
  avgResponseTime: string;
  responseTimeTrend: "up" | "down" | "flat";
  waitingOnUs: number;
  waitingOnCustomer: number;
  customerImpactScore: number;
}

export function SupportPressureCard({
  openIssues, criticalCount, avgResponseTime, responseTimeTrend,
  waitingOnUs, waitingOnCustomer, customerImpactScore
}: SupportPressureCardProps) {
  const pressureLevel = criticalCount >= 3 ? "high" : criticalCount >= 1 ? "medium" : "low";

  return (
    <SitaCard
      hover={false}
      lane={pressureLevel === "high" ? "action" : pressureLevel === "medium" ? "unresolved" : undefined}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          <SitaCardTitle>Support Pressure</SitaCardTitle>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          pressureLevel === "high" ? "text-destructive bg-destructive/10" :
          pressureLevel === "medium" ? "text-amber-500 bg-amber-500/10" :
          "text-chart-2 bg-chart-2/10"
        }`}>
          {pressureLevel === "high" ? "High Pressure" : pressureLevel === "medium" ? "Moderate" : "Low"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Open Issues</p>
          <p className="font-display text-lg font-semibold text-foreground">{openIssues}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Critical</p>
          <p className={`font-display text-lg font-semibold ${criticalCount > 0 ? "text-destructive" : "text-foreground"}`}>{criticalCount}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Avg Response</p>
          <div className="flex items-center gap-1">
            <p className="font-display text-sm font-semibold text-foreground">{avgResponseTime}</p>
            {responseTimeTrend === "up" ? <TrendingUp className="h-3 w-3 text-destructive" /> : <TrendingDown className="h-3 w-3 text-chart-2" />}
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Waiting on Us</p>
          <p className={`font-display text-sm font-semibold ${waitingOnUs > 3 ? "text-amber-500" : "text-foreground"}`}>{waitingOnUs}</p>
        </div>
      </div>

      <ConfidenceBar value={100 - customerImpactScore} label="Customer Satisfaction" size="sm" />
    </SitaCard>
  );
}
