// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Status Badge
// Single source of truth for all status/trust/severity display
// ═══════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Pause, Play, Shield, RotateCcw, Eye, Clock } from "lucide-react";

type StatusType =
  | "healthy" | "verified" | "connected" | "stable" | "compliant" | "pass" | "allow" | "production" | "done" | "resolved" | "completed" | "success"
  | "warning" | "degraded" | "review" | "deploying" | "beta" | "medium" | "in_progress" | "investigating" | "mitigating" | "replayable" | "escalate"
  | "critical" | "error" | "disconnected" | "compromised" | "deny" | "failed" | "violation"
  | "paused" | "disabled" | "alpha" | "planned"
  | "pending" | "new" | "info" | "draft" | "simulate" | "risky";

const statusMap: Record<string, { bg: string; text: string; icon?: React.ElementType }> = {
  // Green — safe
  healthy: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  verified: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  connected: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  stable: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  compliant: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: Shield },
  pass: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  allow: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  production: { bg: "bg-trust-verified/10", text: "text-trust-safe" },
  done: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  resolved: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  completed: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },
  success: { bg: "bg-trust-verified/10", text: "text-trust-safe", icon: CheckCircle },

  // Amber — warning
  warning: { bg: "bg-accent/10", text: "text-accent", icon: AlertTriangle },
  degraded: { bg: "bg-accent/10", text: "text-accent", icon: AlertTriangle },
  review: { bg: "bg-accent/10", text: "text-accent", icon: Eye },
  deploying: { bg: "bg-accent/10", text: "text-accent", icon: Play },
  beta: { bg: "bg-accent/10", text: "text-accent" },
  medium: { bg: "bg-accent/10", text: "text-accent" },
  in_progress: { bg: "bg-accent/10", text: "text-accent", icon: Clock },
  investigating: { bg: "bg-accent/10", text: "text-accent", icon: Eye },
  mitigating: { bg: "bg-accent/10", text: "text-accent", icon: Shield },
  replayable: { bg: "bg-primary/10", text: "text-primary", icon: RotateCcw },
  escalate: { bg: "bg-accent/10", text: "text-accent", icon: AlertTriangle },

  // Red — critical
  critical: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  error: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  disconnected: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  compromised: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  deny: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  failed: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  violation: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },

  // Muted — paused/neutral
  paused: { bg: "bg-muted", text: "text-muted-foreground", icon: Pause },
  disabled: { bg: "bg-muted", text: "text-muted-foreground", icon: Pause },
  alpha: { bg: "bg-muted", text: "text-muted-foreground" },
  planned: { bg: "bg-muted", text: "text-muted-foreground" },

  // Info
  pending: { bg: "bg-primary/10", text: "text-primary", icon: Clock },
  new: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-primary/10", text: "text-primary" },
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
  simulate: { bg: "bg-primary/10", text: "text-primary", icon: Eye },
  risky: { bg: "bg-accent/10", text: "text-accent", icon: AlertTriangle },
};

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, showIcon = false, size = "sm", className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const config = statusMap[key] || { bg: "bg-muted", text: "text-muted-foreground" };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium capitalize",
        config.bg, config.text,
        size === "xs" ? "text-[8px] px-1.5 py-0" : size === "sm" ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-0.5",
        className
      )}
    >
      {showIcon && Icon && <Icon className={cn("shrink-0 mr-1", size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3")} />}
      {status}
    </Badge>
  );
}

// ── Trust Posture Badge ─────────────────────────────────────────
export function TrustPostureBadge({ posture }: { posture: string }) {
  return <StatusBadge status={posture} showIcon size="md" />;
}

// ── Severity Chip ───────────────────────────────────────────────
export function SeverityChip({ severity }: { severity: string }) {
  return <StatusBadge status={severity} showIcon size="xs" />;
}
