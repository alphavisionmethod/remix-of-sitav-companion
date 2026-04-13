import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
}: DesktopWidgetCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/[0.12] bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(0,0,0,0.38)] hover:border-white/[0.18]",
        className
      )}
    >
      {/* Gradient accent overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", accent)} />
      {/* Radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="relative p-4">
        <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
