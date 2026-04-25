import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface SystemStatusPreviewProps {
  modules: { id: string; label: string; icon: React.ReactNode; active: boolean }[];
  className?: string;
}

export function SystemStatusPreview({ modules, className }: SystemStatusPreviewProps) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("rounded-2xl border border-border bg-card/80 p-4 space-y-3", className)}>
      <div className="rounded-lg bg-secondary/30 border border-border p-3 space-y-2">
        {/* Mini desktop preview */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sita-gold))]/60" />
          <div className="h-1.5 w-1.5 rounded-full bg-trust-safe/60" />
          <div className="flex-1 h-1 bg-muted rounded-full ml-2" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {modules.map((m, i) => (
            <motion.div key={m.id}
              initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: m.active ? 1 : 0.3, scale: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.1 }}
              className={cn(
                "rounded-lg border p-2 text-center transition-all",
                m.active ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20"
              )}
            >
              <div className="flex justify-center mb-1">{m.icon}</div>
              <p className="text-[9px] text-muted-foreground truncate">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
