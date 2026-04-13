import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertOctagon, Shield, Clock, Hash, Sparkles } from "lucide-react";
import {
  ApprovalGate, DecisionSeal, ProofReceipt,
  ExecutionChainTimeline, buildDefaultChain,
} from "@/components/sita/primitives";
import { useBoardroomData } from "@/hooks/use-boardroom-data";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

const BLOCKERS = [
  { id: "b1", title: "CRM relationship review for TechCorp", status: "resolved" as const, domain: "business" },
  { id: "b2", title: "Reserve buffer must be above 60%", status: "resolved" as const, domain: "finance" },
  { id: "b3", title: "Advisor consensus above 65%", status: "pending" as const, domain: "system" },
];

const MOCK_APPROVALS = [
  { id: "ap1", title: "Initiate phased collections outreach", description: "Send segmented recovery messages to 3 overdue accounts. TechCorp gets personal outreach, others get standard follow-up.", riskLevel: "medium" as const, advisorEmoji: "📈", advisorName: "Revenue Advisor", advisorConfidence: 72 },
  { id: "ap2", title: "Defer Adobe CC subscription — $54/mo", description: "Pause Adobe Creative Cloud for 30 days to support reserve target. No active projects depend on it.", riskLevel: "low" as const, advisorEmoji: "📋", advisorName: "Obligations Advisor", advisorConfidence: 78 },
  { id: "ap3", title: "Approve NYC travel package — $1,840", description: "Flights, hotel (2 nights), restaurant reservations for Q2 client visit. All documents verified.", riskLevel: "high" as const, advisorEmoji: "✈️", advisorName: "Travel Advisor", advisorConfidence: 88 },
];

const MOCK_SEALED = [
  {
    decision: "Auto-pay AWS hosting approved",
    decidedBy: "Owner",
    timestamp: "Apr 2, 2026 — 10:14 AM",
    receiptHash: "0x8f3a…c7d2",
    status: "sealed" as const,
  },
  {
    decision: "Follow-up email to Sarah Chen approved",
    decidedBy: "Owner",
    timestamp: "Apr 2, 2026 — 09:30 AM",
    receiptHash: "0x2b1f…a9e5",
    status: "sealed" as const,
  },
];

const MOCK_RECEIPTS = [
  {
    title: "Payment received — Invoice #1038",
    hash: "0xa3f2…d8b1",
    verification: "verified" as const,
    timestamp: "Apr 2, 2026 — 08:00 AM",
    actor: "System",
    steps: [
      { label: "Invoice sent", status: "completed" as const, timestamp: "Mar 28" },
      { label: "Payment received", status: "completed" as const, timestamp: "Apr 2" },
      { label: "Verified against bank", status: "completed" as const, timestamp: "Apr 2" },
    ],
  },
  {
    title: "Email sent — Quote #1042",
    hash: "0x7c4e…f1a3",
    verification: "verified" as const,
    timestamp: "Apr 2, 2026 — 06:00 AM",
    actor: "Email Advisor",
  },
];

const executionChain = buildDefaultChain("approval");

export function BoardroomApprovalView({ scope, onNavigate }: Props) {
  const { pendingApprovals } = useBoardroomData();
  const [generatedReceipt, setGeneratedReceipt] = useState<null | { title: string; hash: string; time: string }>(null);

  const handleApprove = (title: string) => {
    const hash = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`;
    setGeneratedReceipt({ title, hash, time: new Date().toLocaleString() });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Execution Chain */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Execution Chain Status
        </p>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
          <ExecutionChainTimeline steps={executionChain} compact />
        </div>
      </div>

      {/* Requirements & Blockers */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3 flex items-center gap-1.5">
          <Shield size={11} /> Requirements & Blockers
        </p>
        <div className="space-y-1.5">
          {BLOCKERS.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-lg border p-3 flex items-center gap-3",
                b.status === "resolved"
                  ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5"
                  : "border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/5",
              )}
            >
              {b.status === "resolved"
                ? <CheckCircle size={14} className="text-[hsl(var(--trust-safe))] shrink-0" />
                : <AlertOctagon size={14} className="text-[hsl(var(--sita-gold))] shrink-0" />
              }
              <p className="text-[12px] text-[hsl(0_0%_100%/0.7)] flex-1">{b.title}</p>
              <span className={cn(
                "text-[9px] font-semibold px-2 py-0.5 rounded-full",
                b.status === "resolved"
                  ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                  : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
              )}>
                {b.status === "resolved" ? "Clear" : "Pending"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generated Receipt */}
      <AnimatePresence>
        {generatedReceipt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border-2 border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              >
                <Sparkles size={18} className="text-[hsl(var(--trust-safe))]" />
              </motion.div>
              <p className="text-sm font-bold text-[hsl(var(--trust-safe))]">Decision Receipt Generated</p>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.7)]">
                <span className="text-[hsl(0_0%_100%/0.4)] w-16 shrink-0">Action:</span>
                {generatedReceipt.title}
              </div>
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.7)]">
                <span className="text-[hsl(0_0%_100%/0.4)] w-16 shrink-0">Hash:</span>
                <span className="font-mono flex items-center gap-1"><Hash size={10} />{generatedReceipt.hash}</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.7)]">
                <span className="text-[hsl(0_0%_100%/0.4)] w-16 shrink-0">Time:</span>
                <span className="flex items-center gap-1"><Clock size={10} />{generatedReceipt.time}</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.7)]">
                <span className="text-[hsl(0_0%_100%/0.4)] w-16 shrink-0">Status:</span>
                <span className="text-[hsl(var(--trust-safe))] font-semibold">Sealed & Recorded</span>
              </div>
            </div>
            <button
              onClick={() => setGeneratedReceipt(null)}
              className="mt-3 text-[10px] text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)] transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Approvals */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Pending Approvals
        </p>
        <div className="space-y-3">
          {MOCK_APPROVALS.map((ap, i) => (
            <motion.div
              key={ap.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Advisor Recommendation Badge */}
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-sm">{ap.advisorEmoji}</span>
                <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.5)]">{ap.advisorName}</span>
                <span className="text-[9px] text-[hsl(280_50%_65%/0.6)] font-medium">
                  {ap.advisorConfidence}% confident
                </span>
              </div>
              <ApprovalGate
                title={ap.title}
                description={ap.description}
                riskLevel={ap.riskLevel}
                onApprove={() => handleApprove(ap.title)}
                onReject={() => {}}
                onSimulate={() => onNavigate("simulation")}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decision Seals */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Recent Decision Seals
        </p>
        <div className="space-y-3">
          {MOCK_SEALED.map((seal, i) => (
            <motion.div
              key={seal.receiptHash}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <DecisionSeal {...seal} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Proof Receipts */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Proof & Receipts
        </p>
        <div className="space-y-3">
          {MOCK_RECEIPTS.map((r, i) => (
            <motion.div
              key={r.hash}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
            >
              <ProofReceipt {...r} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
