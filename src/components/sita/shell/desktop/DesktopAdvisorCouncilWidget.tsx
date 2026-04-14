import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";

const ADVISORS = [
  { domain: "business" as const, name: "Strategy", confidence: 92 },
  { domain: "money" as const, name: "Finance", confidence: 87 },
  { domain: "concierge" as const, name: "Concierge", confidence: 95 },
  { domain: "growth" as const, name: "Growth", confidence: 78 },
];

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopAdvisorCouncilWidget({ onLaunchApp }: Props) {
  return (
    <DesktopWidgetCard title="Advisor Council" onClick={() => onLaunchApp?.("boardroom")}>
      <div className="space-y-2.5">
        {ADVISORS.map(a => (
          <div key={a.domain} className="flex items-center justify-between">
            <AdvisorAvatar domain={a.domain} name={a.name} size="sm" showLabel />
            <span className="text-[10px] text-white/40 tabular-nums">{a.confidence}%</span>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
