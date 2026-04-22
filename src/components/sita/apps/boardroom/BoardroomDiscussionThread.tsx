import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronRight, FileCheck, MessageCircle, AlertTriangle, Mic, Volume2, Play, Pause } from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives";
import { ADVISOR_ROSTERS, type AdvisorRole } from "@/domains/advisors/topology";
import { TalkingAvatar } from "./TalkingAvatar";
import { useDataMode } from "@/contexts/DataModeContext";

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
      statement: "I agree collections are needed, but I'm concerned about the approach. TechCorp is a top-5 client — aggressive outreach could damage the relationship.",
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
      statement: "I support phased approach with personal touch for TechCorp. For the other two accounts ($4,200 and $1,800), standard automated outreach is appropriate.",
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
      statement: "Before we proceed, has anyone verified the support ticket status for these accounts? I'm seeing 2 unresolved tickets for TechCorp.",
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
      statement: "I need to flag that TechCorp has an active billing dispute. Collections outreach before resolving the dispute would violate our own policy.",
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
      statement: "Updated recommendation: resolve TechCorp dispute first (target: 48 hours), then proceed with personal collection outreach. Meanwhile, start smaller collections immediately.",
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
      statement: "I detected an AWS billing spike of $480 above baseline. This needs investigation before we blame subscriptions.",
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
      statement: "Both approaches should run in parallel. Combined savings of $582/month restores buffer in under 5 weeks.",
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
      statement: "Adding a third lever: 3 receivables aging past 30 days. Accelerating collection on $8,400 total would fully resolve the shortfall.",
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
      statement: "NYC trip logistics are fully prepared. Flights, hotel, and restaurant reservations are confirmed. I recommend approving the travel package.",
      reasoning: [
        "Flight: JFK departing Apr 22, 7:15 AM — confirmed",
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
      statement: "All prep items cleared. Client briefing doc is ready, presentation deck reviewed, business cards ordered.",
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
      statement: "One flag: airport transfer isn't booked yet. I recommend pre-booking a car service rather than relying on ride-share at 5 AM.",
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

const stanceConfig: Record<Stance, { borderColor: string; accentColor: string; bgColor: string; label: string; icon: typeof MessageCircle }> = {
  agreement: { borderColor: "hsl(152 55% 48% / 0.25)", accentColor: "hsl(152 55% 48%)", bgColor: "hsl(152 55% 48% / 0.06)", label: "Agrees", icon: MessageCircle },
  concern: { borderColor: "hsl(38 85% 58% / 0.25)", accentColor: "hsl(38 85% 58%)", bgColor: "hsl(38 85% 58% / 0.06)", label: "Concern", icon: AlertTriangle },
  dissent: { borderColor: "hsl(0 70% 55% / 0.25)", accentColor: "hsl(0 70% 55%)", bgColor: "hsl(0 70% 55% / 0.06)", label: "Dissents", icon: AlertTriangle },
  question: { borderColor: "hsl(210 70% 55% / 0.25)", accentColor: "hsl(210 70% 55%)", bgColor: "hsl(210 70% 55% / 0.06)", label: "Questions", icon: MessageCircle },
};

function getAdvisorInfo(id: string): AdvisorRole {
  for (const roster of Object.values(ADVISOR_ROSTERS)) {
    const found = roster.advisors.find(a => a.id === id);
    if (found) return found;
  }
  return { id, name: id, role: "Advisor", specialty: "", accentColor: "hsl(280 50% 55%)", emoji: "🤖", avatarUrl: "" };
}

// Sound wave bars component for speaking indicator
function SoundWaveBars({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0.6, 1, 0.4].map((maxScale, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color }}
          animate={{ height: [4, 12 * maxScale, 4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Typing indicator dots
function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: `${color}80` }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function BoardroomDiscussionThread({ scope }: Props) {
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);

  const domain = scope === "global" ? "business" : scope;
  const entries = MOCK_DISCUSSIONS[domain] || MOCK_DISCUSSIONS.business;

  // Auto-play sequential mode
  React.useEffect(() => {
    if (!playMode) return;
    if (playIndex >= entries.length) { setPlayMode(false); return; }
    const timer = setTimeout(() => setPlayIndex(prev => prev + 1), 4000);
    return () => clearTimeout(timer);
  }, [playMode, playIndex, entries.length]);

  const visibleEntries = playMode ? entries.slice(0, playIndex + 1) : entries;
  const currentSpeakingIndex = playMode ? playIndex : entries.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(280_50%_55%)] to-[hsl(280_60%_40%)] flex items-center justify-center shadow-md">
          <MessageCircle size={13} className="text-white" />
        </div>
        <p className="text-[13px] font-bold text-[hsl(0_0%_100%/0.92)]">Live Deliberation</p>
        <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] bg-[hsl(0_0%_100%/0.04)] px-2 py-0.5 rounded-full">{entries.length} contributions</span>
        <button
          onClick={() => { setPlayMode(p => !p); if (!playMode) setPlayIndex(0); }}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[hsl(280_50%_55%/0.3)] bg-[hsl(280_40%_50%/0.1)] hover:bg-[hsl(280_40%_50%/0.2)] transition-colors text-[9px] font-bold text-[hsl(280_50%_75%)]"
        >
          {playMode ? <Pause size={10} /> : <Play size={10} />}
          {playMode ? "Pause" : "▶ Play"}
        </button>
      </div>

      <div className="space-y-1">
        {visibleEntries.map((entry, i) => {
          const adv = getAdvisorInfo(entry.advisorId);
          const stance = stanceConfig[entry.stance];
          const isExpanded = expandedReasoning === i;
          const isSpeakingNow = i === currentSpeakingIndex;

          return (
            <motion.div
              key={`${entry.advisorId}-${i}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 180, damping: 18 }}
              className="flex items-start gap-3 group"
            >
              {/* Avatar column with connecting line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative">
                  <div
                    className="rounded-full border-2 shadow-lg"
                    style={{
                      borderColor: adv.accentColor,
                      boxShadow: isSpeakingNow
                        ? `0 0 24px ${adv.accentColor}35, 0 0 48px ${adv.accentColor}12`
                        : `0 0 8px ${adv.accentColor}18`,
                    }}
                  >
                    <TalkingAvatar
                      speaking={isSpeakingNow}
                      avatarUrl={adv.avatarUrl}
                      accentColor={adv.accentColor}
                      size={52}
                      name={adv.name}
                      emoji={adv.emoji}
                    />
                  </div>
                  {/* Speaking mic badge */}
                  {isSpeakingNow && (
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[hsl(220_18%_6%)]"
                      style={{ background: adv.accentColor }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Mic size={9} className="text-white" />
                    </motion.div>
                  )}
                </div>
                {/* Connecting line */}
                {i < visibleEntries.length - 1 && (
                  <div className="w-px h-full min-h-[16px] bg-[hsl(0_0%_100%/0.06)] mt-1" />
                )}
              </div>

              {/* Chat bubble */}
              <div className="flex-1 min-w-0 pb-3">
                {/* Gradient top strip */}
                <div
                  className="rounded-t-xl h-[3px] -mb-px"
                  style={{ background: `linear-gradient(90deg, ${adv.accentColor}, transparent)` }}
                />
                <div
                  className={cn(
                    "rounded-b-xl rounded-tr-xl border p-4 backdrop-blur-sm relative transition-all duration-500",
                  )}
                  style={{
                    borderColor: stance.borderColor,
                    background: stance.bgColor,
                    // Breathing glow on the currently speaking entry
                    boxShadow: isSpeakingNow ? `inset 3px 0 0 ${adv.accentColor}50` : undefined,
                  }}
                >
                  {/* Speech triangle */}
                  <div
                    className="absolute -left-1.5 top-4 w-3 h-3 rotate-45 border-l border-b"
                    style={{
                      borderColor: stance.borderColor,
                      background: stance.bgColor,
                    }}
                  />

                  {/* Currently Speaking badge */}
                  {isSpeakingNow && (
                    <motion.div
                      className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full flex items-center gap-1.5 border"
                      style={{
                        background: `${adv.accentColor}15`,
                        borderColor: `${adv.accentColor}40`,
                      }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <SoundWaveBars color={adv.accentColor} />
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: adv.accentColor }}>
                        Speaking
                      </span>
                    </motion.div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[hsl(0_0%_100%/0.88)]">{adv.name}</span>
                    <span className="text-[9px] font-semibold" style={{ color: adv.accentColor }}>{adv.role}</span>
                    <span
                      className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border"
                      style={{ color: stance.accentColor, borderColor: stance.borderColor }}
                    >
                      {stance.label}
                    </span>
                    <span className="text-[8px] text-[hsl(0_0%_100%/0.2)] ml-auto shrink-0">{entry.timestamp}</span>
                  </div>

                  {/* Statement */}
                  <p className="text-[12px] text-[hsl(0_0%_100%/0.72)] leading-relaxed mb-3">
                    {entry.statement}
                  </p>

                  {/* Reasoning chain toggle */}
                  <button
                    onClick={() => setExpandedReasoning(isExpanded ? null : i)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(280_50%_65%/0.7)] hover:text-[hsl(280_50%_80%)] transition-colors mb-2"
                  >
                    <Brain size={11} />
                    {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    Thinking Process
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg bg-[hsl(280_40%_50%/0.06)] border border-[hsl(280_50%_50%/0.12)] p-3 space-y-2 mb-3 relative">
                          {/* Vertical connecting line */}
                          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[hsl(280_50%_50%/0.15)]" />
                          {entry.reasoning.map((step, si) => (
                            <motion.div
                              key={si}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.2 }}
                              className="flex items-start gap-2.5 relative"
                            >
                              <div className="w-5 h-5 rounded-full bg-[hsl(280_50%_50%/0.15)] flex items-center justify-center shrink-0 mt-0.5 z-10">
                                <span className="text-[8px] font-bold text-[hsl(280_50%_70%)]">{si + 1}</span>
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
                    <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] flex items-center gap-1">
                      <FileCheck size={9} /> {entry.evidenceCited} sources
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator at the bottom — next advisor thinking */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: entries.length * 0.12 + 0.5 }}
          className="flex items-center gap-3 pl-1"
        >
          <div className="w-[52px] flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
              <Brain size={14} className="text-[hsl(280_50%_55%/0.4)]" />
            </div>
          </div>
          <div className="rounded-xl bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] px-1">
            <TypingIndicator color="hsl(280 50% 55%)" />
          </div>
          <span className="text-[9px] text-[hsl(0_0%_100%/0.2)] italic">Another advisor is thinking…</span>
        </motion.div>
      </div>
    </div>
  );
}
