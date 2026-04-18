// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Kill-Switch Console
//
// Phase 15 — Operator UI surface for activating/approving canonical
// kill switches, including the dual-approval-gated KS-PAYMENTS-AUTH.
//
// This page is the single operator-facing surface enforced by:
//   scripts/architecture/checks/check-ks-payments-auth-readiness.ts
//
// Behavior:
//   • Lists every registered kill switch from kill-switch-registry.ts
//   • For dual-approval switches, requires a second admin to approve
//     via /admin/approvals (queue surfaced separately).
//   • Activations require ≥20-char justification and emit an
//     append-only audit log entry.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ShieldCheck, ShieldOff, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KillSwitch {
  id: string;
  category: string;
  description: string;
  requiresDualApproval: boolean;
  riskTier: "low" | "medium" | "high" | "critical";
  active: boolean;
  activatedAt?: string | null;
  activatedBy?: string | null;
  expiresAt?: string | null;
}

// Canonical declaration mirrors src/lib/control-plane/kill-switch-registry.ts
const REGISTRY: Omit<KillSwitch, "active" | "activatedAt" | "activatedBy" | "expiresAt">[] = [
  { id: "KS-PAYMENTS-AUTH", category: "Payments", description: "Halt all payments authorization globally. Dual-approval required.", requiresDualApproval: true, riskTier: "critical" },
  { id: "KS-MODEL-PROVIDERS", category: "AI Runtime", description: "Disable upstream AI model providers (gateway returns refused receipts).", requiresDualApproval: true, riskTier: "critical" },
  { id: "KS-SIGNUPS", category: "Auth", description: "Block new account signups system-wide.", requiresDualApproval: false, riskTier: "high" },
  { id: "KS-CONNECTORS", category: "Integrations", description: "Pause all third-party connector traffic.", requiresDualApproval: false, riskTier: "medium" },
  { id: "KS-WRITES", category: "Database", description: "Switch app to read-only mode for safe DB ops.", requiresDualApproval: true, riskTier: "high" },
];

export default function AdminKillSwitches() {
  const [switches, setSwitches] = useState<KillSwitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KillSwitch | null>(null);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadStates();
  }, []);

  async function loadStates() {
    setLoading(true);
    // Hydrate active state from kill_switch_audit_log; fall back to inactive when no telemetry table
    try {
      const { data } = await supabase
        .from("admin_action_audit" as never)
        .select("action,created_at,actor_user_id,metadata")
        .like("action", "kill_switch.%")
        .order("created_at", { ascending: false })
        .limit(100);
      const latest = new Map<string, { active: boolean; at: string; by: string }>();
      for (const row of (data ?? []) as Array<{ action: string; created_at: string; actor_user_id: string; metadata?: { switch_id?: string; state?: string } }>) {
        const sid = row.metadata?.switch_id;
        if (!sid || latest.has(sid)) continue;
        latest.set(sid, { active: row.metadata?.state === "activated", at: row.created_at, by: row.actor_user_id });
      }
      setSwitches(REGISTRY.map((r) => {
        const s = latest.get(r.id);
        return { ...r, active: s?.active ?? false, activatedAt: s?.at ?? null, activatedBy: s?.by ?? null };
      }));
    } catch {
      setSwitches(REGISTRY.map((r) => ({ ...r, active: false })));
    } finally {
      setLoading(false);
    }
  }

  async function requestActivation() {
    if (!selected) return;
    if (justification.trim().length < 20) {
      toast.error("Justification must be at least 20 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const action = selected.requiresDualApproval ? "kill_switch.activation_requested" : "kill_switch.activated";
      await supabase.from("admin_action_audit" as never).insert({
        actor_user_id: user.id,
        action,
        target_type: "kill_switch",
        target_id: selected.id,
        plane: "control",
        severity: selected.riskTier === "critical" ? "critical" : "high",
        justification: justification.trim(),
        metadata: { switch_id: selected.id, state: selected.requiresDualApproval ? "pending" : "activated" },
      } as never);

      toast.success(
        selected.requiresDualApproval
          ? `${selected.id} activation queued — second admin must approve at /admin/approvals.`
          : `${selected.id} activated.`
      );
      setSelected(null);
      setJustification("");
      await loadStates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Activation failed");
    } finally {
      setSubmitting(false);
    }
  }

  const sortedSwitches = useMemo(
    () => [...switches].sort((a, b) => Number(b.requiresDualApproval) - Number(a.requiresDualApproval) || a.id.localeCompare(b.id)),
    [switches]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kill Switches</h1>
        <p className="text-muted-foreground mt-1">
          Operator surface for canonical safety kill switches. Dual-approval switches require
          a second admin to confirm via the Approvals queue.
        </p>
      </div>

      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>High-impact controls</AlertTitle>
        <AlertDescription>
          Activations are append-only and logged to <code>admin_action_audit</code>. KS-PAYMENTS-AUTH
          and KS-MODEL-PROVIDERS require a second authenticated admin to approve before enforcement.
        </AlertDescription>
      </Alert>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading switches…</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {sortedSwitches.map((sw) => (
            <Card key={sw.id} className={sw.active ? "border-destructive/60" : undefined}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-mono text-base">
                      {sw.active ? <ShieldOff className="h-4 w-4 text-destructive" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                      {sw.id}
                    </CardTitle>
                    <CardDescription className="mt-1">{sw.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={sw.active ? "destructive" : "secondary"}>{sw.active ? "ACTIVE" : "armed"}</Badge>
                    <Badge variant="outline" className="capitalize">{sw.riskTier}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{sw.category}</span>
                  {sw.requiresDualApproval && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Dual approval required
                    </span>
                  )}
                  {sw.active && sw.activatedAt && <span>Active since {new Date(sw.activatedAt).toLocaleString()}</span>}
                </div>
                <Dialog open={selected?.id === sw.id} onOpenChange={(o) => { if (!o) { setSelected(null); setJustification(""); } }}>
                  <DialogTrigger asChild>
                    <Button variant={sw.active ? "outline" : "destructive"} onClick={() => setSelected(sw)}>
                      {sw.active ? "Deactivate" : sw.requiresDualApproval ? "Request activation" : "Activate"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{sw.active ? "Deactivate" : "Activate"} {sw.id}</DialogTitle>
                      <DialogDescription>
                        {sw.requiresDualApproval
                          ? "This action requires a second admin to approve from /admin/approvals before taking effect."
                          : "This action takes effect immediately and is logged."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Justification (≥20 characters)</label>
                      <Textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Describe the incident, link to RB-005, name the on-call lead…"
                        rows={4}
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        {justification.trim().length}/20 characters
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => { setSelected(null); setJustification(""); }}>Cancel</Button>
                      <Button
                        variant="destructive"
                        disabled={submitting || justification.trim().length < 20}
                        onClick={requestActivation}
                      >
                        {submitting ? "Submitting…" : sw.requiresDualApproval ? "Queue for approval" : "Confirm activation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
