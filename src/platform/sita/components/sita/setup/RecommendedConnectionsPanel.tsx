import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Shield, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ConnectionItem {
  key: string;
  icon: LucideIcon;
  title: string;
  reason: string;
  capabilities: string[];
  trustNote: string;
  recommended: boolean;
  connected: boolean;
}

interface RecommendedConnectionsPanelProps {
  connections: ConnectionItem[];
  onConnect: (key: string) => void;
  onDefer: (key: string) => void;
}

export function RecommendedConnectionsPanel({ connections, onConnect, onDefer }: RecommendedConnectionsPanelProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-2">
      {connections.map((c, i) => (
        <motion.div key={c.key}
          initial={reduced ? {} : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.05 }}
          className={cn(
            "rounded-xl border p-4 transition-all",
            c.connected ? "border-trust-safe/30 bg-trust-safe/5" :
            c.recommended ? "border-primary/30 bg-primary/5" :
            "border-border bg-secondary/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg p-2", c.connected ? "bg-trust-safe/15" : "bg-secondary")}>
              <c.icon className={cn("h-4 w-4", c.connected ? "text-trust-safe" : "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">{c.title}</p>
                {c.recommended && !c.connected && (
                  <span className="rounded-full bg-[hsl(var(--sita-gold))]/15 px-1.5 py-0.5 text-[9px] font-medium text-[hsl(var(--sita-gold))]">Recommended</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.reason}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-trust-safe">
                <Shield className="h-2.5 w-2.5" />
                {c.trustNote}
              </div>
            </div>
            {!c.connected && (
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => onConnect(c.key)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1">
                  Connect <ChevronRight className="h-2.5 w-2.5" />
                </button>
                <button onClick={() => onDefer(c.key)}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors text-center">
                  Later
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
