import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { UserCheck, ShoppingCart, DollarSign } from "lucide-react";

const STATS = [
  { icon: UserCheck, label: "Leads Recovered", value: "47", color: "text-emerald-400" },
  { icon: ShoppingCart, label: "Carts Recovered", value: "23", color: "text-amber-400" },
  { icon: DollarSign, label: "Revenue Saved", value: "$18.4K", color: "text-sky-400" },
];

export function DesktopLeadsRecoveredWidget() {
  return (
    <DesktopWidgetCard title="Leads Recovered">
      <div className="space-y-3">
        {STATS.map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <div className="flex-1">
              <p className="text-[10px] text-white/40">{s.label}</p>
              <p className="text-sm font-semibold text-white/90">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
