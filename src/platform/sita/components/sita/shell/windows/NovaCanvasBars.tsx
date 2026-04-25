// ═══════════════════════════════════════════════════════════════
// Nova Canvas Bars — Animated utilization bars using NovaContext
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback } from "react";
import { NovaContext, type NovaColor } from "@/platform/nova-sdk/graphics/context";

export interface BarItem {
  label: string;
  value: number; // 0-100
  colorLow: NovaColor;
  colorHigh: NovaColor;
  threshold?: number; // value above which colorHigh kicks in (default 70)
}

interface NovaCanvasBarsProps {
  bars: BarItem[];
  barHeight?: number;
  gap?: number;
  className?: string;
  vertical?: boolean; // if true, render as vertical columns
  columns?: number;   // for vertical mode grid columns
}

const BG_COLOR: NovaColor = { h: 0, s: 0, l: 50, a: 0.08 };
const LABEL_COLOR: NovaColor = { h: 0, s: 0, l: 55 };

export function NovaCanvasBars({
  bars,
  barHeight = 20,
  gap = 6,
  className = "",
  vertical = false,
  columns = 4,
}: NovaCanvasBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevValuesRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);

  const totalHeight = vertical
    ? 60 // fixed height for vertical bars
    : bars.length * (barHeight + gap) - gap + 4;

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    const nova = new NovaContext(canvas);
    const ctx = nova.raw;
    ctx.save();
    ctx.scale(dpr, dpr);
    nova.clear();

    const prev = prevValuesRef.current;

    if (vertical) {
      // Vertical column bars (for CPU/GPU cores)
      const cols = Math.min(columns, bars.length);
      const rows = Math.ceil(bars.length / cols);
      const colW = (w - (cols - 1) * gap) / cols;
      const rowH = (h - 14 - (rows - 1) * gap) / rows; // 14px for label

      bars.forEach((bar, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = col * (colW + gap);
        const by = row * (rowH + gap);

        const prevVal = prev[i] ?? bar.value;
        const currentVal = prevVal + (bar.value - prevVal) * t;
        const clamped = Math.max(0, Math.min(100, currentVal));
        const threshold = bar.threshold ?? 70;

        // Background
        nova.drawRoundedRect(bx, by, colW, rowH, 3, BG_COLOR);

        // Fill from bottom
        const fillH = (clamped / 100) * rowH;
        if (fillH > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(bx, by, colW, rowH, 3);
          ctx.clip();

          const gradient = ctx.createLinearGradient(bx, by + rowH, bx, by + rowH - fillH);
          if (clamped > threshold) {
            gradient.addColorStop(0, `hsl(${bar.colorHigh.h} ${bar.colorHigh.s}% ${bar.colorHigh.l}%)`);
            gradient.addColorStop(1, `hsl(${bar.colorHigh.h} ${bar.colorHigh.s}% ${bar.colorHigh.l + 10}%)`);
          } else {
            gradient.addColorStop(0, `hsl(${bar.colorLow.h} ${bar.colorLow.s}% ${bar.colorLow.l}%)`);
            gradient.addColorStop(1, `hsl(${bar.colorLow.h} ${bar.colorLow.s}% ${bar.colorLow.l + 10}%)`);
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(bx, by + rowH - fillH, colW, fillH);
          ctx.restore();
        }

        // Label
        nova.drawText(bar.label, bx + colW / 2 - 4, by + rowH + 2, LABEL_COLOR, 8);
      });
    } else {
      // Horizontal bars
      bars.forEach((bar, i) => {
        const by = i * (barHeight + gap) + 2;
        const prevVal = prev[i] ?? bar.value;
        const currentVal = prevVal + (bar.value - prevVal) * t;
        const clamped = Math.max(0, Math.min(100, currentVal));
        const threshold = bar.threshold ?? 70;

        const barW = w - 50; // leave room for label
        const labelX = 0;

        // Label
        nova.drawText(bar.label, labelX, by + barHeight / 2 - 4, LABEL_COLOR, 10);

        // Background
        nova.drawRoundedRect(50, by, barW, barHeight, 4, BG_COLOR);

        // Fill
        const fillW = (clamped / 100) * barW;
        if (fillW > 0) {
          const ctx2 = nova.raw;
          ctx2.save();
          ctx2.beginPath();
          ctx2.roundRect(50, by, barW, barHeight, 4);
          ctx2.clip();

          const gradient = ctx2.createLinearGradient(50, by, 50 + fillW, by);
          if (clamped > threshold) {
            gradient.addColorStop(0, `hsl(${bar.colorHigh.h} ${bar.colorHigh.s}% ${bar.colorHigh.l}%)`);
            gradient.addColorStop(1, `hsl(${bar.colorLow.h} ${bar.colorLow.s}% ${bar.colorLow.l}%)`);
          } else {
            gradient.addColorStop(0, `hsl(${bar.colorLow.h} ${bar.colorLow.s}% ${bar.colorLow.l}%)`);
            gradient.addColorStop(1, `hsl(${bar.colorLow.h} ${bar.colorLow.s}% ${bar.colorLow.l + 8}%)`);
          }
          ctx2.fillStyle = gradient;
          ctx2.fillRect(50, by, fillW, barHeight);
          ctx2.restore();
        }

        // Value text
        nova.drawText(`${clamped.toFixed(0)}%`, 50 + barW + 4, by + barHeight / 2 - 4, LABEL_COLOR, 9);
      });
    }

    ctx.restore();
  }, [bars, barHeight, gap, vertical, columns]);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 500;

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      draw(t);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        prevValuesRef.current = bars.map(b => b.value);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [bars, draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw(1));
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className={className} style={{ height: totalHeight }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
