import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert, Clock, Radio, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const modeColors: Record<SessionMode, string> = {
  review: "hsl(280 50% 55%)",
  simulation: "hsl(40 90% 55%)",
  approval: "hsl(145 60% 45%)",
};

const ADVISOR_COLORS = ["#a78bfa", "#f59e0b", "#34d399", "#f472b6", "#60a5fa", "#fb923c"];

export function BoardroomHeader({
  scope, onScopeChange, trustPosture = "verified",
  sessionMode = "review", freshness = "2 min ago", className,
}: BoardroomHeaderProps) {
  const trust = trustConfig[trustPosture];
  const TrustIcon = trust.icon;

  // Live session timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerStr = `${mins}m ${secs.toString().padStart(2, "0")}s`;

  const pulseColor = modeColors[sessionMode];

  return (
    <div className={cn("shrink-0 relative", className)}>
      {/* Main header bar */}
      <div className="h-12 flex items-center justify-between px-5 bg-[hsl(220_18%_5%/0.9)] backdrop-blur-xl border-b border-[hsl(0_0%_100%/0.06)]">
        {/* Left: Scope tabs with transition */}
        <div className="flex items-center gap-1 relative">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => onScopeChange(s.id)}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all",
                scope === s.id
                  ? "text-[hsl(280_50%_75%)]"
                  : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] hover:bg-[hsl(0_0%_100%/0.04)]",
              )}
            >
              {scope === s.id && (
                <motion.div
                  layoutId="scope-indicator"
                  className="absolute inset-0 rounded-lg bg-[hsl(280_60%_50%/0.15)] shadow-[inset_0_1px_0_hsl(280_50%_60%/0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Center: Session mode + timer + advisors */}
        <div className="flex items-center gap-4">
          {/* Session mode */}
          <div className="flex items-center gap-2">
            <Radio size={12} style={{ color: pulseColor, opacity: 0.7 }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: pulseColor, opacity: 0.8 }}>
              {modeLabels[sessionMode]}
            </span>
          </div>

          {/* Live session timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)]">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: pulseColor }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono font-semibold text-[hsl(0_0%_100%/0.5)] tabular-nums">
              {timerStr}
            </span>
          </div>

          {/* Active advisor avatars */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {ADVISOR_COLORS.slice(0, 4).map((color, i) => (
                <motion.div
                  key={i}
                  className="w-5 h-5 rounded-full border border-[hsl(220_18%_5%)]"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                  animate={i === 0 ? { scale: [1, 1.15, 1] } : {}}
                  transition={i === 0 ? { duration: 2, repeat: Infinity } : {}}
                />
              ))}
            </div>
            <span className="text-[9px] font-medium text-[hsl(0_0%_100%/0.3)]">
              6 online
            </span>
          </div>
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

      {/* Ambient pulse bar */}
      <div className="h-[2px] w-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${pulseColor} 50%, transparent 100%)`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            x: ["-30%", "30%", "-30%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
