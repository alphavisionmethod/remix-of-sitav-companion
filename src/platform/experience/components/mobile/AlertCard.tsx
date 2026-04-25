import { AlertTriangle, Info, AlertCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "urgent" | "critical";
  title: string;
  message: string;
  domain: string;
  createdAt: string;
  read: boolean;
}

const severityConfig = {
  info: { icon: Info, color: "text-muted-foreground", border: "border-l-muted-foreground" },
  warning: { icon: AlertTriangle, color: "text-[hsl(var(--trust-review))]", border: "border-l-[hsl(var(--trust-review))]" },
  urgent: { icon: AlertCircle, color: "text-[hsl(var(--trust-high-impact))]", border: "border-l-[hsl(var(--trust-high-impact))]" },
  critical: { icon: Flame, color: "text-destructive", border: "border-l-destructive" },
};

export const AlertCard = ({ item, onClick }: { item: AlertItem; onClick?: () => void }) => {
  const cfg = severityConfig[item.severity];
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border/40 bg-card p-3 border-l-4 transition-colors hover:bg-muted/50",
        cfg.border,
        !item.read && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", cfg.color)} />
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium truncate", !item.read && "font-semibold")}>{item.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">{item.domain}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};
