import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { UserCheck, UserX, DollarSign } from "lucide-react";
import { useLeadsRecoveredData } from "@/platform/sita/hooks/useDesktopWidgetsData";

const ICONS: Record<string, any> = {
  recovered: UserCheck,
  lost: UserX,
  carts: UserCheck,
  revenue: DollarSign,
};

const COLORS: Record<string, string> = {
  recovered: "text-emerald-400",
  lost: "text-red-400",
  carts: "text-amber-400",
  revenue: "text-sky-400",
};

interface Props { onLaunchApp?: (appId: string) => void; }

export function DesktopLeadsRecoveredWidget({ onLaunchApp }: Props) {
  const { data, isLoading, isEmpty } = useLeadsRecoveredData();

  return (
    <DesktopWidgetCard title="Leads" onClick={() => onLaunchApp?.("business")}>
      <div className="space-y-3" data-testid="widget-leads-recovered">
        {isLoading ? (
          <p className="text-xs text-white/40 py-4 text-center">Loading…</p>
        ) : isEmpty ? (
          <div className="text-center py-4">
            <UserCheck className="mx-auto h-5 w-5 text-white/30" />
            <p className="mt-2 text-xs text-white/55">No leads tracked yet</p>
            <p className="mt-1 text-[10px] text-white/30">Add leads to start measuring</p>
          </div>
        ) : (
          data.map((s) => {
            const Icon = ICONS[s.key] ?? UserCheck;
            const color = COLORS[s.key] ?? "text-white/60";
            return (
              <div key={s.key} className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${color}`} />
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">{s.label}</p>
                  <p className="text-sm font-semibold text-white/90">{s.value}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DesktopWidgetCard>
  );
}
