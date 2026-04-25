import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { TrustBadge, TrustLevel } from "@/platform/sita/components/sita/TrustBadge";
import { MessageSquare, CheckCircle, AlertTriangle, Clock, Mail, Phone, Receipt, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
  id: string;
  type: "communication" | "quote" | "invoice" | "support" | "appointment" | "note" | "task" | "payment" | "onboarding";
  title: string;
  description?: string;
  timestamp: string;
  actor: string;
  status?: "completed" | "pending" | "failed";
  linkedEntity?: string;
}

interface RelationshipTimelineProps {
  events: TimelineEvent[];
  maxEvents?: number;
  compact?: boolean;
}

const typeConfig = {
  communication: { icon: Mail, color: "text-primary", bg: "bg-primary/10" },
  quote: { icon: FileText, color: "text-chart-4", bg: "bg-chart-4/10" },
  invoice: { icon: Receipt, color: "text-amber-500", bg: "bg-amber-500/10" },
  support: { icon: MessageSquare, color: "text-chart-3", bg: "bg-chart-3/10" },
  appointment: { icon: Clock, color: "text-chart-2", bg: "bg-chart-2/10" },
  note: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted/50" },
  task: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
  payment: { icon: Receipt, color: "text-chart-2", bg: "bg-chart-2/10" },
  onboarding: { icon: CheckCircle, color: "text-chart-2", bg: "bg-chart-2/10" },
};

export function RelationshipTimeline({ events, maxEvents = 10, compact = false }: RelationshipTimelineProps) {
  const visible = events.slice(0, maxEvents);

  return (
    <SitaCard hover={false} className="p-4">
      <SitaCardTitle>Relationship Timeline</SitaCardTitle>
      <div className="mt-3 relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/50" />

        <div className="space-y-3">
          {visible.map((event, i) => {
            const config = typeConfig[event.type];
            const EventIcon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 relative"
              >
                <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${config.bg} shrink-0 z-10`}>
                  <EventIcon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-foreground ${compact ? "text-[11px]" : "text-xs"}`}>{event.title}</p>
                    {event.status === "failed" && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                  {event.description && !compact && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>{event.timestamp}</span>
                    <span>·</span>
                    <span>{event.actor}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {events.length > maxEvents && (
        <p className="mt-3 text-center text-[10px] text-muted-foreground">+{events.length - maxEvents} more events</p>
      )}
    </SitaCard>
  );
}
