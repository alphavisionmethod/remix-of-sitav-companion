// ═══════════════════════════════════════════════════════════════
// Escalation Packet Preview — Boardroom briefing document
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, FileText, User, GitBranch, MessageSquare, Brain,
  Shield, AlertTriangle, Target, ArrowUpRight, Check, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscalationPacket } from "@/domains/engines/business-advisor-engine";
import { AdvisorDisagreementCard } from "./AdvisorDisagreementCard";
import { toast } from "sonner";
import { ESCALATION_RULES } from "@/lib/ai-platform/runtime/advisor-escalation-policy";

interface Props {
  packet: EscalationPacket;
  onSendToBoardroom?: () => void;
  onClose?: () => void;
}

function Section({ icon: Icon, title, accent, children }: { icon: typeof Crown; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: accent || "hsl(38 85% 58%)" }} />
        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: accent || "hsl(0 0% 50%)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function EscalationPacketPreview({ packet, onSendToBoardroom, onClose }: Props) {
  const [selectedOption, setSelectedOption] = useState(packet.recoveryOptions[0]?.id || "");
  const [confirmed, setConfirmed] = useState(false);

  const handleSend = () => {
    if (!confirmed) { setConfirmed(true); return; }
    onSendToBoardroom?.();
    toast.success("Escalation packet sent to Boardroom");
  };

  const confLevel = packet.confidence.level;
  const confColor = confLevel === "strong" ? "hsl(152 55% 48%)" : confLevel === "moderate" ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-[hsl(38_85%_58%/0.2)] bg-[hsl(0_0%_7%)] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(38_85%_58%/0.08)] to-[hsl(265_55%_58%/0.06)] p-5 border-b border-[hsl(38_85%_58%/0.15)]">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-[hsl(38_85%_58%)]" />
          <span className="text-[9px] uppercase tracking-wider font-bold text-[hsl(38_85%_68%)]">Boardroom Escalation Packet</span>
        </div>
        <h2 className="text-base font-display font-bold text-[hsl(0_0%_90%)]">{packet.title}</h2>
        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-1">Packet ID: {packet.packetId} · {new Date(packet.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* A. Object Context */}
        <Section icon={FileText} title="Object Context">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Type", value: packet.objectContext.type },
              { label: "Status", value: packet.objectContext.status },
              { label: "Value", value: `$${packet.objectContext.value.toLocaleString()}` },
              { label: "Owner", value: packet.objectContext.owner },
              { label: "Priority", value: packet.objectContext.priority },
              { label: "Source", value: packet.objectContext.source },
            ].map(item => (
              <div key={item.label} className="bg-[hsl(0_0%_100%/0.03)] rounded-lg p-2">
                <p className="text-[8px] text-[hsl(0_0%_40%)] uppercase">{item.label}</p>
                <p className="text-[11px] text-[hsl(0_0%_75%)] font-medium capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* B. Lead Context */}
        <Section icon={User} title="Lead & Account Context">
          <div className="bg-[hsl(0_0%_100%/0.02)] rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Name</span><span className="text-[10px] text-[hsl(0_0%_75%)]">{packet.leadContext.name}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Company</span><span className="text-[10px] text-[hsl(0_0%_75%)]">{packet.leadContext.company}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Account Importance</span><span className="text-[10px] text-[hsl(0_0%_75%)] capitalize">{packet.leadContext.accountImportance}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Sensitivity</span><span className="text-[10px] text-[hsl(0_0%_75%)] capitalize">{packet.leadContext.relationshipSensitivity}</span></div>
          </div>
        </Section>

        {/* C. Stage Context */}
        <Section icon={GitBranch} title="Stage Context" accent="hsl(265 55% 58%)">
          <div className="bg-[hsl(265_55%_58%/0.04)] rounded-lg p-3 border border-[hsl(265_55%_58%/0.08)] space-y-1.5">
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Current Stage</span><span className="text-[10px] text-[hsl(265_55%_70%)]">{packet.stageContext.currentStage}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Stage Aging</span><span className="text-[10px] text-[hsl(0_0%_75%)]">{packet.stageContext.stageAging}d</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Failure Point</span><span className="text-[10px] text-[hsl(0_70%_65%)]">{packet.stageContext.failurePoint}</span></div>
          </div>
        </Section>

        {/* D. Communication History */}
        <Section icon={MessageSquare} title="Communication History">
          <div className="bg-[hsl(0_0%_100%/0.02)] rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Last Touch</span><span className="text-[10px] text-[hsl(0_0%_75%)]">{packet.communicationHistory.lastTouch}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-[hsl(0_0%_45%)]">Silence</span><span className="text-[10px] text-[hsl(38_85%_65%)]">{packet.communicationHistory.silenceDays} days</span></div>
          </div>
        </Section>

        {/* E. Advisor Rationale */}
        <Section icon={Brain} title="Advisor Rationale" accent="hsl(265 55% 58%)">
          <div className="space-y-2">
            {packet.advisorRationale.map((a, i) => (
              <div key={i} className="rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-[hsl(265_55%_70%)]">{a.advisorName}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full", a.agrees ? "bg-[hsl(152_55%_48%/0.1)] text-[hsl(152_55%_60%)]" : "bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_65%)]")}>
                    {a.agrees ? "Agrees" : "Dissents"} · {a.confidence}%
                  </span>
                </div>
                <p className="text-[10px] text-[hsl(0_0%_55%)]">{a.position}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Disagreements */}
        {packet.disagreements.length > 0 && (
          <div className="space-y-2">
            {packet.disagreements.map(d => (
              <AdvisorDisagreementCard key={d.disagreementId} disagreement={d} />
            ))}
          </div>
        )}

        {/* F. Confidence */}
        <Section icon={Shield} title="Confidence Assessment">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(0_0%_100%/0.02)]">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: confColor }}>
              <span className="text-[11px] font-bold capitalize" style={{ color: confColor }}>{confLevel[0]}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold capitalize" style={{ color: confColor }}>{confLevel} Confidence</p>
              <p className="text-[9px] text-[hsl(0_0%_45%)]">{packet.confidence.basis}</p>
            </div>
          </div>
          {packet.confidence.incompleteData.length > 0 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-[hsl(38_85%_58%/0.04)]">
              <AlertTriangle className="h-3 w-3 text-[hsl(38_85%_58%)] mt-0.5 shrink-0" />
              <p className="text-[9px] text-[hsl(38_85%_65%)]">Data gaps: {packet.confidence.incompleteData.join(", ")}</p>
            </div>
          )}
        </Section>

        {/* G. Recovery Options */}
        <Section icon={Target} title="Recovery & Action Options">
          <div className="space-y-1.5">
            {packet.recoveryOptions.map(opt => (
              <button key={opt.id} onClick={() => setSelectedOption(opt.id)}
                className={cn("w-full text-left p-3 rounded-lg border transition-colors",
                  selectedOption === opt.id
                    ? "border-[hsl(265_55%_58%/0.3)] bg-[hsl(265_55%_58%/0.06)]"
                    : "border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]"
                )}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0",
                    selectedOption === opt.id ? "border-[hsl(265_55%_58%)]" : "border-[hsl(0_0%_30%)]"
                  )}>
                    {selectedOption === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(265_55%_58%)]" />}
                  </div>
                  <span className="text-[11px] font-medium text-[hsl(0_0%_75%)]">{opt.label}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full ml-auto",
                    opt.risk === "low" ? "bg-[hsl(152_55%_48%/0.1)] text-[hsl(152_55%_60%)]" : opt.risk === "medium" ? "bg-[hsl(38_85%_58%/0.1)] text-[hsl(38_85%_65%)]" : "bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_65%)]"
                  )}>{opt.risk} risk</span>
                  <span className="text-[9px] text-[hsl(0_0%_50%)] tabular-nums">{opt.likelihood}%</span>
                </div>
                <p className="text-[9px] text-[hsl(0_0%_45%)] mt-1 ml-5">{opt.description}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* H. Recommended Motion */}
        <div className="rounded-xl border-2 border-[hsl(38_85%_58%/0.2)] bg-[hsl(38_85%_58%/0.04)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
            <span className="text-[10px] font-bold text-[hsl(38_85%_68%)] uppercase tracking-wider">Recommended Motion</span>
          </div>
          <p className="text-[12px] text-[hsl(0_0%_80%)] font-medium">{packet.recommendedMotion.action}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div><p className="text-[8px] text-[hsl(0_0%_40%)]">Owner</p><p className="text-[10px] text-[hsl(0_0%_65%)]">{packet.recommendedMotion.owner}</p></div>
            <div><p className="text-[8px] text-[hsl(0_0%_40%)]">Timeline</p><p className="text-[10px] text-[hsl(0_0%_65%)]">{packet.recommendedMotion.timeline}</p></div>
            <div><p className="text-[8px] text-[hsl(0_0%_40%)]">Success</p><p className="text-[10px] text-[hsl(0_0%_65%)]">{packet.recommendedMotion.successCriteria}</p></div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button onClick={handleSend}
            className={cn("flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
              confirmed
                ? "bg-[hsl(38_85%_58%)] text-[hsl(0_0%_5%)] hover:bg-[hsl(38_85%_52%)]"
                : "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_68%)] hover:bg-[hsl(38_85%_58%/0.25)]"
            )}>
            {confirmed ? <><Check className="h-4 w-4" /> Confirm & Send to Boardroom</> : <><ArrowUpRight className="h-4 w-4" /> Send to Boardroom</>}
          </button>
          {onClose && (
            <button onClick={onClose} className="px-4 py-3 rounded-xl text-[11px] text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)] border border-[hsl(0_0%_100%/0.08)] hover:border-[hsl(0_0%_100%/0.15)] transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
