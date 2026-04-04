import { motion } from "framer-motion";
import { User, Users, Briefcase, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Check } from "lucide-react";

const MODES = [
  { key: "personal", icon: User, title: "Personal", desc: "Just me — my life, my priorities" },
  { key: "family", icon: Users, title: "Family", desc: "Shared household with family members" },
  { key: "work", icon: Briefcase, title: "Work", desc: "Professional use with team coordination" },
  { key: "managed", icon: Building, title: "Managed", desc: "Organization-managed device and policies" },
] as const;

interface OwnershipModeSelectorProps {
  selected: string;
  onSelect: (mode: string) => void;
}

export function OwnershipModeSelector({ selected, onSelect }: OwnershipModeSelectorProps) {
  const reduced = useReducedMotion();
  return (
    <div className="grid grid-cols-2 gap-3">
      {MODES.map((m, i) => (
        <motion.button key={m.key}
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.05 }}
          onClick={() => onSelect(m.key)}
          className={cn(
            "relative rounded-xl border p-4 text-left transition-all duration-200",
            selected === m.key ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
          )}
        >
          <m.icon className={cn("h-5 w-5 mb-2", selected === m.key ? "text-primary" : "text-muted-foreground")} />
          <p className="text-sm font-semibold text-foreground">{m.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
          {selected === m.key && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
