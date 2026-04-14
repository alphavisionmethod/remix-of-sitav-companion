import { DesktopWidgetCard } from "./DesktopWidgetCard";

const DEALS = [
  { name: "Acme Corp", value: "$45K", stage: "Proposal", color: "bg-amber-500/20 text-amber-300" },
  { name: "Globex Inc", value: "$28K", stage: "Negotiation", color: "bg-sky-500/20 text-sky-300" },
  { name: "Initech LLC", value: "$18K", stage: "Discovery", color: "bg-violet-500/20 text-violet-300" },
];

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopCRMPipelineWidget({ onLaunchApp }: Props) {
  return (
    <DesktopWidgetCard title="CRM Pipeline" onClick={() => onLaunchApp?.("business")}>
      <div className="mb-3">
        <p className="text-2xl font-bold text-white/90">$312K</p>
        <p className="text-[11px] text-white/40">14 open opportunities</p>
      </div>
      <div className="space-y-2">
        {DEALS.map(d => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/70">{d.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${d.color}`}>{d.stage}</span>
            </div>
            <span className="text-[11px] text-white/50">{d.value}</span>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
