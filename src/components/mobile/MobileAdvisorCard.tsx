// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Advisor Card with tap-to-expand bottom sheet
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

export interface MobileAdvisorData {
  id: string;
  name: string;
  domain: string;
  emoji: string;
  accentColor: string;
  confidence: number;
  status: "active" | "idle" | "thinking";
  summary: string;
  kpis: { label: string; value: string; trend: "up" | "down" | "flat" }[];
  recentAction?: string;
}

// ── Haptic helper ──
function haptic(style: "light" | "medium" = "light") {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(style === "light" ? 8 : 15);
    }
  } catch {
    // Silently fail — not all devices support haptic
  }
}

// ── Collapsed card ──
function AdvisorCardCollapsed({
  advisor,
  onTap,
}: {
  advisor: MobileAdvisorData;
  onTap: () => void;
}) {
  return (
    <motion.button
      layout
      layoutId={`advisor-card-${advisor.id}`}
      type="button"
      onClick={() => {
        haptic("light");
        onTap();
      }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "w-full rounded-xl border border-hud-glass-border bg-card p-3.5",
        "flex items-center gap-3 text-left",
        "active:bg-hud-glass-highlight-hover transition-colors",
      )}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2"
        style={{
          borderColor: advisor.accentColor + "50",
          backgroundColor: advisor.accentColor + "15",
        }}
      >
        {advisor.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{advisor.name}</span>
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              advisor.status === "active" && "bg-[hsl(var(--trust-safe))]",
              advisor.status === "thinking" && "bg-primary animate-pulse",
              advisor.status === "idle" && "bg-muted-foreground/40",
            )}
          />
        </div>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{advisor.summary}</p>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-xs font-semibold" style={{ color: advisor.accentColor }}>
          {advisor.confidence}%
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
    </motion.button>
  );
}

// ── Drag-to-close threshold ──
const DRAG_CLOSE_THRESHOLD = 100; // px downward to dismiss
const DRAG_VELOCITY_THRESHOLD = 500; // px/s to dismiss on flick

// ── Expanded bottom sheet ──
function AdvisorDetailSheet({
  advisor,
  onClose,
}: {
  advisor: MobileAdvisorData;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  // Track scroll position to allow drag-to-close only when scrolled to top
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setIsAtTop(scrollRef.current.scrollTop <= 2);
    }
  }, []);

  // Lock body scroll when sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const shouldClose =
      (info.offset.y > DRAG_CLOSE_THRESHOLD) ||
      (info.velocity.y > DRAG_VELOCITY_THRESHOLD && info.offset.y > 30);

    if (shouldClose) {
      haptic("medium");
      onClose();
    }
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-[hsl(var(--trust-safe))]" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          haptic("light");
          onClose();
        }}
      />

      {/* Sheet */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-card border-t border-hud-glass-border shadow-xl"
        style={{ maxHeight: "88vh", touchAction: isAtTop ? "none" : "pan-y" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        drag={isAtTop ? "y" : false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pb-4 border-b border-border/20">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
            style={{
              borderColor: advisor.accentColor + "60",
              backgroundColor: advisor.accentColor + "18",
            }}
          >
            {advisor.emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">{advisor.name}</h3>
            <p className="text-[11px] text-muted-foreground capitalize">{advisor.domain} Advisor</p>
          </div>
          <button
            type="button"
            onClick={() => {
              haptic("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content — isolated scroll */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto overscroll-contain px-5 pt-4 pb-8"
          style={{
            maxHeight: "calc(88vh - 120px)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Confidence bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">Confidence</span>
              <span className="text-sm font-bold" style={{ color: advisor.accentColor }}>
                {advisor.confidence}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-hud-confidence-track overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-hud-confidence-start to-hud-confidence-end"
                initial={{ width: 0 }}
                animate={{ width: `${advisor.confidence}%` }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mb-5">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Assessment
            </h4>
            <p className="text-sm leading-relaxed">{advisor.summary}</p>
          </div>

          {/* KPIs */}
          <div className="mb-5">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {advisor.kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-border/20 bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendIcon trend={kpi.trend} />
                    <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-base font-semibold">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent action */}
          {advisor.recentAction && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Last Action
              </h4>
              <div className="rounded-lg border border-border/20 bg-secondary/20 p-3">
                <p className="text-xs leading-relaxed">{advisor.recentAction}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Public component ──
export function MobileAdvisorCard({ advisor }: { advisor: MobileAdvisorData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <AdvisorCardCollapsed advisor={advisor} onTap={() => setExpanded(true)} />

      <AnimatePresence>
        {expanded && (
          <AdvisorDetailSheet advisor={advisor} onClose={() => setExpanded(false)} />
        )}
      </AnimatePresence>
    </>
  );
}