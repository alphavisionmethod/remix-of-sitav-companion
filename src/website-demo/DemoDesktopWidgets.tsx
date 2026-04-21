import React, { useState } from "react";
import { Star, Plus, TrendingUp } from "lucide-react";
import { CONCIERGE_DATA, BUSINESS_DATA } from "./demo-data";

function TodayWidget() {
  const [tasks, setTasks] = useState(CONCIERGE_DATA.tasks);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const priorityColor: Record<string, string> = {
    high: "bg-red-500/80 text-white",
    medium: "bg-amber-500/80 text-white",
    low: "bg-blue-400/80 text-white",
  };

  return (
    <div className="rounded-2xl p-4 w-64"
      style={{
        background: "rgba(20,20,30,0.65)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-400" fill="currentColor" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Today</span>
        </div>
        <button className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Plus size={12} className="text-white/70" />
        </button>
      </div>
      <p className="text-[10px] text-white/40 mb-3">{dateStr}</p>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <button
              onClick={() => setTasks(prev => prev.map((t, j) => j === i ? { ...t, done: !t.done } : t))}
              className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                task.done ? "bg-green-500/80 border-green-400/60" : "border-white/30 hover:border-white/50"
              }`}
            >
              {task.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-snug ${task.done ? "text-white/30 line-through" : "text-white/80"}`}>
                {task.title}
              </p>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function QuickStatsWidget() {
  const rev = BUSINESS_DATA.kpis[0];
  const pipeline = BUSINESS_DATA.kpis[2];
  return (
    <div className="rounded-2xl p-4 w-64"
      style={{
        background: "rgba(20,20,30,0.65)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-emerald-400" />
        <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Quick Stats</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40">{rev.label}</p>
            <p className="text-sm font-semibold text-white/90">{rev.value}</p>
          </div>
          <span className="text-[10px] text-emerald-400">{rev.trend}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40">{pipeline.label}</p>
            <p className="text-sm font-semibold text-white/90">{pipeline.value}</p>
          </div>
          <span className="text-[10px] text-emerald-400">{pipeline.trend}</span>
        </div>
        <MiniSparkline data={BUSINESS_DATA.chartData} />
      </div>
    </div>
  );
}

export function DemoDesktopWidgets() {
  return (
    <div className="absolute top-10 left-6 flex flex-col gap-4 z-10">
      <TodayWidget />
      <QuickStatsWidget />
    </div>
  );
}