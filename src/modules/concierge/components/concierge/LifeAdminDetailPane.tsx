// ═══════════════════════════════════════════════════════════════
// Life Admin Detail Pane — Right panel for Concierge Life Admin
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, Clock, Calendar, FileText, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminItem {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  daysOverdue: number;
  frequency?: string;
  linkedTo?: string;
  urgency: "high" | "medium" | "low";
}

interface LifeAdminDetailPaneProps {
  item: AdminItem | null;
}

const urgencyConfig = {
  high: { label: "High Priority", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  medium: { label: "Medium Priority", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  low: { label: "Low Priority", color: "text-chart-2", bg: "bg-chart-2/10 border-chart-2/20" },
};

export function LifeAdminDetailPane({ item }: LifeAdminDetailPaneProps) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Select an item</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Click on a life admin task for details and actions</p>
      </div>
    );
  }

  const urgency = urgencyConfig[item.urgency];

  return (
    <div className="space-y-4">
      {/* Item Detail */}
      <div className="rounded-xl border border-border/30 bg-[hsl(0_0%_100%/0.03)] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("h-3 w-3 rounded-full mt-1.5 shrink-0", item.urgency === "high" ? "bg-destructive" : item.urgency === "medium" ? "bg-amber-500" : "bg-chart-2")} />
          <div>
            <h3 className="font-display text-base font-bold text-foreground leading-snug">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{item.category}</span>
              <span className={cn("inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium", urgency.bg)}>
                {urgency.label}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {item.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="text-foreground">{item.dueDate}</span>
            </div>
          )}
          {item.daysOverdue > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-destructive" />
              <span className={cn("font-medium", item.daysOverdue >= 7 ? "text-destructive" : "text-amber-500")}>
                {item.daysOverdue} days overdue
              </span>
            </div>
          )}
          {item.frequency && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Frequency:</span>
              <span className="text-primary font-medium">{item.frequency}</span>
            </div>
          )}
          {item.linkedTo && (
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-3.5 w-3.5 text-accent" />
              <span className="text-muted-foreground">Linked to:</span>
              <span className="text-accent font-medium">{item.linkedTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-chart-2/10 border border-chart-2/20 px-3 py-2.5 text-xs font-medium text-chart-2 hover:bg-chart-2/20 transition-colors">
          <CheckCircle className="h-3.5 w-3.5" /> Mark Done
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-secondary/30 border border-border/20 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors">
          <Clock className="h-3.5 w-3.5" /> Snooze 1 Week
        </button>
      </div>

      {/* AI Suggestion */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
        <p className="text-[11px] font-semibold text-accent mb-1 flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> Concierge Suggestion
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {item.daysOverdue > 7
            ? "This has been postponed multiple times. Consider blocking 15 minutes on your calendar tomorrow morning to clear it."
            : item.linkedTo
            ? `This is linked to "${item.linkedTo}" — completing it together would save time.`
            : "This can be completed in a short sitting. Consider bundling it with similar tasks."
          }
        </p>
      </div>
    </div>
  );
}
