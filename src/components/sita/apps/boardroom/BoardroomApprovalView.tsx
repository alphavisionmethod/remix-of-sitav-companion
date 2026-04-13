import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ApprovalGate, DecisionSeal, ProofReceipt,
  ExecutionChainTimeline, buildDefaultChain,
} from "@/components/sita/primitives";
import { useBoardroomData } from "@/hooks/use-boardroom-data";

const MOCK_APPROVALS = [
  { id: "ap1", title: "Initiate phased collections outreach", description: "Send segmented recovery messages to 3 overdue accounts. TechCorp gets personal outreach, others get standard follow-up.", riskLevel: "medium" as const },
  { id: "ap2", title: "Defer Adobe CC subscription — $54/mo", description: "Pause Adobe Creative Cloud for 30 days to support reserve target. No active projects depend on it.", riskLevel: "low" as const },
  { id: "ap3", title: "Approve NYC travel package — $1,840", description: "Flights, hotel (2 nights), restaurant reservations for Q2 client visit. All documents verified.", riskLevel: "high" as const },
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

export function BoardroomApprovalView() {
  const { pendingApprovals } = useBoardroomData();

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
              <ApprovalGate
                title={ap.title}
                description={ap.description}
                riskLevel={ap.riskLevel}
                onApprove={() => {}}
                onReject={() => {}}
                onSimulate={() => {}}
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
