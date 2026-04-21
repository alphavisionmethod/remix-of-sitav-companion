import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel, NeonRing, CinematicBackground } from "./boardroom-primitives";
import { Brain, ChevronRight } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";
import { MobileAdvisorDetailView } from "./MobileAdvisorDetailView";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

const domainColors: Record<string, string> = {
  business: "#a855f7", money: "#34d399", concierge: "#f59e0b", growth: "#3b82f6",
  trust: "#14b8a6", opportunity: "#f97316", recovery: "#94a3b8", boardroom: "#6366f1",
  family: "#f43f5e", general: "#a78bfa",
};

const domainGradientStrips: Record<string, string> = {
  business: "from-purple-600 to-purple-400",
  money: "from-emerald-500 to-emerald-300",
  concierge: "from-amber-500 to-amber-300",
  growth: "from-blue-500 to-cyan-400",
  trust: "from-teal-500 to-teal-300",
  opportunity: "from-orange-500 to-yellow-400",
  recovery: "from-slate-500 to-slate-400",
  boardroom: "from-indigo-600 to-purple-500",
  family: "from-rose-500 to-pink-400",
  general: "from-purple-500 to-amber-400",
};

interface MobileAdvisorBoardProps {
  advisors: AdvisorConfig[];
  onAdvisorClick?: (advisor: AdvisorConfig) => void;
  className?: string;
}

export const MobileAdvisorBoard = ({ advisors, onAdvisorClick, className }: MobileAdvisorBoardProps) => {
  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / (advisors.length || 1));
  const [expandedAdvisor, setExpandedAdvisor] = useState<AdvisorConfig | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleCardClick = (advisor: AdvisorConfig) => {
    setExpandedAdvisor(advisor);
  };

  return (
    <>
      <CinematicBackground className={cn("rounded-2xl min-h-[400px] pb-6", className)}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <GlassPanel className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Advisory Board</h2>
                <p className="text-[9px] text-white/40">{advisors.length} advisors active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{avgConfidence}%</p>
              <p className="text-[9px] text-white/40">Consensus</p>
            </div>
          </GlassPanel>
        </div>

        {/* 85vw Horizontal Snap Cards */}
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 scrollbar-none"
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / (el.scrollWidth / advisors.length));
            setActiveIdx(Math.min(idx, advisors.length - 1));
          }}
        >
          {advisors.map((advisor, i) => {
            const color = domainColors[advisor.domain] || "#a78bfa";
            const strip = domainGradientStrips[advisor.domain] || domainGradientStrips.general;
            return (
              <motion.div
                key={advisor.id}
                className="snap-center shrink-0"
                style={{ width: "85vw", maxWidth: 340 }}
                initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlassPanel
                  className="relative overflow-hidden h-[320px] flex flex-col items-center justify-between"
                  onClick={() => handleCardClick(advisor)}
                >
                  {/* Domain gradient header strip */}
                  <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", strip)} />

                  <div className="flex flex-col items-center gap-3 pt-6 relative z-10">
                    <NeonRing color={color} active={advisor.status === "active"} intensity={advisor.confidence}>
                      <motion.div layoutId={`portrait-${advisor.id}`}>
                        <AdvisorPortrait
                          domain={advisor.domain as AdvisorDomain}
                          name={advisor.name}
                          status={advisor.status}
                          size="xl"
                          avatarUrl={advisor.avatarUrl}
                        />
                      </motion.div>
                    </NeonRing>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{advisor.name}</p>
                      <p className="text-[10px] text-white/40">{advisor.role?.split(" ").slice(0, 2).join(" ")}</p>
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="relative z-10 w-full px-5 pb-4">
                    <div className="flex items-end justify-center gap-1 h-10 mb-2">
                      {Array.from({ length: 12 }).map((_, j) => (
                        <motion.div
                          key={j}
                          className="w-2 rounded-full"
                          style={{ backgroundColor: `${color}40`, height: 6 + Math.random() * 24 }}
                          animate={{ height: 6 + Math.random() * 24 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: j * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-white/30">Confidence</span>
                      <span className="text-xs font-bold text-white/70">{advisor.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-white/30 mt-2">
                      <span>Tap for details</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Swipe indicator dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {advisors.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIdx ? "w-5 h-1.5 bg-white/60" : "w-1.5 h-1.5 bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Consensus Bar */}
        <div className="px-4">
          <GlassPanel className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/50 uppercase tracking-wider">Board Consensus</span>
              <span className="text-sm font-bold text-white">{avgConfidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-emerald-400 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${avgConfidence}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </GlassPanel>
        </div>
      </CinematicBackground>

      {/* Full-screen detail overlay */}
      <AnimatePresence>
        {expandedAdvisor && (
          <MobileAdvisorDetailView
            advisor={expandedAdvisor}
            onClose={() => setExpandedAdvisor(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};