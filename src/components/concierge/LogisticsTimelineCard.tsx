import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { Route } from "lucide-react";

export interface TimelineStop {
  id: string;
  time: string;
  title: string;
  location?: string;
  status: "done" | "current" | "upcoming";
}

const statusStyle = {
  done: "bg-chart-2 border-chart-2",
  current: "bg-primary border-primary animate-pulse",
  upcoming: "bg-secondary border-border/40",
};

export function LogisticsTimelineCard({ stops, label }: { stops: TimelineStop[]; label?: string }) {
  return (
    <GlassCard glow="none" className="p-4">
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <Route className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">{label}</p>
        </div>
      )}
      <div className="space-y-0">
        {stops.map((stop, i) => (
          <motion.div
            key={stop.id}
            className="flex items-start gap-3 relative"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex flex-col items-center shrink-0">
              <div className={`h-3 w-3 rounded-full border-2 ${statusStyle[stop.status]}`} />
              {i < stops.length - 1 && <div className="w-px flex-1 min-h-[24px] bg-border/30" />}
            </div>
            <div className="pb-4 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-muted-foreground shrink-0">{stop.time}</span>
                <p className={`text-[11px] font-medium truncate ${stop.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{stop.title}</p>
              </div>
              {stop.location && <p className="text-[9px] text-muted-foreground">{stop.location}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
