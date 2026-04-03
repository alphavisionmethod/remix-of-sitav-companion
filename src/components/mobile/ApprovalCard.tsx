import { ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ApprovalItem {
  id: string;
  title: string;
  domain: "business" | "finance" | "concierge" | "platform";
  urgency: "low" | "medium" | "high" | "critical";
  requestedAt: string;
  summary: string;
  amountCents?: number;
}

const urgencyColors = {
  low: "border-l-muted-foreground",
  medium: "border-l-[hsl(var(--trust-review))]",
  high: "border-l-[hsl(var(--trust-high-impact))]",
  critical: "border-l-destructive",
};

export const ApprovalCard = ({ item, onClick }: { item: ApprovalItem; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left rounded-xl border border-border/40 bg-card p-4 border-l-4 transition-colors hover:bg-muted/50",
      urgencyColors[item.urgency]
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.summary}</p>
      </div>
      <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
    </div>
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
        {item.domain}
      </span>
      {item.amountCents != null && (
        <span className="text-xs font-mono text-muted-foreground">
          ${(item.amountCents / 100).toLocaleString()}
        </span>
      )}
      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
        <Clock className="h-3 w-3" />
        {new Date(item.requestedAt).toLocaleDateString()}
      </span>
    </div>
  </button>
);
