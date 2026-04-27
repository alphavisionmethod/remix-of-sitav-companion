// ============================================================
// SITA OS — Boardroom Session Bar
// Formal session lifecycle strip with stage progression
// ============================================================

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Play, Pause, Square, ChevronRight, Clock, Radio, Users } from "lucide-react";
import type { SessionStatus } from "@/platform/boardroom/hooks/useBoardroomSession";

interface Props {
  status: SessionStatus;
  elapsed: number;
  stageIndex: number;
  stages: SessionStatus[];
  advisorCount: number;
  onOpen: () => void;
  onAdvance: () => void;
  onPause: () => void;
  onResume: () => void;
  onAdjourn: () => void;
  sessionMode: string;
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  assembling: "Assembling",
  "in-progress": "In Session",
  paused: "Paused",
  "awaiting-evidence": "Awaiting Evidence",
  "ready-for-approval": "Ready for Approval",
  adjourned: "Adjourned",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  assembling: "hsl(280 50% 55%)",
  "in-progress": "hsl(280 60% 60%)",
  paused: "hsl(40 90% 55%)",
  "awaiting-evidence": "hsl(40 90% 55%)",
  "ready-for-approval": "hsl(145 60% 50%)",
  adjourned: "hsl(0 0% 50%)",
};

export function BoardroomSessionBar({
  status, elapsed, stageIndex, stages, advisorCount,
  onOpen, onAdvance, onPause, onResume, onAdjourn, sessionMode,
}: Props) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerStr = `${mins}m ${secs.toString().padStart(2, "0")}s`;
  const color = STATUS_COLORS[status];
  const isActive = status !== "adjourned";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 py-2 bg-[hsl(220_18%_5%/0.95)] backdrop-blur-xl border-b border-[hsl(0_0%_100%/0.06)] flex items-center gap-4"
    >
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={isActive ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color }}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Stage progress dots */}
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <React.Fragment key={s}>
            <motion.div
              className={cn("w-2 h-2 rounded-full transition-all")}
              style={{
                backgroundColor: i <= stageIndex ? color : "hsl(0 0% 100% / 0.1)",
                boxShadow: i === stageIndex ? `0 0 6px ${color}` : undefined,
              }}
              animate={i === stageIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {i < stages.length - 1 && (
              <div
                className="w-3 h-px"
                style={{ backgroundColor: i < stageIndex ? `${color}80` : "hsl(0 0% 100% / 0.06)" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)]">
        <Clock size={10} className="text-[hsl(0_0%_100%/0.35)]" />
        <span className="text-[10px] font-mono font-semibold text-[hsl(0_0%_100%/0.5)] tabular-nums">
          {timerStr}
        </span>
      </div>

      {/* Advisors */}
      <div className="flex items-center gap-1.5">
        <Users size={10} className="text-[hsl(0_0%_100%/0.3)]" />
        <span className="text-[9px] font-medium text-[hsl(0_0%_100%/0.3)]">
          {advisorCount} advisors
        </span>
      </div>

      <div className="flex-1" />

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {status === "assembling" && (
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(280_50%_50%/0.15)] border border-[hsl(280_50%_50%/0.25)] text-[10px] font-bold text-[hsl(280_50%_75%)] hover:bg-[hsl(280_50%_50%/0.25)] transition-colors"
          >
            <Play size={10} /> Open Session
          </button>
        )}
        {status === "in-progress" && (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] text-[9px] font-semibold text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] transition-colors"
            >
              <Pause size={9} /> Pause
            </button>
            <button
              onClick={onAdvance}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(280_50%_50%/0.1)] border border-[hsl(280_50%_50%/0.2)] text-[9px] font-semibold text-[hsl(280_50%_70%)] hover:bg-[hsl(280_50%_50%/0.2)] transition-colors"
            >
              Advance <ChevronRight size={9} />
            </button>
          </>
        )}
        {status === "paused" && (
          <button
            onClick={onResume}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(280_50%_50%/0.1)] border border-[hsl(280_50%_50%/0.2)] text-[9px] font-semibold text-[hsl(280_50%_70%)] hover:bg-[hsl(280_50%_50%/0.2)] transition-colors"
          >
            <Play size={9} /> Resume
          </button>
        )}
        {isActive && status !== "assembling" && (
          <button
            onClick={onAdjourn}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(0_80%_50%/0.08)] border border-[hsl(0_80%_50%/0.15)] text-[9px] font-semibold text-[hsl(0_80%_60%/0.7)] hover:bg-[hsl(0_80%_50%/0.15)] transition-colors"
          >
            <Square size={9} /> Adjourn
          </button>
        )}
      </div>
    </motion.div>
  );
}
