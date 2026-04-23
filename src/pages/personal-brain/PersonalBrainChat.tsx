import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Brain, Info, Loader2, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ModePicker } from "@/components/personal-brain/ModePicker";
import { ContextDrawer } from "@/components/personal-brain/ContextDrawer";
import { ConvertMessageMenu } from "@/components/personal-brain/ConvertMessageMenu";
import { usePbChat } from "@/components/personal-brain/hooks/usePbChat";
import { usePbMemories, type PbMemoryCategory } from "@/components/personal-brain/hooks/usePbMemories";
import { parseRememberCommand } from "@/components/personal-brain/parseRememberCommand";
import { BRAIN_MODES_BY_ID, type BrainModeId, isBrainModeId } from "@/components/personal-brain/BRAIN_MODES";

function ChatInner() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { chat, messages, loading, streaming, send } = usePbChat(chatId ?? null);
  const { save: saveMemory, triggerScan } = usePbMemories();
  const [input, setInput] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [contextSources, setContextSources] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<BrainModeId>("think");
  const bottomRef = useRef<HTMLDivElement>(null);
  const autosentRef = useRef(false);
  const turnCountRef = useRef(0);
  const lastScanAtRef = useRef(0);

  useEffect(() => {
    if (chat && isBrainModeId(chat.mode)) {
      setMode(chat.mode);
    }
  }, [chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send a starter prompt arriving from dashboard `?prompt=…`
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (!prompt || autosentRef.current || loading || !chatId) return;
    autosentRef.current = true;
    void send(prompt, mode);
    setSearchParams({}, { replace: true });
  }, [searchParams, loading, chatId, mode, send, setSearchParams]);

  const handleModeChange = async (next: BrainModeId) => {
    setMode(next);
    if (!user || !chatId) return;
    await supabase.from("pb_chats").update({ mode: next }).eq("id", chatId).eq("user_id", user.id);
  };

  const handleSubmit = async () => {
    const value = input.trim();
    if (!value || streaming) return;

    // /remember slash command — save explicit memory directly, do not call AI
    const remember = parseRememberCommand(value);
    if (remember) {
      setInput("");
      try {
        await saveMemory({
          content: remember.content,
          category: remember.category as PbMemoryCategory,
          kind: "explicit",
          confidence: 1.0,
          source_chat_id: chatId ?? null,
        });
        toast.success("Saved to Brain", {
          description: `Tagged as ${remember.category.replace(/_/g, " ")}.`,
          action: { label: "View", onClick: () => navigate("/personal-brain/snapshot") },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save memory");
      }
      return;
    }

    setInput("");
    await send(value, mode);
    turnCountRef.current += 1;

    // Trigger background learn.scan every 6 turns, max once per 5 minutes
    const now = Date.now();
    if (turnCountRef.current % 6 === 0 && now - lastScanAtRef.current > 5 * 60 * 1000) {
      lastScanAtRef.current = now;
      void triggerScan(chatId);
    }
  };

  if (!chatId) {
    return (
      <PageShell>
        <div className="p-6 text-sm text-muted-foreground">Missing chat id.</div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  const meta = BRAIN_MODES_BY_ID[mode];

  return (
    <PageShell>
      <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
                <ArrowLeft className="h-4 w-4" />
                Brain
              </Button>
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-foreground">
                  {chat?.title ?? "New chat"}
                </h1>
                <p className="truncate text-[11px] text-muted-foreground">{meta.short}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] capitalize">
              {mode}
            </Badge>
          </div>
          <ModePicker value={mode} onChange={(m) => void handleModeChange(m)} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <Brain className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-semibold text-foreground">{meta.label} mode</h3>
              <p className="mt-1 text-sm text-muted-foreground">{meta.short}</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {msg.content ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : msg.pending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                    {!msg.pending && msg.content && (
                      <div className="mt-2 flex items-center justify-end gap-1">
                        {msg.sources && Object.keys(msg.sources).length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setContextSources(msg.sources ?? null);
                              setContextOpen(true);
                            }}
                          >
                            <Info className="h-3 w-3" />
                            Context
                          </Button>
                        )}
                        <ConvertMessageMenu content={msg.content} chatTitle={chat?.title} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          {parseRememberCommand(input) && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] text-primary">
              <Sparkles className="h-3 w-3" />
              Press Enter to save this directly to your Brain (won't be sent as a message).
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${meta.label} mode… or type /remember … to teach the Brain`}
              className="max-h-[160px] min-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <Button onClick={handleSubmit} disabled={!input.trim() || streaming} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ContextDrawer
        open={contextOpen}
        onOpenChange={setContextOpen}
        sources={contextSources}
      />
    </PageShell>
  );
}

export default function PersonalBrainChat() {
  return (
    <GlobalErrorBoundary>
      <ChatInner />
    </GlobalErrorBoundary>
  );
}