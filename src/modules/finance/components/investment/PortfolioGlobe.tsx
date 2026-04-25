import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PORTFOLIO } from "@/hooks/useInvestmentOfficeData";

interface PortfolioGlobeProps {
  className?: string;
}

export function PortfolioGlobe({ className }: PortfolioGlobeProps) {
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState(0);

  const holdings = PORTFOLIO.holdings;
  const totalValue = PORTFOLIO.totalValue;

  // Animated count-up
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = totalValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalValue) {
        setDisplayValue(totalValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalValue]);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 0.3);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const cardCount = holdings.length;

  return (
    <div className={`relative ${className}`}>
      {/* 3D Ring Container */}
      <div className="relative w-full h-[320px] perspective-[800px]">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {holdings.map((h, i) => {
            const angle = (i / cardCount) * 360;
            const radius = 130;
            const isHovered = hoveredIndex === i;
            const allocPct = (h.currentValue / totalValue) * 100;
            const scale = 0.7 + (allocPct / 100) * 0.6;

            return (
              <motion.div
                key={h.instrument.id}
                className="absolute cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateY(-${angle}deg)`,
                }}
                onMouseEnter={() => { setHoveredIndex(i); }}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{ scale: isHovered ? 1.2 : scale }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className={`rounded-xl border bg-card p-3 min-w-[90px] text-center transition-all duration-200 ${
                  isHovered ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
                }`}>
                  <span className="text-xl block">{h.instrument.logoIcon}</span>
                  <p className="text-[10px] font-bold text-foreground mt-1">{h.instrument.symbol}</p>
                  <p className={`text-[9px] font-semibold ${h.unrealizedPnlPct >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                    {h.unrealizedPnlPct >= 0 ? "+" : ""}{h.unrealizedPnlPct.toFixed(1)}%
                  </p>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-0.5 mt-1.5 pt-1.5 border-t border-border"
                      >
                        <p className="text-[9px] text-muted-foreground">${h.currentValue.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">{allocPct.toFixed(1)}% alloc</p>
                        <p className="text-[9px] text-muted-foreground">{h.quantity} shares</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <motion.p
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            ${displayValue.toLocaleString()}
          </motion.p>
          <p className="text-[10px] text-muted-foreground">Total Portfolio</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-bold ${PORTFOLIO.totalPnlPct >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {PORTFOLIO.totalPnlPct >= 0 ? "+" : ""}{PORTFOLIO.totalPnlPct.toFixed(2)}%
            </span>
            <span className="text-[9px] text-muted-foreground">all time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
