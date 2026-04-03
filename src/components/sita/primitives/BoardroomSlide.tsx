import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BoardroomSlideProps {
  title: string;
  subtitle?: string;
  section?: string;
  children: ReactNode;
  variant?: "default" | "priorities" | "risks" | "opportunities" | "actions" | "decisions";
  slideNumber?: number;
  totalSlides?: number;
  className?: string;
}

const variantAccents = {
  default: "border-border",
  priorities: "border-l-4 border-l-[hsl(var(--sita-purple))] border-border",
  risks: "border-l-4 border-l-[hsl(var(--destructive))] border-border",
  opportunities: "border-l-4 border-l-[hsl(var(--sita-gold))] border-border",
  actions: "border-l-4 border-l-[hsl(var(--trust-safe))] border-border",
  decisions: "border-l-4 border-l-[hsl(var(--sita-purple-dark))] border-border",
};

export const BoardroomSlide = ({
  title, subtitle, section, children, variant = "default",
  slideNumber, totalSlides, className
}: BoardroomSlideProps) => (
  <div className={cn(
    "rounded-xl border bg-card p-6 md:p-8 shadow-sm transition-all",
    variantAccents[variant],
    className
  )}>
    <div className="flex items-start justify-between mb-6">
      <div>
        {section && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 block">
            {section}
          </span>
        )}
        <h2 className="text-lg font-display font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {slideNumber && totalSlides && (
        <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums shrink-0">
          {slideNumber}/{totalSlides}
        </span>
      )}
    </div>
    <div>{children}</div>
  </div>
);
