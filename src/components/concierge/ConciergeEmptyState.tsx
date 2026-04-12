import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConciergeDomain = "travel" | "errands" | "admin" | "appointments" | "services" | "generic";

const DOMAIN_COPY: Record<ConciergeDomain, { title: string; description: string }> = {
  travel: {
    title: "No trips planned yet",
    description: "When you're ready, we'll help you prepare beautifully.",
  },
  errands: {
    title: "Nothing queued",
    description: "Enjoy the calm — we'll bundle things when they come up.",
  },
  admin: {
    title: "All clear",
    description: "No admin lurking — enjoy your day.",
  },
  appointments: {
    title: "No upcoming appointments",
    description: "Your schedule is open — we'll help you prepare when something comes up.",
  },
  services: {
    title: "No coordination needed",
    description: "Your vendor network is quiet right now.",
  },
  generic: {
    title: "Nothing urgent",
    description: "Enjoy your day — we're watching so you don't have to.",
  },
};

interface ConciergeEmptyStateProps {
  domain?: ConciergeDomain;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
}

export function ConciergeEmptyState({
  domain = "generic",
  icon: Icon = Sparkles,
  title,
  description,
  className,
}: ConciergeEmptyStateProps) {
  const copy = DOMAIN_COPY[domain];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl",
        "bg-gradient-to-br from-primary/[0.04] via-accent/[0.025] to-transparent",
        "border border-dashed border-border/30",
        className
      )}
    >
      <div className="rounded-2xl bg-primary/[0.06] p-4 mb-5">
        <Icon className="h-9 w-9 text-primary/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        {title || copy.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description || copy.description}
      </p>
    </motion.div>
  );
}
