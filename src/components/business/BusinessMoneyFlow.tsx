import { useState, useMemo } from "react";

const CURRENT_WEEK = [3200, 4100, 3800, 5200, 4800, 6100, 5400];
const PREVIOUS_WEEK = [2800, 3500, 4200, 3900, 4500, 3700, 4100];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BusinessMoneyFlow() {
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const data = period === "current" ? CURRENT_WEEK : PREVIOUS_WEEK;

  const { path, areaPath, points, maxVal } = useMemo(() => {
    const w = 460, h = 160, px = 30, py = 20;
    const chartW = w - px * 2, chartH = h - py * 2;
    const max = Math.max(...data) * 1.1;
    const min = Math.min(...data) * 0.9;
    const range = max - min || 1;
    const step = chartW / (data.length - 1);

    const pts = data.map((v, i) => ({
      x: px + i * step,
      y: py + chartH - ((v - min) / range) * chartH,
      value: v,
    }));

    const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaD = `${lineD} L${pts[pts.length - 1].x},${h - py} L${pts[0].x},${h - py} Z`;

    return { path: lineD, areaPath: areaD, points: pts, maxVal: max };
  }, [data]);

  return (
    <div className="rounded-2xl bg-[#12121e] border border-[#1a1a2e] p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90">Money Flow</h3>
        <div className="flex gap-1">
          {(["current", "previous"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                period === p
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {p === "current" ? "This Week" : "Last Week"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 460 160" className="w-full flex-1" style={{ minHeight: 140 }}>
        <defs>
          <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={30} y1={20 + i * 40} x2={430} y2={20 + i * 40}
            stroke="rgba(255,255,255,0.04)" strokeWidth={1}
          />
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#flowGrad)" />
        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="rgb(16,185,129)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }}
        />
        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={4} fill="#12121e" stroke="rgb(16,185,129)" strokeWidth={2} />
            <text x={pt.x} y={155} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="sans-serif">
              {DAYS[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
