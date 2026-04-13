import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageCircle, Sparkles } from "lucide-react";
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

  const domains = scope === "global" ? ["business", "finance", "concierge"] : [scope];
  const allAdvisors: AdvisorRole[] = [];
  domains.forEach(d => {
    const roster = getAdvisorRoster(d);
    allAdvisors.push(...roster.advisors);
  });

  const speakingId = scope === "global" ? "biz-revenue" : SPEAKING_ADVISOR_MAP[scope] || allAdvisors[0]?.id;
  const topic = TOPIC_MAP[scope] || TOPIC_MAP.global;

  // For compact mode, show only first 4
  const displayAdvisors = compact ? allAdvisors.slice(0, 4) : allAdvisors;
  const avatarSize = compact ? "w-12 h-12" : "w-16 h-16";
  const fontSize = compact ? "text-[9px]" : "text-[10px]";

  return (
    <div className="relative">
      {/* Cinematic background */}
      <div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 55%, hsl(280 40% 12% / 0.6), transparent 80%)",
        }}
      />

      <div className={cn("rounded-2xl border border-[hsl(280_50%_50%/0.12)] p-5", compact ? "p-3" : "p-6")}>
        {/* Header */}
        {!compact && (
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(280_50%_55%)] to-[hsl(280_60%_40%)] flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.85)]">The Council</p>
              <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">{allAdvisors.length} advisors in session</p>
            </div>
          </div>
        )}

        {/* Arc layout */}
        <div className="flex flex-col items-center gap-4">
          {/* Top arc row */}
          <div className="flex items-end justify-center gap-3 flex-wrap">
            {displayAdvisors.slice(0, Math.ceil(displayAdvisors.length / 2)).map((adv, i) => {
              const isSpeaking = adv.id === speakingId;
              const isHovered = hoveredAdvisor === adv.id;
              return (
                <motion.button
                  key={adv.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onSelectAdvisor?.(adv.id)}
                  onMouseEnter={() => setHoveredAdvisor(adv.id)}
                  onMouseLeave={() => setHoveredAdvisor(null)}
                  className="flex flex-col items-center gap-1.5 group relative"
                >
                  {/* Speaking spotlight */}
                  {isSpeaking && (
                    <motion.div
                      className="absolute -inset-2 rounded-2xl -z-10"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      style={{
                        background: `radial-gradient(ellipse at center, ${adv.accentColor}25, transparent 70%)`,
                      }}
                    />
                  )}
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={cn(
                        avatarSize,
                        "rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300",
                        compact ? "text-base" : "text-xl",
                        isSpeaking && "ring-2 ring-offset-2 ring-offset-[hsl(220_18%_4%)]",
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)`,
                        ringColor: isSpeaking ? adv.accentColor : undefined,
                        boxShadow: isSpeaking
                          ? `0 0 24px ${adv.accentColor}40, 0 0 48px ${adv.accentColor}15`
                          : isHovered
                          ? `0 0 16px ${adv.accentColor}25`
                          : "none",
                      }}
                    >
                      <span className={compact ? "text-lg" : "text-2xl"}>{adv.emoji}</span>
                    </div>
                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(152_55%_48%)] border-2 border-[hsl(220_18%_4%)] flex items-center justify-center"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <MessageCircle size={8} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-center max-w-[80px]">
                    <p className={cn(fontSize, "font-semibold text-[hsl(0_0%_100%/0.75)] leading-tight truncate")}>
                      {adv.name.replace(" Advisor", "")}
                    </p>
                    <p className="text-[8px] font-medium truncate" style={{ color: `${adv.accentColor}cc` }}>
                      {adv.role}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Center topic card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "rounded-xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.06)] backdrop-blur-sm relative overflow-hidden",
              compact ? "px-3 py-2 max-w-[260px]" : "px-5 py-3 max-w-[380px]",
            )}
          >
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(ellipse at center, hsl(280 50% 50% / 0.08), transparent 80%)",
              }}
            />
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={10} className="text-[hsl(280_50%_65%)]" />
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[hsl(280_50%_65%/0.6)]">
                Current Topic
              </span>
            </div>
            <p className={cn("text-[hsl(0_0%_100%/0.85)] font-semibold leading-tight", compact ? "text-[10px]" : "text-[12px]")}>
              {topic}
            </p>
          </motion.div>

          {/* Bottom arc row */}
          {!compact && displayAdvisors.length > Math.ceil(displayAdvisors.length / 2) && (
            <div className="flex items-start justify-center gap-3 flex-wrap">
              {displayAdvisors.slice(Math.ceil(displayAdvisors.length / 2)).map((adv, i) => {
                const isSpeaking = adv.id === speakingId;
                const isHovered = hoveredAdvisor === adv.id;
                return (
                  <motion.button
                    key={adv.id}
                    type="button"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    onClick={() => onSelectAdvisor?.(adv.id)}
                    onMouseEnter={() => setHoveredAdvisor(adv.id)}
                    onMouseLeave={() => setHoveredAdvisor(null)}
                    className="flex flex-col items-center gap-1.5 group relative"
                  >
                    {isSpeaking && (
                      <motion.div
                        className="absolute -inset-2 rounded-2xl -z-10"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        style={{
                          background: `radial-gradient(ellipse at center, ${adv.accentColor}25, transparent 70%)`,
                        }}
                      />
                    )}
                    <div className="relative">
                      <div
                        className={cn(
                          avatarSize,
                          "rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 text-xl",
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)`,
                          boxShadow: isSpeaking
                            ? `0 0 24px ${adv.accentColor}40, 0 0 48px ${adv.accentColor}15`
                            : isHovered
                            ? `0 0 16px ${adv.accentColor}25`
                            : "none",
                        }}
                      >
                        <span className="text-2xl">{adv.emoji}</span>
                      </div>
                      {isSpeaking && (
                        <motion.div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(152_55%_48%)] border-2 border-[hsl(220_18%_4%)] flex items-center justify-center"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <MessageCircle size={8} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                    <div className="text-center max-w-[80px]">
                      <p className={cn(fontSize, "font-semibold text-[hsl(0_0%_100%/0.75)] leading-tight truncate")}>
                        {adv.name.replace(" Advisor", "")}
                      </p>
                      <p className="text-[8px] font-medium truncate" style={{ color: `${adv.accentColor}cc` }}>
                        {adv.role}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
