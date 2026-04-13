import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, MessageCircle, Sparkles, Mic } from "lucide-react";
import { getAdvisorRoster, ADVISOR_ROSTERS, type AdvisorRole } from "@/lib/advisor-topology";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onSelectAdvisor?: (advisorId: string) => void;
  compact?: boolean;
}

const SPEAKING_ADVISOR_MAP: Record<string, string> = {
  business: "biz-revenue",
  finance: "fin-obligations",
  concierge: "con-travel",
};

const TOPIC_MAP: Record<string, string> = {
  global: "Cross-domain strategic review — Q2 priorities",
  business: "Collections action review — 3 overdue invoices totaling $18,500",
  finance: "Reserve shortfall resolution — $2,800 below target",
  concierge: "Travel prep decision — NYC client visit Apr 22-24",
};

export function BoardroomAdvisorCouncil({ scope, onSelectAdvisor, compact = false }: Props) {
  const [hoveredAdvisor, setHoveredAdvisor] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const domains = scope === "global" ? ["business", "finance", "concierge"] : [scope];
  const allAdvisors: AdvisorRole[] = [];
  domains.forEach(d => {
    const roster = getAdvisorRoster(d);
    allAdvisors.push(...roster.advisors);
  });

  const speakingId = scope === "global" ? "biz-revenue" : SPEAKING_ADVISOR_MAP[scope] || allAdvisors[0]?.id;
  const topic = TOPIC_MAP[scope] || TOPIC_MAP.global;
  const displayAdvisors = compact ? allAdvisors.slice(0, 4) : allAdvisors;

  const avatarSize = compact ? 48 : 72;
  const ringSize = compact ? 56 : 84;

  function handleImgError(id: string) {
    setImgErrors(prev => new Set(prev).add(id));
  }

  function renderSeat(adv: AdvisorRole, i: number, fromBottom = false) {
    const isSpeaking = adv.id === speakingId;
    const isHovered = hoveredAdvisor === adv.id;
    const hasImgError = imgErrors.has(adv.id);

    return (
      <motion.button
        key={adv.id}
        type="button"
        initial={{ opacity: 0, y: fromBottom ? -16 : 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: i * 0.07, type: "spring", stiffness: 200 }}
        onClick={() => onSelectAdvisor?.(adv.id)}
        onMouseEnter={() => setHoveredAdvisor(adv.id)}
        onMouseLeave={() => setHoveredAdvisor(null)}
        className="flex flex-col items-center gap-2 group relative"
      >
        {/* Spotlight cone for speaking advisor */}
        {isSpeaking && (
          <motion.div
            className="absolute -inset-4 rounded-3xl -z-10"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(ellipse 80% 100% at 50% 30%, ${adv.accentColor}30, transparent 70%)`,
            }}
          />
        )}

        {/* Avatar with glowing ring */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="rounded-full flex items-center justify-center transition-all duration-500"
            style={{
              width: ringSize,
              height: ringSize,
              background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}55)`,
              padding: "3px",
              boxShadow: isSpeaking
                ? `0 0 28px ${adv.accentColor}50, 0 0 56px ${adv.accentColor}20, inset 0 0 12px ${adv.accentColor}15`
                : isHovered
                ? `0 0 20px ${adv.accentColor}30, 0 0 40px ${adv.accentColor}10`
                : `0 0 6px ${adv.accentColor}15`,
            }}
          >
            {/* Inner portrait */}
            <div
              className="rounded-full overflow-hidden bg-[hsl(220_18%_6%)]"
              style={{ width: avatarSize, height: avatarSize }}
            >
              {!hasImgError && adv.avatarUrl ? (
                <img
                  src={adv.avatarUrl}
                  alt={adv.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImgError(adv.id)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold"
                  style={{ background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)` }}
                >
                  <span className={compact ? "text-xl" : "text-3xl"}>{adv.emoji}</span>
                </div>
              )}
            </div>
          </div>

          {/* Speaking animated ring */}
          {isSpeaking && (
            <motion.div
              className="absolute inset-[-5px] rounded-full border-2 pointer-events-none"
              style={{ borderColor: `${adv.accentColor}50` }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}

          {/* Speaking mic indicator */}
          {isSpeaking && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[hsl(220_18%_6%)]"
              style={{ background: adv.accentColor }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic size={9} className="text-white" />
            </motion.div>
          )}

          {/* Status dot (non-speaking) */}
          {!isSpeaking && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[hsl(152_55%_48%)] border-2 border-[hsl(220_18%_6%)]" />
          )}
        </div>

        {/* Glass name card */}
        <div
          className={cn(
            "rounded-lg px-3 py-1.5 text-center transition-all duration-300 backdrop-blur-sm border",
            isSpeaking
              ? "bg-[hsl(0_0%_100%/0.06)] border-[hsl(0_0%_100%/0.12)]"
              : "bg-[hsl(0_0%_100%/0.03)] border-[hsl(0_0%_100%/0.06)] group-hover:bg-[hsl(0_0%_100%/0.06)]",
          )}
          style={{ maxWidth: compact ? 80 : 100 }}
        >
          <p className={cn(
            "font-bold leading-tight truncate text-[hsl(0_0%_100%/0.85)]",
            compact ? "text-[9px]" : "text-[11px]",
          )}>
            {adv.name.replace(" Advisor", "")}
          </p>
          <p
            className={cn("font-semibold truncate", compact ? "text-[7px]" : "text-[9px]")}
            style={{ color: `${adv.accentColor}cc` }}
          >
            {adv.role}
          </p>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      {/* Deep cinematic background */}
      <div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(280 40% 8% / 0.8), transparent 85%)",
        }}
      />

      <div className={cn("rounded-2xl border border-[hsl(280_50%_50%/0.12)]", compact ? "p-3" : "p-6")}>
        {/* Header */}
        {!compact && (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(280_50%_55%)] to-[hsl(280_60%_35%)] flex items-center justify-center shadow-lg">
              <Brain size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[hsl(0_0%_100%/0.9)]">The Advisory Council</p>
              <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">{allAdvisors.length} advisors in session · Live deliberation</p>
            </div>
          </div>
        )}

        {/* Arc layout */}
        <div className="flex flex-col items-center gap-5">
          {/* Top arc */}
          <div className="flex items-end justify-center gap-4 flex-wrap">
            {displayAdvisors.slice(0, Math.ceil(displayAdvisors.length / 2)).map((adv, i) =>
              renderSeat(adv, i)
            )}
          </div>

          {/* Center topic spotlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className={cn(
              "rounded-xl border border-[hsl(280_50%_50%/0.25)] relative overflow-hidden",
              compact ? "px-3 py-2 max-w-[260px]" : "px-6 py-4 max-w-[420px]",
            )}
            style={{
              background: "linear-gradient(135deg, hsl(280 40% 12% / 0.6), hsl(280 30% 8% / 0.4))",
              boxShadow: "0 0 40px hsl(280 50% 50% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
            }}
          >
            {/* Radial spotlight */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(ellipse 120% 100% at 50% 0%, hsl(280 60% 50% / 0.12), transparent 60%)",
              }}
            />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={11} className="text-[hsl(280_50%_70%)]" />
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[hsl(280_50%_70%/0.6)]">
                Active Deliberation
              </span>
            </div>
            <p className={cn("text-[hsl(0_0%_100%/0.9)] font-semibold leading-snug", compact ? "text-[10px]" : "text-[13px]")}>
              {topic}
            </p>
          </motion.div>

          {/* Bottom arc */}
          {!compact && displayAdvisors.length > Math.ceil(displayAdvisors.length / 2) && (
            <div className="flex items-start justify-center gap-4 flex-wrap">
              {displayAdvisors.slice(Math.ceil(displayAdvisors.length / 2)).map((adv, i) =>
                renderSeat(adv, i + Math.ceil(displayAdvisors.length / 2), true)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
