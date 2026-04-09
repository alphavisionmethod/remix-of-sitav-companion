import { Shield, Key, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRIVILEGED_ACTIONS } from "@/lib/core-services/security/security-posture-engine";
import { useDataMode } from "@/contexts/DataModeContext";

const riskBadge = (level: string) => {
  switch (level) {
    case 'critical': return <Badge variant="destructive">Critical</Badge>;
    case 'high': return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
    default: return <Badge variant="secondary">Medium</Badge>;
  }
};

export default function SEC02PrivilegedActions() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="space-y-6 p-6" data-testid="sec02-privileged-actions">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" /> SEC02 — Privileged Action Audit Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">High-risk mutations, admin actions, and enforcement status</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Privileged Action Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Required Role</th>
                  <th className="text-left p-2">Surface</th>
                  <th className="text-center p-2">Server Enforced</th>
                  <th className="text-center p-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {PRIVILEGED_ACTIONS.map((a, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 font-medium">{a.action}</td>
                    <td className="p-2"><Badge variant="outline">{a.role}</Badge></td>
                    <td className="p-2 text-xs font-mono text-muted-foreground">{a.surface}</td>
                    <td className="p-2 text-center">{a.serverEnforced ? <Shield className="h-4 w-4 text-green-400 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-red-400 mx-auto" />}</td>
                    <td className="p-2 text-center">{riskBadge(a.riskLevel)}</td>
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
