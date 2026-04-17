import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useBusinessPulseData } from "@/hooks/useDesktopWidgetsData";

export function DesktopNotificationsWidget() {
  const { data, isLoading, isEmpty } = useBusinessPulseData();

  return (
    <DesktopWidgetCard title="Business Pulse">
      <div className="space-y-0 divide-y divide-white/[0.04]" data-testid="widget-business-pulse">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <Activity className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No business signals yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add deals or holdings to start the pulse</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/80">{item.symbol}</div>
                <div className="text-[10px] text-white/30 truncate">{item.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-end gap-[2px] h-4">
                  {[3, 5, 4, 7, 6, 8, 7].map((h, i) => (
                    <div
                      key={i}
                      className={cn("w-[3px] rounded-full", item.up ? "bg-emerald-400/30" : "bg-red-400/30")}
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white/85">{item.value}</div>
                  <div className={cn("text-[10px] font-medium", item.up ? "text-emerald-400/70" : "text-red-400/70")}>
                    {item.change}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DesktopWidgetCard>
  );
}
