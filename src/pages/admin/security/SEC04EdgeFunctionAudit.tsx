import { Shield, ShieldAlert, ShieldCheck, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EDGE_FUNCTION_AUDIT } from "@/lib/services/security/security-posture-engine";

const classificationBadge = (c: string) => {
  switch (c) {
    case 'public_safe': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Public Safe</Badge>;
    case 'auth_required': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Auth Required</Badge>;
    case 'privileged': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Privileged</Badge>;
    case 'internal_only': return <Badge variant="secondary">Internal Only</Badge>;
    case 'high_risk': return <Badge variant="destructive">High Risk</Badge>;
    default: return <Badge variant="outline">{c}</Badge>;
  }
};

export default function SEC04EdgeFunctionAudit() {
  const sorted = [...EDGE_FUNCTION_AUDIT].sort((a, b) => b.missingHardening.length - a.missingHardening.length);
  const fullyHardened = EDGE_FUNCTION_AUDIT.filter(f => f.missingHardening.length === 0).length;

  return (
    <div className="space-y-6 p-6" data-testid="sec04-edge-function-audit">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" /> SEC04 — Edge Function Security Audit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Auth, validation, CORS, rate-limiting status for all {EDGE_FUNCTION_AUDIT.length} audited functions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{fullyHardened}</p>
          <p className="text-xs text-muted-foreground">Fully Hardened</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{EDGE_FUNCTION_AUDIT.length - fullyHardened}</p>
          <p className="text-xs text-muted-foreground">Need Hardening</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{EDGE_FUNCTION_AUDIT.filter(f => f.classification === 'high_risk').length}</p>
          <p className="text-xs text-muted-foreground">High Risk</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{EDGE_FUNCTION_AUDIT.length}</p>
          <p className="text-xs text-muted-foreground">Total Audited</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Function Security Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Function</th>
                  <th className="text-center p-2">Auth</th>
                  <th className="text-center p-2">CORS</th>
                  <th className="text-center p-2">Validation</th>
                  <th className="text-center p-2">Rate Limit</th>
                  <th className="text-center p-2">Classification</th>
                  <th className="text-left p-2">Missing</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(f => (
                  <tr key={f.name} className={`border-b border-border/50 ${f.missingHardening.length > 0 ? 'bg-red-500/5' : ''}`}>
                    <td className="p-2 font-mono text-xs">{f.name}</td>
                    <td className="p-2 text-center">{f.hasAuth ? <ShieldCheck className="h-4 w-4 text-green-400 mx-auto" /> : <ShieldAlert className="h-4 w-4 text-red-400 mx-auto" />}</td>
                    <td className="p-2 text-center">{f.hasCors ? "✅" : "❌"}</td>
                    <td className="p-2 text-center">{f.hasValidation ? "✅" : "❌"}</td>
                    <td className="p-2 text-center">{f.hasRateLimit ? "✅" : "❌"}</td>
                    <td className="p-2 text-center">{classificationBadge(f.classification)}</td>
                    <td className="p-2 text-xs text-muted-foreground">{f.missingHardening.join(', ') || '—'}</td>
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
