import { useState, useEffect, useRef } from "react";

/**
 * Premium count-up animation hook.
 * Animates from 0 to target with ease-out cubic easing.
 */
export function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return current;
}

/**
 * Formats a count-up value with prefix/suffix extracted from a display string.
 * e.g. formatCountUp("$12.5K", animatedNum) → "$13K" during animation
 */
export function useCountUpFormatted(displayValue: string | number, duration = 800): string {
  const numericTarget = typeof displayValue === "number"
    ? displayValue
    : parseFloat(String(displayValue).replace(/[^0-9.]/g, "")) || 0;
  const prefix = typeof displayValue === "string" ? (displayValue.match(/^[^0-9]*/)?.[0] || "") : "";
  const suffix = typeof displayValue === "string" ? (displayValue.match(/[^0-9.]*$/)?.[0] || "") : "";
  const hasDecimal = typeof displayValue === "string" && /\d+\.\d+/.test(displayValue);
  const animated = useCountUp(numericTarget * (hasDecimal ? 10 : 1), duration);
  const finalNum = hasDecimal ? (animated / 10).toFixed(1) : animated.toLocaleString();
  return numericTarget > 0 ? `${prefix}${finalNum}${suffix}` : String(displayValue);
}
