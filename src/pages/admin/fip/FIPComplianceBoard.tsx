import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useComplianceRecords } from "@/hooks/use-fip-data";
import { COMPLIANCE_SECTIONS, READINESS_STAGES } from "@/lib/fip/types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const FIPComplianceBoard = () => {
  const { data: records = [], isLoading } = useComplianceRecords();

  const avgScore = records.length > 0 ? Math.round(records.reduce((sum: number,  r: Record<string, any>) => sum + (r.completeness_score || 0), 0) / records.length) : 0;
  const totalViolations = records.reduce((sum: number,  r: Record<string, any>) => sum + (r.violation_count || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-primary" /> FIP05 — Feature Integration Compliance Board</h1>
        <p className="text-muted-foreground mt-1">Protocol compliance verification for every feature</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{records.length}</p><p className="text-xs text-muted-foreground">Total Features</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{avgScore}%</p><p className="text-xs text-muted-foreground">Avg Compliance</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{totalViolations}</p><p className="text-xs text-muted-foreground">Total Violations</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{records.filter((r: Record<string, any>) => (r.completeness_score || 0) >= 90).length}</p><p className="text-xs text-muted-foreground">Fully Compliant</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading compliance records...</p> :
          records.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No compliance records yet. Records are created automatically when features pass through the protocol.</p>
            </CardContent></Card>
          ) :
          records.map((r: Record<string, any>) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.feature_name || r.feature_id}</span>
                    <Badge variant="outline">{r.readiness_stage}</Badge>
                    {r.violation_count > 0 && <Badge variant="destructive" className="text-xs">{r.violation_count} violations</Badge>}
                  </div>
                  <span className="text-sm font-bold">{Math.round(r.completeness_score || 0)}%</span>
                </div>
                <Progress value={r.completeness_score || 0} className="h-2 mb-3" />
                <div className="grid grid-cols-7 gap-2">
                  {COMPLIANCE_SECTIONS.map(s => {
                    const passed = r[s.key];
                    return (
                      <div key={s.key} className={`flex items-center gap-1 text-xs p-1 rounded ${passed ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span className="truncate">{s.label.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPComplianceBoard;
