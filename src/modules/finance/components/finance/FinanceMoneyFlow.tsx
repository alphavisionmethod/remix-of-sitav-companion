import { useState, useMemo } from "react";

const CURRENT_WEEK = [3200, 2800, 4100, 3600, 5200, 4800, 5600];
const PREVIOUS_WEEK = [2400, 3100, 2900, 3400, 3800, 4200, 4000];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function FinanceMoneyFlow() {
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const data = period === "current" ? CURRENT_WEEK : PREVIOUS_WEEK;
  const prevData = period === "current" ? PREVIOUS_WEEK : CURRENT_WEEK;

  const maxVal = useMemo(() => Math.max(...data, ...prevData) * 1.1, [data, prevData]);

  return (
    <div className="rounded-2xl p-5 card-vibrant card-vibrant-green">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Savings</p>
          <p className="text-2xl font-bold text-foreground">
            ${data.reduce((a, b) => a + b, 0).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1">
          {(["current", "previous"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                period === p
                  ? "bg-trust-safe/20 text-trust-safe"
                  : "text-muted-foreground hover:text-secondary-foreground"
              }`}
            >
              {p === "current" ? "This Week" : "Last Week"}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart — dual color like reference */}
      <div className="flex items-end gap-2 h-[140px] mt-2">
        {data.map((val, i) => {
          const diff = val - prevData[i];
          const isPositive = diff >= 0;
          const barH = (val / maxVal) * 100;
          const prevH = (prevData[i] / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-[110px]">
                {/* Previous bar */}
                <div
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${prevH}%`,
                    background: 'linear-gradient(180deg, hsl(350 70% 55%), hsl(340 60% 42%))',
                    boxShadow: '0 0 6px hsl(350 70% 55% / 0.25)',
                    opacity: 0.7,
                  }}
                />
                {/* Current bar */}
                <div
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${barH}%`,
                    background: isPositive
                      ? 'linear-gradient(180deg, hsl(170 70% 55%), hsl(152 65% 42%))'
                      : 'linear-gradient(180deg, hsl(350 70% 55%), hsl(340 60% 42%))',
                    boxShadow: isPositive
                      ? '0 0 8px hsl(165 70% 50% / 0.35)'
                      : '0 0 8px hsl(350 70% 55% / 0.35)',
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{DAYS[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(180deg, hsl(170 70% 55%), hsl(152 65% 42%))' }} />
          <span className="text-[10px] text-muted-foreground">This week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm opacity-70" style={{ background: 'linear-gradient(180deg, hsl(350 70% 55%), hsl(340 60% 42%))' }} />
          <span className="text-[10px] text-muted-foreground">Last week</span>
        </div>
      </div>
    </div>
  );
}
