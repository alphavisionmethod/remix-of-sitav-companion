import { cn } from "@/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";

/* ── GlassPanel ── */
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  onClick?: () => void;
}

export const GlassPanel = ({ children, className, glow, onClick }: GlassPanelProps) => (
  <div
    className={cn(
      "rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-lg",
      glow && `shadow-${glow}/10`,
      onClick && "cursor-pointer",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

/* ── HolographicGauge (upgraded with scan line + counting animation + tick marks) ── */
interface HolographicGaugeProps {
  value: number;
  label: string;
  size?: number;
  color?: string;
  className?: string;
}

export const HolographicGauge = ({ value, label, size = 120, color = "#a78bfa", className }: HolographicGaugeProps) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const tickCount = 24;
  const activeSegment = Math.floor((value / 100) * tickCount);

  // Counting animation
  const springVal = useSpring(0, { stiffness: 40, damping: 20 });
  const displayVal = useTransform(springVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    springVal.set(value);
    const unsub = displayVal.on("change", (v) => setDisplay(v));
    return unsub;
  }, [value, springVal, displayVal]);

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Scan line sweep */}
        <defs>
          <linearGradient id={`scan-${label}`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius - 8} fill="none"
          stroke={`url(#scan-${label})`} strokeWidth={radius * 0.6} opacity={0.15}
          strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
          animate={{ strokeDashoffset: [0, -circumference] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Tick marks */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const a = (i / tickCount) * 2 * Math.PI;
          const inner = radius - 3;
          const outer = radius + 1;
          const cx = size / 2;
          const cy = size / 2;
          const isActive = i < activeSegment;
          return (
            <motion.line
              key={i}
              x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner}
              x2={cx + Math.cos(a) * outer} y2={cy + Math.sin(a) * outer}
              stroke={isActive ? color : "rgba(255,255,255,0.1)"}
              strokeWidth={1.5} strokeLinecap="round"
              animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={isActive ? { duration: 2, repeat: Infinity, delay: i * 0.05 } : {}}
            />
          );
        })}
        {/* Background track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        {/* Value arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-white">{display}%</span>
        <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

/* ── NeonRing (upgraded: triple-layer + rotating conic gradient) ── */
interface NeonRingProps {
  color: string;
  size?: number;
  active?: boolean;
  intensity?: number; // 0-100, maps to confidence
  children: React.ReactNode;
  className?: string;
}

export const NeonRing = ({ color, active = true, intensity = 80, children, className }: NeonRingProps) => {
  const opInner = intensity > 80 ? 0.9 : intensity > 60 ? 0.6 : 0.3;
  const opMid = opInner * 0.5;
  const opOuter = opInner * 0.25;

  return (
    <div className={cn("relative", className)}>
      {active && (
        <>
          {/* Rotating conic gradient border */}
          <motion.div
            className="absolute inset-[-5px] rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, ${color}, transparent 40%, ${color}60 60%, transparent 80%, ${color})`,
              opacity: opOuter,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner sharp glow */}
          <motion.div
            className="absolute inset-[-3px] rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 12px ${color}` }}
            animate={{ opacity: [opInner * 0.7, opInner, opInner * 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Mid diffuse glow */}
          <motion.div
            className="absolute inset-[-6px] rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 30px ${color}` }}
            animate={{ opacity: [opMid * 0.5, opMid, opMid * 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Outer ambient glow */}
          <div
            className="absolute inset-[-10px] rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 50px ${color}40`, opacity: opOuter }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ── FloatingMetricCard (upgraded with bob animation) ── */
interface FloatingMetricCardProps {
  label: string;
  value: string;
  className?: string;
}

export const FloatingMetricCard = ({ label, value, className }: FloatingMetricCardProps) => (
  <motion.div
    className={cn(
      "px-3 py-2 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.1] shadow-lg",
      className
    )}
    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, y: [0, -4, 0], filter: "blur(0px)" }}
    transition={{
      opacity: { duration: 0.4 },
      scale: { type: "spring", stiffness: 200 },
      filter: { duration: 0.5 },
      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    }}
  >
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-[9px] text-white/40 uppercase tracking-wider">{label}</p>
  </motion.div>
);

/* ── DataPulseLine ── */
interface DataPulseLineProps {
  x1: number; y1: number;
  x2: number; y2: number;
  color?: string;
  className?: string;
}

export const DataPulseLine = ({ x1, y1, x2, y2, color = "#a78bfa", className }: DataPulseLineProps) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  return (
    <g className={className}>
      {/* Line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} opacity={0.15} />
      {/* Pulse dot */}
      <motion.circle
        r={3} fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        animate={{
          cx: [x1, x2],
          cy: [y1, y2],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2 + len / 200,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </g>
  );
};

/* ── CinematicBackground (upgraded with bokeh) ── */
export const CinematicBackground = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#10101f] to-[#0d0d18] overflow-hidden", className)}>
    {/* Grid overlay */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
      backgroundSize: "60px 60px"
    }} />
    {/* Bokeh circles */}
    {[
      { x: "15%", y: "20%", s: 200, c: "rgba(167,139,250,0.06)", d: 20 },
      { x: "75%", y: "60%", s: 280, c: "rgba(52,211,153,0.04)", d: 25 },
      { x: "50%", y: "80%", s: 160, c: "rgba(245,158,11,0.05)", d: 18 },
    ].map((b, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: b.x, top: b.y, width: b.s, height: b.s,
          background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
    <div className="relative z-10">{children}</div>
  </div>
);