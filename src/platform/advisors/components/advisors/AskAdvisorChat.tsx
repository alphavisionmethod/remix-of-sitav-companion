import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  advisorId?: string;
}

interface AskAdvisorChatProps {
  advisors: AdvisorConfig[];
  domainLabel: string;
}

const quickQuestions: Record<string, string[]> = {
  money: ["What's my top financial priority?", "How healthy is my cash flow?", "Should I increase reserves?"],
  business: ["What are my pipeline risks?", "Where should I focus this week?", "Which deals need attention?"],
  concierge: ["What's due this week?", "Any appointments to prep for?", "What can be automated?"],
  general: ["Give me a summary", "What needs my attention?", "What's the overall health?"],
};

export const AskAdvisorChat = ({ advisors, domainLabel }: AskAdvisorChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdvisor, setActiveAdvisor] = useState<AdvisorConfig>(advisors[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const domain = advisors[0]?.domain || "general";
  const questions = quickQuestions[domain] || quickQuestions.general;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-advisor", {
        body: {
          advisor: activeAdvisor.advisorId || activeAdvisor.domain,
          message: content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        },
      });

      const reply = data?.reply || data?.content || (error ? "Sorry, I couldn't process that." : "No response received.");
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        advisorId: activeAdvisor.id,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col" style={{ height: "480px" }}>
      {/* Advisor selector strip */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20 overflow-x-auto">
        <span className="text-[10px] text-muted-foreground shrink-0">Ask:</span>
        {advisors.slice(0, 6).map(a => (
          <button
            key={a.id}
            onClick={() => setActiveAdvisor(a)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all shrink-0",
              activeAdvisor.id === a.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
            )}
          >
            <AdvisorAvatar domain={a.domain} size="sm" status={a.status} />
            <span className="hidden sm:inline">{a.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-primary/10 p-4"
            >
              <MessageCircle className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Ask the {domainLabel} Council</p>
              <p className="text-[11px] text-muted-foreground mt-1">Get real-time intelligence from your advisors</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-secondary/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all"
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
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <AdvisorAvatar domain={activeAdvisor.domain} size="sm" status="active" />
              )}
              <div className={cn(
                "rounded-xl px-3 py-2 max-w-[80%] text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground"
              )}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-xs prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <AdvisorAvatar domain={activeAdvisor.domain} size="sm" status="thinking" />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/40"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/40 p-2 bg-muted/10">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${activeAdvisor.name}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
            disabled={isLoading}
          />
          <Button size="icon" variant="ghost" type="submit" disabled={!input.trim() || isLoading} className="h-8 w-8">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
