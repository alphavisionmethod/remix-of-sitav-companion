import FIPSubNav from "@/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Database, CheckCircle2, XCircle, AlertTriangle, FileJson } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGeneratedTruthImpacts } from "@/hooks/use-fip-data";
import { DEMO_GENERATED_ARTIFACTS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



const FIPGeneratedTruthBoard = () => {
  const { isDemoMode } = useDataMode();
  const { data: impacts = [], isLoading } = useGeneratedTruthImpacts();

  const verified = impacts.filter((i: Record<string, any>) => i.verified).length;
  const missing = impacts.filter((i: Record<string, any>) => i.current_state === 'missing').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-primary" /> FIP11 — Generated Truth Impact Board</h1>
        <p className="text-muted-foreground mt-1">Ensure generated artifacts are updated when features change</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{impacts.length}</p><p className="text-xs text-muted-foreground">Total Impacts</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{verified}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{missing}</p><p className="text-xs text-muted-foreground">Missing Updates</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{DEMO_GENERATED_ARTIFACTS.length}</p><p className="text-xs text-muted-foreground">Artifact Types</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Generated Artifact Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_GENERATED_ARTIFACTS.map(artifact => {
              const relatedImpacts = impacts.filter((i: Record<string, any>) => i.artifact_path === artifact);
              const allVerified = relatedImpacts.length > 0 && relatedImpacts.every((i: Record<string, any>) => i.verified);
              const hasMissing = relatedImpacts.some((i: Record<string, any>) => i.current_state === 'missing');
              return (
                <div key={artifact} className={`p-3 rounded-lg border ${allVerified ? 'border-green-500/30' : hasMissing ? 'border-destructive/30' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileJson className="h-3 w-3" />
                    <span className="text-xs font-mono truncate">{artifact.replace('generated/', '')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {allVerified ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : hasMissing ? <XCircle className="h-3 w-3 text-destructive" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                    <span className="text-[10px] text-muted-foreground">{relatedImpacts.length} impacts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          impacts.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No generated truth impacts tracked yet. Impacts are recorded when features modify platform artifacts.</CardContent></Card> :
          impacts.map((i: Record<string, any>) => (
            <Card key={i.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-primary" />
                  <div><p className="text-sm font-medium">{i.feature_id}</p><p className="text-xs text-muted-foreground font-mono">{i.artifact_path}</p></div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={i.verified ? 'default' : 'destructive'} className="text-xs">{i.verified ? 'Verified' : i.current_state}</Badge>
                  <Badge variant="outline" className="text-xs">{i.impact_severity}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPGeneratedTruthBoard;
