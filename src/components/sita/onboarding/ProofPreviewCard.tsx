// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof-of-Action Preview Card
// Shows a simulated action chain: detected → suggested → drafted → approved → executed
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, MessageSquare, FileEdit, Check, ShieldCheck, ChevronDown, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProofPreviewCardProps {
  trustLevel: number;
  className?: string;
}

const PROOF_CHAIN = [
  {
    icon: Eye,
    label: "Pattern detected",
    desc: "SITA notices a recurring $14.99 charge for an unused service",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    minLevel: 1,
  },
  {
    icon: MessageSquare,
    label: "Suggestion prepared",
    desc: "\"Cancel this subscription\" — with projected savings of $179.88/year",
    color: "text-primary",
    bgColor: "bg-primary/10",
    minLevel: 2,
  },
  {
    icon: FileEdit,
    label: "Action drafted",
    desc: "Cancellation request prepared, not yet sent",
    color: "text-accent",
    bgColor: "bg-accent/10",
    minLevel: 3,
  },
  {
    icon: Check,
    label: "Your approval",
    desc: "You review and tap \"Approve\" — or dismiss",
    color: "text-foreground",
    bgColor: "bg-secondary/40",
    minLevel: 4,
  },
  {
    icon: ShieldCheck,
    label: "Executed with proof",
    desc: "Cancellation confirmed. Receipt stored in your proof log.",
    color: "text-[hsl(var(--trust-safe))]",
    bgColor: "bg-[hsl(var(--trust-safe))]/10",
    minLevel: 5,
  },
];

const AUDIT_ENTRIES = [
  { time: "10:32 AM", action: "Detected recurring charge", hash: "0x7f3a…c2b1", status: "logged" },
  { time: "10:32 AM", action: "Prepared cancellation suggestion", hash: "0x8d4b…e3c2", status: "logged" },
  { time: "10:33 AM", action: "Drafted cancellation request", hash: "0x9e5c…f4d3", status: "logged" },
  { time: "10:34 AM", action: "User approved cancellation", hash: "0xa06d…05e4", status: "approved" },
  { time: "10:34 AM", action: "Cancellation executed", hash: "0xb17e…16f5", status: "executed" },
];

export function ProofPreviewCard({ trustLevel, className }: ProofPreviewCardProps) {
  const [showAuditLog, setShowAuditLog] = useState(false);
  const reduced = useReducedMotion();
  const visibleSteps = PROOF_CHAIN.filter(s => trustLevel >= s.minLevel);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Action chain visualization */}
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          How SITA proves every action
        </p>

        <div className="space-y-2">
          {visibleSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: reduced ? 0 : idx * 0.1,
                  type: "spring",
                  damping: 24,
                  stiffness: 300,
                }}
                className="flex items-start gap-3"
              >
                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", step.bgColor)}>
                    <Icon className={cn("h-3.5 w-3.5", step.color)} />
                  </div>
                  {idx < visibleSteps.length - 1 && (
                    <div className="w-px h-3 bg-border/40 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={cn("text-xs font-semibold", step.color)}>{step.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Audit log preview */}
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setShowAuditLog(!showAuditLog)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Proof log preview
            </span>
          </div>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            showAuditLog && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showAuditLog && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5">
                <p className="text-[10px] text-muted-foreground mb-2">
                  Every action SITA takes is permanently recorded with full context
                </p>
                {AUDIT_ENTRIES.filter((_, i) => trustLevel >= PROOF_CHAIN[i]?.minLevel).map((entry, idx) => (
                  <motion.div
                    key={entry.hash}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : idx * 0.05 }}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-md bg-secondary/20"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground font-mono w-14 flex-shrink-0">{entry.time}</span>
                    <span className="text-[10px] text-foreground/80 flex-1 min-w-0 truncate">{entry.action}</span>
                    <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0">{entry.hash}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
