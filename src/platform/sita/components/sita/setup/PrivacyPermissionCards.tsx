import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface PermissionItem {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
  trustNote: string;
}

interface PrivacyPermissionCardsProps {
  permissions: PermissionItem[];
  choices: Record<string, boolean>;
  onToggle: (key: string) => void;
}

export function PrivacyPermissionCards({ permissions, choices, onToggle }: PrivacyPermissionCardsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="space-y-2">
      {permissions.map((p, i) => {
        const enabled = choices[p.key] ?? false;
        const isExpanded = expanded === p.key;
        return (
          <motion.div key={p.key}
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.04 }}
            className={cn("rounded-xl border transition-all", enabled ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20")}
          >
            <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : p.key)}>
              <p.icon className={cn("h-4 w-4 shrink-0", enabled ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.description}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); onToggle(p.key); }}
                className={cn("h-5 w-9 rounded-full transition-colors relative shrink-0",
                  enabled ? "bg-primary" : "bg-muted")}>
                <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                  enabled ? "translate-x-4" : "translate-x-0.5")} />
              </button>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-180")} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={reduced ? { height: "auto" } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? {} : { height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5 pt-0 space-y-2">
                    <p className="text-[11px] text-muted-foreground">{p.detail}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-trust-safe">
                      <Shield className="h-3 w-3" />
                      {p.trustNote}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
