import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useBusinessKPIData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopBusinessKPIWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useBusinessKPIData();

  return (
    <DesktopWidgetCard title="Business KPIs" onClick={() => onLaunchApp?.("business")}>
      <div className="space-y-3" data-testid="widget-business-kpi">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <BarChart3 className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No business data yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add deals to see live KPIs</p>
          </div>
        ) : (
          data.map((k) => (
            <div key={k.label} className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/35">{k.label}</p>
                <p className="text-sm font-semibold text-white/90">{k.value}</p>
              </div>
              <div className="flex items-center gap-1">
                {k.up ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                <span className={`text-[10px] ${k.up ? "text-emerald-400" : "text-red-400"}`}>{k.change}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </DesktopWidgetCard>
  );
}
