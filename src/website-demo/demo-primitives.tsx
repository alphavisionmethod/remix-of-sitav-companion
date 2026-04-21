import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

/* ── Glassmorphic Card ─────────────────────────────── */
export function MockCard({
  label, value, trend, up, className,
}: { label: string; value: string; trend?: string; up?: boolean; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4 flex flex-col gap-1",
      className,
    )}>
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-semibold text-white">{value}</span>
      {trend && (
        <span className={cn("text-xs flex items-center gap-0.5", up ? "text-emerald-400" : "text-rose-400")}>
          {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
  );
}

/* ── SVG Sparkline ─────────────────────────────────── */
export function MockChart({ data, color = "hsl(210,80%,60%)", height = 60, className }: {
  data: number[]; color?: string; height?: number; className?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill="url(#cg)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Bar Chart ─────────────────────────────────────── */
export function MockBarChart({ data, className }: { data: { label: string; pct: number; color?: string }[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-xs text-white/50 w-20 truncate">{d.label}</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color ?? "hsl(210,80%,60%)" }} />
          </div>
          <span className="text-xs text-white/60 w-8 text-right">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ── Circular Gauge ────────────────────────────────── */
export function MockGauge({ value, max = 100, label, size = 100, color = "hsl(160,60%,50%)" }: {
  value: number; max?: number; label?: string; size?: number; color?: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsla(0,0%,100%,0.08)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="text-xl font-bold text-white -mt-[calc(50%+8px)] mb-4">{value}</span>
      {label && <span className="text-xs text-white/50">{label}</span>}
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────── */
export function MockSidebar({ items, active, onSelect, className }: {
  items: string[]; active: string; onSelect: (v: string) => void; className?: string;
}) {
  return (
    <div className={cn("w-44 shrink-0 border-r border-white/10 p-3 flex flex-col gap-0.5", className)}>
      {items.map((item) => (
        <button key={item} onClick={() => onSelect(item)}
          className={cn(
            "text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
            active === item ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5",
          )}>
          {item}
        </button>
      ))}
    </div>
  );
}

/* ── Toggle Switch ─────────────────────────────────── */
export function MockToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={cn("w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
        value ? "bg-emerald-500" : "bg-white/20"
      )}>
      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", value ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

/* ── Avatar ────────────────────────────────────────── */
export function MockAvatar({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  return (
    <img src={src} alt={name} width={size} height={size}
      className="rounded-full border-2 border-white/20 object-cover" />
  );
}