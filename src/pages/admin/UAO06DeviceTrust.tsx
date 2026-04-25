import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const trustColors: Record<string, string> = { high: "bg-green-500/20 text-green-400", standard: "bg-blue-500/20 text-blue-400", low: "bg-muted text-muted-foreground", untrusted: "bg-red-500/20 text-red-400" };

export default function UAO06DeviceTrust() {
  const { data: trust = [] } = useQuery({
    queryKey: ["device-trust"],
    queryFn: async () => { const { data } = await fromTable("device_trust_records").select("*, connected_devices(device_name, platform)").order("created_at"); return data || []; },
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["micro-approval-policies"],
    queryFn: async () => { const { data } = await fromTable("micro_approval_policies").select("*").order("device_family_key"); return data || []; },
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["device-approval-receipts"],
    queryFn: async () => { const { data } = await fromTable("device_approval_receipts").select("*, connected_devices(device_name)").order("decided_at", { ascending: false }).limit(30); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Micro-Approval & Device Trust</h1>
        <p className="text-sm text-muted-foreground mt-1">Trusted devices, approval classes, security posture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Trust Records</p><p className="text-2xl font-bold">{trust.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Approval Policies</p><p className="text-2xl font-bold">{policies.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Approval Receipts</p><p className="text-2xl font-bold">{receipts.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Financial Allowed</p><p className="text-2xl font-bold">{trust.filter((t: Record<string, any>) => t.financial_actions_allowed).length}</p></CardContent></Card>
      </div>

      {trust.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Device Trust Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Device</TableHead><TableHead>Trust</TableHead><TableHead>Biometric</TableHead><TableHead>Approval Tier</TableHead><TableHead>Financial</TableHead><TableHead>High Risk</TableHead><TableHead>Last Verified</TableHead></TableRow></TableHeader>
              <TableBody>
                {trust.map((t: Record<string, any>) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.connected_devices?.device_name || "—"}</TableCell>
                    <TableCell><Badge className={trustColors[t.trust_level] || ""}>{t.trust_level}</Badge></TableCell>
                    <TableCell>{t.biometric_verified ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{t.approval_tier}</TableCell>
                    <TableCell>{t.financial_actions_allowed ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell>{t.high_risk_actions_allowed ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell className="text-xs">{t.last_trust_verification_at ? new Date(t.last_trust_verification_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {policies.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Micro-Approval Policies</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Device Family</TableHead><TableHead>Approval Class</TableHead><TableHead>Allowed</TableHead><TableHead>Biometric</TableHead><TableHead>Max Value</TableHead><TableHead>Cooldown</TableHead><TableHead>Escalation</TableHead></TableRow></TableHeader>
              <TableBody>
                {policies.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.device_family_key}</TableCell>
                    <TableCell className="text-xs">{p.approval_class}</TableCell>
                    <TableCell>{p.allowed ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell>{p.requires_biometric ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Required</Badge> : <span className="text-xs">No</span>}</TableCell>
                    <TableCell className="text-xs">{p.max_value_cents ? `$${(p.max_value_cents / 100).toFixed(2)}` : "—"}</TableCell>
                    <TableCell className="text-xs">{p.cooldown_seconds}s</TableCell>
                    <TableCell className="text-xs">{p.escalation_target}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {receipts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Recent Approval Receipts</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Device</TableHead><TableHead>Class</TableHead><TableHead>Action</TableHead><TableHead>Decision</TableHead><TableHead>Biometric</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {receipts.slice(0, 10).map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.connected_devices?.device_name || r.device_family_key}</TableCell>
                    <TableCell className="text-xs">{r.approval_class}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{r.action_summary || r.action_type}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.decision}</Badge></TableCell>
                    <TableCell>{r.biometric_used ? <CheckCircle className="h-3 w-3 text-green-400" /> : <span className="text-xs">—</span>}</TableCell>
                    <TableCell className="text-xs">{new Date(r.decided_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {trust.length === 0 && policies.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No device trust or approval data yet.</CardContent></Card>)}
    </div>
  );
}
