import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Fingerprint, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { DeviceTrustRecordRow, MicroApprovalPolicyRow, DeviceApprovalReceiptRow } from "@/lib/types/dwe-types";

export default function DWE05DeviceTrustApprovalsCenter() {
  const { isDemoMode } = useDataMode();
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

  const trustIcon = (level: string) => {
    if (level === "high_trust" || level === "approval_capable") return <ShieldCheck className="h-4 w-4 text-green-500" />;
    if (level === "restricted") return <ShieldAlert className="h-4 w-4 text-red-500" />;
    return <Shield className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
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
                  {trustIcon(t.trust_class ?? "")}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Trust Class: {t.trust_class}</p>
                    <p className="text-xs text-muted-foreground">Allowed: {(t.approval_classes_allowed || []).join(", ") || "none"}</p>
                  </div>
                  {t.biometric_capable && <Fingerprint className="h-4 w-4 text-primary" />}
                  <Badge variant={t.device_bound_approval_enabled ? "default" : "secondary"} className="text-xs">
                    {t.device_bound_approval_enabled ? "Approvals ON" : "Approvals OFF"}
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
                    <p className="text-sm font-medium">{p.action_class}</p>
                    <p className="text-xs text-muted-foreground">Max risk: {p.max_risk_tier} · {p.requires_biometric ? "Biometric required" : "No biometric"}</p>
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
