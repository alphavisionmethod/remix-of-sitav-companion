// ═══════════════════════════════════════════════════════════════
// SITA OS — Standing Missions panel (Phase 8)
// Owner / admin surface to view, create, pause, and run-now
// persistent advisor mandates. Uses the same DB-backed engine
// as the bootstrap loop.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  createStandingMission,
  deleteStandingMission,
  runMission,
  setMissionPaused,
  type MissionTriggerKind,
  type StandingMissionRow,
} from "@/lib/autonomy/standing-missions";
import { SIGNAL_KINDS, type SignalSeverity } from "@/lib/autonomy/signal-bus";
import { DEFAULT_CONTROLLED_ADVISORS } from "@/lib/autonomy/controller";

type Props = {
  /** When true, shows owner-only view (own missions). Otherwise admin view (all visible by RLS). */
  ownerView?: boolean;
  compact?: boolean;
};

export function AutonomyMissionsPanel({ ownerView = false, compact = false }: Props) {
  const [missions, setMissions] = useState<StandingMissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("advisor_standing_missions")
      .select("*")
      .order("created_at", { ascending: false });
    setMissions((data ?? []) as StandingMissionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("standing-missions-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advisor_standing_missions" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const onRun = async (id: string) => {
    setBusyId(id);
    const res = await runMission(id);
    if (res.ok) {
      toast.success(res.fired ? `Mission fired (${res.reason})` : `Evaluated — held (${res.reason})`);
    } else {
      toast.error(`Run failed: ${res.reason}`);
    }
    setBusyId(null);
    void load();
  };

  const onTogglePause = async (m: StandingMissionRow) => {
    setBusyId(m.id);
    await setMissionPaused(m.id, !m.paused);
    setBusyId(null);
    void load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this standing mission? This cannot be undone.")) return;
    setBusyId(id);
    await deleteStandingMission(id);
    setBusyId(null);
    void load();
  };

  const visible = useMemo(() => (compact ? missions.slice(0, 5) : missions), [missions, compact]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-base">Standing missions</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Persistent mandates that watch your business and call the right advisor when conditions match.
          </p>
        </div>
        {ownerView && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> New mission
              </Button>
            </DialogTrigger>
            <NewMissionDialog
              onCreated={() => {
                setOpen(false);
                void load();
              }}
            />
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}
        {!loading && visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            No standing missions yet.{ownerView ? " Create one to keep an advisor on watch." : ""}
          </div>
        )}
        {!loading &&
          visible.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              busy={busyId === m.id}
              onRun={() => void onRun(m.id)}
              onTogglePause={() => void onTogglePause(m)}
              onDelete={ownerView ? () => void onDelete(m.id) : undefined}
            />
          ))}
      </CardContent>
    </Card>
  );
}

function MissionRow({
  mission,
  busy,
  onRun,
  onTogglePause,
  onDelete,
}: {
  mission: StandingMissionRow;
  busy: boolean;
  onRun: () => void;
  onTogglePause: () => void;
  onDelete?: () => void;
}) {
  const cfg = (mission.trigger_config ?? {}) as { every_minutes?: number; signal_kind?: string };
  const Icon =
    mission.trigger_kind === "interval"
      ? Repeat
      : mission.trigger_kind === "signal"
      ? Radio
      : Activity;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{mission.title}</span>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mission.advisor_id}
          </Badge>
          {mission.paused && (
            <Badge variant="secondary" className="text-[10px]">paused</Badge>
          )}
        </div>
        {mission.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{mission.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            Trigger: <code className="text-foreground">{mission.trigger_kind}</code>
          </span>
          {cfg.every_minutes && <span>· every {cfg.every_minutes}m</span>}
          {cfg.signal_kind && <span>· on {cfg.signal_kind}</span>}
          <span>· emits {mission.emit_signal_kind}</span>
          <span className={cn("ml-auto", mission.fire_count > 0 && "text-foreground")}>
            {mission.run_count} runs · {mission.fire_count} fired
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="ghost" disabled={busy} onClick={onRun} title="Run now">
          <Zap className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={onTogglePause}>
          {mission.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        {onDelete && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

function NewMissionDialog({ onCreated }: { onCreated: () => void }) {
  const [advisorId, setAdvisorId] = useState<string>(DEFAULT_CONTROLLED_ADVISORS[0] ?? "cfo-advisor");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [triggerKind, setTriggerKind] = useState<MissionTriggerKind>("interval");
  const [everyMinutes, setEveryMinutes] = useState<number>(1440);
  const [signalKind, setSignalKind] = useState<string>(SIGNAL_KINDS.CASH_RUNWAY_DIP);
  const [emitSignalKind, setEmitSignalKind] = useState<string>("standing_mission.tick");
  const [emitSeverity, setEmitSeverity] = useState<SignalSeverity>("medium");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Give the mission a title");
      return;
    }
    setSubmitting(true);
    const triggerConfig =
      triggerKind === "signal"
        ? { signal_kind: signalKind }
        : triggerKind === "composite"
        ? { every_minutes: everyMinutes, signal_kind: signalKind }
        : { every_minutes: everyMinutes };
    const res = await createStandingMission({
      advisorId,
      title: title.trim(),
      description: description.trim(),
      triggerKind,
      triggerConfig,
      emitSignalKind,
      emitSeverity,
      emitSummaryTemplate: title.trim(),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Mission created");
      onCreated();
    } else {
      toast.error(`Could not create mission: ${res.error ?? "unknown"}`);
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>New standing mission</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Advisor</Label>
            <Select value={advisorId} onValueChange={setAdvisorId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEFAULT_CONTROLLED_ADVISORS.map((id) => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trigger kind</Label>
            <Select value={triggerKind} onValueChange={(v) => setTriggerKind(v as MissionTriggerKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Interval (cron)</SelectItem>
                <SelectItem value="signal">Signal-driven</SelectItem>
                <SelectItem value="composite">Composite (interval + signal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Title</Label>
          <Input
            placeholder="Weekly cash runway watch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Textarea
            placeholder="What should this advisor keep watching?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {(triggerKind === "interval" || triggerKind === "composite") && (
          <div className="space-y-1">
            <Label className="text-xs">Every (minutes)</Label>
            <Input
              type="number"
              min={1}
              value={everyMinutes}
              onChange={(e) => setEveryMinutes(Math.max(1, Number(e.target.value) || 60))}
            />
          </div>
        )}

        {(triggerKind === "signal" || triggerKind === "composite") && (
          <div className="space-y-1">
            <Label className="text-xs">Watch for signal</Label>
            <Select value={signalKind} onValueChange={setSignalKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(SIGNAL_KINDS).map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Emit signal kind</Label>
            <Input
              value={emitSignalKind}
              onChange={(e) => setEmitSignalKind(e.target.value)}
              placeholder="standing_mission.tick"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Severity</Label>
            <Select value={emitSeverity} onValueChange={(v) => setEmitSeverity(v as SignalSeverity)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["info", "low", "medium", "high", "critical"] as SignalSeverity[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => void submit()} disabled={submitting}>
          {submitting ? "Creating…" : "Create mission"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}