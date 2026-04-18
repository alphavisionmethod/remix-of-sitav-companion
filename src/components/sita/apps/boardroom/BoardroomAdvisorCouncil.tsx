import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, Sparkles, Mic, Play, Pause, CheckCircle, Shield, XCircle, HelpCircle, Lock } from "lucide-react";
import { getAdvisorRoster, type AdvisorRole } from "@/domains/advisors/topology";
import { TalkingAvatar } from "./TalkingAvatar";
import { getAdvisorOutputs } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onSelectAdvisor?: (advisorId: string) => void;
  compact?: boolean;
}

type AdvisorStance = "agree" | "caution" | "dissent" | "unresolved" | "blocked" | "simulation-only" | "verified";

// Fallback stances used when no pipeline data exists
const FALLBACK_STANCES: Record<string, AdvisorStance> = {
  "biz-revenue": "agree",
  "biz-relationship": "caution",
  "biz-followthrough": "agree",
  "biz-support": "unresolved",
  "biz-collections": "agree",
  "biz-operations": "caution",
  "fin-obligations": "agree",
  "fin-spending": "caution",
  "fin-planning": "simulation-only",
  "fin-reserve": "dissent",
  "fin-approvals": "verified",
  "fin-receivables": "agree",
  "con-lifeadmin": "blocked",
  "con-travel": "verified",
  "con-logistics": "agree",
  "con-support": "caution",
  "con-prep": "verified",
  "con-household": "agree",
};

/** Derive stances from live pipeline advisor outputs, falling back to static map */
function deriveDynamicStances(domains: string[]): Record<string, AdvisorStance> {
  const outputs = getAdvisorOutputs();
  if (outputs.length === 0) return FALLBACK_STANCES;

  const dynamicStances: Record<string, AdvisorStance> = { ...FALLBACK_STANCES };

  // Map pipeline advisor IDs to topology advisor IDs
  const advisorIdMap: Record<string, string[]> = {
    "revenue-advisor": ["biz-revenue"],
    "crm-advisor": ["biz-relationship"],
    "lead-recovery-advisor": ["biz-followthrough"],
    "operations-advisor": ["biz-operations", "biz-support"],
    "spending-advisor": ["fin-spending"],
    "reserve-advisor": ["fin-reserve"],
    "obligations-advisor": ["fin-obligations", "fin-approvals"],
    "travel-advisor": ["con-travel"],
    "calendar-advisor": ["con-prep", "con-lifeadmin"],
    "lifestyle-advisor": ["con-logistics", "con-household"],
  };

  for (const output of outputs) {
    const mappedIds = advisorIdMap[output.advisor_id] || [];
    const stance: AdvisorStance =
      output.boardroom_relevance_score > 0.6 && output.confidence >= 70 ? "agree"
      : output.confidence < 40 ? "unresolved"
      : output.risks.length > 0 && output.confidence < 60 ? "dissent"
      : output.risks.length > 0 ? "caution"
      : output.missing_data.length > 0 ? "unresolved"
      : output.boardroom_relevance_score > 0.5 ? "simulation-only"
      : "agree";

    for (const id of mappedIds) {
      dynamicStances[id] = stance;
    }
  }

  return dynamicStances;
}

const STANCE_DOT: Record<AdvisorStance, { color: string; Icon: React.ElementType }> = {
  agree: { color: "hsl(var(--trust-safe))", Icon: CheckCircle },
  caution: { color: "hsl(var(--sita-gold))", Icon: Shield },
  dissent: { color: "hsl(var(--destructive))", Icon: XCircle },
  unresolved: { color: "hsl(0 0% 50%)", Icon: HelpCircle },
  blocked: { color: "hsl(var(--destructive))", Icon: Lock },
  "simulation-only": { color: "hsl(280 50% 65%)", Icon: HelpCircle },
  verified: { color: "hsl(var(--trust-safe))", Icon: CheckCircle },
};

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

  // Derive stances from pipeline data (live) with fallback to static
  const ADVISOR_STANCES = useMemo(() => deriveDynamicStances(domains), [domains.join(",")]);

  const displayAdvisors = compact ? allAdvisors.slice(0, 4) : allAdvisors;
  const topic = TOPIC_MAP[scope] || TOPIC_MAP.global;

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
    const stance = ADVISOR_STANCES[adv.id] || "unresolved";
    const stanceDot = STANCE_DOT[stance];

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

          {/* Stance dot overlay (non-speaking) */}
          {!isSpeaking && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05, type: "spring" }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[hsl(220_18%_6%)]"
              style={{ backgroundColor: `${stanceDot.color}` }}
              title={stance}
            >
              <stanceDot.Icon size={9} className="text-white" />
            </motion.div>
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
          <div className="flex items-center justify-center gap-1.5">
            <p
              className={cn(
                "font-bold leading-tight truncate",
                compact ? "text-[9px]" : "text-[11px]",
              )}
              style={{
                color: isSpeaking ? "hsl(0 0% 100% / 0.95)" : "hsl(0 0% 100% / 0.9)",
                textShadow: isSpeaking ? `0 0 12px ${adv.accentColor}80, 0 0 24px ${adv.accentColor}40` : undefined,
              }}
            >
              {adv.name.replace(" Advisor", "")}
            </p>
            {isSpeaking && (
              <span className="flex items-center gap-1 shrink-0">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[hsl(0_80%_55%)]"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
                <span className="text-[6px] font-black uppercase tracking-[0.1em] text-[hsl(0_80%_65%)]">
                  LIVE
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1">
            <p
              className={cn("font-semibold truncate", compact ? "text-[7px]" : "text-[9px]")}
              style={{ color: `${adv.accentColor}cc` }}
            >
              {adv.role}
            </p>
            {isSpeaking && (
              <span className="flex items-end gap-[1px] h-2.5 shrink-0">
                {[0, 1, 2].map(bi => (
                  <motion.span
                    key={bi}
                    className="w-[2px] rounded-full"
                    style={{ background: adv.accentColor }}
                    animate={{ height: [3, 8 + bi * 2, 4, 10 - bi, 3] }}
                    transition={{ repeat: Infinity, duration: 0.6 + bi * 0.15, delay: bi * 0.1, ease: "easeInOut" }}
                  />
                ))}
              </span>
            )}
          </div>
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
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(280 40% 8% / 0.9), transparent 85%)",
          boxShadow: "inset 0 0 80px hsl(0 0% 0% / 0.4)",
        }}
      />

      <div className={cn("rounded-2xl border border-[hsl(280_50%_50%/0.12)]", compact ? "p-3" : "p-8")}>
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

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-end justify-center gap-5 flex-wrap">
            {displayAdvisors.slice(0, Math.ceil(displayAdvisors.length / 2)).map((adv, i) =>
              renderSeat(adv, i)
            )}
          </div>

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
