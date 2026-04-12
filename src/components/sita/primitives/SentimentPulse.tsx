// ═══════════════════════════════════════════════════════════════
// SITA OS — SentimentPulse Primitive
// Real-time sentiment indicator (green/amber/red wave)
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export interface SentimentData {
  label: string;
  score: number; // -1 to 1
  source: string;
}

interface SentimentPulseProps {
  sentiments: SentimentData[];
  overallScore: number; // -1 to 1
  className?: string;
}

function scoreToColor(score: number): string {
  if (score > 0.3) return "hsl(152 55% 48%)";
  if (score > -0.3) return "hsl(38 85% 58%)";
  return "hsl(0 65% 55%)";
}

function scoreToLabel(score: number): string {
  if (score > 0.6) return "Very Positive";
  if (score > 0.3) return "Positive";
  if (score > -0.3) return "Neutral";
  if (score > -0.6) return "Concerning";
  return "Critical";
}

function PulseWave({ score, className }: { score: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      phaseRef.current += 0.03;

      const color = scoreToColor(score);
      const amplitude = 8 + Math.abs(score) * 12;
      const frequency = 0.02 + Math.abs(score) * 0.01;

      // Draw wave
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + phaseRef.current) * amplitude * Math.sin(x * 0.005 + phaseRef.current * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow wave
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + phaseRef.current + 0.5) * amplitude * 0.6;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color.replace(")", " / 0.3)").replace("hsl(", "hsla(");
      ctx.lineWidth = 4;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return <canvas ref={canvasRef} width={300} height={40} className={cn("w-full h-8", className)} />;
}

export function SentimentPulse({ sentiments, overallScore, className }: SentimentPulseProps) {
  const color = scoreToColor(overallScore);
  const label = scoreToLabel(overallScore);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
      {/* Overall */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sentiment Pulse</p>
          <p className="text-sm font-bold" style={{ color }}>{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 + (1 - Math.abs(overallScore)) * 2 }}
            className="w-3 h-3 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-lg font-bold tabular-nums" style={{ color }}>
            {overallScore > 0 ? "+" : ""}{(overallScore * 100).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Wave */}
      <PulseWave score={overallScore} />

      {/* Individual Sentiments */}
      <div className="space-y-1.5">
        {sentiments.map((s, i) => {
          const c = scoreToColor(s.score);
          const pct = ((s.score + 1) / 2) * 100;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2"
            >
              <span className="text-[10px] text-muted-foreground w-24 truncate">{s.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                <motion.div
                  initial={{ width: "50%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: c }}
                />
              </div>
              <span className="text-[9px] tabular-nums w-8 text-right" style={{ color: c }}>
                {s.score > 0 ? "+" : ""}{(s.score * 100).toFixed(0)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
