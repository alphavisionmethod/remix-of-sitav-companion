import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel, CinematicBackground } from "./boardroom-primitives";
import { Brain, ChevronRight } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

interface MobileAdvisorBoardProps {
  advisors: AdvisorConfig[];
  onAdvisorClick?: (advisor: AdvisorConfig) => void;
  className?: string;
}

export const MobileAdvisorBoard = ({ advisors, onAdvisorClick, className }: MobileAdvisorBoardProps) => {
  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / (advisors.length || 1));

  return (
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

      {/* Horizontal Scroll Cards */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4 scrollbar-none">
        {advisors.map((advisor, i) => (
          <motion.div
            key={advisor.id}
            className="snap-center shrink-0 w-[200px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassPanel
              className="p-4 h-[260px] flex flex-col items-center justify-between"
              onClick={() => onAdvisorClick?.(advisor)}
            >
              <div className="flex flex-col items-center gap-2">
                <AdvisorPortrait
                  domain={advisor.domain as AdvisorDomain}
                  name={advisor.name}
                  status={advisor.status}
                  size="lg"
                />
                <p className="text-xs font-bold text-white text-center">{advisor.name}</p>
                <p className="text-[10px] text-white/40">{advisor.role?.split(" ").slice(0, 2).join(" ")}</p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">Confidence</span>
                  <span className="text-white font-bold">{advisor.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${advisor.confidence}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  />
                </div>
                <div className="flex items-center justify-center gap-1 text-[9px] text-white/30 mt-1">
                  <span>View details</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </GlassPanel>
          </motion.div>
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
  );
};