import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ModelNode {
  key: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  strength: number; // 0-100
}

interface LiveEnvironmentModelPreviewProps {
  nodes: ModelNode[];
  className?: string;
}

export function LiveEnvironmentModelPreview({ nodes, className }: LiveEnvironmentModelPreviewProps) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-4", className)}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your world model</p>
      <div className="space-y-1.5">
        {nodes.map((n, i) => (
          <motion.div key={n.key}
            initial={reduced ? {} : { opacity: 0, x: 8 }}
            animate={{ opacity: n.active ? 1 : 0.4, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            className="flex items-center gap-2.5"
          >
            <n.icon className={cn("h-3.5 w-3.5 shrink-0", n.active ? "text-primary" : "text-muted-foreground/40")} />
            <span className="text-[11px] text-foreground flex-1 truncate">{n.label}</span>
            <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${n.strength}%` }}
                transition={{ delay: reduced ? 0 : 0.3 + i * 0.1, duration: reduced ? 0 : 0.6 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
