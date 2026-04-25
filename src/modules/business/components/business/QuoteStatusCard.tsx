import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { FileText, Clock, Eye, Send, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface QuoteItem {
  id: string;
  title: string;
  customer: string;
  value: number;
  status: "draft" | "sent" | "viewed" | "acknowledged" | "expired" | "accepted";
  sentAt?: string;
  viewedAt?: string;
  expiresAt?: string;
  followUpDue: boolean;
}

interface QuoteStatusCardProps {
  title?: string;
  items: QuoteItem[];
  onFollowUp?: (id: string) => void;
  onView?: (id: string) => void;
}

const statusConfig = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted/50", icon: FileText },
  sent: { label: "Sent", color: "text-primary", bg: "bg-primary/10", icon: Send },
  viewed: { label: "Viewed", color: "text-chart-4", bg: "bg-chart-4/10", icon: Eye },
  acknowledged: { label: "Acknowledged", color: "text-chart-2", bg: "bg-chart-2/10", icon: CheckCircle },
  expired: { label: "Expired", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
  accepted: { label: "Accepted", color: "text-chart-2", bg: "bg-chart-2/10", icon: CheckCircle },
};

export function QuoteStatusCard({ title = "Quote & Proposal Status", items, onFollowUp, onView }: QuoteStatusCardProps) {
  const needsAttention = items.filter(i => i.followUpDue || i.status === "expired").length;
  const totalValue = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <SitaCard hover={false} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <SitaCardTitle>{title}</SitaCardTitle>
        </div>
        <div className="flex items-center gap-2">
          {needsAttention > 0 && (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{needsAttention} need attention</span>
          )}
          <span className="text-[10px] text-muted-foreground">${(totalValue / 1000).toFixed(0)}K total</span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onView?.(item.id)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-all hover:bg-secondary/40 ${
                item.followUpDue ? "border-amber-500/20 bg-amber-500/5" : "border-border/30 bg-secondary/20"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bg} shrink-0`}>
                <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  <span className="font-display text-xs font-semibold text-foreground">${item.value.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{item.customer}</span>
                  <span>·</span>
                  <span className={config.color}>{config.label}</span>
                  {item.followUpDue && <span className="text-amber-500 font-medium">Follow-up due</span>}
                </div>
              </div>
              {item.followUpDue && (
                <SitaButton variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); onFollowUp?.(item.id); }} className="shrink-0 px-2">
                  <ArrowRight className="h-3 w-3" />
                </SitaButton>
              )}
            </motion.div>
          );
        })}
      </div>
    </SitaCard>
  );
}
