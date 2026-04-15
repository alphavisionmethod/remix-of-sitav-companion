import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Scale, Globe, Lock, FileText, AlertTriangle, Shield } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";

interface ComplianceHook {
  id: string; hook_type: string; target_type: string; target_id: string;
  status: string; reason: string; activated_at: string;
}

export function CloudComplianceAdmin() {
  const [hooks, setHooks] = useState<ComplianceHook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fromTable("cloud_compliance_hooks").select("*").order("created_at", { ascending: false }).limit(50)
      .then(({ data }: any) => { setHooks(data || []); setLoading(false); })
      .catch(() => { setHooks(getDemoHooks()); setLoading(false); });
  }, []);

  const displayHooks = hooks.length > 0 ? hooks : getDemoHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance & Governance</h1>
          <p className="text-sm text-muted-foreground">Legal holds, residency, consent, deletion attestations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Holds", value: displayHooks.filter(h => h.status === "active").length, icon: Lock },
          { label: "Regions", value: 3, icon: Globe },
          { label: "Attestations", value: 12, icon: FileText },
          { label: "Alerts", value: 0, icon: AlertTriangle },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Compliance Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Enforce Data Residency", desc: "Pin user data to declared region", enabled: true },
            { label: "Audit Retention (7 years)", desc: "Retain audit logs for compliance period", enabled: true },
            { label: "Deletion Attestations", desc: "Require attestation for permanent data deletion", enabled: true },
            { label: "Consent Tracking", desc: "Track and verify user consent for data processing", enabled: false },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
              <Switch checked={c.enabled} onCheckedChange={() => toast.info(`Toggled: ${c.label}`)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Holds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Legal Holds & Compliance Hooks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayHooks.map(h => (
                <TableRow key={h.id}>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{h.hook_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-sm">{h.target_type}: <span className="font-mono text-xs">{h.target_id?.slice(0, 8)}...</span></TableCell>
                  <TableCell>
                    <Badge variant={h.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{h.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{h.reason || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(h.activated_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getDemoHooks(): ComplianceHook[] {
  return [
    { id: "ch1", hook_type: "legal_hold", target_type: "user", target_id: "user-abc123", status: "active", reason: "Pending litigation", activated_at: new Date(Date.now() - 604800000).toISOString() },
    { id: "ch2", hook_type: "consent_verification", target_type: "tenant", target_id: "tenant-xyz789", status: "active", reason: "GDPR audit", activated_at: new Date(Date.now() - 2592000000).toISOString() },
    { id: "ch3", hook_type: "deletion_attestation", target_type: "user", target_id: "user-def456", status: "inactive", reason: "Account closure completed", activated_at: new Date(Date.now() - 7776000000).toISOString() },
  ];
}
