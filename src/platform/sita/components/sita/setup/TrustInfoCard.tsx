import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface TrustInfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  detail?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TrustInfoCard({ icon: Icon, title, description, detail, selected, onClick }: TrustInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 transition-all duration-200 cursor-pointer",
        selected ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 transition-colors", selected ? "bg-primary/15" : "bg-secondary")}>
          <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {detail && (
          <button onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
            className="rounded-full p-1 hover:bg-secondary transition-colors">
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </div>
      {detail && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={reduced ? { height: "auto" } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduced ? {} : { height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
