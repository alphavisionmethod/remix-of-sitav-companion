import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plane, AlertCircle } from "lucide-react";

export interface TravelReadiness {
  id: string;
  destination: string;
  daysUntil: number;
  readinessPercent: number;
  totalItems: number;
  completedItems: number;
  missingItems: string[];
}

export const TravelReadinessCard = ({ trip, className }: { trip: TravelReadiness; className?: string }) => {
  const r = trip.readinessPercent;
  const color = r >= 75 ? "text-chart-2" : r >= 50 ? "text-amber-500" : "text-destructive";
  const barColor = r >= 75 ? "bg-chart-2" : r >= 50 ? "bg-amber-500" : "bg-destructive";

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Plane className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground truncate">{trip.destination}</p>
        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{trip.daysUntil}d away</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
          <motion.div className={cn("h-full rounded-full", barColor)} initial={{ width: 0 }} animate={{ width: `${r}%` }} transition={{ duration: 0.6 }} />
        </div>
        <span className={cn("text-xs font-bold tabular-nums", color)}>{r}%</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{trip.completedItems}/{trip.totalItems} items ready</p>
      {trip.missingItems.length > 0 && (
        <div className="mt-2 space-y-1">
          {trip.missingItems.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <AlertCircle className="h-2.5 w-2.5 text-destructive shrink-0" />
              <span className="text-[10px] text-foreground">{m}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
