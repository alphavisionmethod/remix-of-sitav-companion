import { CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProofItem {
  id: string;
  type: "receipt" | "execution" | "verification";
  title: string;
  status: "verified" | "pending" | "failed";
  timestamp: string;
  domain: string;
  hash?: string;
}

const statusConfig = {
  verified: { icon: CheckCircle2, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Verified" },
  pending: { icon: FileText, color: "text-[hsl(var(--trust-review))]", bg: "bg-[hsl(var(--trust-review))]/10", label: "Pending" },
  failed: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
};

export const ProofCard = ({ item, onClick }: { item: ProofItem; onClick?: () => void }) => {
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/40 bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
          <Icon className={cn("h-4 w-4", cfg.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-[10px] font-medium", cfg.color)}>{cfg.label}</span>
            <span className="text-[10px] text-muted-foreground">{item.domain}</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {new Date(item.timestamp).toLocaleDateString()}
        </span>
      </div>
      {item.hash && (
        <p className="text-[10px] font-mono text-muted-foreground mt-2 truncate">
          #{item.hash.slice(0, 16)}…
        </p>
      )}
    </button>
  );
};
