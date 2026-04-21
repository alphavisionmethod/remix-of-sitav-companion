// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Recovery Operations
// Reset user setup, revoke sessions, replay webhooks, export bundles.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCcw, ShieldOff, RefreshCw, Download,
  AlertTriangle, CheckCircle2, XCircle, Loader2, Clock,
} from "lucide-react";

// ── Reset User Setup ──
function ResetUserSetupPanel() {
  const [targetUserId, setTargetUserId] = useState("");

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("admin-reset-user-setup", {
        body: { target_user_id: userId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("User setup reset successfully");
      setTargetUserId("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RotateCcw className="h-4 w-4 text-primary" />
          Reset User Setup
        </CardTitle>
        <CardDescription>
          Reset a user's onboarding state back to pending. This clears their account setup progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-user-id">User ID</Label>
          <Input
            id="reset-user-id"
            placeholder="Enter user UUID..."
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
        </div>
        <Button
          onClick={() => mutation.mutate(targetUserId)}
          disabled={!targetUserId.trim() || mutation.isPending}
          variant="destructive"
          size="sm"
        >
          {mutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Reset Setup
        </Button>
        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Setup reset completed. User will see onboarding on next login.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Revoke Sessions ──
function RevokeSessionsPanel() {
  const [targetUserId, setTargetUserId] = useState("");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-revoke-session", {
        body: { target_user_id: userId, reason },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("All active sessions revoked");
      setTargetUserId("");
      setReason("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldOff className="h-4 w-4 text-destructive" />
          Revoke User Sessions
        </CardTitle>
        <CardDescription>
          Force-logout a user by revoking all their active sessions. Requires justification for audit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="revoke-user-id">User ID</Label>
          <Input
            id="revoke-user-id"
            placeholder="Enter user UUID..."
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revoke-reason">Reason</Label>
          <Textarea
            id="revoke-reason"
            placeholder="Reason for session revocation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          onClick={() => mutation.mutate({ userId: targetUserId, reason })}
          disabled={!targetUserId.trim() || !reason.trim() || mutation.isPending}
          variant="destructive"
          size="sm"
        >
          {mutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Revoke All Sessions
        </Button>
        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Sessions revoked. User will need to re-authenticate.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Webhook Replay ──
interface WebhookFailure {
  id: string;
  target_url: string | null;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  payload: unknown;
}

function WebhookReplayPanel() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["webhook-failures"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("webhook-replay", {
        method: "GET",
        headers: { "x-action": "list" },
        body: undefined,
      });
      if (error) throw error;
      return data as { failures: WebhookFailure[]; count: number };
    },
  });

  const replayMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const { data, error } = await supabase.functions.invoke("webhook-replay?action=replay", {
        body: { webhook_id: webhookId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      if (result?.replay_status === "replayed" || result?.replay_status === "replayed_simulated") {
        toast.success("Webhook replayed successfully");
      } else {
        toast.warning(`Replay status: ${result?.replay_status}`);
      }
      queryClient.invalidateQueries({ queryKey: ["webhook-failures"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const failures = data?.failures ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RefreshCw className="h-4 w-4 text-primary" />
          Webhook Failure Replay
        </CardTitle>
        <CardDescription>
          View and replay failed webhook deliveries. {failures.length} failures found.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading failures...
          </div>
        ) : failures.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No failed webhooks found
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failures.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {f.target_url || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-[10px]">
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{f.retry_count}</TableCell>
                    <TableCell className="text-xs text-destructive max-w-[150px] truncate">
                      {f.last_error || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => replayMutation.mutate(f.id)}
                        disabled={replayMutation.isPending}
                        className="text-xs h-7"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Replay
                      </Button>
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

// ── Diagnostic Bundle Export ──
function DiagnosticBundlePanel() {
  const [bundleType, setBundleType] = useState("system-wide");
  const [bundleResult, setBundleResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async (type: string) => {
      const { data, error } = await supabase.functions.invoke("generate-support-bundle", {
        body: { bundleType: type },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setBundleResult(data);
      toast.success(`Bundle ${data?.bundleId} generated`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const downloadBundle = () => {
    if (!bundleResult) return;
    const blob = new Blob([JSON.stringify(bundleResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `support-bundle-${bundleResult.bundleId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />
          Export Diagnostic Bundle
        </CardTitle>
        <CardDescription>
          Generate a redacted diagnostic bundle for support escalation. PII and secrets are automatically scrubbed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Bundle Type</Label>
          <Select value={bundleType} onValueChange={setBundleType}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
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
          <Button
            onClick={() => mutation.mutate(bundleType)}
            disabled={mutation.isPending}
            size="sm"
          >
            {mutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            Generate Bundle
          </Button>
          {bundleResult && (
            <Button onClick={downloadBundle} size="sm" variant="outline">
              <Download className="h-3 w-3 mr-1" /> Download JSON
            </Button>
          )}
        </div>
        {bundleResult && (
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{bundleResult.bundleId}</Badge>
              <Badge variant="outline" className="text-[10px]">{bundleResult.bundleType}</Badge>
              {bundleResult.redactionApplied && (
                <Badge className="text-[10px] bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                  PII Redacted
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {bundleResult.packs?.length ?? 0} diagnostic packs • Expires {new Date(bundleResult.expiresAt).toLocaleDateString()}
            </p>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Preview bundle contents
              </summary>
              <pre className="mt-2 max-h-[200px] overflow-auto rounded bg-background p-2 text-[10px] leading-relaxed">
                {JSON.stringify(bundleResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
export default function AdminRecoveryOperations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Recovery Operations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Admin-only tools for user recovery, session management, webhook replay, and diagnostics.
        </p>
      </div>

      <Tabs defaultValue="reset" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reset" className="text-xs">Reset Setup</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">Sessions</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs">Webhooks</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="reset" className="mt-4">
          <ResetUserSetupPanel />
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <RevokeSessionsPanel />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <WebhookReplayPanel />
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <DiagnosticBundlePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}