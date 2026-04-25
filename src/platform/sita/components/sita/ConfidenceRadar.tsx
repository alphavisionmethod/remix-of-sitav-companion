// ═══════════════════════════════════════════════════════════════
// SITA OS — Confidence Radar Chart
// Radial visualization of advisor confidence levels
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdvisorConfidence {
  name: string;
  confidence: number;
  domain: string;
  color: string;
}

interface ConfidenceRadarProps {
  advisors: AdvisorConfidence[];
  className?: string;
}

export function ConfidenceRadar({ advisors, className }: ConfidenceRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(cx, cy) - 40;

    ctx.clearRect(0, 0, width, height);

    // Draw grid rings
    for (let i = 1; i <= 4; i++) {
      const r = (maxR * i) / 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "hsla(0, 0%, 100%, 0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw grid labels
    ctx.fillStyle = "hsla(0, 0%, 100%, 0.2)";
    ctx.font = "9px system-ui";
    ctx.textAlign = "center";
    for (let i = 1; i <= 4; i++) {
      ctx.fillText(`${i * 25}%`, cx, cy - (maxR * i) / 4 - 4);
    }

    // Draw spokes and labels
    const n = advisors.length;
    const angleStep = (Math.PI * 2) / n;

    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + Math.cos(angle) * maxR;
      const y = cy + Math.sin(angle) * maxR;

      // Spoke
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "hsla(0, 0%, 100%, 0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const labelR = maxR + 20;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;
      ctx.fillStyle = "hsla(0, 0%, 100%, 0.5)";
      ctx.font = "10px system-ui";
      ctx.textAlign = angle > Math.PI / 2 || angle < -Math.PI / 2 ? "right" : "left";
      if (Math.abs(angle + Math.PI / 2) < 0.1 || Math.abs(angle - Math.PI / 2) < 0.1) ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(a.name, lx, ly);
    });

    // Draw filled polygon
    ctx.beginPath();
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (a.confidence / 100) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "hsla(265, 55%, 58%, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "hsla(265, 55%, 58%, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (a.confidence / 100) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `${a.color}33`;
      ctx.fill();

      // Point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Confidence value
      ctx.fillStyle = "hsla(0, 0%, 100%, 0.7)";
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${a.confidence}%`, x, y - 10);
    });
  }, [advisors]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Advisor Confidence Radar</p>
      <canvas ref={canvasRef} width={320} height={280} className="w-full max-w-[320px] mx-auto" />
    </div>
  );
}
