// ═══════════════════════════════════════════════════════════════
// SITA OS — War Room Presentation Mode
// Cinematic fullscreen with dramatic transitions, ambient HUD,
// slide counter ring, and presenter controls
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, ChevronLeft, ChevronRight, Minimize2, Pause, Play,
  Maximize2, Crosshair, Shield, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBoardroomPacket } from "@/platform/boardroom/hooks/use-boardroom";
import type { BoardroomType, BoardroomContentSection, MetricCardData, NarrativeData, AlertData, ActionItemData, TableData } from "@/lib/boardroom/types";
import { BOARDROOM_META as META } from "@/lib/boardroom/types";
import { KPITile, RiskCard } from "@/platform/sita/components/sita/SitaComponents";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WarRoomPresentationProps {
  type: BoardroomType;
  onExit: () => void;
}

// Cinematic transition variants
const slideTransitions = [
  { initial: { opacity: 0, x: 80, filter: "blur(12px)" }, animate: { opacity: 1, x: 0, filter: "blur(0px)" }, exit: { opacity: 0, x: -80, filter: "blur(8px)" } },
  { initial: { opacity: 0, scale: 0.85, filter: "blur(16px)" }, animate: { opacity: 1, scale: 1, filter: "blur(0px)" }, exit: { opacity: 0, scale: 1.1, filter: "blur(12px)" } },
  { initial: { opacity: 0, y: 60, rotateX: 15 }, animate: { opacity: 1, y: 0, rotateX: 0 }, exit: { opacity: 0, y: -40, rotateX: -10 } },
];

function HUDOverlay({ slideNum, total, elapsed, confidence }: { slideNum: number; total: number; elapsed: number; confidence: number }) {
  const confPct = Math.round(confidence * 100);
  const confColor = confPct >= 80 ? "hsl(152, 55%, 48%)" : confPct >= 60 ? "hsl(38, 85%, 58%)" : "hsl(0, 70%, 55%)";

  return (
    <>
      {/* Top-left: slide counter */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="2.5" />
              <motion.circle
                cx="20" cy="20" r="17" fill="none" stroke="hsl(265, 55%, 58%)" strokeWidth="2.5"
                strokeDasharray={`${(slideNum / total) * 107} 107`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 107" }}
                animate={{ strokeDasharray: `${(slideNum / total) * 107} 107` }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[hsl(0_0%_70%)]">
              {slideNum}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-mono text-[hsl(0_0%_35%)] uppercase">Slide</p>
            <p className="text-[10px] font-mono text-[hsl(0_0%_60%)]">{slideNum}/{total}</p>
          </div>
        </div>
      </div>

      {/* Top-right: confidence + time */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" style={{ color: confColor }} />
          <span className="text-[10px] font-mono font-bold" style={{ color: confColor }}>{confPct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-[hsl(0_0%_35%)]" />
          <span className="text-[10px] font-mono text-[hsl(0_0%_45%)]">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-[hsl(265_55%_58%/0.15)] rounded-tl pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-6 h-6 border-r border-t border-[hsl(265_55%_58%/0.15)] rounded-tr pointer-events-none z-20" />
      <div className="absolute bottom-16 left-3 w-6 h-6 border-l border-b border-[hsl(265_55%_58%/0.15)] rounded-bl pointer-events-none z-20" />
      <div className="absolute bottom-16 right-3 w-6 h-6 border-r border-b border-[hsl(265_55%_58%/0.15)] rounded-br pointer-events-none z-20" />
    </>
  );
}

// Mini section renderer for presentation
function PresentationSection({ section }: { section: BoardroomContentSection }) {
  switch (section.type) {
    case "metric-card": {
      const data = section.data as MetricCardData[];
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[hsl(0_0%_90%)] font-display">{section.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.slice(0, 8).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] p-4"
              >
                <p className="text-[10px] font-mono text-[hsl(0_0%_40%)] uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-display font-bold text-[hsl(0_0%_85%)] mt-1">{m.value}</p>
                {m.trendValue && <p className={cn("text-[10px] font-mono mt-0.5", m.trend === "up" ? "text-[hsl(152_55%_48%)]" : m.trend === "down" ? "text-[hsl(0_70%_55%)]" : "text-[hsl(0_0%_40%)]")}>{m.trendValue}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
    case "narrative": {
      const data = section.data as NarrativeData;
      return (
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-[hsl(0_0%_90%)] font-display">{section.title}</h2>
          <div className="rounded-xl border border-[hsl(265_55%_58%/0.1)] bg-[hsl(265_55%_58%/0.03)] p-6">
            <p className="text-[14px] text-[hsl(0_0%_65%)] leading-relaxed">{data.text}</p>
            <div className="flex items-center gap-2 mt-4">
              <Shield className="h-3 w-3 text-[hsl(265_55%_58%)]" />
              <span className="text-[10px] font-mono text-[hsl(265_55%_58%)]">{Math.round(data.confidence * 100)}% CONFIDENCE</span>
            </div>
          </div>
        </div>
      );
    }
    case "alert": {
      const data = section.data as AlertData[];
      return (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[hsl(0_0%_90%)] font-display">{section.title}</h2>
          {data.slice(0, 4).map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn("rounded-xl border p-4",
                alert.severity === "critical" ? "border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.04)]" :
                alert.severity === "warning" ? "border-[hsl(38_85%_58%/0.2)] bg-[hsl(38_85%_58%/0.04)]" :
                "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)]"
              )}
            >
              <p className="text-[13px] font-medium text-[hsl(0_0%_85%)]">{alert.title}</p>
              <p className="text-[11px] text-[hsl(0_0%_45%)] mt-1">{alert.description}</p>
            </motion.div>
          ))}
        </div>
      );
    }
    case "action-list": {
      const data = section.data as ActionItemData[];
      return (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[hsl(0_0%_90%)] font-display">Action Items</h2>
          {data.slice(0, 6).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] p-4"
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold text-white shrink-0",
                item.priority === "critical" ? "bg-[hsl(0_70%_50%)]" : item.priority === "high" ? "bg-[hsl(38_85%_50%)]" : "bg-[hsl(265_55%_58%)]"
              )}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-[12px] text-[hsl(0_0%_80%)]">{item.text}</p>
                {item.assignee && <p className="text-[10px] text-[hsl(0_0%_40%)] mt-0.5">{item.assignee} {item.dueDate ? `· Due ${item.dueDate}` : ""}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      );
    }
    case "table": {
      const data = section.data as TableData;
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[hsl(0_0%_90%)] font-display">{section.title}</h2>
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[hsl(0_0%_100%/0.06)]">
                  {data.columns.map(col => (
                    <TableHead key={col.key} className="text-[10px] font-mono text-[hsl(0_0%_45%)] uppercase tracking-wider">{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.slice(0, 8).map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-[hsl(0_0%_100%/0.04)]"
                  >
                    {data.columns.map(col => (
                      <TableCell key={col.key} className="text-[12px] text-[hsl(0_0%_70%)]">
                        {String(row[col.key] ?? "—")}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-[9px] font-mono text-[hsl(0_0%_30%)]">SOURCE: {data.source}</p>
        </div>
      );
    }
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-[14px] text-[hsl(0_0%_45%)] font-mono">{section.title}</p>
        </div>
      );
  }
}

export function WarRoomPresentation({ type, onExit }: WarRoomPresentationProps) {
  const { packet, isLoading } = useBoardroomPacket(type);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transitionIdx, setTransitionIdx] = useState(0);
  const SLIDE_DURATION = 30;

  const slides = packet?.sections ?? [];
  const totalSlides = slides.length;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!autoAdvance || totalSlides === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(c => (c + 1) % totalSlides);
      setTransitionIdx(t => (t + 1) % slideTransitions.length);
    }, SLIDE_DURATION * 1000);
    return () => clearInterval(interval);
  }, [autoAdvance, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide(c => Math.min(c + 1, totalSlides - 1));
        setTransitionIdx(t => (t + 1) % slideTransitions.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentSlide(c => Math.max(c - 1, 0));
        setTransitionIdx(t => (t + 1) % slideTransitions.length);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalSlides, onExit]);

  const meta = META[type];
  const transition = slideTransitions[transitionIdx % slideTransitions.length];

  if (isLoading || !packet) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(0_0%_3%)]"
      >
        <Crosshair className="h-8 w-8 text-[hsl(265_55%_58%)] mb-4" />
        <motion.p
          className="text-[12px] font-mono text-[hsl(0_0%_35%)] tracking-wider"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          GENERATING WAR ROOM BRIEFING...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[hsl(0_0%_3%)]"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[hsl(265_55%_58%/0.03)] blur-[200px]" />
      </div>

      {/* HUD Overlay */}
      <HUDOverlay
        slideNum={currentSlide + 1}
        total={totalSlides}
        elapsed={elapsed}
        confidence={packet.confidence}
      />

      {/* Top progress bar */}
      <div className="h-[2px] bg-[hsl(0_0%_8%)] w-full relative z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-[hsl(265_55%_58%)] to-[hsl(210_60%_55%)]"
          animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8 lg:p-16 relative z-10">
        <AnimatePresence mode="wait">
          {slides[currentSlide] && (
            <motion.div
              key={currentSlide}
              initial={transition.initial}
              animate={transition.animate}
              exit={transition.exit}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="w-full max-w-5xl"
            >
              <PresentationSection section={slides[currentSlide]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 border-t border-[hsl(0_0%_100%/0.04)] bg-[hsl(0_0%_3%/0.9)] backdrop-blur-md">
        <button
          onClick={() => { setCurrentSlide(c => Math.max(c - 1, 0)); setTransitionIdx(t => (t + 1) % slideTransitions.length); }}
          disabled={currentSlide === 0}
          className="rounded-lg p-2 text-[hsl(0_0%_40%)] hover:text-white hover:bg-[hsl(0_0%_100%/0.05)] transition-colors disabled:opacity-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentSlide(i); setTransitionIdx(t => (t + 1) % slideTransitions.length); }}
                className={cn("h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide ? "w-6 bg-[hsl(265_55%_58%)]" : "w-1.5 bg-[hsl(0_0%_20%)] hover:bg-[hsl(0_0%_35%)]"
                )}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-[hsl(0_0%_15%)]" />

          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className="rounded-lg p-2 text-[hsl(0_0%_40%)] hover:text-white hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
          >
            {autoAdvance ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={onExit}
            className="rounded-lg p-2 text-[hsl(0_0%_40%)] hover:text-white hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => { setCurrentSlide(c => Math.min(c + 1, totalSlides - 1)); setTransitionIdx(t => (t + 1) % slideTransitions.length); }}
          disabled={currentSlide === totalSlides - 1}
          className="rounded-lg p-2 text-[hsl(0_0%_40%)] hover:text-white hover:bg-[hsl(0_0%_100%/0.05)] transition-colors disabled:opacity-20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
