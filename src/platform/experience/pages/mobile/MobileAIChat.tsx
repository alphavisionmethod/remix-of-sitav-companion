import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, AlertTriangle, Shield, Zap,
  TrendingUp, ChevronRight, RotateCcw, Copy, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: ActionSuggestion[];
  confidence?: number;
  systemContext?: string;
}

interface ActionSuggestion {
  label: string;
  command: string;
  risk: "low" | "medium" | "high";
  confidence: number;
}

const riskColors: Record<string, string> = {
  low: "border-emerald-500/30 text-emerald-400",
  medium: "border-amber-500/30 text-amber-400",
  high: "border-red-500/30 text-red-400",
};

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Good morning. Your system is healthy. 3 devices online, sync current, no pending approvals. One anomaly detected: **tablet-02** has elevated memory usage (87%). Would you like me to investigate?",
    timestamp: "9:01 AM",
    confidence: 0.94,
    systemContext: "Based on live telemetry from 3 active devices",
    suggestions: [
      { label: "Investigate tablet", command: "diagnose device tablet-02 memory", risk: "low", confidence: 0.92 },
      { label: "Restart tablet services", command: "restart services tablet-02", risk: "medium", confidence: 0.78 },
    ],
  },
  {
    id: "m2",
    role: "user",
    content: "Why is the tablet memory so high?",
    timestamp: "9:02 AM",
  },
  {
    id: "m3",
    role: "assistant",
    content: "The elevated memory on **tablet-02** is caused by the background sync service holding a large delta queue (2,847 items) that accumulated during a 6-hour offline period yesterday.\n\n**Root cause:** The device lost Wi-Fi connection at 2:14 AM and reconnected at 8:22 AM. During that window, sync deltas queued in memory rather than flushing to disk.\n\n**Impact:** No data loss risk. Performance may degrade if queue exceeds 5,000 items.\n\n**Recommended action:** Force a sync flush, which will clear the queue and free ~340 MB of memory.",
    timestamp: "9:02 AM",
    confidence: 0.91,
    systemContext: "Analyzed sync logs, device telemetry, network events from past 24h",
    suggestions: [
      { label: "Force sync flush", command: "force sync flush tablet-02", risk: "low", confidence: 0.95 },
      { label: "View sync queue", command: "show sync queue tablet-02", risk: "low", confidence: 0.88 },
      { label: "Set offline threshold", command: "set sync offline-flush-threshold 2000", risk: "medium", confidence: 0.72 },
    ],
  },
];

const quickPrompts = [
  "What should I do next?",
  "Show system health",
  "Any security concerns?",
  "Why did sync fail?",
];

const MobileAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      role: "assistant",
      content: "I'm analyzing your request across system telemetry, sync state, and device health data. Based on current conditions:\n\nAll core services are operating normally. No pending approvals or critical alerts. Your next recommended action is to review the canary deployment results from this morning's v2.4.1 rollout — 12 devices healthy, 0 errors reported.",
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      confidence: 0.88,
      systemContext: "Cross-referenced 14 data sources",
      suggestions: [
        { label: "View rollout status", command: "show rollout v2.4.1", risk: "low", confidence: 0.93 },
        { label: "Promote to stable", command: "promote v2.4.1 stable", risk: "medium", confidence: 0.81 },
      ],
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <MobileShell title="AI Assistant">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      <div className="flex flex-col -mx-4 -my-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground rounded-br-md"
                    : "bg-card border border-border/40 rounded-bl-md"
                )}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>

                  {/* Confidence + Context */}
                  {msg.confidence && (
                    <div className="mt-2 pt-2 border-t border-border/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-[10px] text-primary font-medium">
                          {Math.round(msg.confidence * 100)}% confidence
                        </span>
                      </div>
                      {msg.systemContext && (
                        <p className="text-[10px] text-muted-foreground">{msg.systemContext}</p>
                      )}
                    </div>
                  )}

                  {/* Action Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => handleSend(s.command)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors text-left",
                            riskColors[s.risk]
                          )}
                        >
                          <Zap className="h-3 w-3 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-foreground">{s.label}</p>
                            <p className="text-[9px] font-mono text-muted-foreground truncate">{s.command}</p>
                          </div>
                          <span className="text-[9px] opacity-70">{Math.round(s.confidence * 100)}%</span>
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Actions */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mt-2">
                      <button className="p-1 rounded hover:bg-muted/50 transition-colors">
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button className="p-1 rounded hover:bg-muted/50 transition-colors">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button className="p-1 rounded hover:bg-muted/50 transition-colors">
                        <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <span className="text-[9px] text-muted-foreground ml-auto">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => handleSend(qp)}
              className="px-3 py-1.5 rounded-full border border-border/40 bg-card text-[10px] font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your system..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => handleSend()}
              className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
};

export default MobileAIChat;
