import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel, HolographicGauge, NeonRing, FloatingMetricCard, DataPulseLine, CinematicBackground } from "./boardroom-primitives";
import { Brain } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

const domainColors: Record<string, string> = {
  business: "#a855f7", money: "#34d399", concierge: "#f59e0b", growth: "#3b82f6",
  trust: "#14b8a6", opportunity: "#f97316", recovery: "#94a3b8", boardroom: "#6366f1",
  family: "#f43f5e", general: "#a78bfa",
};

const domainMetrics: Record<string, { label: string; value: string }> = {
  business: { label: "Revenue Impact", value: "+$12.4K" },
  money: { label: "Portfolio", value: "$3,800" },
  concierge: { label: "Tasks Done", value: "24/28" },
  growth: { label: "Growth Rate", value: "+18%" },
  trust: { label: "Trust Score", value: "94%" },
  opportunity: { label: "Opportunities", value: "7 Active" },
  recovery: { label: "Risk Level", value: "Low" },
  boardroom: { label: "Decisions", value: "12 Made" },
  family: { label: "Events", value: "3 Upcoming" },
  general: { label: "Insights", value: "16 New" },
};

interface ImmersiveBoardroomCouncilProps {
  advisors: AdvisorConfig[];
  onAdvisorClick?: (advisor: AdvisorConfig) => void;
  className?: string;
}

export const ImmersiveBoardroomCouncil = ({ advisors, onAdvisorClick, className }: ImmersiveBoardroomCouncilProps) => {
  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / (advisors.length || 1));
  const consensus = Math.round(avgConfidence * 0.9 + 10);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 360 });

  // Consensus-based HUD glow color
  const hudGlow = consensus > 75 ? "#34d399" : consensus > 50 ? "#f59e0b" : "#ef4444";

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(e.contentRect.height, 320) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute seat positions
  const hubX = dims.w / 2;
  const hubY = 40;
  const radiusX = dims.w * 0.42;
  const radiusY = dims.h * 0.38;
  const seats = advisors.map((_, i) => {
    const total = advisors.length;
    const angleRange = Math.PI * 0.85;
    const startAngle = (Math.PI - angleRange) / 2;
    const angle = startAngle + (total > 1 ? (i / (total - 1)) * angleRange : angleRange / 2);
    return {
      x: hubX + Math.cos(angle) * radiusX,
      y: hubY + 60 + Math.sin(angle) * radiusY,
    };
  });

  return (
    <CinematicBackground className={cn("rounded-2xl min-h-[600px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <GlassPanel className="px-4 py-2 flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-400" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">EXECUTIVE'S BOARDROOM</h2>
            <p className="text-[10px] text-white/40">Session #247 — {advisors.length} Advisors Active</p>
          </div>
        </GlassPanel>
        <GlassPanel className="px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-[10px] text-white/50">LIVE</span>
          <motion.span
            className="inline-block h-2 w-2 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </GlassPanel>
      </div>

      {/* Main Council Layout */}
      <div className="relative flex flex-col items-center justify-center px-6 py-8">
        {/* Central HUD with breathing glow */}
        <div className="relative z-20 flex flex-col items-center mb-8">
          <motion.div
            className="absolute inset-[-12px] rounded-3xl pointer-events-none"
            style={{ boxShadow: `0 0 40px ${hudGlow}30, 0 0 80px ${hudGlow}15` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <GlassPanel className="p-6 flex flex-col items-center gap-4 relative" glow={hudGlow}>
            {/* Hexagonal frame effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: `linear-gradient(135deg, ${hudGlow}20, transparent)`,
              }}
            />
            <div className="flex gap-8">
              <div className="relative">
                <HolographicGauge value={consensus} label="Consensus" size={100} color="#a78bfa" />
              </div>
              <div className="relative">
                <HolographicGauge value={avgConfidence} label="Confidence" size={100} color="#34d399" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <NeonRing color="#a78bfa" active intensity={90}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </NeonRing>
              <span className="text-xs text-white/60 font-medium">SITA Intelligence</span>
            </div>
          </GlassPanel>
        </div>

        {/* Semicircular Advisor Layout */}
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto" style={{ height: 360 }}>
          {/* SVG connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {seats.map((seat, i) => (
              <DataPulseLine
                key={`line-${i}`}
                x1={hubX} y1={hubY}
                x2={seat.x} y2={seat.y}
                color={domainColors[advisors[i].domain] || "#a78bfa"}
              />
            ))}
          </svg>

          {advisors.map((advisor, index) => {
            const seat = seats[index];
            const color = domainColors[advisor.domain] || "#a78bfa";
            const metric = domainMetrics[advisor.domain] || { label: "Status", value: "Active" };
            const isHovered = hoveredIdx === index;
            const isDimmed = hoveredIdx !== null && hoveredIdx !== index;

            return (
              <motion.div
                key={advisor.id}
                className="absolute flex flex-col items-center gap-2 cursor-pointer"
                style={{ left: seat.x, top: seat.y, transform: "translate(-50%, -50%)" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isDimmed ? 0.5 : 1,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onAdvisorClick?.(advisor)}
              >
                <NeonRing
                  color={color}
                  active={advisor.status === "active" || advisor.status === "thinking"}
                  intensity={advisor.confidence}
                >
                  <AdvisorPortrait
                    domain={advisor.domain as AdvisorDomain}
                    name={advisor.name}
                    status={advisor.status}
                    size="lg"
                    avatarUrl={advisor.avatarUrl}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </NeonRing>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white">{advisor.name.split(" ")[0]}</p>
                  <p className="text-[9px] text-white/40">{advisor.role?.split(" ").slice(0, 2).join(" ")}</p>
                </div>
                {isHovered && (
                  <FloatingMetricCard label={metric.label} value={metric.value} className="absolute -right-20 -top-2" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </CinematicBackground>
  );
};