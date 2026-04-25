// ═══════════════════════════════════════════════════════════════
// SITA OS — VoiceTranscriptDrawer
// Reads voice_transcripts for a session and lets the operator
// promote any final user/assistant transcript into pb_memories.
// Class: SURFACE.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { Drawer } from "@/components/primitives/overlays/Drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, MessageSquare, Bot, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useSessionTranscripts, usePromoteVoiceTranscript } from "./use-voice-spine";
import type { Sensitivity, VoiceTranscriptRow } from "./voice-service";

export interface VoiceTranscriptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  /** Default sensitivity used when promoting; defaults to "internal". */
  defaultSensitivity?: Sensitivity;
}

const ROLE_ICON: Record<string, React.ReactNode> = {
  user: <MessageSquare className="h-3 w-3" />,
  assistant: <Bot className="h-3 w-3" />,
  system: <AlertCircle className="h-3 w-3" />,
};

export function VoiceTranscriptDrawer({
  open, onOpenChange, sessionId, defaultSensitivity = "internal",
}: VoiceTranscriptDrawerProps) {
  const { data, isLoading } = useSessionTranscripts(sessionId);
  const promote = usePromoteVoiceTranscript();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handlePromote = async (t: VoiceTranscriptRow) => {
    setBusyId(t.id);
    try {
      await promote.mutateAsync({
        transcriptId: t.id,
        sensitivity: defaultSensitivity,
        category: "voice_note",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Voice transcript"
      description={sessionId ? `Session ${sessionId.slice(0, 8)}…` : "No session selected"}
      width="lg"
    >
      <div className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            <Mic className="mx-auto mb-2 h-5 w-5 opacity-60" />
            No transcripts yet for this session.
          </div>
        )}
        {(data ?? []).map((t) => {
          const promoted = !!t.promoted_memory_id;
          const busy = busyId === t.id;
          return (
            <div key={t.id} className="rounded-md border bg-card p-3 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    {ROLE_ICON[t.role] ?? null}
                    {t.role}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">seq {t.seq}</span>
                  {!t.is_final && <Badge variant="secondary" className="text-[10px]">interim</Badge>}
                  <Badge variant="outline" className="text-[10px] uppercase">{t.lang}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    conf {(t.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(t.created_at).toLocaleTimeString()}
                </div>
              </div>
              <p className="leading-snug">{t.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>embed: {t.embedding_status}</span>
                  {promoted && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" /> promoted
                    </Badge>
                  )}
                </div>
                {!promoted && t.is_final && t.role !== "system" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    disabled={busy || promote.isPending}
                    onClick={() => handlePromote(t)}
                  >
                    <Sparkles className="h-3 w-3" />
                    {busy ? "Promoting…" : "Save as memory"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}
