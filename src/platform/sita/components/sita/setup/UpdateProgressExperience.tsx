import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UpdateProgressExperienceProps {
  tasks: { id: string; label: string; progress: number; status: "pending" | "running" | "done" }[];
}

export function UpdateProgressExperience({ tasks }: UpdateProgressExperienceProps) {
  const reduced = useReducedMotion();
  const running = tasks.filter(t => t.status === "running");
  if (!running.length) return null;
  const avgProgress = Math.round(running.reduce((s, t) => s + t.progress, 0) / running.length);

  return (
    <motion.div initial={reduced ? {} : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      className="mb-4 rounded-xl border border-border bg-secondary/20 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Background tasks</span>
        <span className="text-[10px] text-muted-foreground">{avgProgress}%</span>
      </div>
      <Progress value={avgProgress} className="h-1" />
      <div className="mt-2 space-y-1">
        {running.map(t => (
          <div key={t.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <motion.div animate={reduced ? {} : { rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Activity className="h-2.5 w-2.5 text-primary" />
            </motion.div>
            {t.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
