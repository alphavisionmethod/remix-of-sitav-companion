import { useState, useRef, useEffect } from "react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Lightbulb, GraduationCap, Hammer, Palette, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";



type Mode = "think" | "learn" | "build" | "create";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const modes: { id: Mode; label: string; icon: React.ElementType; description: string }[] = [
  { id: "think", label: "Think", icon: Lightbulb, description: "Brainstorm, reflect, analyze" },
  { id: "learn", label: "Learn", icon: GraduationCap, description: "Master new skills" },
  { id: "build", label: "Build", icon: Hammer, description: "Create a business or project" },
  { id: "create", label: "Create", icon: Palette, description: "Write, design, compose" },
];

function PersonalBrainInner() {
  const { user } = useAuth();
  const os = useOSOrchestration();
  const signature = useExperienceSignature();
  const [mode, setMode] = useState<Mode>("think");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Route through OS intent orchestrator for tracking
    if (os.hydrated) {
      os.processIntent(input.trim(), "assistant", "desktop").catch(() => {});
    }

    try {
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: { messages: newMessages, mode, osMode: os.getCurrentMode(), tone: signature.tone },
      });

      if (error) throw error;

      // Handle streaming response
      if (data && typeof data === "string") {
        setMessages(prev => [...prev, { role: "assistant", content: data }]);
      } else if (data?.choices?.[0]?.message?.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
      } else {
        // For SSE streaming, collect the response
        let fullContent = "";
        try {
          const lines = (data as string || "").split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              const json = JSON.parse(line.slice(6));
              fullContent += json.choices?.[0]?.delta?.content || "";
            }
          }
        } catch {
          fullContent = typeof data === "string" ? data : JSON.stringify(data);
        }
        setMessages(prev => [...prev, { role: "assistant", content: fullContent || "I'm here to help. What would you like to explore?" }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message || "Something went wrong"}` }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <PageShell>
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[900px] mx-auto">
{/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Personal Brain</h1>
            <p className="text-xs text-muted-foreground">Your AI companion for thinking, learning, building & creating</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2">
          {modes.map(m => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.id)}
              className="gap-1.5"
            >
              <m.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">
              {mode === "think" && "What's on your mind?"}
              {mode === "learn" && "What would you like to learn?"}
              {mode === "build" && "What are you building?"}
              {mode === "create" && "What would you like to create?"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {modes.find(m => m.id === mode)?.description}. I have context from all your advisors for holistic guidance.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask your Brain anything (${mode} mode)...`}
            className="min-h-[44px] max-h-[120px] resize-none"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || streaming} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-[10px]">
            Mode: {modes.find(m => m.id === mode)?.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{messages.length} messages</span>
        </div>
      </div>
    </div>
    </PageShell>
  );
}

export default function PersonalBrain() {
return (
    <GlobalErrorBoundary>
      <PersonalBrainInner />
    </GlobalErrorBoundary>
  );
}
