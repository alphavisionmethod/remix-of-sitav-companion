import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp, TrendingDown } from "lucide-react";

const KPIS = [
  { label: "Revenue", value: "$84.2K", change: "+12%", up: true },
  { label: "Pipeline", value: "$312K", change: "+8%", up: true },
  { label: "Conversion", value: "3.2%", change: "-0.4%", up: false },
];

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopBusinessKPIWidget({ onLaunchApp }: Props) {
  return (
    <DesktopWidgetCard title="Business KPIs" onClick={() => onLaunchApp?.("business")}>
      <div className="space-y-3">
        {KPIS.map(k => (
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
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
