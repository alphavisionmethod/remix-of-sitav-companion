import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface QuickIdentityCardStackProps {
  questions: { key: string; label: string; options: { key: string; label: string }[]; selected: string[] }[];
  onToggle: (questionKey: string, optionKey: string) => void;
}

export function QuickIdentityCardStack({ questions, onToggle }: QuickIdentityCardStackProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <motion.div key={q.key}
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : qi * 0.08 }}
        >
          <p className="text-xs font-semibold text-foreground mb-2">{q.label}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map(opt => {
              const active = q.selected.includes(opt.key);
              return (
                <button key={opt.key} onClick={() => onToggle(q.key, opt.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border",
                    active ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/20"
                  )}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
