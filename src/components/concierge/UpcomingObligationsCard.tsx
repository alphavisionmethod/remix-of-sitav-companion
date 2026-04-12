import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { Calendar, ArrowRight } from "lucide-react";

export interface UpcomingObligation {
  id: string;
  title: string;
  type: "appointment" | "errand" | "travel" | "admin" | "recurring" | "reservation";
  dueLabel: string;
  who?: string;
  prepNeeded?: boolean;
  onAction?: () => void;
}

const typeColors: Record<UpcomingObligation["type"], string> = {
  appointment: "bg-primary/10 text-primary",
  errand: "bg-accent/10 text-accent",
  travel: "bg-chart-2/10 text-chart-2",
  admin: "bg-amber-500/10 text-amber-500",
  recurring: "bg-secondary text-muted-foreground",
  reservation: "bg-primary/10 text-primary",
};

export function UpcomingObligationsCard({ obligations, title = "Upcoming" }: { obligations: UpcomingObligation[]; title?: string }) {
  if (obligations.length === 0) return null;

  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <span className="ml-auto text-[10px] text-muted-foreground">{obligations.length} items</span>
      </div>
      <div className="space-y-1.5">
        {obligations.map((o, i) => (
          <motion.div
            key={o.id}
            className="flex items-center gap-3 rounded-xl bg-secondary/20 border border-border/15 px-3 py-2.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className={`text-[9px] font-semibold rounded-full px-1.5 py-0.5 shrink-0 ${typeColors[o.type]}`}>
              {o.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{o.title}</p>
              <p className="text-[9px] text-muted-foreground">
                {o.dueLabel}{o.who ? ` · ${o.who}` : ""}{o.prepNeeded ? " · prep needed" : ""}
              </p>
            </div>
            {o.onAction && (
              <button onClick={o.onAction} className="shrink-0 text-primary hover:underline">
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
