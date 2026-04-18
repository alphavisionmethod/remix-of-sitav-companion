import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  detail?: string;
  icon?: ReactNode;
  accentColor?: string;
}

interface TimelineCardProps {
  title: string;
  events: TimelineEvent[];
  maxVisible?: number;
  className?: string;
}

export function TimelineCard({ title, events, maxVisible = 4, className }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, maxVisible);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4",
        className
      )}
    >
      <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-3")}>{title}</h4>

      <div className="relative pl-4">
        {/* Vertical rail */}
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[hsl(0_0%_100%/0.06)]" />

        <div className="space-y-3">
          {visible.map((evt, i) => (
            <div key={evt.id} className="relative flex gap-3">
              {/* Dot on rail */}
              <div
                className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[hsl(0_0%_14%)]"
                style={{ background: evt.accentColor || "hsl(265 55% 58%)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {evt.icon}
                  <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] truncate")}>{evt.title}</span>
                  <span className={cn(SITA_TYPE.timelineMeta, "ml-auto shrink-0")}>{evt.timestamp}</span>
                </div>
                {evt.detail && <p className={cn(SITA_TYPE.timelineMeta, "mt-0.5")}>{evt.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.length > maxVisible && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-3 text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)] transition-colors">
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
          <span className={cn(SITA_TYPE.microLabel)}>{expanded ? "Show less" : `${events.length - maxVisible} more`}</span>
        </button>
      )}
    </motion.div>
  );
}
