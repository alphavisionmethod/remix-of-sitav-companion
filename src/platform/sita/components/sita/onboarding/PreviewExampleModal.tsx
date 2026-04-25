import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";

const examples: Record<string, { title: string; desc: string; detail: string }> = {
  trust: {
    title: "Simulate Before Action",
    desc: "What it looks like when SITA pauses before acting",
    detail: "SITA detects a $2,400 invoice is overdue. Instead of auto-sending a reminder, it shows you the draft, the client's recent context, and the projected outcome. You approve, modify, or dismiss — then proof is logged.",
  },
  "money-advisor": {
    title: "Money Advisor Weekly",
    desc: "What the Money Advisor surfaces each week",
    detail: "Every Monday: 3 bills due this week, 1 subscription renewal, your cash position vs. last week, and any spending anomalies. One tap to approve scheduled payments.",
  },
  boardroom: {
    title: "Boardroom Session",
    desc: "What your Friday boardroom looks like",
    detail: "A decision-ready packet: actions completed, pending approvals, recovered revenue, advisor recommendations, and a confidence score for each domain. Takes 5 minutes to review.",
  },
  "proof-center": {
    title: "Proof Center",
    desc: "How SITA records what happened",
    detail: "Every action creates an immutable receipt: who requested it, which advisor recommended it, who approved it, what happened, and the outcome. Your audit trail is always complete.",
  },
  "recovered-lead": {
    title: "Recovered Lead",
    desc: "How a recovered lead appears",
    detail: "A client went quiet for 14 days. SITA flagged it, the Business Advisor drafted a check-in email with context from your last conversation. You approved — the client replied the same day.",
  },
};

interface PreviewExampleModalProps {
  exampleKey: string;
  onClose: () => void;
}

export function PreviewExampleModal({ exampleKey, onClose }: PreviewExampleModalProps) {
  const example = examples[exampleKey];
  if (!example) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-bold text-foreground">{example.title}</h3>
          <p className="text-sm text-muted-foreground">{example.desc}</p>
          <div className="rounded-xl bg-secondary/30 p-4 mt-4">
            <p className="text-xs text-foreground leading-relaxed">{example.detail}</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={onClose}
            className="w-full rounded-xl bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Button to trigger preview
export function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
    >
      <Eye className="h-3 w-3" /> Show me an example
    </button>
  );
}
