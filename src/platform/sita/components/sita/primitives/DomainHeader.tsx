import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type DomainAccent = "business" | "money" | "concierge" | "files" | "system" | "boardroom";

interface DomainHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  domain: DomainAccent;
  actions?: ReactNode;
  className?: string;
}

const accentBar: Record<DomainAccent, string> = {
  business: "bg-[hsl(var(--sita-purple))]",
  money: "bg-[hsl(var(--trust-safe))]",
  concierge: "bg-[hsl(var(--sita-gold))]",
  files: "bg-blue-500",
  system: "bg-muted-foreground",
  boardroom: "bg-[hsl(var(--sita-purple-dark))]",
};

const accentGlow: Record<DomainAccent, string> = {
  business: "from-[hsl(var(--sita-purple))]/8 to-transparent",
  money: "from-[hsl(var(--trust-safe))]/8 to-transparent",
  concierge: "from-[hsl(var(--sita-gold))]/8 to-transparent",
  files: "from-blue-500/8 to-transparent",
  system: "from-muted-foreground/5 to-transparent",
  boardroom: "from-[hsl(var(--sita-purple-dark))]/8 to-transparent",
};

export const DomainHeader = ({ title, subtitle, icon: Icon, domain, actions, className }: DomainHeaderProps) => (
  <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
    {/* Accent bar */}
    <div className={cn("absolute top-0 left-0 right-0 h-1", accentBar[domain])} />
    {/* Ambient glow */}
    <div className={cn("absolute inset-0 bg-gradient-to-b pointer-events-none", accentGlow[domain])} />
    
    <div className="relative p-5 pt-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("rounded-xl p-2.5", `bg-[hsl(var(--${domain === "money" ? "trust-safe" : domain === "concierge" ? "sita-gold" : "sita-purple"}))]/10`)}>
            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);
