import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { CheckSquare } from "lucide-react";
import { useConciergeTasksData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

const PRIO_COLOR: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-white/30",
};

export function DesktopConciergeTasksWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useConciergeTasksData();

  return (
    <DesktopWidgetCard title="Concierge Tasks" onClick={() => onLaunchApp?.("concierge")}>
      <div className="space-y-2.5" data-testid="widget-concierge-tasks">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <CheckSquare className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No tasks yet</p>
            <p className="mt-1 text-[10px] text-white/30">All caught up!</p>
          </div>
        ) : (
          data.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5">
              <div className={`h-2 w-2 rounded-full shrink-0 ${PRIO_COLOR[t.priority] ?? "bg-white/30"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80 truncate">{t.title}</p>
                <p className="text-[10px] text-white/30">{t.dueLabel}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </DesktopWidgetCard>
  );
}
