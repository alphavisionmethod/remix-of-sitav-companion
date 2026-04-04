import { motion } from "framer-motion";
import { UserPlus, Upload, Link, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const PATHS = [
  { key: "new", icon: UserPlus, title: "New Account", desc: "Start fresh with a new SITA environment" },
  { key: "restore", icon: Upload, title: "Restore Backup", desc: "Restore from a previous SITA environment" },
  { key: "link", icon: Link, title: "Link Existing", desc: "Connect to an existing SITA account" },
] as const;

interface AccountPathChooserProps {
  selected: string;
  onSelect: (path: string) => void;
}

export function AccountPathChooser({ selected, onSelect }: AccountPathChooserProps) {
  const reduced = useReducedMotion();
  return (
    <div className="space-y-2">
      {PATHS.map((p, i) => (
        <motion.button key={p.key}
          initial={reduced ? {} : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.05 }}
          onClick={() => onSelect(p.key)}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
            selected === p.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
          )}
        >
          <div className={cn("rounded-lg p-2", selected === p.key ? "bg-primary/15" : "bg-secondary")}>
            <p.icon className={cn("h-4 w-4", selected === p.key ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
          </div>
          {selected === p.key ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
          )}
        </motion.button>
      ))}
    </div>
  );
}
