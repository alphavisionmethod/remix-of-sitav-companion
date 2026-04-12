import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Stethoscope, FileText, Car, CheckCircle, Clock } from "lucide-react";

export interface AppointmentPrepChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface AppointmentPrep {
  id: string;
  title: string;
  who: string;
  when: string;
  provider?: string;
  prepChecklist?: AppointmentPrepChecklistItem[];
  prepItems?: string[];
  docsNeeded: string[];
  transportTime?: string;
  confirmed?: boolean;
  status?: "confirmed" | "unconfirmed" | "prep-needed";
}

export const AppointmentPrepCard = ({ appointment, className }: { appointment: AppointmentPrep; className?: string }) => {
  const prepDone = 0; // placeholder for interactive state
  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Stethoscope className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{appointment.title}</p>
          <p className="text-[10px] text-muted-foreground">{appointment.who} · {appointment.when}</p>
        </div>
        {(appointment.status === "confirmed" || appointment.confirmed) ? (
          <span className="flex items-center gap-1 text-[9px] font-medium text-chart-2"><CheckCircle className="h-3 w-3" />Confirmed</span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] font-medium text-amber-500"><Clock className="h-3 w-3" />{appointment.status === "prep-needed" ? "Prep needed" : "Unconfirmed"}</span>
        )}
      </div>
      {appointment.transportTime && (
        <div className="flex items-center gap-1.5 mb-2">
          <Car className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{appointment.transportTime}</span>
        </div>
      )}
      {((appointment.prepChecklist && appointment.prepChecklist.length > 0) || (appointment.prepItems && appointment.prepItems.length > 0)) && (
        <div className="bg-secondary/20 rounded-lg p-2.5 mb-2 space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prep</p>
          {(appointment.prepChecklist || []).map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded border shrink-0 ${p.done ? "bg-primary border-primary" : "border-muted-foreground/30"}`} />
              <span className={`text-[10px] ${p.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{p.label}</span>
            </div>
          ))}
          {(appointment.prepItems || []).map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-muted-foreground/30 shrink-0" />
              <span className="text-[10px] text-foreground">{p}</span>
            </div>
          ))}
        </div>
      )}
      {appointment.docsNeeded.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {appointment.docsNeeded.map((d, i) => (
            <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[9px] text-muted-foreground">{d}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
};
