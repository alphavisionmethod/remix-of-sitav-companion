import { cn } from "@/lib/utils";
import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";

export type ProofStatus = "verified" | "pending" | "unverified";

const config = {
  verified: { icon: ShieldCheck, color: "text-chart-2", bg: "bg-chart-2/10", label: "Verified" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  unverified: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-secondary", label: "Unverified" },
};

export const ConciergeProofChip = ({ status, className }: { status: ProofStatus; className?: string }) => {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", c.bg, c.color, className)} title={c.label}>
      <Icon className="h-3 w-3" />{c.label}
    </span>
  );
};
