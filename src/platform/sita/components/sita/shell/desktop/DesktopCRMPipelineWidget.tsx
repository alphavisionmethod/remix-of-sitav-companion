import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Users } from "lucide-react";
import { useCRMPipelineData } from "@/platform/sita/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

const STAGE_COLOR: Record<string, string> = {
  proposal: "bg-amber-500/20 text-amber-300",
  negotiation: "bg-sky-500/20 text-sky-300",
  discovery: "bg-violet-500/20 text-violet-300",
  closed_won: "bg-emerald-500/20 text-emerald-300",
};

export function DesktopCRMPipelineWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useCRMPipelineData();

  return (
    <DesktopWidgetCard title="CRM Pipeline" onClick={() => onLaunchApp?.("business")}>
      <div data-testid="widget-crm-pipeline">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <Users className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No deals yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add a deal to see your pipeline</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-2xl font-bold text-white/90">{data.totalLabel}</p>
              <p className="text-[11px] text-white/40">{data.openCount} open opportunities</p>
            </div>
            <div className="space-y-2">
              {data.deals.map((d) => {
                const stageKey = (d.stage || "discovery").toLowerCase();
                const color = STAGE_COLOR[stageKey] ?? "bg-white/10 text-white/60";
                return (
                  <div key={d.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-white/70 truncate">{d.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>{d.stage}</span>
                    </div>
                    <span className="text-[11px] text-white/50 shrink-0">{d.valueLabel}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DesktopWidgetCard>
  );
}
