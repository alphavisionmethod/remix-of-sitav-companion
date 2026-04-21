import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel, HolographicGauge, NeonRing, FloatingMetricCard, CinematicBackground } from "./boardroom-primitives";
import { Brain } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

const domainColors: Record<string, string> = {
  business: "#a855f7",
  money: "#34d399",
  concierge: "#f59e0b",
  growth: "#3b82f6",
  trust: "#14b8a6",
  opportunity: "#f97316",
  recovery: "#94a3b8",
  boardroom: "#6366f1",
  family: "#f43f5e",
  general: "#a78bfa",
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
  className?: string;
}

export const ImmersiveBoardroomCouncil = ({ advisors, className }: ImmersiveBoardroomCouncilProps) => {
  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / (advisors.length || 1));
  const consensus = Math.round(avgConfidence * 0.9 + 10);

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
        <GlassPanel className="px-3 py-1.5">
          <span className="text-[10px] text-white/50">LIVE</span>
          <motion.span
            className="inline-block ml-1.5 h-2 w-2 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </GlassPanel>
      </div>

      {/* Main Council Layout */}
      <div className="relative flex flex-col items-center justify-center px-6 py-8">
        {/* Central HUD */}
        <div className="relative z-20 flex flex-col items-center mb-8">
          <GlassPanel className="p-6 flex flex-col items-center gap-4">
            <div className="flex gap-8">
              <div className="relative">
                <HolographicGauge value={consensus} label="Consensus" size={100} color="#a78bfa" />
              </div>
              <div className="relative">
                <HolographicGauge value={avgConfidence} label="Confidence" size={100} color="#34d399" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-white/60 font-medium">SITA Intelligence</span>
            </div>
          </GlassPanel>
        </div>

        {/* Semicircular Advisor Layout */}
        <div className="relative w-full max-w-4xl mx-auto" style={{ height: 320 }}>
          {advisors.map((advisor, index) => {
            const total = advisors.length;
            const angleRange = Math.PI * 0.8;
            const startAngle = (Math.PI - angleRange) / 2;
            const angle = startAngle + (total > 1 ? (index / (total - 1)) * angleRange : angleRange / 2);
            const radiusX = 380;
            const radiusY = 140;
            const x = 50 + (Math.cos(angle) * radiusX / 8);
            const y = 50 + (Math.sin(angle) * radiusY / 3.2);
            const color = domainColors[advisor.domain] || "#a78bfa";
            const metric = domainMetrics[advisor.domain] || { label: "Status", value: "Active" };

            return (
              <motion.div
                key={advisor.id}
                className="absolute flex flex-col items-center gap-2"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              >
                <NeonRing color={color} active={advisor.status === "active"}>
                  <AdvisorPortrait
                    domain={advisor.domain as AdvisorDomain}
                    name={advisor.name}
                    status={advisor.status}
                    size="lg"
                  />
                </NeonRing>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white">{advisor.name.split(" ")[0]}</p>
                  <p className="text-[9px] text-white/40">{advisor.role?.split(" ").slice(0, 2).join(" ")}</p>
                </div>
                <FloatingMetricCard label={metric.label} value={metric.value} className="absolute -right-16 top-0" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </CinematicBackground>
  );
};