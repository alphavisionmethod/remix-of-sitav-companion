// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Wallpaper Parallax (W5)
// Shifts wallpaper 2-3px based on mouse position for depth
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";

export function useWallpaperParallax(strength = 3) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const raf = useRef(0);

  const handleMove = useCallback((e: MouseEvent) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = ((e.clientX - cx) / cx) * strength;
      const dy = ((e.clientY - cy) / cy) * strength;
      setOffset({ x: dx, y: dy });
    });
  }, [strength]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf.current);
    };
  }, [handleMove]);

  return offset;
}
