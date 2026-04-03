import { motion } from "framer-motion";
import { type LucideIcon, Plus, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyStateCTAProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: Array<{
    label: string;
    onClick?: () => void;
    to?: string;
    variant?: "primary" | "secondary";
    icon?: LucideIcon;
  }>;
  tip?: string;
}

export const EmptyStateCTA = ({ icon: Icon, title, description, actions, tip }: EmptyStateCTAProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-secondary/20 to-transparent p-10 md:p-14"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15"
      >
        <Icon className="h-8 w-8 text-primary" />
      </motion.div>

      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions.map((action, i) => {
          const ActionIcon = action.icon || (i === 0 ? Plus : ArrowRight);
          const isPrimary = action.variant === "primary" || i === 0;

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (action.onClick) action.onClick();
                else if (action.to) navigate(action.to);
              }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                isPrimary
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <ActionIcon className="h-4 w-4" /> {action.label}
            </motion.button>
          );
        })}
      </div>

      {tip && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground/60"
        >
          <Sparkles className="h-3 w-3" /> {tip}
        </motion.p>
      )}
    </motion.div>
  );
};
