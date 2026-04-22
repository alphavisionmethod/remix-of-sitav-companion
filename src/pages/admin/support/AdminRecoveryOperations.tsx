// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Recovery Operations (Server-Gated)
// Permission-enforced via support-recovery-api edge function.
// Job detail drawer, real webhook data, audit log.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCcw, ShieldOff, RefreshCw, Download, Filter, Send,
  CheckCircle2, XCircle, Loader2, Clock, Lock,
  Activity, ShieldAlert, Ban, FileText, Eye, AlertTriangle,
} from "lucide-react";

// ── API helper ──
async function callRecoveryApi(action: string, params?: Record<string, string>, body?: unknown) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const opts: any = body ? { body } : {};
  const { data, error } = await supabase.functions.invoke(`support-recovery-api?${qs}`, opts);
  if (error) throw error;
  if (data?.code === "PERMISSION_DENIED") throw new Error(data.error);
  if (data?.error) throw new Error(data.error);
  return data;
}

// ── Permission Gate (server-enforced, client hint) ──
function useRecoveryGate() {
  const { user } = useAuth();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["recovery_role_check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) return [];
      return (data ?? []).map((r) => String(r.role));
    },
    staleTime: 60_000,
  });
  const isAdmin = roles.includes("admin");
  const isOp = roles.includes("moderator") || isAdmin;
  return { canView: isOp || isAdmin, canExecute: isAdmin, isLoading, userId: user?.id ?? null };
}

// ── 403 Banner ──
function PermissionDeniedBanner({ permission }: { permission: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Access Denied (403)</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          This action requires <code className="text-xs bg-secondary px-1 py-0.5 rounded">{permission}</code> permission.
          Contact your administrator to request access.
        </p>
      </div>
    </div>
  );
}

// ── Confirm Dialog ──
function ConfirmAction({ title, description, isDryRun, onConfirm, disabled, children }: {
  title: string; description: string; isDryRun: boolean; onConfirm: () => void; disabled: boolean; children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isDryRun ? title : `⚠️ ${title}`}</AlertDialogTitle>
          <AlertDialogDescription>
            {isDryRun ? `Dry-run: no changes will be made. ${description}` : `LIVE execution — may modify production data. ${description}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={disabled}>
            {isDryRun ? "Start Dry-Run" : "Execute Now"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Job Detail Drawer ──
interface RecoveryJob {
  id: string; label: string; status: string; progress: number;
  parameters: any; result: any; error: string | null; error_stack: string | null;
  is_dry_run: boolean; started_at: string; completed_at: string | null; created_at: string;
}

function JobDetailDrawer({ job, open, onClose }: { job: RecoveryJob | null; open: boolean; onClose: () => void }) {
  if (!job) return null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-primary" />
            Job Detail
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">{job.id}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "outline"} className="text-xs">
              {job.status}
            </Badge>
            {job.is_dry_run && <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-300">DRY RUN</Badge>}
          </div>

          {/* Label */}
          <div>
            <Label className="text-xs text-muted-foreground">Label</Label>
            <p className="text-sm text-foreground">{job.label}</p>
          </div>

          {/* Progress */}
          <div>
            <Label className="text-xs text-muted-foreground">Progress</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={job.progress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-10 text-right">{job.progress}%</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Started</Label>
              <p className="text-xs font-mono text-foreground">{new Date(job.started_at).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Completed</Label>
              <p className="text-xs font-mono text-foreground">{job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}</p>
            </div>
          </div>

          {/* Parameters */}
          <div>
            <Label className="text-xs text-muted-foreground">Parameters</Label>
            <pre className="mt-1 rounded-md bg-secondary/30 border p-3 text-xs font-mono text-foreground overflow-auto max-h-48">
              {JSON.stringify(job.parameters, null, 2)}
            </pre>
          </div>

          {/* Result */}
          {job.result && (
            <div>
              <Label className="text-xs text-muted-foreground">Result JSON</Label>
              <pre className="mt-1 rounded-md bg-secondary/30 border p-3 text-xs font-mono text-foreground overflow-auto max-h-48">
                {JSON.stringify(job.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {job.error && (
            <div>
              <Label className="text-xs text-destructive">Error</Label>
              <p className="text-xs text-destructive bg-destructive/10 rounded p-2 mt-1">{job.error}</p>
            </div>
          )}

          {/* Error Stack */}
          {job.error_stack && (
            <div>
              <Label className="text-xs text-destructive">Stack Trace</Label>
              <pre className="mt-1 rounded-md bg-destructive/5 border border-destructive/20 p-3 text-[10px] font-mono text-destructive overflow-auto max-h-60 whitespace-pre-wrap">
                {job.error_stack}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── 1. Job Monitor (server-sourced) ──
function JobMonitorPanel() {
  const [selectedJob, setSelectedJob] = useState<RecoveryJob | null>(null);
  const [permError, setPermError] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recovery-jobs"],
    queryFn: async () => {
      const res = await callRecoveryApi("list-jobs");
      return res.jobs as RecoveryJob[];
    },
    refetchInterval: 3000,
    retry: (count, err) => {
      if (err?.message?.includes("support.view")) { setPermError(true); return false; }
      return count < 2;
    },
  });

  const jobs = data ?? [];
  const icon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    running: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
    failed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
    cancelled: <Ban className="h-3.5 w-3.5 text-muted-foreground" />,
  };

  if (permError) return <PermissionDeniedBanner permission="support.view" />;
  if (isLoading) return <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading jobs…</div>;
  if (!jobs.length) return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No recovery jobs yet.</CardContent></Card>;

  return (
    <>
      <div className="space-y-3">
        {jobs.map((j) => (
          <Card key={j.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedJob(j)}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {icon[j.status] || icon.pending}
                  <span className="text-sm font-medium text-foreground">{j.label}</span>
                  <Badge variant="outline" className="text-[10px]">{j.status}</Badge>
                  {j.is_dry_run && <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-300">DRY RUN</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setSelectedJob(j); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <span className="font-mono text-[10px] text-muted-foreground">{j.id.slice(0, 8)}</span>
                </div>
              </div>
              {j.status === "running" && (
                <div className="flex items-center gap-3">
                  <Progress value={j.progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-10 text-right">{j.progress}%</span>
                </div>
              )}
              {j.error && <p className="text-xs text-destructive bg-destructive/10 rounded p-2">{j.error}</p>}
              <div className="flex gap-4 text-[10px] text-muted-foreground">
                <span>Started: {new Date(j.started_at).toLocaleTimeString()}</span>
                {j.completed_at && <span>Ended: {new Date(j.completed_at).toLocaleTimeString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <JobDetailDrawer job={selectedJob} open={!!selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  );
}

// ── 2. Reset User Setup (server-gated) ──
function ResetUserSetupPanel({ canExecute }: { canExecute: boolean }) {
  const [uid, setUid] = useState("");
  const [isDry, setIsDry] = useState(true);
  const [permError, setPermError] = useState(false);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: async ({ userId, dry }: { userId: string; dry: boolean }) => {
      return callRecoveryApi("trigger-action", {}, {
        action_type: "reset-user-setup", target_user_id: userId, is_dry_run: dry,
      });
    },
    onSuccess: () => { toast.success(isDry ? "Dry-run done" : "Setup reset"); setUid(""); qc.invalidateQueries({ queryKey: ["recovery-jobs"] }); },
    onError: (e: Error) => {
      if (e.message?.includes("admin.recovery")) setPermError(true);
      toast.error(e.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4 text-primary" />Reset User Setup</CardTitle>
        <CardDescription>Reset onboarding state. Server enforces admin.recovery.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permError && <PermissionDeniedBanner permission="admin.recovery" />}
        <div className="space-y-2"><Label>User ID</Label><Input placeholder="UUID…" value={uid} onChange={(e) => setUid(e.target.value)} /></div>
        <div className="flex items-center gap-2">
          <Switch id="dry-r" checked={isDry} onCheckedChange={setIsDry} />
          <Label htmlFor="dry-r" className="text-xs text-muted-foreground cursor-pointer">Dry-run {isDry ? "(safe)" : "(LIVE)"}</Label>
        </div>
        <ConfirmAction title="Reset User Setup?" description={`Target: ${uid.slice(0, 8)}…`} isDryRun={isDry}
          onConfirm={() => m.mutate({ userId: uid, dry: isDry })} disabled={!uid.trim() || m.isPending || !canExecute}>
          <Button disabled={!uid.trim() || m.isPending || !canExecute} variant={isDry ? "outline" : "destructive"} size="sm">
            {m.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}{isDry ? "Preview" : "Reset"}
          </Button>
        </ConfirmAction>
        {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
      </CardContent>
    </Card>
  );
}

// ── 3. Revoke Sessions (server-gated) ──
function RevokeSessionsPanel({ canExecute }: { canExecute: boolean }) {
  const [uid, setUid] = useState("");
  const [reason, setReason] = useState("");
  const [isDry, setIsDry] = useState(true);
  const [permError, setPermError] = useState(false);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: async ({ userId, reason, dry }: { userId: string; reason: string; dry: boolean }) => {
      return callRecoveryApi("trigger-action", {}, {
        action_type: "revoke-sessions", target_user_id: userId, reason, is_dry_run: dry,
      });
    },
    onSuccess: () => { toast.success(isDry ? "Dry-run done" : "Sessions revoked"); setUid(""); setReason(""); qc.invalidateQueries({ queryKey: ["recovery-jobs"] }); },
    onError: (e: Error) => {
      if (e.message?.includes("admin.recovery")) setPermError(true);
      toast.error(e.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><ShieldOff className="h-4 w-4 text-destructive" />Revoke Sessions</CardTitle>
        <CardDescription>Force-logout. Server enforces admin.recovery.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permError && <PermissionDeniedBanner permission="admin.recovery" />}
        <div className="space-y-2"><Label>User ID</Label><Input placeholder="UUID…" value={uid} onChange={(e) => setUid(e.target.value)} /></div>
        <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Justification…" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} /></div>
        <div className="flex items-center gap-2">
          <Switch id="dry-s" checked={isDry} onCheckedChange={setIsDry} />
          <Label htmlFor="dry-s" className="text-xs text-muted-foreground cursor-pointer">Dry-run {isDry ? "(safe)" : "(LIVE)"}</Label>
        </div>
        <ConfirmAction title="Revoke All Sessions?" description={`User: ${uid.slice(0, 8)}… Reason: ${reason}`} isDryRun={isDry}
          onConfirm={() => m.mutate({ userId: uid, reason, dry: isDry })} disabled={!uid.trim() || !reason.trim() || m.isPending || !canExecute}>
          <Button disabled={!uid.trim() || !reason.trim() || m.isPending || !canExecute} variant={isDry ? "outline" : "destructive"} size="sm">
            {m.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}{isDry ? "Preview" : "Revoke"}
          </Button>
        </ConfirmAction>
        {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
      </CardContent>
    </Card>
  );
}

// ── 4. Webhook Replay (real backend data, only failed selectable) ──
interface WebhookEntry {
  id: string; target_url: string | null; status: string; retry_count: number;
  last_error: string | null; created_at: string; event_type: string | null;
  source: string | null; payload: unknown; updated_at: string;
}

function WebhookReplayPanel({ canExecute }: { canExecute: boolean }) {
  const qc = useQueryClient();
  const [fUrl, setFUrl] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [permError, setPermError] = useState(false);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["webhook-events", fStatus, fFrom, fTo],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (fStatus) params.status = fStatus;
      if (fFrom) params.from = fFrom;
      if (fTo) params.to = fTo;
      const res = await callRecoveryApi("list-webhooks", params);
      return res as { failures: WebhookEntry[]; count: number };
    },
    retry: (count, err) => {
      if ((err as Error)?.message?.includes("support.view")) { setPermError(true); return false; }
      return count < 2;
    },
  });

  const all = data?.failures ?? [];
  const filtered = useMemo(() => {
    if (!fUrl) return all;
    return all.filter((f) => (f.target_url ?? "").toLowerCase().includes(fUrl.toLowerCase()));
  }, [all, fUrl]);

  const failedOnly = filtered.filter((f) => f.status === "failed" || f.status === "error");
  const isFailed = (s: string) => s === "failed" || s === "error";

  const toggle = (id: string) => setSelected((p) => {
    const n = new Set(p);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const replayM = useMutation({
    mutationFn: async (wid: string) => callRecoveryApi("replay-webhook", {}, { webhook_id: wid }),
    onSuccess: (r: any) => {
      toast.success(r?.replay_status === "replayed" ? "Replayed" : `Status: ${r?.replay_status}`);
      qc.invalidateQueries({ queryKey: ["webhook-events"] });
      qc.invalidateQueries({ queryKey: ["recovery-jobs"] });
    },
    onError: (e: Error) => {
      if (e.message?.includes("admin.recovery")) setPermError(true);
      toast.error(e.message);
    },
  });

  const batchReplay = () => {
    Array.from(selected).forEach((id) => replayM.mutate(id));
    setSelected(new Set());
  };

  if (permError) return <PermissionDeniedBanner permission="support.view" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><RefreshCw className="h-4 w-4 text-primary" />Webhook Replay</CardTitle>
            <CardDescription>{filtered.length}/{all.length} shown · {failedOnly.length} failed · only failed events are selectable</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setSelected(new Set(failedOnly.map((f) => f.id)))} disabled={!failedOnly.length}>
              Select Failed
            </Button>
            <ConfirmAction title="Replay Selected?" description={`${selected.size} webhook(s)`} isDryRun={false}
              onConfirm={batchReplay} disabled={!selected.size || !canExecute}>
              <Button size="sm" className="text-xs h-7" disabled={!selected.size || !canExecute}>
                <Send className="h-3 w-3 mr-1" />Replay ({selected.size})
              </Button>
            </ConfirmAction>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap items-end">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <Input className="h-7 w-40 text-xs" placeholder="URL filter…" value={fUrl} onChange={(e) => setFUrl(e.target.value)} />
          <Select value={fStatus || "all"} onValueChange={(v) => setFStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="replayed">Replayed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-7 w-36 text-xs" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          <Input type="date" className="h-7 w-36 text-xs" value={fTo} onChange={(e) => setFTo(e.target.value)} />
          {(fUrl || fStatus || fFrom || fTo) && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setFUrl(""); setFStatus(""); setFFrom(""); setFTo(""); }}>Clear</Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" />Loading from backend…</div>
        ) : !filtered.length ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><CheckCircle2 className="h-4 w-4 text-green-400" />No webhook events match filters</div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id} className={selected.has(f.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(f.id)}
                        onCheckedChange={() => toggle(f.id)}
                        disabled={!isFailed(f.status)}
                      />
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate">{f.target_url || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.event_type || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={isFailed(f.status) ? "destructive" : f.status === "replayed" ? "secondary" : "outline"} className="text-[10px]">
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{f.retry_count}</TableCell>
                    <TableCell className="text-xs text-destructive max-w-[150px] truncate">{f.last_error || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <ConfirmAction title="Replay?" description={`To ${f.target_url ?? ""}`} isDryRun={false}
                        onConfirm={() => replayM.mutate(f.id)} disabled={replayM.isPending || !canExecute || !isFailed(f.status)}>
                        <Button size="sm" variant="outline" disabled={replayM.isPending || !canExecute || !isFailed(f.status)} className="text-xs h-7">
                          <RefreshCw className="h-3 w-3 mr-1" />Replay
                        </Button>
                      </ConfirmAction>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── 5. Diagnostic Export ──
function DiagnosticBundlePanel({ canExecute }: { canExecute: boolean }) {
  const [bundleType, setBundleType] = useState("system-wide");
  const [result, setResult] = useState<any>(null);
  const [permError, setPermError] = useState(false);

  const m = useMutation({
    mutationFn: async (type: string) => {
      const { data, error } = await supabase.functions.invoke("generate-support-bundle", { body: { bundleType: type } });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { setResult(d); toast.success(`Bundle ${d?.bundleId}`); },
    onError: (e: Error) => {
      if (e.message?.includes("admin.recovery")) setPermError(true);
      toast.error(e.message);
    },
  });

  const dl = () => {
    if (!result) return;
    const b = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u; a.download = `bundle-${result.bundleId}.json`; a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Download className="h-4 w-4 text-primary" />Export Diagnostic Bundle</CardTitle>
        <CardDescription>Redacted bundle with audit trail.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permError && <PermissionDeniedBanner permission="admin.recovery" />}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={bundleType} onValueChange={setBundleType}>
            <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system-wide">System-Wide</SelectItem>
              <SelectItem value="runtime-crash">Runtime Crash</SelectItem>
              <SelectItem value="admin-operator">Admin/Operator</SelectItem>
              <SelectItem value="support-escalation">Support Escalation</SelectItem>
              <SelectItem value="integration-failure">Integration Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <ConfirmAction title="Generate Bundle?" description={`Type: ${bundleType}`} isDryRun={false}
            onConfirm={() => m.mutate(bundleType)} disabled={m.isPending || !canExecute}>
            <Button disabled={m.isPending || !canExecute} size="sm">
              {m.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}Generate
            </Button>
          </ConfirmAction>
          {result && <Button onClick={dl} size="sm" variant="outline"><Download className="h-3 w-3 mr-1" />Download</Button>}
        </div>
        {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
        {result && (
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{result.bundleId}</Badge>
              <Badge variant="outline" className="text-[10px]">{result.bundleType}</Badge>
              {result.redactionApplied && <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">PII Redacted</Badge>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ──
export default function AdminRecoveryOperations() {
  const { canView, canExecute, isLoading } = useRecoveryGate();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (!canView) return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            Requires <code className="text-xs bg-secondary px-1 py-0.5 rounded">support.view</code> and{" "}
            <code className="text-xs bg-secondary px-1 py-0.5 rounded">admin.recovery</code> permissions.
          </p>
          <p className="text-xs text-muted-foreground">Server returns HTTP 403 for unauthorized requests.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />Recovery Operations
        </h2>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
          Server-enforced permissions. All actions go through the support-recovery-api endpoint.
          {!canExecute && <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-300">Read-only</Badge>}
        </p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jobs" className="text-xs gap-1"><Activity className="h-3 w-3" />Jobs</TabsTrigger>
          <TabsTrigger value="reset" className="text-xs gap-1"><RotateCcw className="h-3 w-3" />Reset</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs gap-1"><ShieldOff className="h-3 w-3" />Sessions</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1"><RefreshCw className="h-3 w-3" />Webhooks</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs gap-1"><Download className="h-3 w-3" />Diagnostics</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="mt-4"><JobMonitorPanel /></TabsContent>
        <TabsContent value="reset" className="mt-4"><ResetUserSetupPanel canExecute={canExecute} /></TabsContent>
        <TabsContent value="sessions" className="mt-4"><RevokeSessionsPanel canExecute={canExecute} /></TabsContent>
        <TabsContent value="webhooks" className="mt-4"><WebhookReplayPanel canExecute={canExecute} /></TabsContent>
        <TabsContent value="diagnostics" className="mt-4"><DiagnosticBundlePanel canExecute={canExecute} /></TabsContent>
      </Tabs>
    </div>
  );
}
