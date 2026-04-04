import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TrustWorkflowPreviewProps {
  stages: string[];
  activeStages: boolean[];
}

export function TrustWorkflowPreview({ stages, activeStages }: TrustWorkflowPreviewProps) {
  const reduced = useReducedMotion();

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Workflow preview</p>
      <div className="space-y-1.5">
        {stages.map((s, i) => {
          const active = activeStages[i];
          return (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                initial={reduced ? {} : { scale: 0.8 }}
                animate={{ scale: 1, opacity: active ? 1 : 0.3 }}
                transition={{ delay: reduced ? 0 : i * 0.1 }}
                className={cn("h-2 w-2 rounded-full shrink-0", active ? "bg-primary" : "bg-muted")}
              />
              <span className={cn("text-[11px] flex-1", active ? "text-foreground font-medium" : "text-muted-foreground/50")}>
                {s}
              </span>
              {active && !reduced && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 24 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="h-0.5 bg-primary/30 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
