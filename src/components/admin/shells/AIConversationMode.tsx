import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send, Bot, User, HelpCircle, Wrench, Eye, ChevronRight,
  Lightbulb, CornerDownLeft
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  actions?: { label: string; icon: React.ElementType }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1", role: "ai",
    content: "Welcome to the AI conversation panel. Ask me anything about your platform — I'll explain clearly and suggest next steps.",
    timestamp: new Date(Date.now() - 60000),
  },
];

const QUICK_ASKS = [
  "Why is sync slow?",
  "What's the biggest risk right now?",
  "Should I ship the release?",
  "How's the AI budget?",
];

export function AIConversationMode() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"founder" | "technical">("founder");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`, role: "user", content: text.trim(), timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, { content: string; actions?: ChatMessage["actions"] }> = {
        "Why is sync slow?": {
          content: mode === "founder"
            ? "Upload finalization is slower than usual because the storage metadata lookup became more expensive after the last release. This is causing mobile retries to increase."
            : "Root cause: metadata query regression in upload-finalization-service since v2.14.0-rc3. P95 latency increased 38%. Mobile retry storm probability: HIGH.",
          actions: [
            { label: "Simulate a fix", icon: Wrench },
            { label: "Show technical details", icon: Eye },
            { label: "What if I do nothing?", icon: HelpCircle },
          ],
        },
        "What's the biggest risk right now?": {
          content: mode === "founder"
            ? "The trust false-positive rate is at 4.2%, which means some legitimate users are getting unnecessary security prompts. This could hurt user experience."
            : "Trust engine FP rate: 4.2% (SLO target: <3%). Affected cohort: new signups in last 7d. Root: overly aggressive device fingerprint threshold.",
          actions: [
            { label: "Recalibrate thresholds", icon: Wrench },
            { label: "Show affected users", icon: Eye },
          ],
        },
      };
      const match = responses[text.trim()] || {
        content: mode === "founder"
          ? "I've analyzed your platform state. Everything looks stable right now. Would you like me to run a deeper analysis on any specific area?"
          : "Platform health: 98%. No critical issues detected. Sync: 99.4% reliability. Trust: FP rate slightly elevated. AI budget: within limits.",
        actions: [
          { label: "Run full audit", icon: Wrench },
          { label: "Show details", icon: Eye },
        ],
      };

      const aiMsg: ChatMessage = {
        id: `a${Date.now()}`, role: "ai", content: match.content,
        timestamp: new Date(), actions: match.actions,
      };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div className="px-3 py-1.5 border-b border-border/10 flex items-center gap-2">
        <button
          onClick={() => setMode("founder")}
          className={cn("text-[9px] px-2 py-0.5 rounded", mode === "founder" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Founder Mode
        </button>
        <button
          onClick={() => setMode("technical")}
          className={cn("text-[9px] px-2 py-0.5 rounded", mode === "technical" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Technical Mode
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "ai" && (
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
            )}
            <div className={cn(
              "max-w-[85%] rounded-lg px-2.5 py-2 space-y-1.5",
              msg.role === "user"
                ? "bg-primary/10 text-foreground"
                : "bg-muted/10 text-foreground border border-border/10"
            )}>
              <p className="text-[11px] leading-relaxed">{msg.content}</p>
              {msg.actions && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {msg.actions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.label)}
                      className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-primary hover:bg-white/[0.08] transition-colors"
                    >
                      <action.icon className="h-2.5 w-2.5" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-5 w-5 rounded-full bg-muted/20 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="bg-muted/10 rounded-lg px-3 py-2 border border-border/10">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Asks */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {QUICK_ASKS.map(ask => (
            <button
              key={ask}
              onClick={() => sendMessage(ask)}
              className="text-[9px] px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors"
            >
              <Lightbulb className="h-2.5 w-2.5 inline mr-1" />
              {ask}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-border/10">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            disabled={typing}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="p-1.5 rounded hover:bg-muted/30 transition-colors disabled:opacity-30"
          >
            <Send className="h-3 w-3 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
