import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, Sparkles, Mic, Play, Pause } from "lucide-react";
import { getAdvisorRoster, type AdvisorRole } from "@/lib/advisor-topology";
import { TalkingAvatar } from "./TalkingAvatar";

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
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);

  const domains = scope === "global" ? ["business", "finance", "concierge"] : [scope];
  const allAdvisors: AdvisorRole[] = [];
  domains.forEach(d => {
    const roster = getAdvisorRoster(d);
    allAdvisors.push(...roster.advisors);
  });

  const displayAdvisors = compact ? allAdvisors.slice(0, 4) : allAdvisors;
  const topic = TOPIC_MAP[scope] || TOPIC_MAP.global;

  // Auto-play cycling
  React.useEffect(() => {
    if (!autoPlay || displayAdvisors.length === 0) return;
    const interval = setInterval(() => {
      setAutoPlayIndex(prev => (prev + 1) % displayAdvisors.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, displayAdvisors.length]);

  const speakingId = autoPlay
    ? displayAdvisors[autoPlayIndex]?.id
    : scope === "global" ? "biz-revenue" : SPEAKING_ADVISOR_MAP[scope] || allAdvisors[0]?.id;

  const avatarSize = compact ? 56 : 96;
  const ringSize = compact ? 64 : 108;

  function renderSeat(adv: AdvisorRole, i: number, fromBottom = false) {
    const isSpeaking = adv.id === speakingId;
    const isHovered = hoveredAdvisor === adv.id;
    const isIdle = !isSpeaking && !isHovered;

    return (
      <motion.button
        key={adv.id}
        type="button"
        initial={{ opacity: 0, y: fromBottom ? -20 : 20, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSelectAdvisor?.(adv.id)}
        onMouseEnter={() => setHoveredAdvisor(adv.id)}
        onMouseLeave={() => setHoveredAdvisor(null)}
        className={cn(
          "flex flex-col items-center gap-2.5 group relative transition-opacity duration-500",
          isIdle && "opacity-70 hover:opacity-100",
        )}
      >
        {/* Cinematic spotlight cone for speaking advisor */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute -inset-6 rounded-3xl -z-10 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{
                background: `radial-gradient(ellipse 100% 120% at 50% 20%, ${adv.accentColor}35, transparent 65%)`,
              }}
            />
            {/* Sparkle particles */}
            {[...Array(3)].map((_, pi) => (
              <motion.div
                key={pi}
                className="absolute w-1 h-1 rounded-full -z-5 pointer-events-none"
                style={{ background: adv.accentColor }}
                animate={{
                  y: [-10, -30 - pi * 8],
                  x: [(-1 + pi) * 12, (-1 + pi) * 18],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 2 + pi * 0.5, delay: pi * 0.4, ease: "easeOut" }}
              />
            ))}
          </>
        )}

        {/* Avatar with dramatic glowing ring */}
        <div className="relative">
          {/* Ambient shadow/glow beneath */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full blur-xl -z-10 pointer-events-none"
            style={{
              width: ringSize * 0.8,
              height: ringSize * 0.3,
              background: adv.accentColor,
            }}
            animate={isSpeaking ? { opacity: [0.15, 0.35, 0.15] } : { opacity: 0.08 }}
            transition={isSpeaking ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : {}}
          />

          {/* Outer glow ring */}
          <div
            className="rounded-full flex items-center justify-center transition-all duration-500"
            style={{
              width: ringSize,
              height: ringSize,
              background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}44)`,
              padding: "3px",
              boxShadow: isSpeaking
                ? `0 0 36px ${adv.accentColor}50, 0 0 72px ${adv.accentColor}20, inset 0 0 16px ${adv.accentColor}12`
                : isHovered
                ? `0 0 24px ${adv.accentColor}35, 0 0 48px ${adv.accentColor}12`
                : `0 0 8px ${adv.accentColor}12`,
            }}
          >
            {/* Talking Avatar Portrait */}
            <TalkingAvatar
              speaking={isSpeaking}
              avatarUrl={adv.avatarUrl}
              accentColor={adv.accentColor}
              size={avatarSize}
              name={adv.name}
              emoji={adv.emoji}
            />
          </div>

          {/* Speaking double-pulse rings */}
          {isSpeaking && (
            <>
              <motion.div
                className="absolute inset-[-6px] rounded-full border-2 pointer-events-none"
                style={{ borderColor: `${adv.accentColor}55` }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-[-12px] rounded-full border pointer-events-none"
                style={{ borderColor: `${adv.accentColor}25` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
              />
            </>
          )}

          {/* Mic indicator for speaking */}
          {isSpeaking && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[hsl(220_18%_6%)]"
              style={{ background: adv.accentColor }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic size={11} className="text-white" />
            </motion.div>
          )}

          {/* Status dot (non-speaking) */}
          {!isSpeaking && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[hsl(152_55%_48%)] border-2 border-[hsl(220_18%_6%)]" />
          )}
        </div>

        {/* Frosted glass nameplate */}
        <div
          className={cn(
            "rounded-xl px-4 py-2 text-center backdrop-blur-md border transition-all duration-300",
            isSpeaking
              ? "bg-[hsl(0_0%_100%/0.08)] border-[hsl(0_0%_100%/0.15)] shadow-lg"
              : "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.06)] group-hover:bg-[hsl(0_0%_100%/0.08)]",
          )}
          style={{
            maxWidth: compact ? 90 : 120,
            boxShadow: isSpeaking ? `0 4px 20px ${adv.accentColor}15` : undefined,
          }}
        >
          <p className={cn(
            "font-bold leading-tight truncate text-[hsl(0_0%_100%/0.9)]",
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
          {!compact && (
            <p className="text-[7px] text-[hsl(0_0%_100%/0.25)] mt-0.5 truncate">
              {adv.specialty.split(",")[0]}
            </p>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      {/* Theatrical vignette */}
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(280 40% 8% / 0.9), transparent 85%)",
          boxShadow: "inset 0 0 80px hsl(0 0% 0% / 0.4)",
        }}
      />

      <div className={cn("rounded-2xl border border-[hsl(280_50%_50%/0.12)]", compact ? "p-3" : "p-8")}>
        {/* Header */}
        {!compact && (
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(280_50%_55%)] to-[hsl(280_60%_35%)] flex items-center justify-center shadow-lg">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[hsl(0_0%_100%/0.92)]">The Advisory Council</p>
              <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">{allAdvisors.length} advisors in session · Live deliberation</p>
            </div>
            <button
              onClick={() => { setAutoPlay(p => !p); setAutoPlayIndex(0); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(280_50%_55%/0.3)] bg-[hsl(280_40%_50%/0.1)] hover:bg-[hsl(280_40%_50%/0.2)] transition-colors text-[10px] font-bold text-[hsl(280_50%_75%)]"
            >
              {autoPlay ? <Pause size={11} /> : <Play size={11} />}
              {autoPlay ? "Pause" : "▶ Watch Discussion"}
            </button>
          </div>
        )}

        {/* Arc layout */}
        <div className="flex flex-col items-center gap-6">
          {/* Top arc */}
          <div className="flex items-end justify-center gap-5 flex-wrap">
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
              "rounded-xl border border-[hsl(280_50%_50%/0.3)] relative overflow-hidden",
              compact ? "px-3 py-2 max-w-[260px]" : "px-8 py-5 max-w-[460px]",
            )}
            style={{
              background: "linear-gradient(135deg, hsl(280 40% 12% / 0.7), hsl(280 30% 8% / 0.5))",
              boxShadow: "0 0 60px hsl(280 50% 50% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
            }}
          >
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(ellipse 140% 110% at 50% 0%, hsl(280 60% 50% / 0.15), transparent 55%)",
              }}
            />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-[hsl(280_50%_70%)]" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[hsl(280_50%_70%/0.7)]">
                Active Deliberation
              </span>
            </div>
            <p className={cn("text-[hsl(0_0%_100%/0.92)] font-semibold leading-snug", compact ? "text-[10px]" : "text-[14px]")}>
              {topic}
            </p>
          </motion.div>

          {/* Bottom arc */}
          {!compact && displayAdvisors.length > Math.ceil(displayAdvisors.length / 2) && (
            <div className="flex items-start justify-center gap-5 flex-wrap">
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
