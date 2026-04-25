// ═══════════════════════════════════════════════════════════════
// SITA OS — DecisionSeal Primitive
// Animated approval stamp with receipt hash
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check, Lock, Hash, Clock } from "lucide-react";

interface DecisionSealProps {
  decision: string;
  decidedBy: string;
  timestamp: string;
  receiptHash: string;
  status: "pending" | "sealed" | "rejected";
  onSeal?: () => void;
  className?: string;
}

export function DecisionSeal({ decision, decidedBy, timestamp, receiptHash, status, onSeal, className }: DecisionSealProps) {
  const [animating, setAnimating] = useState(false);

  const handleSeal = () => {
    if (status !== "pending" || animating) return;
    setAnimating(true);
    setTimeout(() => { setAnimating(false); onSeal?.(); }, 1200);
  };

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", 
      status === "sealed" ? "border-[hsl(var(--trust-safe)/0.4)]" :
      status === "rejected" ? "border-destructive/40" : "border-border",
      className
    )}>
      <div className="p-4">
        <p className="text-sm font-semibold text-foreground mb-1">{decision}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timestamp}</span>
          <span>by {decidedBy}</span>
        </div>
      </div>

      {/* Seal Area */}
      <div className="relative border-t border-border bg-muted/20 p-4 flex items-center justify-center min-h-[80px]">
        <AnimatePresence mode="wait">
          {status === "pending" && !animating && (
            <motion.button
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSeal}
              className="px-6 py-2 rounded-lg bg-[hsl(var(--sita-purple))] hover:bg-[hsl(var(--sita-purple-dark))] text-white text-[12px] font-semibold transition-colors flex items-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" /> Seal Decision
            </motion.button>
          )}

          {(animating || status === "sealed") && (
            <motion.div
              key="seal"
              initial={{ scale: 3, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex flex-col items-center gap-2"
            >
              {/* Stamp */}
              <div className="w-16 h-16 rounded-full border-4 border-[hsl(var(--trust-safe))] flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Check className="h-8 w-8 text-[hsl(var(--trust-safe))]" strokeWidth={3} />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--trust-safe))]"
              >
                SEALED
              </motion.p>
            </motion.div>
          )}

          {status === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full border-4 border-destructive flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-destructive">✕</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive mt-2">REJECTED</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple Effect */}
        {animating && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-16 h-16 rounded-full bg-[hsl(var(--trust-safe)/0.3)]"
          />
        )}
      </div>

      {/* Receipt Hash */}
      <div className="px-4 py-2 border-t border-border bg-muted/10 flex items-center gap-2">
        <Hash className="h-3 w-3 text-muted-foreground/50" />
        <code className="text-[9px] font-mono text-muted-foreground/60 truncate">{receiptHash}</code>
      </div>
    </div>
  );
}
