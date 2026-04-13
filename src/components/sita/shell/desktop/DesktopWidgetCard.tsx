import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DesktopWidgetCardProps {
  title: string;
  children: ReactNode;
  accent?: string;
  className?: string;
}

export function DesktopWidgetCard({
  title,
  children,
  accent = "from-white/[0.12] to-white/[0.05]",
  className,
}: DesktopWidgetCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.28)]",
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
    </div>
  );
}
