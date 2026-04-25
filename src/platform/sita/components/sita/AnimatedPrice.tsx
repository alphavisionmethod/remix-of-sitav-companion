import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
  flash?: boolean;
}

export function AnimatedPrice({ value, prefix = "$", decimals = 2, className = "", flash = true }: AnimatedPriceProps) {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const prevValue = useRef(value);
  const spring = useSpring(value, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, v => `${prefix}${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`);

  useEffect(() => {
    if (value !== prevValue.current) {
      setDirection(value > prevValue.current ? "up" : "down");
      spring.set(value);
      prevValue.current = value;
      if (flash) {
        const t = setTimeout(() => setDirection(null), 800);
        return () => clearTimeout(t);
      }
    }
  }, [value, spring, flash]);

  return (
    <motion.span
      className={`inline-block font-mono tabular-nums transition-colors duration-300 ${
        direction === "up" ? "text-[hsl(var(--trust-safe))]" :
        direction === "down" ? "text-destructive" :
        ""
      } ${className}`}
    >
      {display}
    </motion.span>
  );
}

// Simulated real-time price ticker hook
export function useSimulatedPrices(basePrice: number, volatility = 0.002, intervalMs = 2000) {
  const [price, setPrice] = useState(basePrice);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrice(prev => {
        const change = prev * (Math.random() - 0.5) * 2 * volatility;
        return Math.max(0.01, prev + change);
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [basePrice, volatility, intervalMs]);

  return price;
}
