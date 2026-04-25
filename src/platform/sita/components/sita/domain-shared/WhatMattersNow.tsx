import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Clock, Zap } from "lucide-react";
import { GlassCard } from "@/components/sita/PremiumPageComponents";

export type DomainType = "business" | "finance" | "concierge";

export interface MatterItem {
  id: string;
  title: string;
  subtitle: string;
  urgency: "high" | "medium" | "low";
  icon?: React.ReactNode;
  action?: string;
  onAction?: () => void;
}

const urgencyConfig = {
  high: { dot: "bg-destructive", bg: "bg-destructive/5 border-destructive/15", label: "Urgent" },
  medium: { dot: "bg-amber-500", bg: "bg-amber-500/5 border-amber-500/15", label: "Soon" },
  low: { dot: "bg-chart-2", bg: "bg-secondary/30 border-border/20", label: "When ready" },
};

const domainAccent: Record<DomainType, string> = {
  business: "primary",
  finance: "emerald",
  concierge: "accent",
};

export const WhatMattersNow = ({ items, domain, maxItems = 5 }: {
  items: MatterItem[];
  domain: DomainType;
  maxItems?: number;
}) => {
  const visible = items.slice(0, maxItems);
  if (visible.length === 0) return null;

  return (
    <GlassCard glow={domainAccent[domain] as any} intensity="medium" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">What Matters Now</p>
        <span className="ml-auto text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
          {visible.length} item{visible.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {visible.map((item, i) => {
          const cfg = urgencyConfig[item.urgency];
          return (
            <motion.div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${cfg.bg}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-[9px] text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              {item.action && (
                <button
                  onClick={item.onAction}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  {item.action} <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};
