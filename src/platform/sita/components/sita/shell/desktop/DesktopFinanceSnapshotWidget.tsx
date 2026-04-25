import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useFinanceSnapshotData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

function fmt(cents: number): string {
  if (cents >= 1_000_000_00) return `$${(cents / 100_000_000).toFixed(1)}M`;
  if (cents >= 1_000_00) return `$${(cents / 100_000).toFixed(1)}K`;
  return `$${(cents / 100).toFixed(0)}`;
}

export function DesktopFinanceSnapshotWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useFinanceSnapshotData();
  const up = data.monthDeltaPct >= 0;

  return (
    <DesktopWidgetCard title="Finance Snapshot" onClick={() => onLaunchApp?.("finance")}>
      <div className="space-y-3" data-testid="widget-finance-snapshot">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <Wallet className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No portfolio yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add holdings to see your snapshot</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[10px] text-white/35">Total Portfolio</p>
              <p className="text-xl font-bold text-white/90">{fmt(data.totalCents)}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {up ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                <span className={`text-[10px] ${up ? "text-emerald-400" : "text-red-400"}`}>
                  {up ? "+" : ""}{data.monthDeltaPct.toFixed(2)}% all-time
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <p className="text-[9px] text-white/35">Files</p>
                <p className="text-sm font-semibold text-emerald-400">{data.fileCount}</p>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-2.5">
                <p className="text-[9px] text-white/35">Value</p>
                <p className="text-sm font-semibold text-violet-400">{fmt(data.totalCents)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </DesktopWidgetCard>
  );
}
