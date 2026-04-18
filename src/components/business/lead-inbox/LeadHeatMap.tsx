import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadScoreResult } from "@/domains/engines/lead-scoring-engine";

interface Props {
  items: InboxItem[];
  scoreMap: Map<string, LeadScoreResult>;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  className?: string;
}

const getColor = (score: number) => {
  if (score >= 80) return "hsl(var(--trust-safe))";
  if (score >= 60) return "hsl(var(--sita-gold))";
  if (score >= 40) return "hsl(var(--urgency-high))";
  return "hsl(var(--trust-degraded))";
};

const getRecencyHours = (dateStr: string) => (Date.now() - new Date(dateStr).getTime()) / 3600000;

export const LeadHeatMap = ({ items, scoreMap, onSelect, selectedId, className }: Props) => {
  // Plot: X = recency (newer on left), Y = score (higher on top)
  const plotItems = items
    .filter(i => i.triage_status !== "rejected")
    .map(i => {
      const s = scoreMap.get(i.id);
      const recencyH = getRecencyHours(i.last_activity_at || i.created_at);
      return { item: i, score: s?.priorityScore ?? i.quality_score, recencyH, result: s };
    })
    .slice(0, 30);

  const maxRecency = Math.max(...plotItems.map(p => p.recencyH), 1);
  const W = 100;
  const H = 100;

  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card p-5", className)}>
      <p className="text-xs font-semibold text-foreground mb-3">Score vs. Recency Map</p>
      <div className="relative" style={{ paddingBottom: "60%" }}>
        <svg className="absolute inset-0 w-full h-full" viewBox={`-8 -4 ${W + 16} ${H + 12}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <rect x={0} y={0} width={W} height={H} fill="none" stroke="hsl(var(--border))" strokeWidth={0.3} opacity={0.3} rx={2} />
          {[25, 50, 75].map(v => (
            <g key={v}>
              <line x1={0} y1={H - (v / 100) * H} x2={W} y2={H - (v / 100) * H} stroke="hsl(var(--border))" strokeWidth={0.2} opacity={0.2} strokeDasharray="2,2" />
              <text x={-3} y={H - (v / 100) * H + 1} textAnchor="end" className="fill-muted-foreground" fontSize={3}>{v}</text>
            </g>
          ))}

          {/* Quadrant labels */}
          <text x={W * 0.25} y={H * 0.12} textAnchor="middle" className="fill-muted-foreground" fontSize={2.5} opacity={0.4}>Hot & High</text>
          <text x={W * 0.75} y={H * 0.88} textAnchor="middle" className="fill-muted-foreground" fontSize={2.5} opacity={0.4}>Cold & Low</text>

          {/* Dots */}
          {plotItems.map((p, i) => {
            const x = Math.max(2, Math.min(W - 2, (1 - p.recencyH / maxRecency) * W));
            const y = Math.max(2, Math.min(H - 2, H - (p.score / 100) * H));
            const isSelected = selectedId === p.item.id;
            const dotR = isSelected ? 3.5 : 2.5;
            return (
              <motion.circle
                key={p.item.id}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: dotR, opacity: isSelected ? 1 : 0.75 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                cx={x} cy={y}
                fill={getColor(p.score)}
                stroke={isSelected ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                strokeWidth={isSelected ? 0.8 : 0.4}
                className="cursor-pointer hover:opacity-100"
                onClick={() => onSelect?.(p.item.id)}
              />
            );
          })}

          {/* Axes labels */}
          <text x={W / 2} y={H + 7} textAnchor="middle" className="fill-muted-foreground" fontSize={2.8}>← Recent · · · Older →</text>
          <text x={-5} y={H / 2} textAnchor="middle" className="fill-muted-foreground" fontSize={2.8} transform={`rotate(-90, -5, ${H / 2})`}>Score</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        {[
          { label: "80+", color: "hsl(var(--trust-safe))" },
          { label: "60–79", color: "hsl(var(--sita-gold))" },
          { label: "40–59", color: "hsl(var(--urgency-high))" },
          { label: "<40", color: "hsl(var(--trust-degraded))" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[8px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
