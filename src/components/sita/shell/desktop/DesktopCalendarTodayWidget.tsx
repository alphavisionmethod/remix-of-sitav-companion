import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { CalendarDays } from "lucide-react";
import { useCalendarTodayData } from "@/hooks/useDesktopWidgetsData";

const DOMAIN_COLOR: Record<string, string> = {
  business: "bg-violet-500",
  finance: "bg-emerald-500",
  concierge: "bg-amber-500",
  personal: "bg-sky-500",
};

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopCalendarTodayWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useCalendarTodayData();

  return (
    <DesktopWidgetCard title="Today's Schedule" onClick={() => onLaunchApp?.("calendar")}>
      <div className="space-y-2.5" data-testid="widget-calendar-today">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <CalendarDays className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No events today</p>
            <p className="mt-1 text-[10px] text-white/30">A clear calendar awaits</p>
          </div>
        ) : (
          data.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOMAIN_COLOR[e.domain] ?? "bg-white/40"}`} />
              <span className="text-[10px] text-white/35 w-16 shrink-0 tabular-nums">{e.time}</span>
              <span className="text-[11px] text-white/75 truncate">{e.title}</span>
            </div>
          ))
        )}
      </div>
    </DesktopWidgetCard>
  );
}
