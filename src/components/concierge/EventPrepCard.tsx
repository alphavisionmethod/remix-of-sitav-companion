import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PartyPopper, Gift, Calendar, FileText, CheckCircle } from "lucide-react";

export interface EventPrep {
  id: string;
  title: string;
  who: string;
  daysUntil: number;
  giftStatus?: "idea" | "purchased" | "wrapped" | "sent" | "none";
  giftIdea?: string;
  outstandingItems: string[];
  linkedDocs?: string[];
}

const giftColors = { idea: "text-amber-500", purchased: "text-chart-2", wrapped: "text-chart-2", sent: "text-primary", none: "text-muted-foreground" };

export const EventPrepCard = ({ event, className }: { event: EventPrep; className?: string }) => {
  const done = 0;
  const total = event.outstandingItems.length;

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <PartyPopper className="h-4 w-4 text-accent" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
          <p className="text-[10px] text-muted-foreground">{event.who}</p>
        </div>
        <span className={cn("text-[10px] font-bold tabular-nums", event.daysUntil <= 7 ? "text-destructive" : event.daysUntil <= 14 ? "text-amber-500" : "text-muted-foreground")}>
          {event.daysUntil}d
        </span>
      </div>
      {event.giftStatus && event.giftStatus !== "none" && (
        <div className="flex items-center gap-1.5 mb-2">
          <Gift className="h-3 w-3 text-muted-foreground" />
          <span className={cn("text-[10px] font-medium capitalize", giftColors[event.giftStatus])}>{event.giftStatus}</span>
          {event.giftIdea && <span className="text-[10px] text-muted-foreground ml-1">— {event.giftIdea}</span>}
        </div>
      )}
      {event.outstandingItems.length > 0 && (
        <div className="space-y-1 mb-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Outstanding</p>
          {event.outstandingItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-muted-foreground/30 shrink-0" />
              <span className="text-[10px] text-foreground">{item}</span>
            </div>
          ))}
        </div>
      )}
      {event.linkedDocs && event.linkedDocs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {event.linkedDocs.map((d, i) => (
            <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[9px] text-muted-foreground">{d}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
};
