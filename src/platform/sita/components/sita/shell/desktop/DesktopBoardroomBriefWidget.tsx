import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Brain, AlertTriangle } from "lucide-react";
import { useBoardroomBriefData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopBoardroomBriefWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useBoardroomBriefData();

  return (
    <DesktopWidgetCard title="Boardroom Brief" onClick={() => onLaunchApp?.("boardroom")}>
      <div data-testid="widget-boardroom-brief">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-violet-400" />
          <div>
            <p className="text-xs font-semibold text-white/90">{isLoading ? "Loading…" : data.nextSessionLabel}</p>
            <p className="text-[10px] text-white/35 truncate">{data.topic}</p>
          </div>
        </div>
        <div className="space-y-2 border-t border-white/[0.06] pt-2.5">
          {isEmpty ? (
            <p className="text-[11px] text-white/40 text-center py-2">No active boardroom items.</p>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/60">
                  {data.pendingDecisions} pending decision{data.pendingDecisions === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-400/50 mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/60">
                  {data.carryoverItems} carryover item{data.carryoverItems === 1 ? "" : "s"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
