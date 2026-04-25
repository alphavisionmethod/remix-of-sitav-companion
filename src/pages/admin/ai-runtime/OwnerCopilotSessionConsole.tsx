// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 16 · Owner Copilot Session Console
// Surfaces owner_copilot_sessions (Phase 15) — read-only history of
// copilot interactions, with start/end via owner-copilot-session-tracker.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, RefreshCw, Play, Square, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  user_id: string;
  tenant_id: string | null;
  copilot_kind: string;
  session_started_at: string;
  session_ended_at: string | null;
  prompt_count: number;
  read_only_verified: boolean;
}

export default function OwnerCopilotSessionConsole() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [sessionClass, setSessionClass] = useState("daily-briefing");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("owner_copilot_sessions")
      .select("id, user_id, tenant_id, copilot_kind, session_started_at, session_ended_at, prompt_count, read_only_verified")
      .order("session_started_at", { ascending: false })
      .limit(50);
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Session[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function startSession() {
    const { error } = await supabase.functions.invoke("owner-copilot-session-tracker", {
      body: {
        action: "start",
        tenant_id: tenantId || null,
        session_class: sessionClass,
      },
    });
    if (error) toast.error(error.message);
    else { toast.success("Session started"); load(); }
  }

  async function endSession(id: string) {
    const { error } = await supabase.functions.invoke("owner-copilot-session-tracker", {
      body: { action: "end", session_id: id },
    });
    if (error) toast.error(error.message);
    else { toast.success("Session ended"); load(); }
  }

  const active = useMemo(() => items.filter(s => !s.session_ended_at), [items]);
  const ended = useMemo(() => items.filter(s => s.session_ended_at), [items]);

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Owner Copilot Sessions">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" /> Owner Copilot Sessions
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 16 · Read-only telemetry of copilot interactions. Sessions are append-tracked; end-times persist on close.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-2xl font-semibold">{active.length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Recent (50)</div>
            <div className="text-2xl font-semibold">{items.length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total prompts</div>
            <div className="text-2xl font-semibold">
              {items.reduce((sum, s) => sum + (s.prompt_count ?? 0), 0)}
            </div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-5 w-5" /> Start session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tenant ID (optional)</Label>
                <Input value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="UUID" />
              </div>
              <div className="space-y-1.5">
                <Label>Session class</Label>
                <Input value={sessionClass} onChange={e => setSessionClass(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={startSession}><Play className="h-4 w-4 mr-1" /> Start</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {active.length === 0 && (
              <div className="text-sm text-muted-foreground">No active sessions.</div>
            )}
            {active.map(s => (
              <div key={s.id} className="border rounded-md p-3 text-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge>{s.copilot_kind}</Badge>
                    {s.read_only_verified && <Badge variant="outline">read-only</Badge>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> started {formatDistanceToNow(new Date(s.session_started_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{s.id}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => endSession(s.id)}>
                  <Square className="h-4 w-4 mr-1" /> End
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ended.length === 0 && (
              <div className="text-sm text-muted-foreground">No completed sessions.</div>
            )}
            {ended.map(s => (
              <div key={s.id} className="border rounded-md p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{s.copilot_kind}</Badge>
                    <Badge variant="secondary">{s.prompt_count} prompts</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ended {s.session_ended_at ? formatDistanceToNow(new Date(s.session_ended_at), { addSuffix: true }) : "—"}
                  </span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">{s.id}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}
