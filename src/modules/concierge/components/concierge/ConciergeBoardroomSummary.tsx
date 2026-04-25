import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, ArrowRight, Calendar } from "lucide-react";

export interface BoardroomSummaryData {
  completionPercent: number;
  carryoverCount: number;
  topPriority: string;
  nextReviewDate: string;
}

export const ConciergeBoardroomSummary = ({ data, className, onClick }: { data: BoardroomSummaryData; className?: string; onClick?: () => void }) => {
  const pct = data.completionPercent;
  const color = pct >= 75 ? "text-chart-2" : pct >= 50 ? "text-amber-500" : "text-destructive";
  const barColor = pct >= 75 ? "bg-chart-2" : pct >= 50 ? "bg-amber-500" : "bg-destructive";

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4 cursor-pointer hover:border-border/80 transition-colors", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold text-foreground">Boardroom Summary</p>
        <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className={cn("font-display text-lg font-bold", color)}>{pct}%</p>
          <p className="text-[9px] text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-bold text-foreground">{data.carryoverCount}</p>
          <p className="text-[9px] text-muted-foreground">Carryover</p>
        </div>
        <div className="text-center">
          <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
          <p className="text-[9px] text-muted-foreground">{data.nextReviewDate}</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-2">
        <motion.div className={cn("h-full rounded-full", barColor)} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <p className="text-[10px] text-foreground/80 truncate">⚡ {data.topPriority}</p>
    </motion.div>
  );
};
