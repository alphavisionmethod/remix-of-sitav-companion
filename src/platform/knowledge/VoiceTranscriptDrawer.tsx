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
import { Mic, MessageSquare, Bot, AlertCircle, Sparkles, CheckCircle2, Wand2, Check, X, Play, Zap } from "lucide-react";
import {
  useSessionTranscripts,
  usePromoteVoiceTranscript,
  useSessionIntents,
  useExtractVoiceIntents,
  useUpdateVoiceIntent,
  useDispatchVoiceIntent,
} from "./use-voice-spine";
import type { Sensitivity, VoiceIntentRow, VoiceTranscriptRow } from "./voice-service";

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
  const { data: intents = [], isLoading: intentsLoading } = useSessionIntents(sessionId);
  const extract = useExtractVoiceIntents();
  const updateIntent = useUpdateVoiceIntent(sessionId);
  const dispatchIntent = useDispatchVoiceIntent(sessionId);
  const [intentBusyId, setIntentBusyId] = useState<string | null>(null);

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

  const handleExtract = async () => {
    if (!sessionId) return;
    await extract.mutateAsync({ sessionId, maxTranscripts: 15 });
  };

  const handleIntent = async (intent: VoiceIntentRow, status: "approved" | "rejected" | "executed") => {
    setIntentBusyId(intent.id);
    try {
      await updateIntent.mutateAsync({ intentId: intent.id, status });
    } finally {
      setIntentBusyId(null);
    }
  };

  const handleDispatch = async (intent: VoiceIntentRow) => {
    setIntentBusyId(intent.id);
    try {
      await dispatchIntent.mutateAsync({ intentId: intent.id });
    } finally {
      setIntentBusyId(null);
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
        {/* ── Phase 7: Voice Intents panel ── */}
        {sessionId && (
          <div className="rounded-md border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Wand2 className="h-3.5 w-3.5" /> Proposed actions
                <Badge variant="outline" className="text-[10px]">{intents.length}</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                disabled={extract.isPending || (data?.length ?? 0) === 0}
                onClick={handleExtract}
              >
                <Sparkles className="h-3 w-3" />
                {extract.isPending ? "Extracting…" : "Extract intents"}
              </Button>
            </div>
            {intentsLoading && <Skeleton className="h-12 w-full" />}
            {!intentsLoading && intents.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No proposed actions. Click <em>Extract intents</em> to scan transcripts for whitelisted actions.
              </p>
            )}
            {intents.map((intent) => {
              const busy = intentBusyId === intent.id;
              const conf = Math.round(intent.confidence * 100);
              const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
                proposed: "default",
                approved: "secondary",
                rejected: "destructive",
                executed: "secondary",
                expired: "outline",
              };
              return (
                <div key={intent.id} className="rounded-md border bg-card p-2 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="text-[10px] font-mono">{intent.action_key}</Badge>
                      <span className="text-muted-foreground">conf {conf}%</span>
                    </div>
                    <Badge variant={statusVariant[intent.status] ?? "outline"} className="text-[10px] uppercase">
                      {intent.status}
                    </Badge>
                  </div>
                  {intent.rationale && (
                    <p className="text-[11px] text-muted-foreground leading-snug">{intent.rationale}</p>
                  )}
                  {Object.keys(intent.params ?? {}).length > 0 && (
                    <pre className="rounded bg-muted/50 px-2 py-1 text-[10px] font-mono overflow-x-auto">
                      {JSON.stringify(intent.params, null, 0)}
                    </pre>
                  )}
                  {intent.status === "proposed" && (
                    <div className="flex items-center gap-1 pt-1">
                      <Button
                        size="sm" variant="outline"
                        className="h-6 gap-1 text-[11px]"
                        disabled={busy} onClick={() => handleIntent(intent, "approved")}
                      >
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-6 gap-1 text-[11px]"
                        disabled={busy} onClick={() => handleIntent(intent, "rejected")}
                      >
                        <X className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  )}
                  {intent.status === "approved" && (
                    <div className="flex items-center gap-1 pt-1">
                      <Button
                        size="sm" variant="default"
                        className="h-6 gap-1 text-[11px]"
                        disabled={busy} onClick={() => handleDispatch(intent)}
                      >
                        <Zap className="h-3 w-3" /> Dispatch to agent
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        className="h-6 gap-1 text-[11px]"
                        disabled={busy} onClick={() => handleIntent(intent, "executed")}
                      >
                        <Play className="h-3 w-3" /> Mark executed
                      </Button>
                    </div>
                  )}
                  {intent.status === "dispatched" && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <Zap className="h-3 w-3" /> dispatched to agent
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
