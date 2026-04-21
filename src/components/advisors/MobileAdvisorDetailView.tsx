import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, MessageCircle, Clock } from "lucide-react";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { NeonRing, HolographicGauge, FloatingMetricCard, CinematicBackground } from "./boardroom-primitives";
import type { AdvisorConfig } from "./AdvisorCouncilShell";
import { Button } from "@/components/ui/button";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

const domainColors: Record<string, string> = {
  business: "#a855f7", money: "#34d399", concierge: "#f59e0b", growth: "#3b82f6",
  trust: "#14b8a6", opportunity: "#f97316", recovery: "#94a3b8", boardroom: "#6366f1",
  family: "#f43f5e", general: "#a78bfa",
};

const domainBadges: Record<string, string> = {
  business: "Business", money: "Finance", concierge: "Concierge", growth: "Growth",
  trust: "Trust", opportunity: "Opportunity", recovery: "Recovery", boardroom: "Boardroom",
  family: "Family", general: "General",
};

interface MobileAdvisorDetailViewProps {
  advisor: AdvisorConfig;
  onClose: () => void;
}

export const MobileAdvisorDetailView = ({ advisor, onClose }: MobileAdvisorDetailViewProps) => {
  const color = domainColors[advisor.domain] || "#a78bfa";

  // Back button support
  useEffect(() => {
    const handler = () => onClose();
    window.history.pushState({ advisorDetail: true }, "");
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full w-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
      >
        <CinematicBackground className="min-h-full overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>

          {/* Drag handle */}
          <div className="flex justify-center -mt-2 mb-4">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Portrait + Info */}
          <div className="flex flex-col items-center gap-3 px-6">
            <NeonRing color={color} active intensity={advisor.confidence}>
              <motion.div layoutId={`portrait-${advisor.id}`}>
                <AdvisorPortrait
                  domain={advisor.domain as AdvisorDomain}
                  name={advisor.name}
                  status={advisor.status}
                  size="xl"
                />
              </motion.div>
            </NeonRing>
            <h2 className="text-lg font-bold text-white">{advisor.name}</h2>
            <p className="text-xs text-white/50">{advisor.role}</p>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-medium text-white/80"
              style={{ backgroundColor: `${color}30`, border: `1px solid ${color}50` }}
            >
              {domainBadges[advisor.domain] || "Advisor"}
            </span>
          </div>

          {/* Gauge + Metrics */}
          <div className="flex flex-col items-center mt-6 px-6">
            <HolographicGauge value={advisor.confidence} label="Confidence" size={160} color={color} />

            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
              <FloatingMetricCard label="Status" value={advisor.status === "active" ? "Online" : "Idle"} />
              <FloatingMetricCard label="Confidence" value={`${advisor.confidence}%`} />
              <FloatingMetricCard label="Domain" value={domainBadges[advisor.domain] || "General"} />
              <FloatingMetricCard label="Capability" value={advisor.specialAbility?.slice(0, 12) || "Multi-domain"} />
            </div>
          </div>

          {/* Mission + Ability */}
          <div className="px-6 mt-6 space-y-4 pb-6">
            {advisor.mission && (
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4">
                <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Mission</h3>
                <p className="text-sm text-white/70 leading-relaxed">{advisor.mission}</p>
              </div>
            )}
            {advisor.specialAbility && (
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4">
                <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Special Ability</h3>
                <p className="text-sm text-white/70">{advisor.specialAbility}</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" className="flex-1 border-white/10 text-white/70 bg-white/[0.04]">
                <MessageCircle className="h-4 w-4 mr-2" /> Ask
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-white/10 text-white/70 bg-white/[0.04]">
                <Clock className="h-4 w-4 mr-2" /> Timeline
              </Button>
            </div>
          </div>
        </CinematicBackground>
      </motion.div>
    </motion.div>
  );
};