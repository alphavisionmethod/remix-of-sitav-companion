import React from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert, Clock, Radio } from "lucide-react";
import { motion } from "framer-motion";

type SessionScope = "global" | "business" | "finance" | "concierge";
type TrustPosture = "verified" | "review" | "degraded";
type SessionMode = "review" | "simulation" | "approval";

interface BoardroomHeaderProps {
  scope: SessionScope;
  onScopeChange: (scope: SessionScope) => void;
  trustPosture?: TrustPosture;
  sessionMode?: SessionMode;
  freshness?: string;
  className?: string;
}

const SCOPES: { id: SessionScope; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "business", label: "Business" },
  { id: "finance", label: "Finance" },
  { id: "concierge", label: "Concierge" },
];

const trustConfig: Record<TrustPosture, { icon: typeof Shield; label: string; cls: string }> = {
  verified: { icon: ShieldCheck, label: "Verified", cls: "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/10" },
  review: { icon: Shield, label: "Review", cls: "text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10" },
  degraded: { icon: ShieldAlert, label: "Degraded", cls: "text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10" },
};

const modeLabels: Record<SessionMode, string> = {
  review: "Review Mode",
  simulation: "Simulation Mode",
  approval: "Approval Mode",
};

export function BoardroomHeader({
  scope, onScopeChange, trustPosture = "verified",
  sessionMode = "review", freshness = "2 min ago", className,
}: BoardroomHeaderProps) {
  const trust = trustConfig[trustPosture];
  const TrustIcon = trust.icon;

  return (
    <div className={cn(
      "h-12 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center justify-between px-5",
      "bg-[hsl(220_18%_5%/0.9)] backdrop-blur-xl",
      className,
    )}>
      {/* Left: Scope tabs */}
      <div className="flex items-center gap-1">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            onClick={() => onScopeChange(s.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all",
              scope === s.id
                ? "bg-[hsl(280_60%_50%/0.15)] text-[hsl(280_50%_75%)] shadow-[inset_0_1px_0_hsl(280_50%_60%/0.2)]"
                : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.04)]",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Center: Session mode */}
      <div className="flex items-center gap-2">
        <Radio size={12} className="text-[hsl(280_50%_60%/0.6)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(280_50%_65%/0.7)]">
          {modeLabels[sessionMode]}
        </span>
      </div>

      {/* Right: Trust + Freshness */}
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", trust.cls)}>
          <TrustIcon size={12} />
          {trust.label}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(0_0%_100%/0.3)]">
          <Clock size={11} />
          {freshness}
        </div>
      </div>
    </div>
  );
}
