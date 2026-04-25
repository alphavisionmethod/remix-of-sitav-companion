// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Conversation Interface
// Chat directly with any advisor — context-aware, memory-enriched
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageSquare, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_ADVISORS, type AdvisorPersona } from "@/domains/engines/business-advisor-personas";
import type { MemorySnapshot } from "@/domains/engines/advisor-memory-engine";
import type { BusinessContextSnapshot } from "@/domains/engines/business-context-graph";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "advisor";
  content: string;
  advisorId?: string;
  timestamp: string;
}

interface Props {
  selectedAdvisor: AdvisorPersona | null;
  onSelectAdvisor: (advisor: AdvisorPersona) => void;
  memorySnapshot: MemorySnapshot;
  businessContext: BusinessContextSnapshot;
}

export function AdvisorConversation({ selectedAdvisor, onSelectAdvisor, memorySnapshot, businessContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Reset on advisor change
  useEffect(() => {
    if (selectedAdvisor) {
      setMessages([{
        id: `welcome-${Date.now()}`,
        role: "advisor",
        content: `I'm **${selectedAdvisor.displayName}**, your ${selectedAdvisor.role}. ${selectedAdvisor.promptTemplate.slice(0, 150)}...\n\nHow can I help you today?`,
        advisorId: selectedAdvisor.id,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [selectedAdvisor?.id]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedAdvisor || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("advisor-conversation", {
        body: {
          advisorId: selectedAdvisor.id,
          advisorName: selectedAdvisor.displayName,
          advisorRole: selectedAdvisor.role,
          personalityTraits: selectedAdvisor.personalityTraits,
          communicationStyle: selectedAdvisor.communicationStyle,
          domainScope: selectedAdvisor.domainScope,
          userMessage: userMsg.content,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          businessContext: {
            identity: businessContext.identity,
            performance: businessContext.performance,
          },
          memoryContext: {
            longTerm: memorySnapshot.longTerm.slice(0, 3).map(m => m.content),
            preferences: memorySnapshot.preference.slice(0, 3).map(m => m.content),
          },
        },
      });

      if (error) throw error;

      const advisorMsg: ChatMessage = {
        id: `advisor-${Date.now()}`,
        role: "advisor",
        content: data?.response ?? "I couldn't process that right now. Please try again.",
        advisorId: selectedAdvisor.id,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, advisorMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "advisor",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        advisorId: selectedAdvisor.id,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, selectedAdvisor, isLoading, messages, businessContext, memorySnapshot]);

  return (
    <div className="space-y-3">
      {/* Advisor Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {BUSINESS_ADVISORS.map(advisor => (
          <button
            key={advisor.id}
            onClick={() => onSelectAdvisor(advisor)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-all duration-200 ${
              selectedAdvisor?.id === advisor.id
                ? "border-[hsl(265_55%_58%)] bg-[hsl(265_55%_58%/0.1)] shadow-[0_0_12px_hsl(265_55%_58%/0.15)]"
                : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.12)]"
            }`}
          >
            <span className="text-sm">{advisor.emoji}</span>
            <span className="text-[10px] font-medium text-foreground">{advisor.displayName}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.015)] overflow-hidden">
        <CardContent className="p-0 flex flex-col" style={{ height: "420px" }}>
          {!selectedAdvisor ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(265_55%_58%/0.08)] flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-[hsl(265_55%_58%/0.4)]" />
              </div>
              <h3 className="text-sm font-display font-bold text-foreground mb-1">Select an Advisor</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                Choose an advisor above to start a conversation. They'll use your business context and memory to give personalized guidance.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                  {messages.map(msg => {
                    const advisor = msg.advisorId ? BUSINESS_ADVISORS.find(a => a.id === msg.advisorId) : null;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
                      >
                        {msg.role === "advisor" && advisor && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center text-sm">
                            {advisor.emoji}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 ${
                            msg.role === "user"
                              ? "bg-[hsl(265_55%_58%)] text-white"
                              : "bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)]"
                          }`}
                        >
                          {msg.role === "advisor" ? (
                            <div className="text-[11px] text-foreground/90 prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_p]:leading-relaxed [&_strong]:text-foreground [&_li]:text-[11px]">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-[11px] leading-relaxed">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center text-sm">
                      {selectedAdvisor.emoji}
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[hsl(265_55%_58%/0.5)]"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[hsl(0_0%_100%/0.06)] p-3 flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={`Ask ${selectedAdvisor.displayName}...`}
                  className="text-[11px] h-8 bg-transparent border-[hsl(0_0%_100%/0.06)] focus-visible:ring-[hsl(265_55%_58%)]"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_48%)] text-white flex-shrink-0"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}