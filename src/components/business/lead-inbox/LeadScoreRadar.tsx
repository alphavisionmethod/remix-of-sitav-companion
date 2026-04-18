import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ScoreFactor } from "@/domains/engines/lead-scoring-engine";

interface Props {
  factors: ScoreFactor[];
  size?: number;
  className?: string;
  showLabels?: boolean;
}

const RADAR_FACTORS = [
  "sourceQuality", "responseSpeed", "recency", "engagement", "fit",
  "valuePotential", "appointmentStatus", "quoteIntent", "communicationQuality",
  "ownerResponsiveness", "businessProfileRelevance", "urgencyWindow",
  "leadAge", "priorHistory", "reactivationPotential",
];

const SHORT_LABELS: Record<string, string> = {
  sourceQuality: "Source",
  responseSpeed: "Response",
  recency: "Recency",
  engagement: "Engage",
  fit: "Fit",
  valuePotential: "Value",
  appointmentStatus: "Appt",
  quoteIntent: "Quote",
  communicationQuality: "Comms",
  ownerResponsiveness: "Owner",
  businessProfileRelevance: "Profile",
  urgencyWindow: "Urgency",
  leadAge: "Fresh",
  priorHistory: "History",
  reactivationPotential: "Reactivate",
};

export const LeadScoreRadar = ({ factors, size = 220, className, showLabels = true }: Props) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.46;
  const n = RADAR_FACTORS.length;
  const angleStep = (2 * Math.PI) / n;

  const factorMap = new Map(factors.map(f => [f.key, f]));
  const orderedFactors = RADAR_FACTORS.map(key => factorMap.get(key));

  const getPoint = (i: number, value: number) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Rings
  const rings = [25, 50, 75, 100];

  // Data polygon
  const points = orderedFactors.map((f, i) => getPoint(i, f?.normalizedScore ?? 0));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map(r => {
          const ringPoints = Array.from({ length: n }, (_, i) => getPoint(i, r));
          const d = ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={r} d={d} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.3} />;
        })}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.2} />;
        })}

        {/* Data area */}
        <motion.path
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          d={pathD}
          fill="hsl(var(--primary))"
          fillOpacity={0.15}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data dots */}
        {points.map((p, i) => {
          const f = orderedFactors[i];
          const color = f?.polarity === "positive"
            ? "hsl(var(--trust-safe))"
            : f?.polarity === "negative"
              ? "hsl(var(--trust-degraded))"
              : "hsl(var(--primary))";
          return (
            <motion.circle
              key={i}
              initial={{ r: 0 }}
              animate={{ r: 2.5 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              cx={p.x} cy={p.y}
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth={1}
            />
          );
        })}

        {/* Labels */}
        {showLabels && orderedFactors.map((f, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const key = RADAR_FACTORS[i];
          return (
            <text
              key={i}
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize={7}
              fontWeight={500}
            >
              {SHORT_LABELS[key] || key}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
