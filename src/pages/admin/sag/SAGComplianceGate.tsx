import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComplianceViolations, useGatewayStats } from "@/hooks/use-sag-data";
import type { ComplianceGate, TenantFirewallRule, SecurityIncident } from "@/packages/enterprise-contracts";
import { DEMO_VIOLATION_TYPES } from "@/data/seed/admin-platform";
import SAGSubNav from "@/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const sevColors: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive',
  high: 'bg-orange-500/10 text-orange-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  low: 'bg-muted text-muted-foreground',
};

const SAGComplianceGate = () => {
  const { data: violations = [], isLoading } = useComplianceViolations();
  const { data: stats } = useGatewayStats();
  const s = stats || { totalRequests: 0, violations: 0 };

  const blockers = violations.filter((v: Record<string, any>) => v.blocks_launch);
  const resolved = violations.filter((v: Record<string, any>) => v.resolved);
  const typeCounts = ([] as typeof DEMO_VIOLATION_TYPES).map(vt => ({ ...vt, count: violations.filter((v: Record<string, any>) => v.violation_type === vt.type && !v.resolved).length }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" /> SAG12 — AI Launch & Compliance Gate</h1>
        <p className="text-muted-foreground mt-1">AI governance truth as a launch gate</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{violations.length - resolved.length}</p><p className="text-xs text-muted-foreground">Active Violations</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{blockers.length}</p><p className="text-xs text-muted-foreground">Launch Blockers</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{resolved.length}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2">
            {blockers.length === 0 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Ban className="h-5 w-5 text-destructive" />}
            <p className="text-sm font-bold">{blockers.length === 0 ? 'Launch Eligible' : 'Blocked'}</p>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Violation Type Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {typeCounts.map(vt => (
              <div key={vt.type} className={`p-3 rounded-lg border ${vt.count > 0 ? 'border-destructive/30' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <vt.icon className={`h-4 w-4 ${vt.count > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{vt.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{vt.count}</span>
                  <Badge className={sevColors[vt.severity]} variant="outline">{vt.severity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading violations...</p> :
          violations.filter((v: Record<string, any>) => !v.resolved).length === 0 ? (
            <Card className="border-green-500/30"><CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="font-medium text-green-500">No active AI governance violations</p>
              <p className="text-sm text-muted-foreground mt-1">All AI features comply with sovereign gateway rules</p>
            </CardContent></Card>
          ) :
          violations.filter((v: Record<string, any>) => !v.resolved).map((v: Record<string, any>) => (
            <Card key={v.id} className={v.blocks_launch ? 'border-destructive/30' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {v.blocks_launch ? <Ban className="h-4 w-4 text-destructive" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <div>
                      <p className="font-medium text-sm">{v.description}</p>
                      <p className="text-xs text-muted-foreground">{v.violation_type?.replace(/_/g, ' ')} · {v.feature_id || '—'} · {v.source_file || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={sevColors[v.severity]}>{v.severity}</Badge>
                    {v.blocks_launch && <Badge variant="destructive" className="text-xs">Blocks Launch</Badge>}
                  </div>
                </div>
                {v.remediation && <p className="text-xs text-muted-foreground mt-2">Fix: {v.remediation}</p>}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SAGComplianceGate;
