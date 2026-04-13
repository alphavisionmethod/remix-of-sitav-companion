import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface DesktopWidgetCardProps {
  title: string;
  children: ReactNode;
  accent?: string;
  className?: string;
  delay?: number;
}

export function DesktopWidgetCard({
  title,
  children,
  accent = "from-white/[0.12] to-white/[0.05]",
  className,
  delay = 0,
}: DesktopWidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.28)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_24px_90px_rgba(0,0,0,0.35)] hover:border-white/[0.16]",
        className
      )}
    >
      {/* Gradient accent overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", accent)} />
      {/* Radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="relative p-5">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
          {title}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
