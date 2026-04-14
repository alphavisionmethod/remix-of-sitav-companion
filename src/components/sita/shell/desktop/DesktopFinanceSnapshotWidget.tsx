import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp } from "lucide-react";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopFinanceSnapshotWidget({ onLaunchApp }: Props) {
  return (
    <DesktopWidgetCard title="Finance Snapshot" onClick={() => onLaunchApp?.("finance")}>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-white/35">Total Balance</p>
          <p className="text-xl font-bold text-white/90">$24,800</p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">+5.27% this month</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5">
            <p className="text-[9px] text-white/35">Income</p>
            <p className="text-sm font-semibold text-emerald-400">$4,800</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-2.5">
            <p className="text-[9px] text-white/35">Expenses</p>
            <p className="text-sm font-semibold text-violet-400">$1,450</p>
          </div>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
