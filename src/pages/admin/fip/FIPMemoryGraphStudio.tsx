import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Brain, Database, Eye, Lock, Trash2, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeatureSpecs } from "@/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const FIPMemoryGraphStudio = () => {
  const { data: specs = [], isLoading } = useFeatureSpecs();
  const specsWithMemory = specs.filter((s: Record<string, any>) => s.memory_graph_effects && Object.keys(s.memory_graph_effects).length > 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> FIP08 — Memory / Graph Impact Studio</h1>
        <p className="text-muted-foreground mt-1">Inspect memory and relationship effects of features</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specs.length}</p><p className="text-xs text-muted-foreground">Total Features</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specsWithMemory.length}</p><p className="text-xs text-muted-foreground">With Memory Effects</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-yellow-500">{specs.length - specsWithMemory.length}</p><p className="text-xs text-muted-foreground">Undeclared</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Sensitive Memory</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Memory Impact Grid</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['reads', 'writes', 'sensitivity', 'expiration', 'correction_path', 'forget_path'].map(field => (
              <div key={field} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="capitalize">{field.replace(/_/g, ' ')}</span>
                <Badge variant="outline">{specsWithMemory.filter((s: Record<string, any>) => s.memory_graph_effects?.[field]).length} defined</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" /> Graph Effects</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['nodes_touched', 'edges_touched', 'authority_model', 'visibility_rules', 'revocation_behavior', 'actor_scope'].map(field => (
              <div key={field} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="capitalize">{field.replace(/_/g, ' ')}</span>
                <Badge variant="outline">{specsWithMemory.filter((s: Record<string, any>) => s.memory_graph_effects?.[field]).length} defined</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
        specs.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No features with declared memory/graph effects yet.</CardContent></Card> : null}
    </div>
  );
};

export default FIPMemoryGraphStudio;
