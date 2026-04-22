import { useEffect, useRef, useState, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, MessageCircle, Clock } from "lucide-react";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { NeonRing, HolographicGauge, FloatingMetricCard, CinematicBackground } from "./boardroom-primitives";
import type { AdvisorConfig } from "./AdvisorCouncilShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const closedViaBack = useRef(false);

  // Haptic helper
  const haptic = useCallback((style: "light" | "medium" = "light") => {
    try {
      if ("vibrate" in navigator) navigator.vibrate(style === "light" ? 8 : 15);
    } catch { /* noop */ }
  }, []);

  // Hardware back / gesture support — push a history entry, clean up on close
  useEffect(() => {
    window.history.pushState({ advisorDetailOpen: true }, "");

    const handler = (e: PopStateEvent) => {
      // Only handle if this overlay pushed the state
      closedViaBack.current = true;
      haptic("light");
      onClose();
    };

    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      // If closing via UI (not back button), pop the state we pushed
      if (!closedViaBack.current) {
        window.history.back();
      }
    };
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Track scroll position for drag-to-close gating
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setIsScrolledToTop(scrollRef.current.scrollTop <= 2);
    }
  }, []);

  // Drag-to-close with tuned thresholds
  const DRAG_CLOSE_PX = 100;
  const DRAG_CLOSE_VEL = 500;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const shouldClose =
      info.offset.y > DRAG_CLOSE_PX ||
      (info.velocity.y > DRAG_CLOSE_VEL && info.offset.y > 30);
    if (shouldClose) {
      haptic("medium");
      onClose();
    }
  };

  const handleClose = () => {
    haptic("light");
    onClose();
  };

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
        drag={isScrolledToTop ? "y" : false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ touchAction: isScrolledToTop ? "none" : "pan-y" }}
      >
        <CinematicBackground className="min-h-full flex flex-col">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>

          {/* Drag handle */}
          <div className="flex justify-center -mt-2 mb-4">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Scrollable content — isolated scroll area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Portrait + Info */}
            <div className="flex flex-col items-center gap-3 px-6">
              <NeonRing color={color} active intensity={advisor.confidence}>
                <motion.div layoutId={`portrait-${advisor.id}`}>
                  <PortraitWithSkeleton advisor={advisor} />
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
            <div className="px-6 mt-6 space-y-4 pb-8">
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
          </div>
        </CinematicBackground>
      </motion.div>
    </motion.div>
  );
};

// ── Portrait with skeleton placeholder ──
function PortraitWithSkeleton({ advisor }: { advisor: AdvisorConfig }) {
  const [ready, setReady] = useState(false);

  // Give portrait a brief moment to mount & start loading
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      {!ready && (
        <Skeleton className="absolute inset-0 rounded-full z-10 h-[120px] w-[120px]" />
      )}
      <AdvisorPortrait
        domain={advisor.domain as AdvisorDomain}
        name={advisor.name}
        status={advisor.status}
        size="xl"
        avatarUrl={advisor.avatarUrl}
      />
    </div>
  );
}