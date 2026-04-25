// ============================================================
// SITA OS — Boardroom Lineage View
// Signal → Advisor → Boardroom → Simulation → Approval → Receipt → Outcome
// ============================================================

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Radio, Brain, Presentation, FlaskConical, CheckSquare,
  FileCheck, TrendingUp, ChevronRight,
} from "lucide-react";

const LINEAGE_NODES = [
  { id: "signal", label: "Signal Detected", icon: Radio, detail: "Revenue advisor flagged 3 overdue invoices ($18.5K). Reserve shortfall compounding.", color: "hsl(40 90% 55%)", time: "Apr 1, 8:00 AM" },
  { id: "advisor", label: "Advisor Analysis", icon: Brain, detail: "6 advisors analyzed. Revenue + CRM disagreed on approach. Phased outreach recommended.", color: "hsl(280 50% 60%)", time: "Apr 1, 8:12 AM" },
  { id: "boardroom", label: "Boardroom Entry", icon: Presentation, detail: "Issue escalated to boardroom. Severity: High. Session opened for executive review.", color: "hsl(280 60% 65%)", time: "Apr 1, 9:00 AM" },
  { id: "simulation", label: "Simulation Run", icon: FlaskConical, detail: "3 scenarios modeled. Phased recovery shows 91% expected recovery with low client risk.", color: "hsl(40 90% 55%)", time: "Apr 1, 9:15 AM" },
  { id: "approval", label: "Decision Approved", icon: CheckSquare, detail: "Phased outreach approved by Owner. Locked to recommendation snapshot #R-2026-041.", color: "hsl(145 60% 50%)", time: "Apr 1, 10:14 AM" },
  { id: "receipt", label: "Receipt Generated", icon: FileCheck, detail: "Decision receipt sealed. Hash: 0x8f3a…c7d2. Evidence snapshot preserved.", color: "hsl(145 60% 50%)", time: "Apr 1, 10:14 AM" },
  { id: "outcome", label: "Outcome Verified", icon: TrendingUp, detail: "Recovered $16,800 (91%) within 18 days. No client relationships damaged. Score: 94/100.", color: "hsl(152 55% 48%)", time: "Apr 19, 3:00 PM" },
];

export function BoardroomLineageView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(200_50%_50%)] to-[hsl(200_50%_30%)] flex items-center justify-center">
          <ChevronRight size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[hsl(0_0%_100%/0.9)]">Decision Lineage</p>
          <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">Full provenance trail — signal to outcome</p>
        </div>
      </div>

      {/* Horizontal connected node graph */}
      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-[900px]">
          {LINEAGE_NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={node.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center w-[130px] shrink-0 relative group"
                >
                  {/* Node circle */}
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 relative z-10"
                    style={{
                      borderColor: node.color,
                      backgroundColor: `${node.color}15`,
                      boxShadow: `0 0 20px ${node.color}25`,
                    }}
                    whileHover={{ scale: 1.15, boxShadow: `0 0 30px ${node.color}40` }}
                  >
                    <Icon size={18} style={{ color: node.color }} />
                  </motion.div>

                  {/* Label */}
                  <p className="text-[10px] font-bold text-[hsl(0_0%_100%/0.8)] mt-3 text-center leading-tight">
                    {node.label}
                  </p>
                  <p className="text-[8px] text-[hsl(0_0%_100%/0.25)] mt-0.5">{node.time}</p>

                  {/* Detail card on hover */}
                  <div className="absolute top-16 mt-8 w-[180px] left-1/2 -translate-x-1/2 rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(220_18%_6%)] p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                    <p className="text-[10px] text-[hsl(0_0%_100%/0.6)] leading-relaxed">{node.detail}</p>
                  </div>
                </motion.div>

                {/* Connector line */}
                {i < LINEAGE_NODES.length - 1 && (
                  <div className="flex items-center self-start mt-6 -mx-2">
                    <motion.div
                      className="h-[2px] w-8"
                      style={{ background: `linear-gradient(90deg, ${node.color}60, ${LINEAGE_NODES[i + 1].color}60)` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.12 + 0.1, duration: 0.3 }}
                      // eslint-disable-next-line react/no-unknown-property
                    />
                    <ChevronRight size={10} style={{ color: `${LINEAGE_NODES[i + 1].color}80` }} className="-ml-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed timeline below */}
      <div className="space-y-0">
        {LINEAGE_NODES.map((node, i) => {
          const Icon = node.icon;
          const isLast = i === LINEAGE_NODES.length - 1;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="flex gap-4"
            >
              {/* Vertical connector */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${node.color}15` }}
                >
                  <Icon size={14} style={{ color: node.color }} />
                </div>
                {!isLast && <div className="w-px flex-1 min-h-[8px]" style={{ backgroundColor: `${node.color}20` }} />}
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0 pb-3", isLast && "pb-0")}>
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.8)]">{node.label}</p>
                    <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">{node.time}</span>
                  </div>
                  <p className="text-[11px] text-[hsl(0_0%_100%/0.5)] leading-relaxed">{node.detail}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
