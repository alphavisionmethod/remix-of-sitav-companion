import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface SetupStageHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  align?: "center" | "left";
}

export function SetupStageHeader({ title, subtitle, icon: Icon, align = "center" }: SetupStageHeaderProps) {
  const reduced = useReducedMotion();
  const textAlign = align === "center" ? "text-center" : "text-left";
  return (
    <div className={textAlign}>
      {Icon && (
        <motion.div
          initial={reduced ? {} : { scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4"
        >
          <Icon className="h-7 w-7 text-primary-foreground" />
        </motion.div>
      )}
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
