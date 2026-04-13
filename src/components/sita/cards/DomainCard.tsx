// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain-Aware Card
// Reads CSS variables from DomainAppShell atmosphere layer
// Adapts radius, padding, shadow, hover per domain automatically
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DomainCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function DomainCard({ children, className, onClick, hover = true }: DomainCardProps) {
  return (
    <motion.div
      whileHover={hover ? {
        y: "var(--domain-hover-lift, -2px)" as any,
        transition: { duration: 0.15 },
      } : undefined}
      onClick={onClick}
      className={cn(
        "border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]",
        "transition-all",
        hover && onClick && "cursor-pointer",
        className
      )}
      style={{
        borderRadius: "var(--domain-card-radius, 16px)",
        padding: "var(--domain-density, 1rem)",
        boxShadow: "var(--domain-shadow, 0 2px 8px hsl(0 0% 0% / 0.1))",
        transitionDuration: "var(--domain-motion-speed, 200ms)",
      }}
    >
      {children}
    </motion.div>
  );
}
