import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

/* ── Premium Glassmorphic Card ─────────────────────── */
export function MockCard({
  label, value, trend, up, className,
}: { label: string; value: string; trend?: string; up?: boolean; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-1 relative overflow-hidden group transition-transform duration-200 hover:scale-[1.02]",
      className,
    )}
    style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, hsl(265 55% 58% / 0.08), transparent 70%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{label}</span>
      <span className="text-2xl font-bold text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.06)" }}>{value}</span>
      {trend && (
        <span className={cn("text-xs flex items-center gap-0.5 font-medium", up ? "text-emerald-400" : "text-rose-400")}>
          {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
  );
}

/* ── SVG Sparkline with Gradient Fill ──────────────── */
export function MockChart({ data, color = "hsl(210,80%,60%)", height = 60, className }: {
  data: number[]; color?: string; height?: number; className?: string;
}) {
  const chartId = `chart-${Math.random().toString(36).slice(2, 8)}`;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${chartId}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`${chartId}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill={`url(#${chartId}-fill)`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        filter={`url(#${chartId}-glow)`} opacity="0.9" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Bar Chart with Gradient Bars ──────────────────── */
export function MockBarChart({ data, className }: { data: { label: string; pct: number; color?: string }[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 w-20 truncate font-medium">{d.label}</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${d.pct}%`,
              background: `linear-gradient(90deg, ${d.color ?? "hsl(210,80%,60%)"}, ${d.color ?? "hsl(210,80%,60%)"}88)`,
              boxShadow: `0 0 8px ${d.color ?? "hsl(210,80%,60%)"}44`,
            }} />
          </div>
          <span className="text-[11px] text-white/50 w-8 text-right font-mono">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ── Circular Gauge with Glow ──────────────────────── */
export function MockGauge({ value, max = 100, label, size = 100, color = "hsl(160,60%,50%)" }: {
  value: number; max?: number; label?: string; size?: number; color?: string;
}) {
  const gaugeId = `gauge-${Math.random().toString(36).slice(2, 8)}`;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`${gaugeId}-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsla(0,0%,100%,0.06)" strokeWidth="6" />
        {/* Glow layer */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          filter={`url(#${gaugeId}-glow)`} opacity="0.5"
          className="transition-all duration-700" />
        {/* Main arc */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="text-xl font-bold text-white -mt-[calc(50%+8px)] mb-4" style={{ textShadow: `0 0 12px ${color}44` }}>{value}</span>
      {label && <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{label}</span>}
    </div>
  );
}

/* ── Premium Sidebar ───────────────────────────────── */
export function MockSidebar({ items, active, onSelect, className }: {
  items: string[]; active: string; onSelect: (v: string) => void; className?: string;
}) {
  return (
    <div className={cn("w-44 shrink-0 border-r border-white/[0.06] p-3 flex flex-col gap-0.5", className)}
      style={{ background: "linear-gradient(180deg, hsl(225 12% 8% / 0.5), hsl(225 12% 6% / 0.3))" }}>
      {items.map((item) => (
        <button key={item} onClick={() => onSelect(item)}
          className={cn(
            "text-left text-[13px] px-3 py-2 rounded-xl transition-all duration-200 relative",
            active === item
              ? "bg-white/[0.08] text-white font-medium shadow-[inset_0_0_12px_hsl(265_55%_58%/0.06)]"
              : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
          )}>
          {active === item && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-[hsl(265,55%,58%)] to-[hsl(285,50%,48%)]" />
          )}
          {item}
        </button>
      ))}
    </div>
  );
}

/* ── Premium Toggle Switch ─────────────────────────── */
export function MockToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={cn("w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
        value ? "bg-emerald-500 shadow-[0_0_10px_hsl(152_55%_48%/0.4)]" : "bg-white/15"
      )}
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", value ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

/* ── Avatar with Glow Ring ─────────────────────────── */
export function MockAvatar({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-[-2px] rounded-full bg-gradient-to-br from-[hsl(265,55%,58%)] to-[hsl(152,55%,48%)] opacity-40" />
      <img src={src} alt={name} width={size} height={size}
        className="rounded-full border-2 border-white/10 object-cover relative z-10" />
    </div>
  );
}