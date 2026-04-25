import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { RotateCcw } from "lucide-react";

export interface ContinuityItem {
  id: string;
  title: string;
  context: string;
  daysSince: number;
}

export function ConciergeContinuityCard({ items }: { items: ContinuityItem[] }) {
  if (items.length === 0) return null;

  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <RotateCcw className="h-4 w-4 text-amber-500" />
        <p className="text-xs font-semibold text-foreground">Continuity</p>
        <span className="text-[10px] text-muted-foreground">picked up from yesterday</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{item.title}</p>
              <p className="text-[9px] text-muted-foreground">{item.context}</p>
            </div>
            <span className="text-[9px] text-amber-600 shrink-0">{item.daysSince}d</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
