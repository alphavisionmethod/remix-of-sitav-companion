// ═══════════════════════════════════════════════════════════════
// Nova Canvas Chart — Real-time area chart using NovaContext
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback } from "react";
import { NovaContext, type NovaColor } from "@/platform/nova-sdk/graphics/context";

export interface ChartSeries {
  key: string;
  color: NovaColor;
  fillOpacity?: number;
  data: number[];
}

interface NovaCanvasChartProps {
  series: ChartSeries[];
  stacked?: boolean;
  maxY?: number;
  height?: number;
  yUnit?: string;
  gridLines?: number;
  className?: string;
}

const GRID_COLOR: NovaColor = { h: 0, s: 0, l: 50, a: 0.15 };
const LABEL_COLOR: NovaColor = { h: 0, s: 0, l: 55 };
const PADDING = { top: 8, right: 8, bottom: 20, left: 40 };

export function NovaCanvasChart({
  series,
  stacked = false,
  maxY,
  height = 180,
  yUnit = "",
  gridLines = 4,
  className = "",
}: NovaCanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const prevSeriesRef = useRef<ChartSeries[]>([]);
  const interpRef = useRef(0);

  const draw = useCallback(() => {
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

    const plotX = PADDING.left;
    const plotY = PADDING.top;
    const plotW = w - PADDING.left - PADDING.right;
    const plotH = h - PADDING.top - PADDING.bottom;

    if (plotW <= 0 || plotH <= 0) {
      ctx.restore();
      return;
    }

    // Compute Y max
    let computedMax = maxY ?? 100;
    if (!maxY) {
      for (const s of series) {
        for (const v of s.data) {
          if (v > computedMax) computedMax = v;
        }
      }
      computedMax = Math.ceil(computedMax * 1.1);
    }

    // Grid lines
    for (let i = 0; i <= gridLines; i++) {
      const gy = plotY + (plotH / gridLines) * i;
      const val = computedMax - (computedMax / gridLines) * i;

      ctx.strokeStyle = `hsl(0 0% 50% / 0.1)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(plotX, gy);
      ctx.lineTo(plotX + plotW, gy);
      ctx.stroke();

      nova.drawText(
        `${val.toFixed(val >= 10 ? 0 : 1)}${yUnit}`,
        2, gy - 4, LABEL_COLOR, 9
      );
    }

    // Time labels on X axis
    const maxLen = Math.max(...series.map(s => s.data.length), 1);
    const timeLabels = [0, Math.floor(maxLen * 0.25), Math.floor(maxLen * 0.5), Math.floor(maxLen * 0.75), maxLen - 1];
    for (const idx of timeLabels) {
      if (idx < 0 || idx >= maxLen) continue;
      const tx = plotX + (idx / Math.max(maxLen - 1, 1)) * plotW;
      nova.drawText(`${idx}s`, tx - 6, h - 10, LABEL_COLOR, 9);
    }

    // Interpolation factor
    const t = Math.min(interpRef.current, 1);

    // Draw series (back to front for stacking)
    const renderOrder = [...series].reverse();

    // For stacked: accumulate base values
    const baseValues = new Float32Array(maxLen);

    for (const s of renderOrder) {
      const data = s.data;
      const prevSeries = prevSeriesRef.current.find(ps => ps.key === s.key);
      const prevData = prevSeries?.data || [];
      const len = data.length;
      if (len < 2) continue;

      const fillOpacity = s.fillOpacity ?? 0.25;

      // Build path points
      const points: [number, number][] = [];
      for (let i = 0; i < len; i++) {
        const x = plotX + (i / (len - 1)) * plotW;
        const curr = data[i];
        const prev = i < prevData.length ? prevData[i] : curr;
        const interpolated = prev + (curr - prev) * t;
        const base = stacked ? baseValues[i] : 0;
        const val = interpolated + base;
        const y = plotY + plotH - (val / computedMax) * plotH;
        points.push([x, y]);
      }

      // Area fill with gradient
      const gradient = ctx.createLinearGradient(0, plotY, 0, plotY + plotH);
      gradient.addColorStop(0, `hsl(${s.color.h} ${s.color.s}% ${s.color.l}% / ${fillOpacity})`);
      gradient.addColorStop(1, `hsl(${s.color.h} ${s.color.s}% ${s.color.l}% / 0.02)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(points[0][0], plotY + plotH);
      for (const [x, y] of points) {
        ctx.lineTo(x, y);
      }
      ctx.lineTo(points[points.length - 1][0], plotY + plotH);
      ctx.closePath();
      ctx.fill();

      // Stroke line
      ctx.strokeStyle = `hsl(${s.color.h} ${s.color.s}% ${s.color.l}%)`;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i][0], points[i][1]);
        else ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();

      // Live dot at the end
      const lastPt = points[points.length - 1];
      // Glow
      const glowGrad = ctx.createRadialGradient(lastPt[0], lastPt[1], 0, lastPt[0], lastPt[1], 8);
      glowGrad.addColorStop(0, `hsl(${s.color.h} ${s.color.s}% ${s.color.l}% / 0.4)`);
      glowGrad.addColorStop(1, `hsl(${s.color.h} ${s.color.s}% ${s.color.l}% / 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lastPt[0], lastPt[1], 8, 0, Math.PI * 2);
      ctx.fill();
      // Dot
      nova.drawCircle(lastPt[0], lastPt[1], 3, s.color);
      nova.drawCircle(lastPt[0], lastPt[1], 1.5, { h: 0, s: 0, l: 100 });

      // Update base for stacking
      if (stacked) {
        for (let i = 0; i < len; i++) {
          const curr = data[i];
          const prev = i < prevData.length ? prevData[i] : curr;
          baseValues[i] += prev + (curr - prev) * t;
        }
      }
    }

    ctx.restore();
  }, [series, stacked, maxY, gridLines, yUnit]);

  // Animation loop
  useEffect(() => {
    prevSeriesRef.current = series.map(s => ({ ...s, data: [...s.data] }));
    interpRef.current = 0;

    const startTime = performance.now();
    const duration = 300; // ms interpolation

    const animate = (now: number) => {
      interpRef.current = Math.min((now - startTime) / duration, 1);
      draw();
      if (interpRef.current < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [series, draw]);

  // Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className={className} style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
