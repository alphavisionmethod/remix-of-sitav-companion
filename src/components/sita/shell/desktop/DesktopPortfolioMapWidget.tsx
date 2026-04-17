import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { PieChart } from "lucide-react";
import { usePortfolioMapData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopPortfolioMapWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = usePortfolioMapData();

  return (
    <DesktopWidgetCard title="Portfolio Map" onClick={() => onLaunchApp?.("investment")}>
      <div data-testid="widget-portfolio-map">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <PieChart className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No portfolio data yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add holdings with sectors to map</p>
          </div>
        ) : (
          <>
            <div className="flex h-3 rounded-full overflow-hidden mb-3">
              {data.map((s) => (
                <div key={s.name} className={s.color} style={{ width: `${s.pct}%` }} />
              ))}
            </div>
            <div className="space-y-1.5">
              {data.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-[11px] text-white/60">{s.name}</span>
                  </div>
                  <span className="text-[11px] text-white/40 tabular-nums">{s.pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DesktopWidgetCard>
  );
}
