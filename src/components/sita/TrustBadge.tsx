import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Shield, Clock, Eye, Lock, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react";

export type TrustLevel = "safe" | "verified" | "review" | "approval" | "high-impact" | "low-confidence" | "recovered" | "degraded" | "blocked";

const trustConfig: Record<TrustLevel, { icon: typeof Shield; label: string; class: string }> = {
  safe: { icon: ShieldCheck, label: "Safe", class: "text-trust-safe bg-trust-safe/10 border-trust-safe/20" },
  verified: { icon: ShieldCheck, label: "Verified", class: "text-trust-verified bg-trust-verified/10 border-trust-verified/20" },
  review: { icon: Eye, label: "Review Required", class: "text-trust-review bg-trust-review/10 border-trust-review/20" },
  approval: { icon: Lock, label: "Approval Required", class: "text-trust-approval bg-trust-approval/10 border-trust-approval/20" },
  "high-impact": { icon: Zap, label: "High Impact", class: "text-trust-high-impact bg-trust-high-impact/10 border-trust-high-impact/20" },
  "low-confidence": { icon: AlertTriangle, label: "Low Confidence", class: "text-trust-low-confidence bg-trust-low-confidence/10 border-trust-low-confidence/20" },
  recovered: { icon: CheckCircle, label: "Recovered", class: "text-trust-recovered bg-trust-recovered/10 border-trust-recovered/20" },
  degraded: { icon: ShieldAlert, label: "Degraded", class: "text-trust-degraded bg-trust-degraded/10 border-trust-degraded/20" },
  blocked: { icon: XCircle, label: "Blocked", class: "text-trust-blocked bg-trust-blocked/10 border-trust-blocked/20" },
};

export const TrustBadge = ({ level, label, className, size = "default" }: { level: TrustLevel; label?: string; className?: string; size?: "sm" | "default" }) => {
  const c = trustConfig[level];
  const Icon = c.icon;
  return (
    <span role="status" aria-label={`Trust level: ${label || c.label}`} className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      size === "sm" ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]",
      c.class, className
    )}>
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {label || c.label}
    </span>
  );
};
