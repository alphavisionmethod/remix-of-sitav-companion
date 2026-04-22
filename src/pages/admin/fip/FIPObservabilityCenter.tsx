import FIPSubNav from "@/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle, Wrench, FileSearch, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComplianceRecords, useFeatureSpecs } from "@/hooks/use-fip-data";
import { DEMO_OBSERVABILITY_FIELDS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



const FIPObservabilityCenter = () => {
  const { isDemoMode } = useDataMode();
  const { data: compliance = [] } = useComplianceRecords();
  const { data: specs = [] } = useFeatureSpecs();

  const obsCount = compliance.filter((c: Record<string, any>) => c.observability_defined).length;
  const specsWithObs = specs.filter((s: Record<string, any>) => s.observability_support && Object.keys(s.observability_support).length > 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary" /> FIP09 — Observability & Support Readiness</h1>
        <p className="text-muted-foreground mt-1">Ensure supportability is designed into every feature</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{obsCount}</p><p className="text-xs text-muted-foreground">Observability Defined</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{compliance.length - obsCount}</p><p className="text-xs text-muted-foreground">Missing Observability</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specsWithObs.length}</p><p className="text-xs text-muted-foreground">Full Obs Specs</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Observability Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(isDemoMode ? DEMO_OBSERVABILITY_FIELDS : [] as typeof DEMO_OBSERVABILITY_FIELDS).map(field => {
              const count = specsWithObs.filter((s: Record<string, any>) => s.observability_support?.[field]).length;
              return (
                <div key={field} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm capitalize">{field.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1">
                    {count > 0 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-xs">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Support Readiness Panel</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {compliance.length === 0 ? <p className="text-center py-4 text-muted-foreground text-sm">No features to check support readiness for.</p> :
            compliance.map((c: Record<string, any>) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {c.observability_defined ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  <span className="text-sm font-medium">{c.feature_name || c.feature_id}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant={c.observability_defined ? 'default' : 'destructive'} className="text-xs">{c.observability_defined ? 'Observable' : 'Not Observable'}</Badge>
                  <Badge variant={c.testing_defined ? 'default' : 'outline'} className="text-xs">{c.testing_defined ? 'Tested' : 'Untested'}</Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FIPObservabilityCenter;
