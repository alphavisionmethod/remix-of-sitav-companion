// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Canvas — Particle Storm + Distribution
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback } from "react";
import type { SimulationProgress } from "@/domains/simulation/monte-carlo-engine";

interface SimulationCanvasProps {
  progress: SimulationProgress | null;
  isRunning: boolean;
  isComplete: boolean;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  hue: number;
}

export function SimulationCanvas({ progress, isRunning, isComplete }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark background with slight fade for trails
    ctx.fillStyle = "rgba(10, 12, 20, 0.15)";
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = "rgba(100, 120, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const particles = particlesRef.current;

    // Spawn particles from simulation results
    if (progress && isRunning) {
      const resultsLen = progress.results.length;
      const newCount = Math.min(50, Math.floor(resultsLen / 100));
      for (let i = 0; i < newCount; i++) {
        const idx = Math.floor(Math.random() * resultsLen);
        const val = progress.results[idx];
        const normalized = progress.max !== progress.min
          ? (val - progress.min) / (progress.max - progress.min)
          : 0.5;

        // Target position on distribution curve
        const targetX = 60 + normalized * (w - 120);
        const targetY = h * 0.7 - normalized * 0.15 * h;

        // Hue: blue (good) to gold (great) to red (bad)
        const hue = normalized > 0.5 ? 200 + (normalized - 0.5) * 80 : 0 + normalized * 200;

        particles.push({
          x: w * 0.5 + (Math.random() - 0.5) * 100,
          y: 20 + Math.random() * 40,
          targetX,
          targetY,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2 + 1,
          alpha: 1,
          size: 1.5 + Math.random() * 2,
          hue,
        });
      }
    }

    // Cap particles
    if (particles.length > 3000) {
      particles.splice(0, particles.length - 3000);
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (isRunning || isComplete) {
        // Ease toward target
        p.vx += (p.targetX - p.x) * 0.008;
        p.vy += (p.targetY - p.y) * 0.008;
        p.vx *= 0.96;
        p.vy *= 0.96;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= isComplete ? 0.998 : 0.995;

      if (p.alpha < 0.05) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha * 0.15})`;
      ctx.fill();
    }

    // Draw distribution curve if we have data
    if (progress && progress.completed > 500) {
      const sorted = progress.results;
      const bins = 60;
      const min = progress.min;
      const range = progress.max - min || 1;
      const binWidth = range / bins;
      const counts = new Array(bins).fill(0);
      for (const v of sorted) {
        const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
        counts[idx]++;
      }
      const maxCount = Math.max(...counts, 1);

      // Draw histogram bars
      const barW = (w - 120) / bins;
      for (let i = 0; i < bins; i++) {
        const barH = (counts[i] / maxCount) * h * 0.4;
        const x = 60 + i * barW;
        const y = h * 0.85 - barH;
        const normalized = i / bins;
        const hue = normalized > 0.5 ? 200 + (normalized - 0.5) * 80 : 40 + normalized * 160;

        ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${isComplete ? 0.6 : 0.35})`;
        ctx.fillRect(x, y, barW - 1, barH);

        // Top glow
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${isComplete ? 0.3 : 0.15})`;
        ctx.fillRect(x, y, barW - 1, 2);
      }

      // Percentile markers
      if (progress.percentiles.P50 !== undefined) {
        const markers = [
          { key: "P10", color: "rgba(255,100,100,0.6)" },
          { key: "P50", color: "rgba(100,200,255,0.8)" },
          { key: "P90", color: "rgba(100,255,150,0.6)" },
        ];
        for (const m of markers) {
          const val = progress.percentiles[m.key];
          if (val === undefined) continue;
          const x = 60 + ((val - min) / range) * (w - 120);
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(x, h * 0.45); ctx.lineTo(x, h * 0.85); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = m.color;
          ctx.font = "11px monospace";
          ctx.fillText(m.key, x - 10, h * 0.43);
        }
      }
    }

    // Iteration counter overlay
    if (progress) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 14px monospace";
      ctx.fillText(
        `${progress.completed.toLocaleString()} / ${progress.total.toLocaleString()} scenarios`,
        20, 30
      );
      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(150,180,255,0.6)";
      ctx.fillText(`${progress.speed.toLocaleString()} scenarios/sec`, 20, 48);
    }

    // "Simulation Complete" flash
    if (isComplete && particles.length > 100) {
      ctx.fillStyle = `rgba(100, 160, 255, ${Math.random() * 0.03})`;
      ctx.fillRect(0, 0, w, h);
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [progress, isRunning, isComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Reset particles when starting new sim
  useEffect(() => {
    if (isRunning) particlesRef.current = [];
  }, [isRunning]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl"
      style={{ background: "hsl(228 15% 6%)" }}
    />
  );
}
