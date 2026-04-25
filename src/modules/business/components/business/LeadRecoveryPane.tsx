// ═══════════════════════════════════════════════════════════════
// Lead Recovery Detail Pane — Premium Rescue Briefing
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bot, Phone, Mail, Linkedin, MessageSquare, Send, Clock, Target,
  AlertTriangle, Shield, UserCheck, UserX, Crown, ArrowRight, Calendar,
  FileText, RotateCcw, Archive, ChevronRight, Heart, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecoveryCandidate } from "@/domains/engines/lead-recovery-engine";
import { FAILURE_MODE_META, SUCCESS_BAND_META, RECOVERY_PATH_META } from "@/domains/engines/lead-recovery-engine";
import { ModuleAdvisorPanel } from "@/modules/business/components/business/advisor-board/ModuleAdvisorPanel";
import { EscalationPacketPreview } from "@/modules/business/components/business/advisor-board/EscalationPacketPreview";
import { generateRecoveryAdvisors, buildEscalationPacket } from "@/domains/engines/business-advisor-engine";

const CHANNEL_ICONS: Record<string, typeof Mail> = { email: Mail, phone: Phone, linkedin: Linkedin, sms: MessageSquare };
const CHANNEL_LABELS: Record<string, string> = { email: "Email", phone: "Phone", linkedin: "LinkedIn", sms: "SMS" };

interface Props {
  lead: RecoveryCandidate | null;
}

function SectionHeader({ icon: Icon, title, accent }: { icon: typeof Target; title: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Icon className="h-3.5 w-3.5" style={{ color: accent || "hsl(265 55% 58%)" }} />
      <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: accent || "hsl(0 0% 55%)" }}>{title}</span>
    </div>
  );
}

export function LeadRecoveryPane({ lead }: Props) {
  const [showEscalation, setShowEscalation] = useState(false);
  const recoveryAdvisors = useMemo(() => lead ? generateRecoveryAdvisors(lead) : [], [lead]);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Target className="h-8 w-8 text-[hsl(0_0%_20%)] mb-3" />
        <p className="text-sm font-medium text-[hsl(0_0%_50%)]">Select a recovery candidate</p>
        <p className="text-xs text-[hsl(0_0%_35%)] mt-1">Click on a lead to see the full rescue briefing</p>
      </div>
    );
  }

  const fm = FAILURE_MODE_META[lead.failureMode];
  const sb = SUCCESS_BAND_META[lead.successBand];
  const rp = RECOVERY_PATH_META[lead.recommendedPath];
  const ChannelIcon = CHANNEL_ICONS[lead.suggestedChannel] || Mail;

  const urgencyLabel = lead.urgency === "act_today" ? "Act Today" : lead.urgency === "this_week" ? "This Week" : "Flexible";
  const urgencyColor = lead.urgency === "act_today" ? "hsl(0 70% 55%)" : lead.urgency === "this_week" ? "hsl(38 85% 58%)" : "hsl(0 0% 50%)";
  const sensitivityLabel = lead.relationshipSensitivity === "handle_carefully" ? "Handle Carefully" : lead.relationshipSensitivity === "standard" ? "Standard" : "Direct Approach";
  const sensitivityColor = lead.relationshipSensitivity === "handle_carefully" ? "hsl(0 70% 55%)" : lead.relationshipSensitivity === "standard" ? "hsl(152 55% 48%)" : "hsl(38 85% 58%)";

  return (
    <motion.div
      key={lead.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 p-1 overflow-y-auto"
    >
      {/* ── A. Recovery Summary ─────────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
        <div className="flex items-start gap-4">
          {/* Avatar + score */}
          <div className="relative shrink-0">
            <div className="w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={sb.color} strokeWidth="2.5"
                  strokeDasharray={`${lead.recoveryScore * 0.94} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[hsl(0_0%_85%)] tabular-nums">{lead.recoveryScore}%</span>
              </div>
            </div>
            {lead.boardroomCandidate && <Crown className="absolute -top-1 -right-1 h-4 w-4 text-[hsl(38_85%_58%)]" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-display font-bold text-[hsl(0_0%_90%)]">{lead.name}</h3>
            <p className="text-xs text-[hsl(0_0%_50%)]">{lead.company} · {lead.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${fm.color}15`, color: fm.color }}>
                {fm.label}
              </span>
              <span className="text-[9px] font-medium" style={{ color: sb.color }}>{sb.label}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] text-[hsl(0_0%_40%)] uppercase tracking-wider">Value at Risk</p>
            <p className="text-xl font-bold text-[hsl(38_85%_58%)] font-display tabular-nums">${lead.valueAtRisk.toLocaleString()}</p>
            <p className="text-[9px] text-[hsl(0_0%_40%)]">${lead.dealSize.toLocaleString()} deal</p>
          </div>
        </div>

        <p className="text-xs text-[hsl(0_0%_60%)] mt-3 leading-relaxed italic">"{lead.recoveryReason}"</p>
      </div>

      {/* ── B. What Went Wrong — Timeline ──────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <SectionHeader icon={Clock} title="What Went Wrong" />
        <div className="space-y-0 ml-1">
          {lead.timeline.map((evt, i) => {
            const dotColors: Record<string, string> = {
              positive: "hsl(152 55% 48%)", neutral: "hsl(0 0% 50%)", warning: "hsl(38 85% 58%)", negative: "hsl(0 70% 55%)", current: "hsl(265 55% 58%)",
            };
            const isLast = i === lead.timeline.length - 1;
            return (
              <div key={i} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1.5", isLast && "ring-2 ring-offset-1 ring-offset-[hsl(0_0%_9%)]")}
                    style={{ background: dotColors[evt.status], ["--tw-ring-color" as string]: isLast ? dotColors[evt.status] : undefined }}
                  />
                  {!isLast && <div className="w-px flex-1 min-h-[16px] bg-[hsl(0_0%_100%/0.08)]" />}
                </div>
                <div className="pb-3">
                  <p className="text-[10px] text-[hsl(0_0%_40%)] tabular-nums">{evt.date}</p>
                  <p className={cn("text-[11px]", evt.status === "negative" ? "text-[hsl(0_70%_65%)]" : evt.status === "current" ? "text-[hsl(265_55%_70%)] font-medium" : "text-[hsl(0_0%_65%)]")}>
                    {evt.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── C. Recovery Path ───────────────────────────── */}
      <div className="rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-[hsl(265_55%_58%/0.04)] p-4">
        <SectionHeader icon={ArrowRight} title="Recommended Recovery Path" accent="hsl(265 55% 58%)" />
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-display font-bold text-[hsl(265_55%_80%)]">{rp.label}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(265_55%_58%/0.15)] text-[hsl(265_55%_70%)]">{rp.tone}</span>
        </div>
        <p className="text-[11px] text-[hsl(0_0%_55%)] leading-relaxed">{rp.description}</p>
      </div>

      {/* ── D. Time & Relationship Sensitivity ─────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1.5" style={{ color: urgencyColor }} />
          <p className="text-[9px] text-[hsl(0_0%_40%)] uppercase tracking-wider mb-0.5">Urgency</p>
          <p className="text-sm font-bold" style={{ color: urgencyColor }}>{urgencyLabel}</p>
          <p className="text-[9px] text-[hsl(0_0%_40%)] mt-0.5">{lead.daysSinceLastAction} days since action</p>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3 text-center">
          <Heart className="h-4 w-4 mx-auto mb-1.5" style={{ color: sensitivityColor }} />
          <p className="text-[9px] text-[hsl(0_0%_40%)] uppercase tracking-wider mb-0.5">Relationship</p>
          <p className="text-sm font-bold" style={{ color: sensitivityColor }}>{sensitivityLabel}</p>
          <p className="text-[9px] text-[hsl(0_0%_40%)] mt-0.5">{lead.relationshipSensitivity === "handle_carefully" ? "Proceed with care" : "Standard approach"}</p>
        </div>
      </div>

      {/* ── E. Prepared Communication ──────────────────── */}
      <div className="rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-[hsl(265_55%_58%/0.04)] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
            <span className="text-[10px] font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wider">AI Recovery Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChannelIcon className="h-3 w-3 text-[hsl(0_0%_45%)]" />
            <span className="text-[9px] text-[hsl(0_0%_45%)]">{CHANNEL_LABELS[lead.suggestedChannel]}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]">{lead.draftTone}</span>
          </div>
        </div>
        <div className="rounded-lg bg-[hsl(0_0%_6%)] p-3.5 border border-[hsl(0_0%_100%/0.05)] text-xs text-[hsl(0_0%_65%)] italic leading-relaxed">
          "{lead.aiDraft}"
        </div>
        <div className="flex gap-2 mt-3">
          <button className="text-[10px] bg-[hsl(265_55%_58%)] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[hsl(265_55%_50%)] transition-colors flex items-center gap-1">
            <Send className="h-3 w-3" /> Send This
          </button>
          <button className="text-[10px] bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_70%)] px-3 py-1.5 rounded-lg font-medium hover:bg-[hsl(265_55%_58%/0.2)] transition-colors">
            Edit & Send
          </button>
          <button className="text-[10px] bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_70%)] px-3 py-1.5 rounded-lg font-medium hover:bg-[hsl(265_55%_58%/0.2)] transition-colors">
            Add to Campaign
          </button>
        </div>
      </div>

      {/* ── F. Suggested Next Actions ──────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <SectionHeader icon={Target} title="Recovery Actions" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Send, label: "Send Recovery Message", primary: true },
            { icon: Phone, label: "Schedule Callback", primary: false },
            { icon: UserCheck, label: "Reassign Owner", primary: false },
            { icon: FileText, label: "Reopen Quote", primary: false },
            { icon: Calendar, label: "Invite to Consult", primary: false },
            { icon: Crown, label: "Escalate to Boardroom", primary: false },
            { icon: RotateCcw, label: "Add to Winback", primary: false },
            { icon: Archive, label: "Archive with Rationale", primary: false },
          ].map(action => (
            <button
              key={action.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors",
                action.primary
                  ? "bg-[hsl(265_55%_58%)] text-white hover:bg-[hsl(265_55%_50%)]"
                  : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] hover:text-[hsl(0_0%_80%)]"
              )}
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── G. Accountability ─────────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <SectionHeader icon={UserCheck} title="Accountability" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[hsl(0_0%_50%)]">Current Owner</span>
            <span className="text-[11px] font-medium text-[hsl(0_0%_80%)]">{lead.currentOwner}</span>
          </div>
          {lead.previousOwner && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[hsl(0_0%_50%)]">Previous Owner</span>
              <span className="text-[11px] text-[hsl(0_0%_60%)]">{lead.previousOwner}</span>
            </div>
          )}
          {lead.ownerIssue && (
            <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-[hsl(38_85%_58%/0.06)] border border-[hsl(38_85%_58%/0.12)]">
              <AlertTriangle className="h-3 w-3 text-[hsl(38_85%_58%)] shrink-0" />
              <span className="text-[10px] text-[hsl(38_85%_65%)]">{lead.ownerIssue}</span>
            </div>
          )}
          {lead.escalationNeeded && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_70%_55%/0.06)] border border-[hsl(0_70%_55%/0.12)]">
              <Shield className="h-3 w-3 text-[hsl(0_70%_55%)] shrink-0" />
              <span className="text-[10px] text-[hsl(0_70%_65%)]">Escalation recommended — manager review suggested</span>
            </div>
          )}
          {lead.boardroomCandidate && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(38_85%_58%/0.06)] border border-[hsl(38_85%_58%/0.12)]">
              <Crown className="h-3 w-3 text-[hsl(38_85%_58%)] shrink-0" />
              <span className="text-[10px] text-[hsl(38_85%_65%)]">Boardroom candidate — strategic visibility recommended</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Structured Advisor Intelligence ─────────── */}
      <ModuleAdvisorPanel
        advisors={recoveryAdvisors}
        title="Recovery Advisor Intelligence"
        collapsible={false}
        onEscalate={() => setShowEscalation(true)}
      />

      {/* ── Escalation Packet Preview ─────────────────── */}
      {showEscalation && lead.boardroomCandidate && (
        <EscalationPacketPreview
          packet={buildEscalationPacket(
            { name: lead.name, company: lead.company, value: lead.valueAtRisk, stage: lead.stageAtSlip, daysSince: lead.daysSinceLastAction, failureMode: lead.failureMode, owner: lead.currentOwner, sensitivity: lead.relationshipSensitivity },
            recoveryAdvisors
          )}
          onClose={() => setShowEscalation(false)}
        />
      )}
    </motion.div>
  );
}
