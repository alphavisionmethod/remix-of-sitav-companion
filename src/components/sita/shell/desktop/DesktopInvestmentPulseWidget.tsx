import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp, TrendingDown } from "lucide-react";

const HOLDINGS = [
  { name: "AAPL", value: "$12,450", change: "+2.3%", up: true },
  { name: "MSFT", value: "$8,220", change: "+1.1%", up: true },
  { name: "TSLA", value: "$5,100", change: "-0.8%", up: false },
];

export function DesktopInvestmentPulseWidget() {
  return (
    <DesktopWidgetCard title="Investment Pulse">
      <div className="mb-3">
        <p className="text-2xl font-bold text-white/90">$142,800</p>
        <div className="flex items-center gap-1 mt-0.5">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span className="text-[11px] text-emerald-400">+1.8% today</span>
        </div>
      </div>
      <div className="space-y-2">
        {HOLDINGS.map(h => (
          <div key={h.name} className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/60">{h.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/50">{h.value}</span>
              <span className={`text-[10px] ${h.up ? "text-emerald-400" : "text-red-400"}`}>{h.change}</span>
            </div>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
