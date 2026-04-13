import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Brain, AlertTriangle } from "lucide-react";

export function DesktopBoardroomBriefWidget() {
  return (
    <DesktopWidgetCard title="Boardroom Brief">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-violet-400" />
        <div>
          <p className="text-xs font-semibold text-white/90">Next session: Tomorrow 10 AM</p>
          <p className="text-[10px] text-white/35">Quarterly strategy review</p>
        </div>
      </div>
      <div className="space-y-2 border-t border-white/[0.06] pt-2.5">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/60">3 pending decisions from last session</p>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3 w-3 text-amber-400/50 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/60">2 carryover items need resolution</p>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
