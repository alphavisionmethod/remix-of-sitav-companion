import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel } from "./boardroom-primitives";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

const domainTitles: Record<string, string> = {
  business: "Business Growth Advisor",
  money: "Financial Strategist",
  concierge: "Concierge Planner",
  growth: "Growth Architect",
  trust: "Trust & Compliance",
  opportunity: "Opportunity Scout",
  recovery: "Recovery Specialist",
  boardroom: "Boardroom Chairman",
  family: "Family Office Advisor",
  general: "Chief Intelligence",
};

const domainAuras: Record<string, string> = {
  business: "from-purple-600/30 via-purple-500/10 to-transparent",
  money: "from-emerald-600/30 via-emerald-500/10 to-transparent",
  concierge: "from-amber-500/30 via-amber-400/10 to-transparent",
  growth: "from-blue-500/30 via-cyan-400/10 to-transparent",
  trust: "from-teal-500/30 via-teal-400/10 to-transparent",
  opportunity: "from-orange-500/30 via-yellow-400/10 to-transparent",
  recovery: "from-slate-500/30 via-slate-400/10 to-transparent",
  boardroom: "from-indigo-600/30 via-purple-500/10 to-transparent",
  family: "from-rose-500/30 via-pink-400/10 to-transparent",
  general: "from-purple-500/30 via-amber-400/10 to-transparent",
};

interface AdvisorShowcaseCardProps {
  advisor: AdvisorConfig;
  onClick?: () => void;
  className?: string;
}

export const AdvisorShowcaseCard = ({ advisor, onClick, className }: AdvisorShowcaseCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [highlight, setHighlight] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);
  const aura = domainAuras[advisor.domain] || domainAuras.general;
  const title = domainTitles[advisor.domain] || "Advisor";

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    setTilt({ rotateX: -py * 8, rotateY: px * 8 });
    setHighlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ perspective: 800 }}
    >
      <motion.div
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <GlassPanel className="relative overflow-hidden p-5 h-[340px] flex flex-col items-center justify-between">
          {/* Aura glow */}
          <div className={cn("absolute inset-0 bg-gradient-radial", aura, "opacity-60 pointer-events-none")} />

          {/* Cursor highlight gradient */}
          {hovered && (
            <div
              className="absolute inset-0 pointer-events-none opacity-30 transition-opacity"
              style={{
                background: `radial-gradient(circle at ${highlight.x}% ${highlight.y}%, rgba(255,255,255,0.15), transparent 60%)`,
              }}
            />
          )}

          {/* Portrait */}
          <div className="relative z-10 flex flex-col items-center gap-3 pt-4">
            <motion.div
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AdvisorPortrait
                domain={advisor.domain as AdvisorDomain}
                name={advisor.name}
                status={advisor.status}
                size="xl"
                avatarUrl={advisor.avatarUrl}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">{advisor.name}</p>
              <p className="text-[11px] text-white/50">{title}</p>
            </div>
          </div>

          {/* Mini visualization */}
          <div className="relative z-10 w-full mt-4">
            <div className="flex items-end justify-center gap-1 h-12">
              {Array.from({ length: 12 }).map((_, i) => {
                const h = 8 + Math.random() * 28;
                return (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-white/20"
                    style={{ height: h }}
                    animate={hovered ? { height: 8 + Math.random() * 28 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.03 }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-white/30">Confidence</span>
              <span className="text-xs font-bold text-white/70">{advisor.confidence}%</span>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
};