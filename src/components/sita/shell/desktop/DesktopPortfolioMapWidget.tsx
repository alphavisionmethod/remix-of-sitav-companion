import { DesktopWidgetCard } from "./DesktopWidgetCard";

const SECTORS = [
  { name: "Tech", pct: 42, color: "bg-sky-400" },
  { name: "Healthcare", pct: 24, color: "bg-emerald-400" },
  { name: "Finance", pct: 18, color: "bg-violet-400" },
  { name: "Other", pct: 16, color: "bg-white/20" },
];

export function DesktopPortfolioMapWidget() {
  return (
    <DesktopWidgetCard title="Portfolio Map">
      {/* Mini bar chart */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {SECTORS.map(s => (
          <div key={s.name} className={`${s.color}`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="space-y-1.5">
        {SECTORS.map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-[11px] text-white/60">{s.name}</span>
            </div>
            <span className="text-[11px] text-white/40 tabular-nums">{s.pct}%</span>
          </div>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
