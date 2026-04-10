import { useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  positive?: boolean;
}

export function SparklineChart({ data, width = 80, height = 24, className = "", positive }: SparklineChartProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    return data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [data, width, height]);

  const isUp = positive ?? (data.length >= 2 && data[data.length - 1] >= data[0]);
  const color = isUp ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} fill="none">
      <path d={path} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </svg>
  );
}
