// ============================================================
// SITA OS — Trust State Badge (11 states)
// Used throughout the Boardroom for anti-hallucination clarity
// ============================================================

import { cn } from "@/lib/utils";
import {
  ShieldCheck, Brain, FlaskConical, Clock, HelpCircle,
  AlertTriangle, Lock, Plug, Calculator, MessageCircle, CheckCircle,
} from "lucide-react";

export type TrustState =
  | "verified"
  | "evidence-backed"
  | "inferred"
  | "simulation-only"
  | "stale"
  | "source-missing"
  | "needs-human-review"
  | "blocked-by-secret"
  | "blocked-by-connector"
  | "mathematically-constrained"
  | "advisory-only";

const config: Record<TrustState, { icon: typeof ShieldCheck; label: string; fg: string; bg: string; border: string }> = {
  verified: {
    icon: CheckCircle, label: "Verified",
    fg: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", border: "border-[hsl(var(--trust-safe))]/20",
  },
  "evidence-backed": {
    icon: ShieldCheck, label: "Evidence-Backed",
    fg: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/8", border: "border-[hsl(var(--trust-safe))]/15",
  },
  inferred: {
    icon: Brain, label: "Inferred",
    fg: "text-[hsl(var(--sita-purple-light))]", bg: "bg-[hsl(var(--sita-purple))]/10", border: "border-[hsl(var(--sita-purple))]/20",
  },
  "simulation-only": {
    icon: FlaskConical, label: "Simulation Only",
    fg: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", border: "border-[hsl(var(--sita-gold))]/20",
  },
  stale: {
    icon: Clock, label: "Stale",
    fg: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", border: "border-[hsl(var(--destructive))]/20",
  },
  "source-missing": {
    icon: AlertTriangle, label: "Source Missing",
    fg: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/8", border: "border-[hsl(var(--destructive))]/15",
  },
  "needs-human-review": {
    icon: HelpCircle, label: "Needs Review",
    fg: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/8", border: "border-[hsl(var(--sita-gold))]/15",
  },
  "blocked-by-secret": {
    icon: Lock, label: "Blocked (Secret)",
    fg: "text-[hsl(0_0%_100%/0.4)]", bg: "bg-[hsl(0_0%_100%/0.04)]", border: "border-[hsl(0_0%_100%/0.08)]",
  },
  "blocked-by-connector": {
    icon: Plug, label: "Blocked (Connector)",
    fg: "text-[hsl(0_0%_100%/0.4)]", bg: "bg-[hsl(0_0%_100%/0.04)]", border: "border-[hsl(0_0%_100%/0.08)]",
  },
  "mathematically-constrained": {
    icon: Calculator, label: "Math Constrained",
    fg: "text-[hsl(200_60%_60%)]", bg: "bg-[hsl(200_60%_60%)]/10", border: "border-[hsl(200_60%_60%)]/20",
  },
  "advisory-only": {
    icon: MessageCircle, label: "Advisory Only",
    fg: "text-[hsl(0_0%_100%/0.45)]", bg: "bg-[hsl(0_0%_100%/0.03)]", border: "border-[hsl(0_0%_100%/0.06)]",
  },
};

interface Props {
  state: TrustState;
  className?: string;
  size?: "xs" | "sm";
}

export function TrustStateBadge({ state, className, size = "xs" }: Props) {
  const c = config[state];
  const Icon = c.icon;
  return (
    <span
      role="status"
      aria-label={`Trust: ${c.label}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        size === "xs" ? "px-1.5 py-px text-[8px]" : "px-2 py-0.5 text-[9px]",
        c.fg, c.bg, c.border, className,
      )}
    >
      <Icon className={size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5"} />
      {c.label}
    </span>
  );
}
