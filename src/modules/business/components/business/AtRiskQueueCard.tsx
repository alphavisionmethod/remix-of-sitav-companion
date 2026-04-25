import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { AlertTriangle, Clock, ArrowRight, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface AtRiskItem {
  id: string;
  title: string;
  entity: string;
  entityType: string;
  reason: string;
  urgency: "critical" | "high" | "medium";
  value?: number;
  age: string;
  nextAction: string;
}

interface AtRiskQueueCardProps {
  title?: string;
  items: AtRiskItem[];
  onItemClick?: (id: string) => void;
  onAction?: (id: string) => void;
  maxItems?: number;
}

const urgencyColors = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  high: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  medium: "text-muted-foreground bg-muted/50 border-border",
};

export function AtRiskQueueCard({ title = "At Risk", items, onItemClick, onAction, maxItems = 5 }: AtRiskQueueCardProps) {
  const visible = items.slice(0, maxItems);
  const remaining = items.length - visible.length;

  return (
    <SitaCard hover={false} lane="action" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <SitaCardTitle>{title}</SitaCardTitle>
        </div>
        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="space-y-2">
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onItemClick?.(item.id)}
            className="flex items-start gap-2 rounded-xl border border-border/40 bg-secondary/30 p-2.5 cursor-pointer hover:bg-secondary/50 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <span className={`inline-flex items-center rounded px-1 py-px text-[9px] font-bold uppercase border ${urgencyColors[item.urgency]}`}>{item.urgency}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{item.entity} · {item.reason}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{item.age}</span>
                {item.value && <span className="flex items-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />${item.value.toLocaleString()}</span>}
              </div>
            </div>
            <SitaButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onAction?.(item.id); }} className="shrink-0 px-2">
              <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </motion.div>
        ))}
      </div>

      {remaining > 0 && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">+{remaining} more at risk</p>
      )}
    </SitaCard>
  );
}
