import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertOctagon, Shield, Clock, Hash, Sparkles, Timer } from "lucide-react";
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
  { id: "ap1", title: "Initiate phased collections outreach", description: "Send segmented recovery messages to 3 overdue accounts. TechCorp gets personal outreach, others get standard follow-up.", riskLevel: "medium" as const, advisorEmoji: "📈", advisorName: "Revenue Advisor", advisorConfidence: 72, urgencyHours: 4, beforeState: "$18.5K overdue, 3 accounts aging", afterState: "$16.8K recovered, relationships preserved" },
  { id: "ap2", title: "Defer Adobe CC subscription — $54/mo", description: "Pause Adobe Creative Cloud for 30 days to support reserve target. No active projects depend on it.", riskLevel: "low" as const, advisorEmoji: "📋", advisorName: "Obligations Advisor", advisorConfidence: 78, urgencyHours: 48, beforeState: "Reserves at $7,200 (72% target)", afterState: "Reserves at $7,542 (75% target)" },
  { id: "ap3", title: "Approve NYC travel package — $1,840", description: "Flights, hotel (2 nights), restaurant reservations for Q2 client visit. All documents verified.", riskLevel: "high" as const, advisorEmoji: "✈️", advisorName: "Travel Advisor", advisorConfidence: 88, urgencyHours: 2, beforeState: "Prices at $1,840, rising $120/day", afterState: "Locked at $1,840, full logistics booked" },
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

// Signature line animation component
function SignatureAnimation({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      <motion.svg width="200" height="40" viewBox="0 0 200 40" className="opacity-80">
        <motion.path
          d="M10 30 Q30 5 50 25 Q70 45 90 20 Q110 -5 130 25 Q150 45 170 15 L190 20"
          fill="none"
          stroke="hsl(var(--trust-safe))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

// Gold particle seal stamp
function SealStampCeremony({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    distance: 30 + Math.random() * 20,
    size: 2 + Math.random() * 3,
  }));

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    >
      {/* Camera shake */}
      <motion.div
        animate={{ x: [0, -3, 3, -2, 0], y: [0, 2, -2, 1, 0] }}
        transition={{ duration: 0.3 }}
      >
        {/* Seal stamp */}
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-[hsl(var(--sita-gold))] flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--sita-gold) / 0.15)" }}
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <CheckCircle size={24} className="text-[hsl(var(--sita-gold))]" />
        </motion.div>
      </motion.div>
      {/* Gold particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: "hsl(var(--sita-gold))",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
          }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

export function BoardroomApprovalView({ scope, onNavigate }: Props) {
  const { pendingApprovals } = useBoardroomData();
  const [generatedReceipt, setGeneratedReceipt] = useState<null | { title: string; hash: string; time: string }>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showSealStamp, setShowSealStamp] = useState(false);

  const handleApprove = (title: string) => {
    setShowSignature(true);
    setTimeout(() => {
      setShowSignature(false);
      setShowSealStamp(true);
      setTimeout(() => {
        setShowSealStamp(false);
        const hash = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`;
        setGeneratedReceipt({ title, hash, time: new Date().toLocaleString() });
      }, 2000);
    }, 1300);
  };

  return (
    <div className="p-6 space-y-6 relative">
      <SignatureAnimation show={showSignature} />
      <SealStampCeremony show={showSealStamp} />

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

      {/* Pending Approvals with Before/After + Countdown */}
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
              {/* Advisor + Countdown */}
              <div className="flex items-center justify-between mb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{ap.advisorEmoji}</span>
                  <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.5)]">{ap.advisorName}</span>
                  <span className="text-[9px] text-[hsl(280_50%_65%/0.6)] font-medium">
                    {ap.advisorConfidence}% confident
                  </span>
                </div>
                {/* Countdown urgency */}
                <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]">
                  <Timer size={9} />
                  <span className="font-semibold">{ap.urgencyHours}h window</span>
                </div>
              </div>

              {/* Before/After preview */}
              <div className="grid grid-cols-2 gap-2 mb-2 px-1">
                <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2">
                  <p className="text-[8px] font-bold uppercase text-[hsl(0_0%_100%/0.25)] mb-0.5">Before</p>
                  <p className="text-[10px] text-[hsl(0_0%_100%/0.45)]">{ap.beforeState}</p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 p-2">
                  <p className="text-[8px] font-bold uppercase text-[hsl(var(--trust-safe))]/60 mb-0.5">After</p>
                  <p className="text-[10px] text-[hsl(var(--trust-safe))]/80">{ap.afterState}</p>
                </div>
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
