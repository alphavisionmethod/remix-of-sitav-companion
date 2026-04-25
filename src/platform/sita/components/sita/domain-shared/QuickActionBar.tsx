import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "accent" | "destructive";
}

const variantClasses = {
  default: "bg-secondary/50 hover:bg-secondary/80 text-foreground border-border/30",
  accent: "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20",
  destructive: "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20",
};

export const QuickActionBar = ({ actions, label = "Quick Actions" }: {
  actions: QuickAction[];
  label?: string;
}) => {
  if (actions.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => {
          const cls = variantClasses[action.variant || "default"];
          return (
            <motion.button
              key={action.label}
              onClick={action.onClick}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-colors ${cls}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
