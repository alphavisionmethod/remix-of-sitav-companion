import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

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

/* ── HolographicGauge ── */
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

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-white">{value}%</span>
        <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

/* ── NeonRing ── */
interface NeonRingProps {
  color: string;
  size?: number;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const NeonRing = ({ color, active = true, children, className }: NeonRingProps) => (
  <div className={cn("relative", className)}>
    {active && (
      <motion.div
        className="absolute inset-[-4px] rounded-full pointer-events-none"
        style={{ boxShadow: `0 0 20px ${color}, 0 0 40px ${color}40` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
    {children}
  </div>
);

/* ── FloatingMetricCard ── */
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
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-[9px] text-white/40 uppercase tracking-wider">{label}</p>
  </motion.div>
);

/* ── CinematicBackground ── */
export const CinematicBackground = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#10101f] to-[#0d0d18] overflow-hidden", className)}>
    {/* Grid overlay */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
      backgroundSize: "60px 60px"
    }} />
    <div className="relative z-10">{children}</div>
  </div>
);