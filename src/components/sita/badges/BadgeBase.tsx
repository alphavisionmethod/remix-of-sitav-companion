import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeBaseProps {
  children: ReactNode;
  bg: string;
  text: string;
  border?: string;
  className?: string;
}

export function BadgeBase({ children, bg, text, border, className }: BadgeBaseProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-medium leading-none whitespace-nowrap",
        className
      )}
      style={{
        background: bg,
        color: text,
        border: border ? `1px solid ${border}` : undefined,
      }}
    >
      {children}
    </span>
  );
}
