// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Recovery Operations (Enhanced)
// Job polling, webhook filters, audit log, confirmation dialogs,
// dry-run mode, and permission gating.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
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
  Activity, ShieldAlert, Ban, FileText,
} from "lucide-react";

// ── Permission Gate ──
function useRecoveryGate() {
  const { user } = useAuth();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["recovery_role_check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles" as any).select("role").eq("user_id", user!.id);
      if (error) return [];
      return (data as any[]).map((r: any) => String(r.role));
    },
    staleTime: 60_000,
  });
  const isAdmin = roles.includes("admin");
  const isOp = roles.includes("moderator") || isAdmin;
  return { canView: isOp || isAdmin, canExecute: isAdmin, isLoading, userId: user?.id ?? null };
}

// ── Job Store ──
type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
interface RecoveryJob { id: string; label: string; status: JobStatus; progress: number; startedAt: string; completedAt: string | null; error: string | null; isDryRun: boolean; }
const jobStore: RecoveryJob[] = [];
let nextJobId = 1;
function launchJob(label: string, isDryRun: boolean): RecoveryJob {
  const job: RecoveryJob = { id: `RJ-${String(nextJobId++).padStart(4,"0")}`, label, status: "running", progress: 0, startedAt: new Date().toISOString(), completedAt: null, error: null, isDryRun };
  jobStore.unshift(job);
  const steps = 5 + Math.floor(Math.random() * 5);
  let step = 0;
  const iv = setInterval(() => { step++; job.progress = Math.min(Math.round((step/steps)*100),100); if(step>=steps){clearInterval(iv);const ok=Math.random()>0.1;job.status=ok?"completed":"failed";job.progress=ok?100:job.progress;job.completedAt=new Date().toISOString();job.error=ok?null:"Simulated: downstream timeout";} }, 800);
  return job;
}

// ── Confirm Dialog ──
function ConfirmAction({ title, description, isDryRun, onConfirm, disabled, children }: { title: string; description: string; isDryRun: boolean; onConfirm: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isDryRun ? title : `⚠️ ${title}`}</AlertDialogTitle>
          <AlertDialogDescription>{isDryRun ? `Dry-run: no changes will be made. ${description}` : `LIVE execution — may modify production data. ${description}`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={disabled}>{isDryRun ? "Start Dry-Run" : "Execute Now"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── 1. Job Monitor ──
function JobMonitorPanel() {
  const [jobs, setJobs] = useState<RecoveryJob[]>([]);
  useEffect(() => { const iv = setInterval(() => setJobs([...jobStore]), 1000); setJobs([...jobStore]); return () => clearInterval(iv); }, []);
  const icon: Record<string, React.ReactNode> = { pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />, running: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />, completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />, failed: <XCircle className="h-3.5 w-3.5 text-destructive" />, cancelled: <Ban className="h-3.5 w-3.5 text-muted-foreground" /> };
  if (!jobs.length) return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No recovery jobs yet.</CardContent></Card>;
  return (
    <div className="space-y-3">
      {jobs.map(j => (
        <Card key={j.id}><CardContent className="pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">{icon[j.status]}<span className="text-sm font-medium text-foreground">{j.label}</span><Badge variant="outline" className="text-[10px]">{j.status}</Badge>{j.isDryRun && <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-300">DRY RUN</Badge>}</div>
            <span className="font-mono text-[10px] text-muted-foreground">{j.id}</span>
          </div>
          {j.status === "running" && <div className="flex items-center gap-3"><Progress value={j.progress} className="flex-1 h-2" /><span className="text-xs text-muted-foreground w-10 text-right">{j.progress}%</span><Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => { j.status="cancelled"; j.completedAt=new Date().toISOString(); }}>Cancel</Button></div>}
          {j.error && <p className="text-xs text-destructive bg-destructive/10 rounded p-2">{j.error}</p>}
          <div className="flex gap-4 text-[10px] text-muted-foreground"><span>Started: {new Date(j.startedAt).toLocaleTimeString()}</span>{j.completedAt && <span>Ended: {new Date(j.completedAt).toLocaleTimeString()}</span>}</div>
        </CardContent></Card>
      ))}
    </div>
  );
}

// ── 2. Reset User Setup ──
function ResetUserSetupPanel({ canExecute }: { canExecute: boolean }) {
  const [uid, setUid] = useState(""); const [isDry, setIsDry] = useState(true);
  const m = useMutation({
    mutationFn: async ({ userId, dry }: { userId: string; dry: boolean }) => {
      launchJob(`Reset setup: ${userId.slice(0,8)}…${dry?" (dry-run)":""}`, dry);
      if (!dry) { const { data, error } = await supabase.functions.invoke("admin-reset-user-setup", { body: { target_user_id: userId } }); if (error) throw error; return data; }
      return { simulated: true };
    },
    onSuccess: () => { toast.success(isDry ? "Dry-run done" : "Setup reset"); setUid(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4 text-primary" />Reset User Setup</CardTitle><CardDescription>Reset onboarding state. Confirm before executing.</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2"><Label>User ID</Label><Input placeholder="UUID…" value={uid} onChange={e => setUid(e.target.value)} /></div>
      <div className="flex items-center gap-2"><Switch id="dry-r" checked={isDry} onCheckedChange={setIsDry} /><Label htmlFor="dry-r" className="text-xs text-muted-foreground cursor-pointer">Dry-run {isDry?"(safe)":"(LIVE)"}</Label></div>
      <ConfirmAction title="Reset User Setup?" description={`Target: ${uid.slice(0,8)}…`} isDryRun={isDry} onConfirm={() => m.mutate({userId:uid,dry:isDry})} disabled={!uid.trim()||m.isPending||!canExecute}>
        <Button disabled={!uid.trim()||m.isPending||!canExecute} variant={isDry?"outline":"destructive"} size="sm">{m.isPending&&<Loader2 className="h-3 w-3 mr-1 animate-spin"/>}{isDry?"Preview":"Reset"}</Button>
      </ConfirmAction>
      {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
      {m.isSuccess && <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 className="h-3 w-3"/>{isDry?"Dry-run done":"Reset complete"}</div>}
    </CardContent></Card>
  );
}

// ── 3. Revoke Sessions ──
function RevokeSessionsPanel({ canExecute }: { canExecute: boolean }) {
  const [uid, setUid] = useState(""); const [reason, setReason] = useState(""); const [isDry, setIsDry] = useState(true);
  const m = useMutation({
    mutationFn: async ({ userId, reason, dry }: { userId: string; reason: string; dry: boolean }) => {
      launchJob(`Revoke: ${userId.slice(0,8)}…${dry?" (dry-run)":""}`, dry);
      if (!dry) { const { data, error } = await supabase.functions.invoke("admin-revoke-session", { body: { target_user_id: userId, reason } }); if (error) throw error; return data; }
      return { simulated: true };
    },
    onSuccess: () => { toast.success(isDry?"Dry-run done":"Sessions revoked"); setUid(""); setReason(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldOff className="h-4 w-4 text-destructive" />Revoke Sessions</CardTitle><CardDescription>Force-logout. Confirm before executing.</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2"><Label>User ID</Label><Input placeholder="UUID…" value={uid} onChange={e => setUid(e.target.value)} /></div>
      <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Justification…" value={reason} onChange={e => setReason(e.target.value)} rows={2} /></div>
      <div className="flex items-center gap-2"><Switch id="dry-s" checked={isDry} onCheckedChange={setIsDry} /><Label htmlFor="dry-s" className="text-xs text-muted-foreground cursor-pointer">Dry-run {isDry?"(safe)":"(LIVE)"}</Label></div>
      <ConfirmAction title="Revoke All Sessions?" description={`User: ${uid.slice(0,8)}… Reason: ${reason}`} isDryRun={isDry} onConfirm={() => m.mutate({userId:uid,reason,dry:isDry})} disabled={!uid.trim()||!reason.trim()||m.isPending||!canExecute}>
        <Button disabled={!uid.trim()||!reason.trim()||m.isPending||!canExecute} variant={isDry?"outline":"destructive"} size="sm">{m.isPending&&<Loader2 className="h-3 w-3 mr-1 animate-spin"/>}{isDry?"Preview":"Revoke"}</Button>
      </ConfirmAction>
      {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
      {m.isSuccess && <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 className="h-3 w-3"/>{isDry?"Dry-run done":"Revoked"}</div>}
    </CardContent></Card>
  );
}

// ── 4. Webhook Replay (with filters + batch) ──
interface WebhookFailure { id: string; target_url: string|null; status: string; retry_count: number; last_error: string|null; created_at: string; payload: unknown; }
function WebhookReplayPanel({ canExecute }: { canExecute: boolean }) {
  const qc = useQueryClient();
  const [fType, setFType] = useState(""); const [fStatus, setFStatus] = useState(""); const [fFrom, setFFrom] = useState(""); const [fTo, setFTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data, isLoading } = useQuery({ queryKey: ["webhook-failures"], queryFn: async () => { const { data, error } = await supabase.functions.invoke("webhook-replay", { method: "GET", headers: { "x-action": "list" }, body: undefined }); if (error) throw error; return data as { failures: WebhookFailure[]; count: number }; } });
  const all = data?.failures ?? [];
  const filtered = useMemo(() => all.filter(f => { if (fType && !(f.target_url??"").toLowerCase().includes(fType.toLowerCase())) return false; if (fStatus && f.status !== fStatus) return false; if (fFrom && f.created_at < fFrom) return false; if (fTo && f.created_at > fTo) return false; return true; }), [all, fType, fStatus, fFrom, fTo]);
  const failedOnly = filtered.filter(f => f.status === "failed" || f.status === "error");
  const toggle = (id: string) => setSelected(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const replayM = useMutation({ mutationFn: async (wid: string) => { const { data, error } = await supabase.functions.invoke("webhook-replay?action=replay", { body: { webhook_id: wid } }); if (error) throw error; return data; }, onSuccess: (r: any) => { toast.success(r?.replay_status === "replayed" ? "Replayed" : `Status: ${r?.replay_status}`); qc.invalidateQueries({ queryKey: ["webhook-failures"] }); }, onError: (e: Error) => toast.error(e.message) });
  const batchReplay = () => { if (!canExecute) { toast.error("admin.recovery required"); return; } launchJob(`Batch replay: ${selected.size} webhook(s)`, false); Array.from(selected).forEach(id => replayM.mutate(id)); setSelected(new Set()); };
  return (
    <Card><CardHeader>
      <div className="flex items-center justify-between">
        <div><CardTitle className="flex items-center gap-2 text-base"><RefreshCw className="h-4 w-4 text-primary" />Webhook Replay</CardTitle><CardDescription>{filtered.length}/{all.length} shown · {failedOnly.length} failed</CardDescription></div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setSelected(new Set(failedOnly.map(f=>f.id)))} disabled={!failedOnly.length}>Select Failed</Button>
          <ConfirmAction title="Replay Selected?" description={`${selected.size} webhook(s)`} isDryRun={false} onConfirm={batchReplay} disabled={!selected.size||!canExecute}><Button size="sm" className="text-xs h-7" disabled={!selected.size||!canExecute}><Send className="h-3 w-3 mr-1"/>Replay ({selected.size})</Button></ConfirmAction>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex gap-2 flex-wrap items-end">
        <Filter className="h-3 w-3 text-muted-foreground" />
        <Input className="h-7 w-40 text-xs" placeholder="URL filter…" value={fType} onChange={e => setFType(e.target.value)} />
        <Select value={fStatus||"all"} onValueChange={v => setFStatus(v==="all"?"":v)}><SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="error">Error</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select>
        <Input type="date" className="h-7 w-36 text-xs" value={fFrom} onChange={e => setFFrom(e.target.value)} />
        <Input type="date" className="h-7 w-36 text-xs" value={fTo} onChange={e => setFTo(e.target.value)} />
        {(fType||fStatus||fFrom||fTo) && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {setFType("");setFStatus("");setFFrom("");setFTo("");}}>Clear</Button>}
      </div>
      {isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin"/>Loading…</div> : !filtered.length ? <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><CheckCircle2 className="h-4 w-4 text-green-400"/>No matches</div> : (
        <div className="max-h-[400px] overflow-auto"><Table><TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead><TableHead>Retries</TableHead><TableHead>Error</TableHead><TableHead>Time</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>{filtered.map(f => (
          <TableRow key={f.id} className={selected.has(f.id)?"bg-primary/5":""}>
            <TableCell><Checkbox checked={selected.has(f.id)} onCheckedChange={() => toggle(f.id)} disabled={f.status!=="failed"&&f.status!=="error"}/></TableCell>
            <TableCell className="text-xs max-w-[200px] truncate">{f.target_url||"—"}</TableCell>
            <TableCell><Badge variant="destructive" className="text-[10px]">{f.status}</Badge></TableCell>
            <TableCell className="text-xs">{f.retry_count}</TableCell>
            <TableCell className="text-xs text-destructive max-w-[150px] truncate">{f.last_error||"—"}</TableCell>
            <TableCell className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</TableCell>
            <TableCell><ConfirmAction title="Replay?" description={`To ${f.target_url??""}`} isDryRun={false} onConfirm={() => replayM.mutate(f.id)} disabled={replayM.isPending||!canExecute}><Button size="sm" variant="outline" disabled={replayM.isPending||!canExecute} className="text-xs h-7"><RefreshCw className="h-3 w-3 mr-1"/>Replay</Button></ConfirmAction></TableCell>
          </TableRow>
        ))}</TableBody></Table></div>
      )}
    </CardContent></Card>
  );
}

// ── 5. Diagnostic Export (with audit log + report download) ──
interface ExportAudit { id: string; at: string; type: string; ok: boolean; bundleId: string|null; }
const auditLog: ExportAudit[] = [];

function DiagnosticBundlePanel({ canExecute }: { canExecute: boolean }) {
  const [bundleType, setBundleType] = useState("system-wide");
  const [result, setResult] = useState<any>(null);
  const [audits, setAudits] = useState<ExportAudit[]>(auditLog);

  const m = useMutation({
    mutationFn: async (type: string) => { launchJob(`Export: ${type}`, false); const { data, error } = await supabase.functions.invoke("generate-support-bundle", { body: { bundleType: type } }); if (error) throw error; return data; },
    onSuccess: (d) => { setResult(d); toast.success(`Bundle ${d?.bundleId}`); const e: ExportAudit = { id: `DEA-${auditLog.length+1}`, at: new Date().toISOString(), type: bundleType, ok: true, bundleId: d?.bundleId }; auditLog.unshift(e); setAudits([...auditLog]); },
    onError: (e: Error) => { toast.error(e.message); auditLog.unshift({ id: `DEA-${auditLog.length+1}`, at: new Date().toISOString(), type: bundleType, ok: false, bundleId: null }); setAudits([...auditLog]); },
  });

  const dl = () => { if(!result)return; const b=new Blob([JSON.stringify(result,null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`bundle-${result.bundleId}.json`; a.click(); URL.revokeObjectURL(u); };
  const dlAudit = () => { const b=new Blob([JSON.stringify({generatedAt:new Date().toISOString(),entries:audits},null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`export-audit-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(u); };

  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Download className="h-4 w-4 text-primary"/>Export Diagnostic Bundle</CardTitle><CardDescription>Redacted bundle with audit trail.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Type</Label><Select value={bundleType} onValueChange={setBundleType}><SelectTrigger className="w-[250px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="system-wide">System-Wide</SelectItem><SelectItem value="runtime-crash">Runtime Crash</SelectItem><SelectItem value="admin-operator">Admin/Operator</SelectItem><SelectItem value="support-escalation">Support Escalation</SelectItem><SelectItem value="integration-failure">Integration Failure</SelectItem></SelectContent></Select></div>
        <div className="flex gap-2">
          <ConfirmAction title="Generate Bundle?" description={`Type: ${bundleType}`} isDryRun={false} onConfirm={() => m.mutate(bundleType)} disabled={m.isPending||!canExecute}><Button disabled={m.isPending||!canExecute} size="sm">{m.isPending&&<Loader2 className="h-3 w-3 mr-1 animate-spin"/>}Generate</Button></ConfirmAction>
          {result && <Button onClick={dl} size="sm" variant="outline"><Download className="h-3 w-3 mr-1"/>Download</Button>}
        </div>
        {!canExecute && <p className="text-[10px] text-yellow-400">Requires admin.recovery</p>}
        {result && <div className="rounded-md border bg-muted/30 p-3"><div className="flex items-center gap-2"><Badge variant="secondary" className="text-[10px]">{result.bundleId}</Badge><Badge variant="outline" className="text-[10px]">{result.bundleType}</Badge>{result.redactionApplied && <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">PII Redacted</Badge>}</div></div>}
      </CardContent></Card>

      <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4"/>Export Audit Log</CardTitle>{audits.length>0 && <Button size="sm" variant="outline" className="text-xs h-7" onClick={dlAudit}><Download className="h-3 w-3 mr-1"/>Report</Button>}</div></CardHeader>
      <CardContent>{!audits.length ? <p className="text-xs text-muted-foreground py-4 text-center">No exports yet.</p> : <div className="space-y-1">{audits.map(a => <div key={a.id} className="flex items-center gap-3 text-xs p-2 rounded bg-secondary/20"><span className="font-mono text-muted-foreground w-16">{a.id}</span><Badge variant="outline" className={`text-[10px] ${a.ok?"bg-green-500/20 text-green-300":"bg-destructive/20 text-destructive"}`}>{a.ok?"success":"failed"}</Badge><span className="text-foreground flex-1">{a.type}</span><span className="text-muted-foreground">{a.bundleId??"—"}</span><span className="text-muted-foreground">{new Date(a.at).toLocaleString()}</span></div>)}</div>}</CardContent></Card>
    </div>
  );
}

// ── Main ──
export default function AdminRecoveryOperations() {
  const { canView, canExecute, isLoading } = useRecoveryGate();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>;

  if (!canView) return (
    <div className="max-w-md mx-auto mt-16"><Card><CardContent className="py-12 text-center space-y-3">
      <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
      <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
      <p className="text-sm text-muted-foreground">Requires <code className="text-xs bg-secondary px-1 py-0.5 rounded">support.view</code> and <code className="text-xs bg-secondary px-1 py-0.5 rounded">admin.recovery</code> permissions.</p>
    </CardContent></Card></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary"/>Recovery Operations</h2>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
          Admin-only tools with confirmation, dry-run mode, and audit logging.
          {!canExecute && <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-300">Read-only</Badge>}
        </p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jobs" className="text-xs gap-1"><Activity className="h-3 w-3"/>Jobs</TabsTrigger>
          <TabsTrigger value="reset" className="text-xs gap-1"><RotateCcw className="h-3 w-3"/>Reset</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs gap-1"><ShieldOff className="h-3 w-3"/>Sessions</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1"><RefreshCw className="h-3 w-3"/>Webhooks</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs gap-1"><Download className="h-3 w-3"/>Diagnostics</TabsTrigger>
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
