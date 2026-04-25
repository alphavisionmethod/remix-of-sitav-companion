// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Suppression Rules Panel
// Manages suppression windows: create, view, expire rules.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { VolumeX, Plus, Clock, Trash2, Loader2, Shield, CheckCircle2 } from "lucide-react";

interface SuppressionRule {
  id: string;
  subsystem: string | null;
  source: string | null;
  fingerprint_pattern: string | null;
  severity_filter: string[];
  reason: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  match_count: number;
  created_at: string;
}

export function AlertSuppressionRulesPanel() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subsystem: "", source: "", fingerprint: "", severity: "", reason: "", durationHours: "1" });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["alert-suppression-rules"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("alert_suppression_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SuppressionRule[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const hours = parseInt(form.durationHours) || 1;
      const expiresAt = new Date(Date.now() + hours * 3600_000).toISOString();
      const sevFilter = form.severity ? form.severity.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const { error } = await supabase.from("alert_suppression_rules").insert({
        user_id: user.id,
        subsystem: form.subsystem || null,
        source: form.source || null,
        fingerprint_pattern: form.fingerprint || null,
        severity_filter: sevFilter,
        reason: form.reason || "Manual suppression",
        expires_at: expiresAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Suppression rule created" });
      qc.invalidateQueries({ queryKey: ["alert-suppression-rules"] });
      setOpen(false);
      setForm({ subsystem: "", source: "", fingerprint: "", severity: "", reason: "", durationHours: "1" });
    },
    onError: (e) => toast({ title: "Failed", description: String(e), variant: "destructive" }),
  });

  const deactivateMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alert_suppression_rules").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Rule deactivated" });
      qc.invalidateQueries({ queryKey: ["alert-suppression-rules"] });
    },
  });

  const activeRules = rules.filter((r) => r.is_active && new Date(r.expires_at) > new Date());
  const expiredRules = rules.filter((r) => !r.is_active || new Date(r.expires_at) <= new Date());

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <VolumeX className="h-4 w-4 text-muted-foreground" /> Suppression Rules
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Suppression Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs">Subsystem (optional)</Label><Input value={form.subsystem} onChange={(e) => setForm((f) => ({ ...f, subsystem: e.target.value }))} placeholder="e.g. auth, sync" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Source (optional)</Label><Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="e.g. edge-function, cron" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Fingerprint Pattern (optional)</Label><Input value={form.fingerprint} onChange={(e) => setForm((f) => ({ ...f, fingerprint: e.target.value }))} placeholder="Partial match pattern" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Severities (comma-sep, optional)</Label><Input value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))} placeholder="e.g. low,info" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Reason</Label><Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Why are we suppressing?" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Duration (hours)</Label><Input type="number" min="1" max="720" value={form.durationHours} onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value }))} className="h-8 text-sm w-24" /></div>
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="w-full">
                  {createMut.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Shield className="h-3.5 w-3.5 mr-1" />}
                  Create Suppression Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <div className="text-center py-4"><Loader2 className="h-4 w-4 mx-auto animate-spin text-muted-foreground" /></div>}
        {!isLoading && activeRules.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-1 opacity-30" /> No active suppression rules
          </div>
        )}
        {activeRules.map((r) => (
          <div key={r.id} className="flex items-start justify-between p-2 rounded-md border border-border/50 bg-muted/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500">Active</Badge>
                {r.subsystem && <Badge variant="outline" className="text-[9px]">{r.subsystem}</Badge>}
                {r.source && <Badge variant="outline" className="text-[9px]">{r.source}</Badge>}
                {r.severity_filter?.length > 0 && <Badge variant="outline" className="text-[9px]">{r.severity_filter.join(",")}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{r.reason}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" /> Expires {new Date(r.expires_at).toLocaleString()}
                {r.match_count > 0 && <span>· {r.match_count} matches</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deactivateMut.mutate(r.id)}>
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {expiredRules.length > 0 && (
          <details className="mt-2">
            <summary className="text-[10px] text-muted-foreground cursor-pointer">Show {expiredRules.length} expired rules</summary>
            <div className="space-y-1 mt-1">
              {expiredRules.slice(0, 10).map((r) => (
                <div key={r.id} className="text-[10px] text-muted-foreground/60 p-1.5 rounded bg-muted/10">
                  {r.subsystem || r.source || "any"} — {r.reason} — expired {new Date(r.expires_at).toLocaleDateString()} ({r.match_count} matches)
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}