import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DesktopWidgetCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DesktopWidgetCard({
  title,
  children,
  className,
  onClick,
}: DesktopWidgetCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[40px]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
        onClick && "cursor-pointer hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(114,92,255,0.15)]",
        className
      )}
    >
      <div className="relative p-4">
        {title && (
          <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
