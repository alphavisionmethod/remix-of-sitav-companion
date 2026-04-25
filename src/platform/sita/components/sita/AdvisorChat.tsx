import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useBrainCore, AdvisorResponse } from "@/hooks/use-brain-core";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import { useDataMode } from "@/contexts/DataModeContext";
import { TrustBadge } from "./TrustBadge";
import { EpistemicTrustDisplay } from "./EpistemicTrustDisplay";
import { getAdvisorContract, getOutputClassLabel } from "@/lib/no-hallucination/advisor-contract";
import {
  Brain, X, Send, Sparkles, DollarSign, Briefcase, Headphones, Users, TrendingUp,
  ChevronDown, Cpu, CheckCircle, Zap, MessageSquare, ShieldAlert, Eye, FlaskConical,
  AlertTriangle, Coins, StopCircle
} from "lucide-react";
import { AIDegradedState } from "@/components/ai/AIDegradedState";
import type { TrustEnrichedResponse } from "@/lib/ai/ai-capability-client";

type AdvisorDomain = "money" | "business" | "concierge" | "family" | "growth" | "general";
type ChatMode = "single" | "council";

interface ChatMessage {
  id: string;
  role: "user" | "advisor";
  content: string;
  advisor?: AdvisorDomain;
  response?: AdvisorResponse;
  trustMetadata?: TrustEnrichedResponse["trustMetadata"];
  timestamp: Date;
}

const ADVISOR_META: Record<AdvisorDomain, { label: string; icon: typeof Brain; color: string }> = {
  money: { label: "Money Advisor", icon: DollarSign, color: "text-accent" },
  business: { label: "Business Advisor", icon: Briefcase, color: "text-primary" },
  concierge: { label: "Concierge Advisor", icon: Headphones, color: "text-primary" },
  family: { label: "Family Advisor", icon: Users, color: "text-primary" },
  growth: { label: "Growth Advisor", icon: TrendingUp, color: "text-accent" },
  general: { label: "SITA", icon: Brain, color: "text-primary" },
};

const QUICK_PROMPTS: Record<AdvisorDomain, string[]> = {
  money: ["What's my cash posture?", "Any bills due soon?", "Detect subscription waste", "Safe to spend right now?"],
  business: ["Pipeline health check", "Any stale leads?", "Revenue forecast", "Follow up on quotes"],
  concierge: ["Today's schedule", "Prioritize my tasks", "Plan groceries", "Upcoming appointments"],
  family: ["Family calendar this week", "School activities", "Household task status", "Service provider review"],
  growth: ["Growth opportunities", "Market positioning", "Expansion ideas"],
  general: ["Daily briefing", "What needs attention?", "Cross-domain summary"],
};

interface AdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisorChat = ({ isOpen, onClose }: AdvisorChatProps) => {
  const [activeAdvisor, setActiveAdvisor] = useState<AdvisorDomain>("general");
  const [chatMode, setChatMode] = useState<ChatMode>("single");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { isDemoMode } = useDataMode();
  const { ask, isLoading } = useBrainCore({ advisor: activeAdvisor });
  const { messages: streamMsgs, isStreaming, error: streamError, send: streamSend, stop: streamStop, clear: streamClear } = useStreamingChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    if (isDemoMode) {
      if (chatMode === "council") {
        // Council mode: all advisors respond
        const councilAdvisors: AdvisorDomain[] = ["money", "business", "concierge", "family"];
        setTimeout(() => {
          const councilResponses: ChatMessage[] = councilAdvisors.map(adv => ({
            id: crypto.randomUUID(),
            role: "advisor" as const,
            content: getDemoResponse(adv, text),
            advisor: adv,
            timestamp: new Date(),
          }));
          // Add contradiction card if advisors disagree
          const contradictionMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "advisor" as const,
            content: "⚠️ **Contradiction Detected**: Finance Advisor estimates higher cost tolerance than Business Advisor's recommendation. Review both perspectives before deciding.",
            advisor: "general",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, ...councilResponses, contradictionMsg]);
        }, 1200);
      } else {
        setTimeout(() => {
          const demoResponse: ChatMessage = {
            id: crypto.randomUUID(),
            role: "advisor",
            content: getDemoResponse(activeAdvisor, text),
            advisor: activeAdvisor,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, demoResponse]);
        }, 800);
      }
      return;
    }

    // Live mode: use streaming chat for real-time token display
    streamSend(text, activeAdvisor, { chatMode });
  }, [activeAdvisor, isDemoMode, streamSend]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const meta = ADVISOR_META[activeAdvisor];
  const Icon = meta.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Icon className={`h-4 w-4 ${meta.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {chatMode === "council" ? "Advisor Council" : meta.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isDemoMode ? "Demo Mode" : "Live — Brain Core"}
                  {chatMode === "council" && " · All advisors"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Council toggle */}
              <button
                onClick={() => setChatMode(m => m === "single" ? "council" : "single")}
                className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${chatMode === "council" ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:bg-secondary"}`}
                title="Toggle Council Mode — all advisors respond"
              >
                <Users className="h-3.5 w-3.5 inline mr-1" />
                Council
              </button>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advisor Selector */}
          <div className="flex gap-1 border-b border-border px-3 py-2 overflow-x-auto">
            {(Object.keys(ADVISOR_META) as AdvisorDomain[]).map((domain) => {
              const am = ADVISOR_META[domain];
              const DomainIcon = am.icon;
              return (
                <button
                  key={domain}
                  onClick={() => setActiveAdvisor(domain)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                    activeAdvisor === domain
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <DomainIcon className="h-3 w-3" />
                  {am.label.replace(" Advisor", "")}
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4 pt-8">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-sita">
                    <Brain className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Ask {meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">Get intelligent recommendations backed by your data</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">Quick prompts</p>
                  {QUICK_PROMPTS[activeAdvisor].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left rounded-xl border border-border px-3 py-2.5 text-xs text-foreground hover:bg-secondary hover:border-primary/20 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary/60 border border-border text-foreground rounded-bl-md"
                }`}>
                  {msg.role === "advisor" && (
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {msg.response && (
                        <TrustBadge
                          level={msg.response.confidence >= 0.8 ? "verified" : msg.response.confidence >= 0.5 ? "review" : "degraded"}
                          label={`${Math.round(msg.response.confidence * 100)}%`}
                          size="sm"
                        />
                      )}
                      {/* Output class badge from advisor contract */}
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-muted-foreground capitalize">
                        {getOutputClassLabel(getAdvisorContract(msg.advisor || "general").outputClass)}
                      </span>
                      {msg.response && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                          {msg.response.source === "rules" ? <CheckCircle className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                          {msg.response.source === "rules" ? "Rules" : "AI"}
                        </span>
                      )}
                      {msg.response && msg.response.confidence < 0.5 && (
                        <span className="text-[9px] text-destructive flex items-center gap-1">
                          <ShieldAlert className="h-2.5 w-2.5" /> Low confidence — verify
                        </span>
                      )}
                    </div>
                  )}
                  {/* Epistemic Trust Metadata */}
                  {msg.role === "advisor" && msg.trustMetadata && (
                    <div className="mb-2">
                      <EpistemicTrustDisplay trustMetadata={msg.trustMetadata} compact />
                    </div>
                  )}
                  <div className="text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {/* Simulation & Cost buttons */}
                  {msg.role === "advisor" && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                      <button className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors">
                        <FlaskConical className="h-2.5 w-2.5" /> Simulate This
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="h-2.5 w-2.5" /> Background
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <AlertTriangle className="h-2.5 w-2.5" /> Challenge
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-[9px] text-muted-foreground/70">
                        <Coins className="h-2.5 w-2.5" /> $0.03
                      </span>
                    </div>
                  )}
                  {msg.role === "advisor" && msg.response?.actions && msg.response.actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      <p className="text-[9px] font-medium text-muted-foreground uppercase">Actions</p>
                      {msg.response.actions.map((a, i) => (
                        <button key={i} className="flex items-center gap-1.5 text-[11px] text-primary hover:underline">
                          <Zap className="h-2.5 w-2.5" />
                          {a.description || a.type}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {msg.advisor && chatMode === "council" && (
                      <span className="ml-1.5 text-muted-foreground/40">· {ADVISOR_META[msg.advisor]?.label}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming messages (live mode) */}
            {!isDemoMode && streamMsgs.map((msg, i) => (
              <div key={`stream-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  data-testid={msg.role === "assistant" ? "advisor-message-assistant" : undefined}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary/60 border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Sparkles className="h-2.5 w-2.5" /> Streaming AI
                      {isStreaming && i === streamMsgs.length - 1 && (
                        <span className="ml-1 inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </span>
                  )}
                  <div className="text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Degraded state banner */}
            {streamError && (
              <AIDegradedState
                state="error"
                reason={streamError}
                onRetry={() => streamClear()}
                compact
              />
            )}

            {(isLoading || isStreaming) && streamMsgs.filter(m => m.role === "assistant").length === 0 && !streamError && (
              <div className="flex justify-start">
                <div className="bg-secondary/60 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2" data-testid="advisor-streaming-indicator">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Brain Core processing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${meta.label.replace(" Advisor", "")}...`}
                className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                disabled={isLoading || isStreaming}
                data-testid="advisor-chat-input"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={streamStop}
                  className="rounded-xl bg-destructive p-2.5 text-destructive-foreground transition-all hover:bg-destructive/90"
                >
                  <StopCircle className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl bg-primary p-2.5 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  data-testid="advisor-chat-send"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Floating trigger button
export const AdvisorChatTrigger = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl gradient-sita shadow-glow-purple text-primary-foreground transition-all hover:scale-105"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title="Ask SITA Advisor"
  >
    <MessageSquare className="h-6 w-6" />
  </motion.button>
);

// Demo response generator
function getDemoResponse(advisor: AdvisorDomain, query: string): string {
  const responses: Record<AdvisorDomain, string[]> = {
    money: [
      "**Cash Position Summary**\n\nYour current safe-to-spend is **$15,780** after accounting for upcoming bills and reserves.\n\n- Available: $24,680\n- Incoming (expected): $12,400\n- Outgoing (committed): $8,900\n- Next big expense: Quarterly Tax — $4,200 on Apr 15\n\n**Recommendation:** Hold off on non-essential purchases until after the quarterly tax payment.",
      "**Bill Analysis**\n\n3 bills need attention:\n\n1. ⚠️ **Insurance Premium** — $890 (overdue)\n2. 📅 Office Rent — $2,500 (due Apr 1)\n3. 📅 AWS Hosting — $342 (due Apr 3)\n\nTotal upcoming: $3,732\n\n**Action:** Pay the overdue insurance premium today to avoid late fees.",
    ],
    business: [
      "**Pipeline Health Report**\n\nYour pipeline looks **moderately healthy** with $86,400 in total opportunity value.\n\n- **Negotiation:** Acme Expansion ($48K, 75% prob)\n- **Proposal:** Bloom Retainer ($14.4K, 60% prob)\n- **Discovery:** NovaTech Upgrade ($24K, 40% prob)\n\nWeighted pipeline: **$55,440**\n\n**Priority:** Focus on closing Acme Expansion — it represents 55% of weighted value.",
      "**Stale Lead Alert**\n\n1 lead at risk:\n\n- **James Morton** (Morton Labs) — last contact 5 days ago, $6,000 potential\n\n**Recommendation:** Send a re-engagement email with a time-limited offer. Leads that go 7+ days without contact have a 60% lower close rate.",
    ],
    concierge: [
      "**Today's Priority Stack**\n\n1. 🔴 **Grocery run** — weekly staples (today)\n2. 🟡 **HVAC maintenance** — SITA is scheduling with ServicePro\n3. ⬜ **Dry cleaning pickup** — tomorrow\n4. 🔴 **Car registration** — due Apr 12, start process today\n\n**Suggestion:** Combine the grocery run with dry cleaning pickup tomorrow to save a trip.",
    ],
    family: [
      "**Family Calendar This Week**\n\n- Today 4:00 PM — Soccer Practice (Alex) @ Wilson Park\n- Thu 3:30 PM — Parent-Teacher Meeting @ Lincoln Elementary\n- Sat 2:00 PM — Dance Recital (Maya) @ Community Center\n- Next Mon 10:00 AM — Dentist (Maya) @ Dr. Kim's office\n\n**Conflict:** None detected. Thursday is the busiest day.",
    ],
    growth: [
      "**Growth Opportunities Identified**\n\n1. **Service upsell** — 3 existing clients showing expansion signals\n2. **Referral program** — Your top clients haven't been asked for referrals\n3. **Adjacent market** — Your consulting expertise could serve healthcare\n\n**Quick win:** Ask your top 3 clients for referrals this week. Warm referrals close 4x faster.",
    ],
    general: [
      "**Daily Operating Summary**\n\n📊 **Business:** Pipeline healthy at $86K, 1 stale lead needs attention\n💰 **Money:** $15,780 safe-to-spend, 1 overdue bill\n🏠 **Concierge:** 4 tasks pending, grocery run today\n👨‍👩‍👧‍👦 **Family:** Soccer practice today, no conflicts\n\n**Top Priority:** Pay the overdue insurance bill and follow up with James Morton.\n\n*6 items need your attention today.*",
    ],
  };

  const advisorResponses = responses[advisor] || responses.general;
  return advisorResponses[Math.floor(Math.random() * advisorResponses.length)];
}
