import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Archive, Trash2, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeprecationRecords } from "@/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500',
  deprecated: 'bg-yellow-500/10 text-yellow-500',
  retiring: 'bg-orange-500/10 text-orange-500',
  retired: 'bg-muted text-muted-foreground',
};

const FIPDeprecationManager = () => {
  const { data: records = [], isLoading } = useDeprecationRecords();

  const stats = {
    active: records.filter((r: Record<string, any>) => r.retirement_status === 'active').length,
    deprecated: records.filter((r: Record<string, any>) => r.retirement_status === 'deprecated').length,
    retiring: records.filter((r: Record<string, any>) => r.retirement_status === 'retiring').length,
    retired: records.filter((r: Record<string, any>) => r.retirement_status === 'retired').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Archive className="h-6 w-6 text-primary" /> FIP13 — Deprecation / Retirement Manager</h1>
        <p className="text-muted-foreground mt-1">Manage feature end-of-life paths and cleanup</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <Card key={status}><CardContent className="pt-4"><p className="text-2xl font-bold">{count}</p><p className="text-xs text-muted-foreground capitalize">{status}</p></CardContent></Card>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          records.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deprecation records. The no-undead-features rule requires every feature to have an end-of-life path.</p>
            </CardContent></Card>
          ) :
          records.map((r: Record<string, any>) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-primary" />
                    <div><p className="font-medium">{r.feature_name}</p><p className="text-xs text-muted-foreground">{r.feature_id}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[r.retirement_status] || ''}>{r.retirement_status}</Badge>
                    {r.replacement_owner && <Badge variant="outline" className="text-xs">→ {r.replacement_owner}</Badge>}
                  </div>
                </div>
                {(r.migration_path || r.compatibility_window) && (
                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-muted-foreground">
                    {r.migration_path && <div><span className="font-medium">Migration:</span> {r.migration_path}</div>}
                    {r.compatibility_window && <div><Clock className="h-3 w-3 inline mr-1" />{r.compatibility_window}</div>}
                  </div>
                )}
                {r.generated_truth_cleanup?.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">{r.generated_truth_cleanup.map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPDeprecationManager;
