import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Ticket, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export interface Reservation {
  id: string;
  title: string;
  date: string;
  status: "confirmed" | "pending" | "missing";
  linkedTrip?: string;
}

const statusConfig = {
  confirmed: { icon: CheckCircle, color: "text-chart-2", bg: "bg-chart-2/10", label: "Confirmed" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  missing: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Missing" },
};

export const ReservationStatusCard = ({ reservations, className }: { reservations: Reservation[]; className?: string }) => (
  <motion.div
    className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Ticket className="h-4 w-4 text-accent" />
      <p className="text-xs font-semibold text-foreground">Reservations</p>
      <span className="ml-auto text-[10px] text-muted-foreground">{reservations.length}</span>
    </div>
    <div className="space-y-2">
      {reservations.map(r => {
        const cfg = statusConfig[r.status];
        const Icon = cfg.icon;
        return (
          <div key={r.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-secondary/15">
            <div className={cn("rounded-lg p-1.5", cfg.bg)}>
              <Icon className={cn("h-3 w-3", cfg.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{r.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{r.date}</span>
                {r.linkedTrip && <span className="text-[9px] text-primary">↗ {r.linkedTrip}</span>}
              </div>
            </div>
            <span className={cn("text-[9px] font-medium", cfg.color)}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  </motion.div>
);
