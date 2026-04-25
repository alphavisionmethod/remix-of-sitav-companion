import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bell } from "lucide-react";
import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";

export interface ChangeEvent {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  color?: string;
}

export const WhatChangedFeed = ({ events, title = "What Changed" }: {
  events: ChangeEvent[];
  title?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (events.length === 0) return null;

  const visible = expanded ? events : events.slice(0, 3);

  return (
    <GlassCard glow="none" className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full mb-3"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <span className="text-[10px] text-muted-foreground ml-1">Since yesterday</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        <div className="space-y-1.5">
          {visible.map((ev, i) => (
            <motion.div
              key={ev.id}
              className="flex items-start gap-2.5 py-1.5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="rounded-lg bg-secondary/50 p-1.5 shrink-0 mt-0.5">
                {ev.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">{ev.title}</p>
                <p className="text-[9px] text-muted-foreground truncate">{ev.subtitle}</p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">{ev.time}</span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      {events.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[10px] text-primary hover:underline mt-2"
        >
          +{events.length - 3} more changes
        </button>
      )}
    </GlassCard>
  );
};
