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
    <DesktopWidgetCard title="Business Pulse" accent="from-emerald-500/15 via-white/[0.05] to-violet-500/10">
      <div className="space-y-0 divide-y divide-white/[0.06]">
        {STOCKS.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{item.symbol}</div>
              <div className="text-[10px] text-white/40 truncate">{item.name}</div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini sparkline placeholder */}
              <div className="hidden sm:flex items-end gap-[2px] h-4">
                {[3, 5, 4, 7, 6, 8, 7].map((h, i) => (
                  <div
                    key={i}
                    className={cn("w-[3px] rounded-full", item.up ? "bg-emerald-400/60" : "bg-red-400/60")}
                    style={{ height: `${h * 2}px` }}
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{item.value}</div>
                <div className={cn("text-[10px] font-medium", item.up ? "text-emerald-400" : "text-red-400")}>
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

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
