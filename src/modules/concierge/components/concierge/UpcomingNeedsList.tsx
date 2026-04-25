import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, Calendar, Plane, ShoppingCart, Wrench, Stethoscope, RefreshCw } from "lucide-react";

export interface UpcomingNeed {
  id: string;
  title: string;
  type: "obligation" | "appointment" | "reservation" | "trip" | "errand" | "recurring";
  when: string;
  handling: "needs-handling" | "can-wait";
  who?: string;
}

const typeIcon = { obligation: Calendar, appointment: Stethoscope, reservation: Clock, trip: Plane, errand: ShoppingCart, recurring: RefreshCw };
const typeColor = { obligation: "text-primary", appointment: "text-accent", reservation: "text-chart-2", trip: "text-primary", errand: "text-amber-500", recurring: "text-muted-foreground" };

export const UpcomingNeedsList = ({ items, className }: { items: UpcomingNeed[]; className?: string }) => {
  const needsHandling = items.filter(i => i.handling === "needs-handling");
  const canWait = items.filter(i => i.handling === "can-wait");

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold text-foreground">Upcoming Needs</p>
      </div>
      {needsHandling.length > 0 && (
        <div className="mb-3">
          <p className="text-[9px] font-semibold text-destructive uppercase tracking-wider mb-1.5">Needs Handling</p>
          {needsHandling.map(item => {
            const Icon = typeIcon[item.type];
            return (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-destructive/5 mb-1">
                <Icon className={cn("h-3 w-3 shrink-0", typeColor[item.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground truncate">{item.title}</p>
                  <span className="text-[9px] text-muted-foreground">{item.when}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {canWait.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Can Wait</p>
          {canWait.map(item => {
            const Icon = typeIcon[item.type];
            return (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1">
                <Icon className={cn("h-3 w-3 shrink-0", typeColor[item.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground truncate">{item.title}</p>
                  <span className="text-[9px] text-muted-foreground">{item.when}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
