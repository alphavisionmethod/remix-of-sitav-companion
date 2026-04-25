import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp, TrendingDown, LineChart } from "lucide-react";
import { useInvestmentPulseData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopInvestmentPulseWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useInvestmentPulseData();

  return (
    <DesktopWidgetCard title="Investment Pulse" onClick={() => onLaunchApp?.("investment")}>
      <div data-testid="widget-investment-pulse">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <LineChart className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No holdings yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add holdings to track performance</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-2xl font-bold text-white/90">{data.totalLabel}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {data.up ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                <span className={`text-[11px] ${data.up ? "text-emerald-400" : "text-red-400"}`}>{data.changeLabel}</span>
              </div>
            </div>
            <div className="space-y-2">
              {data.holdings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/60">{h.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/50">{h.valueLabel}</span>
                    <span className={`text-[10px] ${h.up ? "text-emerald-400" : "text-red-400"}`}>{h.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DesktopWidgetCard>
  );
}
