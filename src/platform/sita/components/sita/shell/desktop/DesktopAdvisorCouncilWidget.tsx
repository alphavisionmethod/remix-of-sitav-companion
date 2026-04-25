import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { AdvisorAvatar } from "@/platform/sita/components/sita/primitives/AdvisorAvatar";
import { Sparkles } from "lucide-react";
import { useAdvisorCouncilData } from "@/hooks/useDesktopWidgetsData";

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopAdvisorCouncilWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useAdvisorCouncilData();

  return (
    <DesktopWidgetCard title="Advisor Council" onClick={() => onLaunchApp?.("boardroom")}>
      <div className="space-y-2.5" data-testid="widget-advisor-council">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <Sparkles className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No advisors yet</p>
            <p className="mt-1 text-[10px] text-white/30">Activate your advisor council</p>
          </div>
        ) : (
          data.map((a) => (
            <div key={a.advisor_id} className="flex items-center justify-between">
              <AdvisorAvatar domain={a.domain as any} name={a.display_name} size="sm" showLabel />
              <span className="text-[10px] text-white/40 tabular-nums">{a.confidence}%</span>
            </div>
          ))
        )}
      </div>
    </DesktopWidgetCard>
  );
}
