// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Wallpaper
// Data-driven ambient canvas with calm/money/business modes
// ═══════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type WallpaperMode = "calm" | "money" | "business";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface LivingWallpaperProps {
  mode?: WallpaperMode;
  className?: string;
  intensity?: number; // 0-1
}

const MODE_CONFIG = {
  calm: { hueBase: 265, hueDrift: 30, speed: 0.15, count: 40, sizeBase: 2 },
  money: { hueBase: 152, hueDrift: 40, speed: 0.3, count: 50, sizeBase: 2.5 },
  business: { hueBase: 38, hueDrift: 20, speed: 0.1, count: 35, sizeBase: 3 },
};

function createParticle(w: number, h: number, config: typeof MODE_CONFIG.calm): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * config.speed,
    vy: (Math.random() - 0.5) * config.speed,
    radius: config.sizeBase + Math.random() * 2,
    opacity: 0.02 + Math.random() * 0.06,
    hue: config.hueBase + (Math.random() - 0.5) * config.hueDrift,
    life: Math.random() * 300,
    maxLife: 200 + Math.random() * 200,
  };
}

export function LivingWallpaper({ mode = "calm", className, intensity = 0.5 }: LivingWallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const config = MODE_CONFIG[mode];

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    particles.current = Array.from({ length: Math.round(config.count * intensity) }, () =>
      createParticle(w, h, config)
    );
  }, [config, intensity]);

  useEffect(() => {
    init();
    const handleResize = () => init();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Fade in/out based on life
        const lifeFrac = p.life / p.maxLife;
        const fade = lifeFrac < 0.1 ? lifeFrac / 0.1 : lifeFrac > 0.9 ? (1 - lifeFrac) / 0.1 : 1;

        if (p.life >= p.maxLife) {
          particles.current[i] = createParticle(w, h, config);
          return;
        }

        const alpha = p.opacity * fade * intensity;

        // Draw glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 55%, 58%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, 55%, 58%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 55%, 65%, ${alpha * 1.5})`;
        ctx.fill();
      });

      // Draw faint connections (calm & business modes)
      if (mode !== "money") {
        const ps = particles.current;
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[i].x - ps[j].x;
            const dy = ps[i].y - ps[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const alpha = (1 - dist / 120) * 0.02 * intensity;
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = `hsla(${config.hueBase}, 40%, 50%, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, config, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
