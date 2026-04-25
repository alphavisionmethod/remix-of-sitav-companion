// ═══════════════════════════════════════════════════════════════
// SITA OS — Animated Confidence Ring
// SVG-based radial confidence indicator with cinematic animation
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

interface Props {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

function getColor(value: number): string {
  if (value >= 80) return "hsl(152 55% 48%)";
  if (value >= 60) return "hsl(38 85% 58%)";
  if (value >= 40) return "hsl(25 90% 55%)";
  return "hsl(0 65% 50%)";
}

export function AnimatedConfidenceRing({ value, size = 80, strokeWidth = 5, label, sublabel, className = "" }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getColor(value);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0 0% 100% / 0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${value}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Animated arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          filter={`url(#glow-${value})`}
        />
      </svg>
      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold"
          style={{ color, fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {value}
        </motion.span>
        {sublabel && (
          <span className="text-muted-foreground" style={{ fontSize: Math.max(8, size * 0.1) }}>
            {sublabel}
          </span>
        )}
      </div>
      {label && (
        <span className="text-[9px] text-muted-foreground mt-1 text-center">{label}</span>
      )}
    </div>
  );
}