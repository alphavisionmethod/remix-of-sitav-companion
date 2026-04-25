// ═══════════════════════════════════════════════════════════════
// Business Advisor Board Panel — Cross-module synthesis dashboard
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, AlertTriangle, TrendingUp, Shield, ChevronDown, ChevronRight, ArrowUpRight, Activity, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardSynthesisTheme, AdvisorOutput } from "@/domains/engines/business-advisor-engine";
import { synthesizeBusinessBoard, generateHomeAdvisors, detectAdvisorDisagreements, buildEscalationPacket } from "@/domains/engines/business-advisor-engine";
import { AdvisorDisagreementCard } from "./AdvisorDisagreementCard";
import { EscalationPacketPreview } from "./EscalationPacketPreview";
import { toast } from "sonner";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  critical: { bg: "bg-[hsl(0_70%_55%/0.06)]", border: "border-[hsl(0_70%_55%/0.15)]", text: "text-[hsl(0_70%_65%)]", dot: "bg-[hsl(0_70%_55%)]" },
  warning: { bg: "bg-[hsl(38_85%_58%/0.06)]", border: "border-[hsl(38_85%_58%/0.15)]", text: "text-[hsl(38_85%_68%)]", dot: "bg-[hsl(38_85%_58%)]" },
  watch: { bg: "bg-[hsl(265_55%_58%/0.06)]", border: "border-[hsl(265_55%_58%/0.15)]", text: "text-[hsl(265_55%_70%)]", dot: "bg-[hsl(265_55%_58%)]" },
  info: { bg: "bg-[hsl(0_0%_100%/0.02)]", border: "border-[hsl(0_0%_100%/0.08)]", text: "text-[hsl(0_0%_60%)]", dot: "bg-[hsl(0_0%_45%)]" },
};

const MODULE_LABELS: Record<string, string> = {
  "business-home": "Business Home", leads: "Leads", "lead-inbox": "Lead Inbox",
  scoring: "Scoring", stages: "Stages", "lead-recovery": "Lead Recovery",
};

interface Props {
  allAdvisors?: AdvisorOutput[];
  themes?: BoardSynthesisTheme[];
}

export function BusinessAdvisorBoardPanel({ allAdvisors: propAdvisors, themes: propThemes }: Props) {
  const [activeTab, setActiveTab] = useState<"themes" | "escalation" | "modules" | "disagreements">("themes");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [activePacketTheme, setActivePacketTheme] = useState<string | null>(null);

  // Use provided or generate demo data
  const allAdvisors = useMemo(() => propAdvisors || generateHomeAdvisors(), [propAdvisors]);
  const themes = useMemo(() => propThemes || synthesizeBusinessBoard(allAdvisors), [propThemes, allAdvisors]);
  const disagreements = useMemo(() => detectAdvisorDisagreements(allAdvisors), [allAdvisors]);
  const escalationCandidates = themes.filter(t => t.escalationCandidate);

  // Module health
  const moduleHealth = useMemo(() => {
    const modules = [...new Set(allAdvisors.map(a => a.module))];
    return modules.map(m => {
      const advisors = allAdvisors.filter(a => a.module === m);
      const avgConf = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / advisors.length);
      const hasUrgent = advisors.some(a => a.urgency === "high" || a.urgency === "critical");
      return { module: m, label: MODULE_LABELS[m] || m, advisorCount: advisors.length, avgConfidence: avgConf, hasUrgent, lastUpdate: advisors[0]?.timestamp };
    });
  }, [allAdvisors]);

  const tabs = [
    { key: "themes" as const, label: "Themes", count: themes.length },
    { key: "escalation" as const, label: "Escalation Queue", count: escalationCandidates.length },
    { key: "modules" as const, label: "Module Health", count: moduleHealth.length },
    { key: "disagreements" as const, label: "Disagreements", count: disagreements.length },
  ];

  return (
    <div className="space-y-4">
      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Themes", value: themes.length, color: "hsl(265 55% 58%)", icon: TrendingUp },
          { label: "Escalation Candidates", value: escalationCandidates.length, color: "hsl(38 85% 58%)", icon: ArrowUpRight },
          { label: "Advisor Disagreements", value: disagreements.length, color: disagreements.length > 0 ? "hsl(38 85% 58%)" : "hsl(152 55% 48%)", icon: AlertTriangle },
          { label: "Board Health", value: `${Math.round(allAdvisors.reduce((s, a) => s + a.confidence, 0) / allAdvisors.length)}%`, color: "hsl(152 55% 48%)", icon: Shield },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3.5 text-center">
            <m.icon className="h-4 w-4 mx-auto mb-1.5" style={{ color: m.color }} />
            <p className="text-xl font-bold font-display tabular-nums" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[9px] text-[hsl(0_0%_45%)] mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-[hsl(0_0%_100%/0.06)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn("px-3 py-2 text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === t.key ? "border-[hsl(265_55%_58%)] text-[hsl(265_55%_70%)]" : "border-transparent text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_65%)]"
            )}>
            {t.label}
            {t.count > 0 && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.06)]">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "themes" && (
          <motion.div key="themes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {themes.length === 0 && <p className="text-[11px] text-[hsl(0_0%_40%)] text-center py-8">No active themes detected</p>}
            {themes.map((theme, i) => {
              const style = SEVERITY_STYLES[theme.severity] || SEVERITY_STYLES.info;
              const isExpanded = expandedTheme === theme.themeId;
              return (
                <motion.div key={theme.themeId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn("rounded-xl border overflow-hidden", style.bg, style.border)}>
                  <button onClick={() => setExpandedTheme(isExpanded ? null : theme.themeId)} className="w-full text-left p-4">
                    <div className="flex items-start gap-3">
                      <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", style.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{theme.title}</span>
                          {theme.escalationCandidate && <Zap className="h-3 w-3 text-[hsl(38_85%_58%)]" />}
                        </div>
                        <p className="text-[10px] text-[hsl(0_0%_55%)] mt-0.5">{theme.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {theme.modules.map(m => (
                            <span key={m} className="text-[8px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]">{MODULE_LABELS[m] || m}</span>
                          ))}
                          <span className="text-[8px] text-[hsl(0_0%_40%)] ml-auto">Agreement: {theme.advisorAgreement}%</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-[hsl(0_0%_35%)] shrink-0" /> : <ChevronRight className="h-4 w-4 text-[hsl(0_0%_35%)] shrink-0" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 border-t border-[hsl(0_0%_100%/0.04)] pt-3 space-y-2">
                          {theme.metrics.map((m, j) => (
                            <div key={j} className="flex items-center justify-between">
                              <span className="text-[10px] text-[hsl(0_0%_50%)]">{m.label}</span>
                              <span className="text-[11px] font-bold text-[hsl(0_0%_75%)]">{m.value}</span>
                            </div>
                          ))}
                          <div className="mt-2">
                            <span className="text-[8px] uppercase tracking-wider text-[hsl(0_0%_40%)]">Contributing Advisors</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {theme.contributingAdvisors.map((a, j) => (
                                <span key={j} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(265_55%_58%/0.1)] text-[hsl(265_55%_65%)]">{a}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "escalation" && (
          <motion.div key="escalation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {escalationCandidates.length === 0 && <p className="text-[11px] text-[hsl(0_0%_40%)] text-center py-8">No items currently warrant Boardroom escalation</p>}
            {escalationCandidates.map(theme => (
              <div key={theme.themeId} className="space-y-3">
                <div className="rounded-xl border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.04)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
                    <span className="text-[11px] font-semibold text-[hsl(0_0%_80%)]">{theme.title}</span>
                  </div>
                  <p className="text-[10px] text-[hsl(0_0%_55%)]">{theme.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setActivePacketTheme(activePacketTheme === theme.themeId ? null : theme.themeId)}
                      className="text-[9px] px-3 py-1.5 rounded-lg bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_68%)] hover:bg-[hsl(38_85%_58%/0.25)] transition-colors flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {activePacketTheme === theme.themeId ? "Hide Packet" : "Build Escalation Packet"}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {activePacketTheme === theme.themeId && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <EscalationPacketPreview
                        packet={buildEscalationPacket(
                          { name: theme.contributingAdvisors[0] || "Strategic Item", company: "Portfolio", value: 25000, stage: "Review", daysSince: 14, failureMode: "process_bottleneck", owner: "Current Team", sensitivity: "high" },
                          allAdvisors.filter(a => theme.modules.includes(a.module))
                        )}
                        onClose={() => setActivePacketTheme(null)}
                        onSendToBoardroom={() => {
                          toast.success("Escalation packet sent to Boardroom");
                          setActivePacketTheme(null);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "modules" && (
          <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {moduleHealth.map(m => (
              <div key={m.module} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3.5 flex items-center gap-3">
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", m.hasUrgent ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(152_55%_48%)]")} />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-[hsl(0_0%_75%)]">{m.label}</p>
                  <p className="text-[9px] text-[hsl(0_0%_40%)]">{m.advisorCount} advisor{m.advisorCount > 1 ? "s" : ""} active</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold tabular-nums" style={{ color: m.avgConfidence > 75 ? "hsl(152 55% 48%)" : m.avgConfidence > 55 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)" }}>{m.avgConfidence}%</p>
                  <p className="text-[8px] text-[hsl(0_0%_35%)]">avg confidence</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "disagreements" && (
          <motion.div key="disagreements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {disagreements.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-6 w-6 text-[hsl(152_55%_48%)] mx-auto mb-2" />
                <p className="text-[11px] text-[hsl(0_0%_50%)]">All advisors are in agreement</p>
                <p className="text-[9px] text-[hsl(0_0%_35%)]">No significant position conflicts detected</p>
              </div>
            )}
            {disagreements.map(d => (
              <AdvisorDisagreementCard key={d.disagreementId} disagreement={d} onEscalate={() => toast.info("Disagreement would be escalated to Boardroom")} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
