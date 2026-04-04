import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AdvancedDetailsDisclosureProps {
  label?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AdvancedDetailsDisclosure({ label = "Fine-tune", children, defaultOpen = false }: AdvancedDetailsDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  return (
    <div className="rounded-xl border border-border bg-secondary/10 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/20 transition-colors">
        <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">{label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { height: "auto" } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? {} : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
