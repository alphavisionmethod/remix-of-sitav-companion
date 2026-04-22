import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createRecoveryJob } from "@/lib/recovery-ops/recovery-job-service";
import type { DiagnosticExportAudit as AuditEntry } from "@/lib/recovery-ops/types";
import { FileDown, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDataMode } from "@/contexts/DataModeContext";

// Demo audit entries
const DEMO_AUDITS: AuditEntry[] = [
  { id: "DEA-001", exportedAt: "2026-04-21T10:00:00Z", exportedBy: "admin@sita.os", parameters: { scope: "full", redacted: true }, resultStatus: "success", fileSize: 2450000, bundleId: "BND-042", downloadUrl: "#" },
  { id: "DEA-002", exportedAt: "2026-04-20T16:30:00Z", exportedBy: "ops@sita.os", parameters: { scope: "ai-runtime", redacted: true }, resultStatus: "success", fileSize: 890000, bundleId: "BND-041", downloadUrl: "#" },
  { id: "DEA-003", exportedAt: "2026-04-19T09:15:00Z", exportedBy: "admin@sita.os", parameters: { scope: "full", redacted: false }, resultStatus: "partial", fileSize: 1200000, bundleId: "BND-040", downloadUrl: "#" },
];

interface Props {
  operatorId: string;
  canExecute: boolean;
}

export function DiagnosticExportAuditPanel({ operatorId, canExecute }: Props) {
  const { isDemoMode } = useDataMode();
  const { toast } = useToast();

  const { data: liveAudits } = useQuery({
    queryKey: ["diagnostic-export-audits", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await supabase.from("audit_export_bundles").select("*").order("created_at", { ascending: false }).limit(20);
      return (data ?? []).map((a: any) => ({
        id: a.id, exportedAt: a.created_at, exportedBy: a.exported_by || user!.email,
        parameters: a.parameters || {}, resultStatus: a.status || "success",
        fileSize: a.file_size || null, bundleId: a.bundle_id || a.id, downloadUrl: a.download_url || null,
      }));
    },
  });

  const audits = isDemoMode ? DEMO_AUDITS : (liveAudits ?? []);

  const exportBundle = () => {
    if (!canExecute) {
      toast({ title: "Permission denied", variant: "destructive" });
      return;
    }
    createRecoveryJob("diagnostic-export", "Diagnostic bundle export", operatorId, false, {
      scope: "full",
      redacted: true,
      exportedBy: operatorId,
    });
    toast({ title: "Export started", description: "Diagnostic bundle is being generated" });
  };

  const statusColor: Record<string, string> = {
    success: "bg-green-500/20 text-green-300",
    partial: "bg-yellow-500/20 text-yellow-300",
    failed: "bg-destructive/20 text-destructive",
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${(bytes / 1_000).toFixed(0)} KB`;
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Diagnostic Export Audit Log
          </CardTitle>
          <Button size="sm" className="text-xs h-7" onClick={exportBundle} disabled={!canExecute}>
            <FileDown className="h-3 w-3 mr-1" /> New Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {audits.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded bg-secondary/20 text-xs">
              <span className="font-mono w-20 text-muted-foreground">{a.id}</span>
              <Badge variant="outline" className={`${statusColor[a.resultStatus]} text-[10px]`}>
                {a.resultStatus}
              </Badge>
              <span className="text-foreground flex-1">Bundle {a.bundleId}</span>
              <span className="text-muted-foreground">{formatSize(a.fileSize)}</span>
              <span className="text-muted-foreground">{new Date(a.exportedAt).toLocaleString()}</span>
              <span className="text-muted-foreground">{a.exportedBy}</span>
              {a.downloadUrl && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Download className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Every export is logged with parameters, operator, and result status for compliance auditing.
        </p>
      </CardContent>
    </Card>
  );
}