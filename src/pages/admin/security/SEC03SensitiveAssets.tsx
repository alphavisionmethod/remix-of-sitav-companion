import { Database, Lock, AlertTriangle, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SENSITIVE_ASSETS, SECRET_INVENTORY } from "@/lib/core-services/security/security-posture-engine";
import { useDataMode } from "@/contexts/DataModeContext";

const levelBadge = (level: string) => {
  switch (level) {
    case 'critical': return <Badge variant="destructive">Critical</Badge>;
    case 'high': return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
    case 'medium': return <Badge variant="secondary">Medium</Badge>;
    default: return <Badge variant="outline">Low</Badge>;
  }
};

export default function SEC03SensitiveAssets() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="space-y-6 p-6" data-testid="sec03-sensitive-assets">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" /> SEC03 — Sensitive Asset Map
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Most sensitive tables, functions, secrets, and their protection layers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Protected Assets</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SENSITIVE_ASSETS.map((a, i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{a.name}</span>
                    <Badge variant="outline" className="text-xs">{a.type}</Badge>
                  </div>
                  {levelBadge(a.sensitivityLevel)}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.protectionLayers.map((p, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
                {a.remainingRisks.length > 0 && (
                  <div className="mt-2 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-yellow-400">{a.remainingRisks.join('; ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" /> Secret Inventory</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Secret</th>
                  <th className="text-left p-2">Used By</th>
                  <th className="text-left p-2">Storage</th>
                  <th className="text-center p-2">Exposure Risk</th>
                  <th className="text-center p-2">Rotation</th>
                </tr>
              </thead>
              <tbody>
                {SECRET_INVENTORY.map((s, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 font-mono text-xs">{s.name}</td>
                    <td className="p-2 text-xs text-muted-foreground">{s.whereUsed}</td>
                    <td className="p-2"><Badge variant="outline" className="text-xs">{s.storagePosture}</Badge></td>
                    <td className="p-2 text-center">
                      <Badge variant={s.exposureRisk === 'none' ? 'secondary' : 'destructive'} className="text-xs">{s.exposureRisk}</Badge>
                    </td>
                    <td className="p-2 text-center">{s.rotationNeeded ? "⚠️" : "✅"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
