import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronRight, FileCheck, MessageCircle, AlertTriangle } from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives";
import { getAdvisorRoster, ADVISOR_ROSTERS, type AdvisorRole } from "@/lib/advisor-topology";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
}

type Stance = "agreement" | "concern" | "dissent" | "question";

interface DiscussionEntry {
  advisorId: string;
  stance: Stance;
  statement: string;
  reasoning: string[];
  confidence: number;
  evidenceCited: number;
  timestamp: string;
}

const MOCK_DISCUSSIONS: Record<string, DiscussionEntry[]> = {
  business: [
    {
      advisorId: "biz-revenue",
      stance: "agreement",
      statement: "Collections must be prioritized this week. The $18,500 overdue puts our Q2 revenue target at risk. I recommend phased outreach starting with TechCorp.",
      reasoning: [
        "Analyzing Q2 revenue pipeline — current shortfall is $23K against target",
        "TechCorp represents 68% of overdue balance and has a history of paying within 7 days of follow-up",
        "Therefore: phased collection starting with highest-value accounts maximizes recovery probability",
      ],
      confidence: 78,
      evidenceCited: 6,
      timestamp: "2 min ago",
    },
    {
      advisorId: "biz-relationship",
      stance: "concern",
      statement: "I agree collections are needed, but I'm concerned about the approach. TechCorp is a top-5 client — aggressive outreach could damage the relationship. I recommend a personal touch first.",
      reasoning: [
        "Reviewing CRM engagement score — TechCorp has 92/100 relationship health",
        "Historical data shows personal outreach yields 91% recovery vs 76% for automated",
        "Risk assessment: aggressive approach has 15% churn probability for high-value clients",
      ],
      confidence: 72,
      evidenceCited: 4,
      timestamp: "1 min ago",
    },
    {
      advisorId: "biz-collections",
      stance: "agreement",
      statement: "I support phased approach with personal touch for TechCorp. For the other two accounts ($4,200 and $1,800), standard automated outreach is appropriate given their lower relationship scores.",
      reasoning: [
        "Segmenting accounts by relationship value and overdue amount",
        "David Kim ($4,200) has mid-tier relationship — standard sequence appropriate",
        "Sarah Chen ($1,800) is lower priority — automated reminder sufficient",
      ],
      confidence: 82,
      evidenceCited: 5,
      timestamp: "45 sec ago",
    },
    {
      advisorId: "biz-operations",
      stance: "question",
      statement: "Before we proceed, has anyone verified the support ticket status for these accounts? If there are open issues, collection outreach could backfire. I'm seeing 2 unresolved tickets for TechCorp.",
      reasoning: [
        "Cross-referencing support queue with overdue accounts",
        "Found 2 open tickets for TechCorp — one is a billing dispute from March",
        "Need to confirm: is the overdue amount disputed or simply late?",
      ],
      confidence: 55,
      evidenceCited: 3,
      timestamp: "30 sec ago",
    },
    {
      advisorId: "biz-support",
      stance: "dissent",
      statement: "I need to flag that TechCorp has an active billing dispute. Collections outreach before resolving the dispute would violate our own policy. We should resolve the dispute first, then collect.",
      reasoning: [
        "Ticket #4521: TechCorp disputes $3,200 of the $12,500 invoice",
        "Our policy requires dispute resolution before collection escalation",
        "Net collectible may be $9,300, not $12,500 — adjusting the recommendation",
      ],
      confidence: 68,
      evidenceCited: 4,
      timestamp: "15 sec ago",
    },
    {
      advisorId: "biz-followthrough",
      stance: "agreement",
      statement: "Updated recommendation: resolve TechCorp dispute first (target: 48 hours), then proceed with personal collection outreach. Meanwhile, initiate standard sequences for David Kim and Sarah Chen immediately.",
      reasoning: [
        "Revised timeline accounts for dispute resolution window",
        "Parallel execution: start smaller collections while resolving TechCorp",
        "Expected recovery: $6,000 within 7 days, remaining $12,500 within 14 days post-resolution",
      ],
      confidence: 75,
      evidenceCited: 5,
      timestamp: "Just now",
    },
  ],
  finance: [
    {
      advisorId: "fin-obligations",
      stance: "concern",
      statement: "Reserve buffer is at 72% of target. I recommend deferring three non-essential subscriptions totaling $342/month to restore buffer within 30 days.",
      reasoning: [
        "Current reserves: $7,200 vs $10,000 target — $2,800 shortfall",
        "Identified 3 subscriptions with zero usage in last 30 days",
        "Deferral would restore $1,026 over 3 months without operational impact",
      ],
      confidence: 78,
      evidenceCited: 5,
      timestamp: "3 min ago",
    },
    {
      advisorId: "fin-spending",
      stance: "dissent",
      statement: "I detected an AWS billing spike of $480 above baseline. This needs investigation before we blame subscriptions. The spike alone could explain half the shortfall.",
      reasoning: [
        "AWS costs jumped from $320/mo baseline to $800 last billing cycle",
        "Spike correlates with a development environment left running",
        "Fix: shut down idle environment, recover ~$240/mo going forward",
      ],
      confidence: 74,
      evidenceCited: 4,
      timestamp: "2 min ago",
    },
    {
      advisorId: "fin-reserve",
      stance: "agreement",
      statement: "Both approaches should run in parallel. Defer subscriptions AND fix the AWS spike. Combined savings of $582/month restores buffer in under 5 weeks.",
      reasoning: [
        "Combined approach accelerates recovery by 40% vs either alone",
        "Reserve target achievable by May 20 with dual action",
        "Safety margin: even if receivables are delayed, reserves stay above 80%",
      ],
      confidence: 70,
      evidenceCited: 3,
      timestamp: "1 min ago",
    },
    {
      advisorId: "fin-receivables",
      stance: "agreement",
      statement: "Adding a third lever: 3 receivables are aging past 30 days. Accelerating collection on these ($8,400 total) would fully resolve the shortfall and create a surplus.",
      reasoning: [
        "Receivable aging: Invoice #1042 ($4,200), #1038 ($2,800), #1051 ($1,400)",
        "Historical pattern: these clients pay within 5 days of follow-up",
        "Expected recovery: 85% probability of full collection within 2 weeks",
      ],
      confidence: 76,
      evidenceCited: 5,
      timestamp: "30 sec ago",
    },
  ],
  concierge: [
    {
      advisorId: "con-travel",
      stance: "agreement",
      statement: "NYC trip logistics are fully prepared. Flights, hotel, and restaurant reservations are confirmed. All documents are current. I recommend approving the travel package.",
      reasoning: [
        "Flight: JFK departing Apr 22, 7:15 AM — confirmed and checked in window opens Apr 21",
        "Hotel: Midtown East, 2 nights — confirmed, late checkout arranged",
        "Client dinner reservation: Apr 22, 7:30 PM — confirmed for 4 guests",
      ],
      confidence: 92,
      evidenceCited: 7,
      timestamp: "5 min ago",
    },
    {
      advisorId: "con-prep",
      stance: "agreement",
      statement: "All prep items cleared. Client briefing doc is ready, presentation deck reviewed, business cards ordered. No outstanding prep requirements.",
      reasoning: [
        "Checklist: 8/8 items completed as of this morning",
        "Briefing includes latest revenue data and proposal for Q3 engagement",
        "Backup copies saved to cloud — accessible offline",
      ],
      confidence: 95,
      evidenceCited: 6,
      timestamp: "3 min ago",
    },
    {
      advisorId: "con-logistics",
      stance: "concern",
      statement: "One flag: airport transfer isn't booked yet. Given the early departure time, I recommend pre-booking a car service rather than relying on ride-share availability at 5 AM.",
      reasoning: [
        "Flight departs 7:15 AM — need airport arrival by 5:45 AM",
        "Historical ride-share wait time at 5 AM: 12-18 minutes with 30% surge",
        "Pre-booked car service: guaranteed pickup, fixed rate, stress reduction",
      ],
      confidence: 82,
      evidenceCited: 3,
      timestamp: "1 min ago",
    },
  ],
};

const stanceStyles: Record<Stance, { border: string; accent: string; label: string; icon: typeof MessageCircle }> = {
  agreement: { border: "border-[hsl(152_55%_48%/0.2)]", accent: "text-[hsl(152_55%_48%)]", label: "Agrees", icon: MessageCircle },
  concern: { border: "border-[hsl(38_85%_58%/0.2)]", accent: "text-[hsl(38_85%_58%)]", label: "Concern", icon: AlertTriangle },
  dissent: { border: "border-[hsl(0_70%_55%/0.2)]", accent: "text-[hsl(0_70%_55%)]", label: "Dissents", icon: AlertTriangle },
  question: { border: "border-[hsl(210_70%_55%/0.2)]", accent: "text-[hsl(210_70%_55%)]", label: "Questions", icon: MessageCircle },
};

function getAdvisorInfo(id: string): AdvisorRole {
  for (const roster of Object.values(ADVISOR_ROSTERS)) {
    const found = roster.advisors.find(a => a.id === id);
    if (found) return found;
  }
  return { id, name: id, role: "Advisor", specialty: "", accentColor: "hsl(280 50% 55%)", emoji: "🤖" };
}

export function BoardroomDiscussionThread({ scope }: Props) {
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null);

  const domain = scope === "global" ? "business" : scope;
  const entries = MOCK_DISCUSSIONS[domain] || MOCK_DISCUSSIONS.business;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle size={14} className="text-[hsl(280_50%_65%)]" />
        <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.85)]">Live Discussion</p>
        <span className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{entries.length} contributions</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, i) => {
          const adv = getAdvisorInfo(entry.advisorId);
          const style = stanceStyles[entry.stance];
          const isExpanded = expandedReasoning === i;

          return (
            <motion.div
              key={`${entry.advisorId}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-xl border bg-[hsl(0_0%_100%/0.02)] p-4 relative",
                style.border,
              )}
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: adv.accentColor }}
              />

              {/* Header */}
              <div className="flex items-start gap-3 ml-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)`,
                  }}
                >
                  {adv.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[hsl(0_0%_100%/0.85)]">{adv.name}</span>
                    <span className="text-[9px] font-medium" style={{ color: adv.accentColor }}>{adv.role}</span>
                    <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border", style.border, style.accent)}>
                      {style.label}
                    </span>
                    <span className="text-[8px] text-[hsl(0_0%_100%/0.2)] ml-auto shrink-0">{entry.timestamp}</span>
                  </div>

                  {/* Statement */}
                  <p className="text-[12px] text-[hsl(0_0%_100%/0.7)] leading-relaxed mb-3">
                    {entry.statement}
                  </p>

                  {/* Reasoning chain toggle */}
                  <button
                    onClick={() => setExpandedReasoning(isExpanded ? null : i)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(280_50%_65%/0.6)] hover:text-[hsl(280_50%_75%)] transition-colors mb-2"
                  >
                    <Brain size={11} />
                    {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    Reasoning Chain
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg bg-[hsl(280_40%_50%/0.04)] border border-[hsl(280_50%_50%/0.1)] p-3 space-y-2 mb-3">
                          {entry.reasoning.map((step, si) => (
                            <motion.div
                              key={si}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <div className="w-4 h-4 rounded-full bg-[hsl(280_50%_50%/0.1)] flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[8px] font-bold text-[hsl(280_50%_65%)]">{si + 1}</span>
                              </div>
                              <p className="text-[10px] text-[hsl(0_0%_100%/0.5)] leading-relaxed italic">
                                {step}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer metrics */}
                  <div className="flex items-center gap-4">
                    <ConfidenceBar value={entry.confidence} size="sm" className="w-24" />
                    <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] flex items-center gap-1">
                      <FileCheck size={9} /> {entry.evidenceCited} sources
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
