import { useState, useMemo } from "react";

const CURRENT_WEEK = [3200, 2800, 4100, 3600, 5200, 4800, 5600];
const PREVIOUS_WEEK = [2400, 3100, 2900, 3400, 3800, 4200, 4000];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function FinanceMoneyFlow() {
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const data = period === "current" ? CURRENT_WEEK : PREVIOUS_WEEK;

  const { path, areaPath, dots } = useMemo(() => {
    const W = 460, H = 160, padX = 30, padY = 20;
    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.05;
    const range = max - min || 1;
    const step = (W - padX * 2) / (data.length - 1);

    const pts = data.map((v, i) => ({
      x: padX + i * step,
      y: padY + (1 - (v - min) / range) * (H - padY * 2),
      value: v,
    }));

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

    return { path: line, areaPath: area, dots: pts };
  }, [data]);

  return (
    <div className="rounded-2xl p-5 bg-[#12121e] border border-[#1a1a2e]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider">Savings</p>
          <p className="text-2xl font-bold text-white/90">
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
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {p === "current" ? "This Week" : "Last Week"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg viewBox="0 0 460 160" className="w-full" fill="none">
        <defs>
          <linearGradient id="fin-flow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#fin-flow-grad)" />
        <path
          d={path}
          stroke="rgb(16,185,129)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }}
        />
        {dots.map((dot, i) => (
          <g key={i}>
            <circle cx={dot.x} cy={dot.y} r={4} fill="#12121e" stroke="rgb(16,185,129)" strokeWidth={2} />
            <text x={dot.x} y={155} textAnchor="middle" className="text-[10px]" fill="rgba(255,255,255,0.3)">
              {DAYS[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
