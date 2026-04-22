// ============================================================
// SITA OS — Boardroom Issue Frame
// Central "matter before the room" card
// ============================================================

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, HelpCircle, Brain, Clock,
  Shield, Lock, Sparkles, ArrowUpRight,
} from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives";
import { useDataMode } from "@/contexts/DataModeContext";

interface IssueFrameItem {
  title: string;
  domain: string;
  severity: "critical" | "high" | "medium" | "low";
  whyHere: string;
  recommendation: string;
  approvalRequired: boolean;
  simulationState: "none" | "pending" | "complete";
  confidenceScore: number;
  freshness: string;
  blockingConditions: string[];
}

interface Props {
  item?: IssueFrameItem;
  onNavigate?: (module: string) => void;
}

const DEMO_ITEM: IssueFrameItem = {
  title: "Collections action review — 3 overdue invoices totaling $18,500",
  domain: "business",
  severity: "high",
  whyHere: "Revenue advisor escalated: TechCorp invoice aged past 45 days. Reserve shortfall compounding. System-detected urgency threshold exceeded.",
  recommendation: "Initiate phased recovery outreach — segment by relationship value",
  approvalRequired: true,
  simulationState: "complete",
  confidenceScore: 72,
  freshness: "Updated 12 min ago",
  blockingConditions: [],
};

const severityStyles: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", border: "border-[hsl(var(--destructive))]/25" },
  high: { bg: "bg-[hsl(var(--sita-gold))]/10", text: "text-[hsl(var(--sita-gold))]", border: "border-[hsl(var(--sita-gold))]/25" },
  medium: { bg: "bg-[hsl(var(--sita-purple-light))]/10", text: "text-[hsl(var(--sita-purple-light))]", border: "border-[hsl(var(--sita-purple))]/25" },
  low: { bg: "bg-[hsl(var(--trust-safe))]/10", text: "text-[hsl(var(--trust-safe))]", border: "border-[hsl(var(--trust-safe))]/25" },
};

const simLabels: Record<string, { label: string; color: string }> = {
  none: { label: "No Simulation", color: "text-[hsl(0_0%_100%/0.3)]" },
  pending: { label: "Simulation Pending", color: "text-[hsl(var(--sita-gold))]" },
  complete: { label: "Simulation Complete", color: "text-[hsl(var(--trust-safe))]" },
};

const domainColors: Record<string, string> = {
  business: "hsl(var(--sita-purple-light))",
  finance: "hsl(var(--trust-safe))",
  concierge: "hsl(var(--sita-gold))",
  general: "hsl(0 0% 60%)",
};

export function BoardroomIssueFrame({ item, onNavigate }: Props) {
  const issue = item || DEMO_ITEM;
  const sev = severityStyles[issue.severity] || severityStyles.medium;
  const sim = simLabels[issue.simulationState];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border-2 p-6 relative overflow-hidden",
        sev.border,
        "bg-gradient-to-br from-[hsl(280_40%_6%/0.8)] to-[hsl(220_18%_4%/0.9)]",
      )}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none -z-0"
        style={{ background: `${domainColors[issue.domain] || domainColors.general}10` }}
      />

      <div className="relative z-10">
        {/* Header: "The Matter Before The Room" */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={12} className="text-[hsl(280_50%_65%/0.5)]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[hsl(280_50%_65%/0.5)]">
            The Matter Before The Room
          </span>
        </div>

        {/* Title + Severity */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-[hsl(0_0%_100%/0.95)] leading-snug mb-2">
              {issue.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{
                  color: domainColors[issue.domain],
                  backgroundColor: `${domainColors[issue.domain]}15`,
                }}
              >
                {issue.domain}
              </span>
              <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border", sev.bg, sev.text, sev.border)}>
                {issue.severity}
              </span>
              {issue.approvalRequired && (
                <span className="flex items-center gap-1 text-[9px] font-semibold text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10 px-2 py-0.5 rounded-full">
                  <Shield size={9} /> Approval Required
                </span>
              )}
              <span className={cn("text-[9px] font-semibold", sim.color)}>
                {sim.label}
              </span>
            </div>
          </div>
        </div>

        {/* Why Here */}
        <div className="rounded-xl bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.06)] p-4 mb-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.3)] mb-1.5 flex items-center gap-1.5">
            <ArrowUpRight size={9} /> Why This Is Here
          </p>
          <p className="text-[12px] text-[hsl(0_0%_100%/0.55)] leading-relaxed">{issue.whyHere}</p>
        </div>

        {/* Recommendation + Confidence */}
        <div className="rounded-xl bg-[hsl(280_40%_50%/0.04)] border border-[hsl(280_50%_50%/0.15)] p-4 mb-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[hsl(280_50%_65%/0.5)] mb-1.5 flex items-center gap-1.5">
            <Brain size={9} /> Current Recommendation
          </p>
          <p className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.85)] mb-3">{issue.recommendation}</p>
          <ConfidenceBar value={issue.confidenceScore} label="System Confidence" />
        </div>

        {/* Footer row: Freshness + Blockers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] text-[hsl(0_0%_100%/0.3)]">
            <Clock size={9} /> {issue.freshness}
          </div>
          {issue.blockingConditions.length > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-[hsl(var(--destructive))]">
              <Lock size={9} /> {issue.blockingConditions.length} blocker{issue.blockingConditions.length > 1 ? "s" : ""}
            </div>
          )}
          {issue.blockingConditions.length === 0 && (
            <div className="flex items-center gap-1 text-[9px] text-[hsl(var(--trust-safe))]">
              <CheckCircle size={9} /> No blockers
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
