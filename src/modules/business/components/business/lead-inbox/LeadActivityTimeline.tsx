import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import type { InboxItem } from "./mock-inbox-data";
import { Mail, Phone, Calendar, FileText, MessageSquare, User, Zap, Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "created" | "email" | "call" | "appointment" | "quote" | "response" | "assigned" | "status-change";
  label: string;
  timestamp: Date;
  detail?: string;
}

const EVENT_CONFIG: Record<TimelineEvent["type"], { icon: typeof Mail; color: string }> = {
  created: { icon: Zap, color: "text-primary bg-primary/10" },
  email: { icon: Mail, color: "text-accent bg-accent/10" },
  call: { icon: Phone, color: "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/10" },
  appointment: { icon: Calendar, color: "text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10" },
  quote: { icon: FileText, color: "text-[hsl(var(--urgency-high))] bg-[hsl(var(--urgency-high))]/10" },
  response: { icon: MessageSquare, color: "text-accent bg-accent/10" },
  assigned: { icon: User, color: "text-muted-foreground bg-muted/30" },
  "status-change": { icon: Clock, color: "text-primary bg-primary/10" },
};

function generateTimeline(item: InboxItem): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const created = new Date(item.created_at);

  events.push({ id: "e-created", type: "created", label: "Lead captured", timestamp: created, detail: `Source: ${item.source}` });

  if (item.owner_assigned) {
    events.push({ id: "e-assigned", type: "assigned", label: `Assigned to ${item.owner_assigned}`, timestamp: new Date(created.getTime() + 300000) });
  }

  if (item.response_time_minutes) {
    events.push({ id: "e-response", type: "response", label: "First response sent", timestamp: new Date(created.getTime() + item.response_time_minutes * 60000), detail: `${item.response_time_minutes}m response time` });
  }

  if (item.communication_count && item.communication_count > 1) {
    for (let i = 1; i < Math.min(item.communication_count, 4); i++) {
      events.push({ id: `e-comm-${i}`, type: "email", label: `Communication #${i + 1}`, timestamp: new Date(created.getTime() + (i * 2 + 1) * 3600000) });
    }
  }

  if (item.appointment_booked) {
    events.push({ id: "e-appt", type: "appointment", label: "Appointment booked", timestamp: new Date(created.getTime() + 4 * 3600000) });
  }

  if (item.quote_requested) {
    events.push({ id: "e-quote", type: "quote", label: "Quote requested", timestamp: new Date(created.getTime() + 1800000) });
  }

  if (item.triage_status === "accepted" && item.accepted_at) {
    events.push({ id: "e-accepted", type: "status-change", label: "Lead accepted", timestamp: new Date(item.accepted_at) });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const timeAgo = (d: Date) => {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

interface Props {
  item: InboxItem;
  className?: string;
}

export const LeadActivityTimeline = ({ item, className }: Props) => {
  const events = generateTimeline(item);

  if (events.length === 0) return null;

  return (
    <SitaCard hover={false} className={cn("p-4", className)}>
      <SitaCardTitle>Activity Timeline</SitaCardTitle>
      <div className="mt-3 space-y-0">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type];
          const Icon = config.icon;
          const isLast = i === events.length - 1;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 relative"
            >
              {/* Line */}
              {!isLast && (
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border/30" />
              )}
              {/* Icon */}
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 relative z-10", config.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-foreground">{event.label}</p>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{timeAgo(event.timestamp)}</span>
                </div>
                {event.detail && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">{event.detail}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SitaCard>
  );
};
