import { BriefcaseBusiness, Wallet, HeartHandshake } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";

const domains = [
  {
    id: "business",
    label: "Business",
    icon: BriefcaseBusiness,
    color: "text-violet-300",
    summary: "3 follow-ups prepared, 1 account needs decision, support pressure elevated.",
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    color: "text-emerald-300",
    summary: "One payment requires approval. Reserve confidence remains stable.",
  },
  {
    id: "concierge",
    label: "Concierge",
    icon: HeartHandshake,
    color: "text-amber-200",
    summary: "Travel prep updated and one recurring household obligation grouped for Friday.",
  },
];

export function DesktopWhatMattersWidget() {
  return (
    <DesktopWidgetCard title="What matters now" accent="from-emerald-500/15 via-white/[0.05] to-teal-400/10" delay={0.25}>
      <div className="space-y-4">
        {domains.map((d) => (
          <div key={d.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <d.icon className={`h-4 w-4 ${d.color}`} />
              {d.label}
            </div>
            <p className="mt-2 text-sm text-white/65">{d.summary}</p>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
