// ═══════════════════════════════════════════════════════════════
// SITA OS — War Room Confidence Radar (Enhanced)
// Animated radar with pulse rings, live scanning, glow effects
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, Crosshair } from "lucide-react";

interface AdvisorConfidence {
  name: string;
  confidence: number;
  domain: string;
  color: string;
}

interface WarRoomConfidenceRadarProps {
  advisors: AdvisorConfidence[];
  className?: string;
}

export function WarRoomConfidenceRadar({ advisors, className }: WarRoomConfidenceRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scanAngle, setScanAngle] = useState(0);
  const frameRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    const cx = displayW / 2;
    const cy = displayH / 2;
    const maxR = Math.min(cx, cy) - 50;

    ctx.clearRect(0, 0, displayW, displayH);

    const n = advisors.length;
    const angleStep = (Math.PI * 2) / n;
    const frame = frameRef.current++;

    // ── Scanning sweep ──
    const sweep = (frame * 0.008) % (Math.PI * 2);
    const sweepGrad = ctx.createConicGradient(sweep - Math.PI / 2, cx, cy);
    sweepGrad.addColorStop(0, "hsla(265, 55%, 58%, 0.12)");
    sweepGrad.addColorStop(0.08, "hsla(265, 55%, 58%, 0.02)");
    sweepGrad.addColorStop(0.1, "transparent");
    sweepGrad.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // ── Grid rings with pulse ──
    for (let i = 1; i <= 4; i++) {
      const r = (maxR * i) / 4;
      const pulse = 1 + Math.sin(frame * 0.02 + i) * 0.008;
      ctx.beginPath();
      ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(265, 55%, 58%, ${0.08 + (i === 4 ? 0.04 : 0)})`;
      ctx.lineWidth = i === 4 ? 1.5 : 0.8;
      ctx.stroke();

      // Ring label
      ctx.fillStyle = "hsla(0, 0%, 100%, 0.15)";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${i * 25}`, cx - 6, cy - r * pulse + 3);
    }

    // ── Spokes ──
    advisors.forEach((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "hsla(0, 0%, 100%, 0.05)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // ── Outer labels ──
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const labelR = maxR + 28;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;

      ctx.fillStyle = hoveredIdx === i ? "hsla(0, 0%, 100%, 0.9)" : "hsla(0, 0%, 100%, 0.45)";
      ctx.font = hoveredIdx === i ? "bold 10px system-ui" : "10px system-ui";
      ctx.textAlign = Math.abs(angle + Math.PI / 2) < 0.2 ? "center" : angle > -Math.PI / 2 && angle < Math.PI / 2 ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(a.name, lx, ly);
    });

    // ── Filled polygon with gradient ──
    ctx.beginPath();
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (a.confidence / 100) * maxR;
      const breathe = Math.sin(frame * 0.015 + i * 0.5) * 2;
      const x = cx + Math.cos(angle) * (r + breathe);
      const y = cy + Math.sin(angle) * (r + breathe);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Gradient fill
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, "hsla(265, 55%, 58%, 0.05)");
    grad.addColorStop(1, "hsla(265, 55%, 58%, 0.2)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke with glow
    ctx.shadowColor = "hsla(265, 55%, 58%, 0.5)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "hsla(265, 55%, 58%, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Data points with pulse ──
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (a.confidence / 100) * maxR;
      const breathe = Math.sin(frame * 0.015 + i * 0.5) * 2;
      const x = cx + Math.cos(angle) * (r + breathe);
      const y = cy + Math.sin(angle) * (r + breathe);
      const isHovered = hoveredIdx === i;
      const pointSize = isHovered ? 6 : 4;

      // Outer glow pulse
      const pulseSize = pointSize + 4 + Math.sin(frame * 0.04 + i) * 2;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = `${a.color}20`;
      ctx.fill();

      // Point
      ctx.beginPath();
      ctx.arc(x, y, pointSize, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.strokeStyle = isHovered ? "white" : "hsla(0, 0%, 100%, 0.6)";
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();

      // Value label
      ctx.fillStyle = isHovered ? "white" : "hsla(0, 0%, 100%, 0.65)";
      ctx.font = `bold ${isHovered ? 11 : 9}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${a.confidence}%`, x, y - pointSize - 6);
    });

    // ── Center crosshair ──
    const crossSize = 8;
    ctx.beginPath();
    ctx.moveTo(cx - crossSize, cy);
    ctx.lineTo(cx + crossSize, cy);
    ctx.moveTo(cx, cy - crossSize);
    ctx.lineTo(cx, cy + crossSize);
    ctx.strokeStyle = "hsla(265, 55%, 58%, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, [advisors, hoveredIdx]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // Mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const maxR = Math.min(cx, cy) - 50;
    const n = advisors.length;
    const angleStep = (Math.PI * 2) / n;

    let closest = -1;
    let closestDist = 30;
    advisors.forEach((a, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (a.confidence / 100) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const dist = Math.hypot(mx - x, my - y);
      if (dist < closestDist) {
        closest = i;
        closestDist = dist;
      }
    });
    setHoveredIdx(closest >= 0 ? closest : null);
  }, [advisors]);

  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / advisors.length);
  const minConfidence = Math.min(...advisors.map(a => a.confidence));
  const weakest = advisors.find(a => a.confidence === minConfidence);

  return (
    <div className={cn("rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-[hsl(0_0%_3%)] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.04)] bg-[hsl(265_55%_58%/0.03)]">
        <div className="flex items-center gap-2">
          <Crosshair className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
          <span className="text-[11px] font-mono font-bold text-[hsl(0_0%_85%)] tracking-wider uppercase">
            Confidence Radar
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono text-[hsl(152_55%_48%)]">LIVE</span>
          </div>
          <span className="text-[10px] font-mono text-[hsl(0_0%_40%)]">AVG {avgConfidence}%</span>
        </div>
      </div>

      <div className="relative p-4">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: 300 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        />

        {/* Hovered advisor tooltip */}
        {hoveredIdx !== null && advisors[hoveredIdx] && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_6%)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: advisors[hoveredIdx].color }} />
              <span className="text-[11px] font-medium text-[hsl(0_0%_85%)]">{advisors[hoveredIdx].name}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: advisors[hoveredIdx].color }}>
                {advisors[hoveredIdx].confidence}%
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-px bg-[hsl(0_0%_100%/0.03)] border-t border-[hsl(0_0%_100%/0.04)]">
        <div className="px-3 py-2 text-center bg-[hsl(0_0%_3%)]">
          <p className="text-[9px] font-mono text-[hsl(0_0%_35%)] uppercase">Advisors</p>
          <p className="text-[13px] font-mono font-bold text-[hsl(0_0%_75%)]">{advisors.length}</p>
        </div>
        <div className="px-3 py-2 text-center bg-[hsl(0_0%_3%)]">
          <p className="text-[9px] font-mono text-[hsl(0_0%_35%)] uppercase">Avg Confidence</p>
          <p className="text-[13px] font-mono font-bold" style={{ color: avgConfidence >= 75 ? "hsl(152, 55%, 48%)" : "hsl(38, 85%, 58%)" }}>
            {avgConfidence}%
          </p>
        </div>
        <div className="px-3 py-2 text-center bg-[hsl(0_0%_3%)]">
          <p className="text-[9px] font-mono text-[hsl(0_0%_35%)] uppercase">Weakest</p>
          <p className="text-[13px] font-mono font-bold text-[hsl(0_70%_55%)]">
            {weakest?.name.split(" ")[0]} {minConfidence}%
          </p>
        </div>
      </div>
    </div>
  );
}
