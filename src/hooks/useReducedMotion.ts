import { useState, useEffect } from "react";

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) return true;
    const mem = (navigator as NavigatorWithDeviceMemory).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    if ((mem && mem < 4) || (cores && cores < 4)) return true;
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}