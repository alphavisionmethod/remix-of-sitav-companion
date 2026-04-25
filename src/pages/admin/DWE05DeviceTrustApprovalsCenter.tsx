import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Fingerprint, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { DeviceTrustRecordRow, MicroApprovalPolicyRow, DeviceApprovalReceiptRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

export default function DWE05DeviceTrustApprovalsCenter() {
  const { user } = useAuth();

  const { data: trustRecords = [] } = useQuery<DeviceTrustRecordRow[]>({
    queryKey: ["dwe05-trust", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("device_trust_records").select("*").order("created_at", { ascending: false });
      return (data ?? []) as DeviceTrustRecordRow[];
    },
  });

  const { data: policies = [] } = useQuery<MicroApprovalPolicyRow[]>({
    queryKey: ["dwe05-policies", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("micro_approval_policies").select("*");
      return (data ?? []) as MicroApprovalPolicyRow[];
    },
  });

  const { data: receipts = [] } = useQuery<DeviceApprovalReceiptRow[]>({
    queryKey: ["dwe05-receipts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("device_approval_receipts").select("*").order("created_at", { ascending: false }).limit(20);
      return (data ?? []) as DeviceApprovalReceiptRow[];
    },
  });

  const trustIcon = (level: string | null) => {
    if (level === "high" || level === "verified") return <ShieldCheck className="h-4 w-4 text-primary" />;
    if (level === "restricted" || level === "revoked") return <ShieldAlert className="h-4 w-4 text-destructive" />;
    return <Shield className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE05" />
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE05 — Device Trust & Approvals Center</h1>
        <p className="text-muted-foreground">Trusted devices, device-bound approvals, biometric escalation, security posture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Trust Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{trustRecords.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approval Policies</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{policies.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approval Receipts</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{receipts.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Device Trust Records</CardTitle></CardHeader>
        <CardContent>
          {trustRecords.length === 0 ? <p className="text-sm text-muted-foreground">No device trust records yet.</p> : (
            <div className="space-y-2">
              {trustRecords.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {trustIcon(t.approval_tier)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Approval Tier: {t.approval_tier}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.financial_actions_allowed ? "Financial ✓" : "Financial ✗"} · {t.high_risk_actions_allowed ? "High risk ✓" : "High risk ✗"}
                    </p>
                  </div>
                  {t.biometric_verified && <Fingerprint className="h-4 w-4 text-primary" />}
                  <Badge variant={t.trust_level === "high" ? "default" : "secondary"} className="text-xs">
                    {t.trust_level || "unknown"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Micro-Approval Policies</CardTitle></CardHeader>
        <CardContent>
          {policies.length === 0 ? <p className="text-sm text-muted-foreground">No micro-approval policies configured.</p> : (
            <div className="space-y-2">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.approval_class}</p>
                    <p className="text-xs text-muted-foreground">Max value: ${(p.max_value_cents / 100).toFixed(0)} · {p.requires_biometric ? "Biometric required" : "No biometric"}</p>
                  </div>
                  <Badge variant={p.allowed ? "default" : "destructive"} className="text-xs">{p.allowed ? "Allowed" : "Blocked"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
