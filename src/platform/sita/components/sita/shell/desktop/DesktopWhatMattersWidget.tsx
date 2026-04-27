import { BriefcaseBusiness, Wallet, HeartHandshake, Inbox } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { useWhatMattersData } from "@/platform/sita/hooks/useDesktopWidgetsData";

const ICONS: Record<string, any> = {
  business: BriefcaseBusiness,
  finance: Wallet,
  concierge: HeartHandshake,
};

interface Props {
  onLaunchApp?: (appId: string) => void;
}

export function DesktopWhatMattersWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useWhatMattersData();

  return (
    <DesktopWidgetCard title="What matters now">
      <div className="space-y-4" data-testid="widget-what-matters">
        {isLoading ? (
          <div className="text-xs text-white/40 py-6 text-center">Loading…</div>
        ) : isEmpty ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-4 text-center">
            <Inbox className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">All quiet across your domains.</p>
            <p className="mt-1 text-[10px] text-white/30">No approvals, alerts, or open tasks.</p>
          </div>
        ) : (
          data.map((d) => {
            const Icon = ICONS[d.id] ?? BriefcaseBusiness;
            return (
              <div
                key={d.id}
                onClick={() => onLaunchApp?.(d.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-2xl border border-white/10 bg-black/15 p-4 cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Icon className={`h-4 w-4 ${d.color}`} />
                    {d.label}
                  </div>
                  {d.count > 0 && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/80 tabular-nums">
                      {d.count}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-white/65">{d.summary}</p>
              </div>
            );
          })
        )}
      </div>
    </DesktopWidgetCard>
  );
}
