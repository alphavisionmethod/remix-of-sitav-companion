import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { cn } from "@/lib/utils";

interface StockItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  up: boolean;
}

const STOCKS: StockItem[] = [
  { symbol: "REVENUE", name: "Monthly Revenue", value: "$48.2K", change: "+12.3%", up: true },
  { symbol: "PIPELINE", name: "Active Pipeline", value: "$127K", change: "+8.7%", up: true },
  { symbol: "NET", name: "Net Worth", value: "$2.4M", change: "+0.89%", up: true },
];

export function DesktopNotificationsWidget() {
  return (
    <DesktopWidgetCard title="Business Pulse">
      <div className="space-y-0 divide-y divide-white/[0.04]">
        {STOCKS.map((item) => (
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
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
