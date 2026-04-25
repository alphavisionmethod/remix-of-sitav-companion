// ═══════════════════════════════════════════════════════════════
// SITA OS — Calm Assistant / Chief-of-Staff Chat Surface
// Conversational AI surface using the canonical useAdvisorChat hook
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { useAdvisorChat, STATE_BADGE_CONFIG, isDegradedState } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Send, Trash2, Loader2, Bot, User, Sparkles,
  ShieldCheck, Clock, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const SYSTEM_PROMPT = `You are SITA's Chief of Staff — a calm, precise, and proactive executive assistant.
You orchestrate across all domains (business, money, family, operations) with quiet confidence.
Be concise. Surface what matters. Offer next actions. Never overwhelm.
When uncertain, say so honestly with confidence levels.`;

const QUICK_PROMPTS = [
  "What's my top priority today?",
  "Summarize this week's business",
  "Any urgent items I should know about?",
];

export default function CalmAssistantChat() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    state,
    lastEnvelope,
    sendMessage,
    clearChat,
    isLoading,
  } = useAdvisorChat({
    capabilityKey: "advisor.chat.primary",
    systemPrompt: SYSTEM_PROMPT,
    onResponse: () => {},
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const badge = STATE_BADGE_CONFIG[state];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 gap-4" data-testid="advisors-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Chief of Staff</h1>
            <p className="text-xs text-muted-foreground">Your calm, cross-domain executive assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <Badge variant={badge.variant} className={cn("text-[10px]", badge.className)}>
            {badge.label}
          </Badge>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border/50 bg-card/30 p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Crown className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">What can I help you with today?</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full border border-border/50 text-xs hover:bg-muted/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              data-testid="chat-message"
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/50 border border-border/30 rounded-bl-md"
                )}
                data-testid={msg.role === "assistant" ? "advisor-chat-response" : undefined}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                {msg.envelope?.usageSummary && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                    {msg.envelope.modelUsed && (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" /> {msg.envelope.modelUsed}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {msg.envelope.usageSummary.latencyMs}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" /> {msg.envelope.usageSummary.inputTokens + msg.envelope.usageSummary.outputTokens} tok
                    </span>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {/* Degraded Banner */}
      {isDegradedState(state) && lastEnvelope && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive" data-testid="advisor-degraded-banner">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{lastEnvelope.degradedReason || "AI capability is running in degraded mode"}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <Textarea
          data-testid="advisor-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your Chief of Staff anything…"
          className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
          rows={1}
          disabled={isLoading}
        />
        <Button
          data-testid="advisor-chat-send"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="rounded-xl h-11 w-11 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
