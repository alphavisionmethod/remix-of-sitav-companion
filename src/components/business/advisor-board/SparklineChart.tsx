// ═══════════════════════════════════════════════════════════════
// SITA OS — Sparkline Chart
// Tiny inline SVG chart for micro-trends
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  className?: string;
}

export function SparklineChart({
  data,
  width = 80,
  height = 24,
  color = "hsl(265 55% 58%)",
  fillOpacity = 0.15,
  className = "",
}: Props) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const trend = data[data.length - 1] - data[0];
  const trendColor = trend >= 0 ? "hsl(152 55% 48%)" : "hsl(0 65% 50%)";
  const finalColor = color === "auto" ? trendColor : color;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fill area */}
      <motion.path
        d={fillPath}
        fill={finalColor}
        opacity={fillOpacity}
        initial={{ opacity: 0 }}
        animate={{ opacity: fillOpacity }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={finalColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {/* End dot */}
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={finalColor}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
      />
    </motion.svg>
  );
}