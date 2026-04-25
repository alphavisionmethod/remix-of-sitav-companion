// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 7 StreamingChatPanel
// Reusable surface that wires `useOrchestratorStream` into a small
// chat UI with live SemanticContextBadges for retrieved sources.
// Class: SURFACE.
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, StopCircle, Sparkles } from "lucide-react";
import { useOrchestratorStream } from "./use-orchestrator-stream";
import {
  SemanticContextBadge,
  type RetrievalKind,
} from "@/modules/_shared/knowledge";

export interface StreamingChatPanelProps {
  title?: string;
  capabilityKey?: string;
  systemPrompt?: string;
  workspaceId?: string | null;
  moduleId?: string | null;
  placeholder?: string;
  className?: string;
}

export function StreamingChatPanel({
  title = "Live cortex chat",
  capabilityKey = "shared.chat",
  systemPrompt,
  workspaceId = null,
  moduleId = null,
  placeholder = "Ask anything — semantic memories will be pulled in automatically…",
  className,
}: StreamingChatPanelProps) {
  const [input, setInput] = useState("");
  const { start, cancel, reset, isStreaming, text, events, error } = useOrchestratorStream();

  const traceEvents = useMemo(
    () => events.filter((e) => e.kind === "trace") as Array<Extract<typeof events[number], { kind: "trace" }>>,
    [events],
  );
  const contextEvent = useMemo(
    () => events.find((e) => e.kind === "context") as Extract<typeof events[number], { kind: "context" }> | undefined,
    [events],
  );

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;
    setInput("");
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });
    await start({
      capabilityKey,
      workspaceId,
      moduleId,
      messages,
      contextSources: { semanticRetrieval: true, semanticMemoryMax: 6, semanticChunkMax: 6, workspaceMemoryAuto: true },
    });
  };

  const kindOf = (k: string): RetrievalKind => {
    if (k === "semantic" || k === "fulltext" || k === "recency" || k === "voice") return k;
    return "manual";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> {title}</span>
          {contextEvent && (
            <Badge variant="outline" className="text-[10px] font-normal">
              {contextEvent.semanticMemories} mem · {contextEvent.semanticChunks} chunks
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {traceEvents.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {traceEvents.slice(0, 12).map((t, i) => (
              <SemanticContextBadge
                key={`${t.source_label}-${i}`}
                kind={kindOf(t.retrieval_kind)}
                similarity={t.similarity}
                label={t.source_label?.slice(0, 28)}
              />
            ))}
            {traceEvents.length > 12 && (
              <Badge variant="outline" className="text-[10px]">+{traceEvents.length - 12} more</Badge>
            )}
          </div>
        )}

        <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
          {!text && !isStreaming && (
            <p className="text-sm text-muted-foreground">
              Streamed response will appear here. Context is resolved before tokens stream.
            </p>
          )}
          {text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>}
          {isStreaming && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> streaming…
            </p>
          )}
          {error && (
            <p className="mt-2 text-xs text-destructive">Error: {error}</p>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={2}
            disabled={isStreaming}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">⌘/Ctrl + Enter to send</p>
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Button size="sm" variant="outline" onClick={cancel} className="gap-1">
                  <StopCircle className="h-3.5 w-3.5" /> Stop
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={reset} disabled={!text && !error}>
                  Clear
                </Button>
              )}
              <Button size="sm" onClick={handleSend} disabled={isStreaming || !input.trim()} className="gap-1">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}