import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { MapPin, Clock, Zap } from "lucide-react";

export interface ErrandItem {
  id: string;
  title: string;
  location?: string;
  estimatedMinutes?: number;
  priority: "high" | "medium" | "low";
  combinable?: boolean;
}

export interface ErrandBundle {
  id: string;
  label: string;
  errands: ErrandItem[];
  totalMinutes: number;
  area?: string;
}

const priorityDot = { high: "bg-destructive", medium: "bg-amber-500", low: "bg-chart-2" };

export function ErrandBundleCard({ bundle }: { bundle: ErrandBundle }) {
  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold text-foreground">{bundle.label}</p>
        {bundle.area && <span className="text-[10px] text-muted-foreground">· {bundle.area}</span>}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" /> ~{bundle.totalMinutes}min
        </span>
      </div>
      <div className="space-y-1.5">
        {bundle.errands.map((e, i) => (
          <motion.div
            key={e.id}
            className="flex items-center gap-2.5 rounded-lg bg-secondary/20 px-3 py-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${priorityDot[e.priority]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{e.title}</p>
              {e.location && <p className="text-[9px] text-muted-foreground">{e.location}</p>}
            </div>
            {e.combinable && (
              <span className="text-[9px] bg-accent/10 text-accent rounded-full px-1.5 py-0.5 shrink-0">
                <Zap className="h-2.5 w-2.5 inline mr-0.5" />combine
              </span>
            )}
            {e.estimatedMinutes && (
              <span className="text-[9px] text-muted-foreground shrink-0">{e.estimatedMinutes}m</span>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
