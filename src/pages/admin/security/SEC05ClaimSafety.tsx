import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECURITY_CLAIM_SAFETY, THREAT_MODEL } from "@/lib/services/security/security-posture-engine";
import { useDataMode } from "@/contexts/DataModeContext";

export default function SEC05ClaimSafety() {
  const { isDemoMode } = useDataMode();
  const safeClaims = SECURITY_CLAIM_SAFETY.filter(c => c.safe && !c.qualifyCarefully);
  const qualifyClaims = SECURITY_CLAIM_SAFETY.filter(c => c.qualifyCarefully);
  const unsafeClaims = SECURITY_CLAIM_SAFETY.filter(c => !c.safe && !c.qualifyCarefully);

  return (
    <div className="space-y-6 p-6" data-testid="sec05-claim-safety">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> SEC05 — Security Claim Safety Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">What security claims are safe, need qualification, or must not be made</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/30">
          <CardHeader><CardTitle className="text-green-400 flex items-center gap-2 text-base"><CheckCircle className="h-4 w-4" /> Safe to Claim ({safeClaims.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {safeClaims.map((c, i) => (
              <div key={i} className="p-2 rounded bg-green-500/10 text-sm">
                <p className="font-medium">{c.claim}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30">
          <CardHeader><CardTitle className="text-yellow-400 flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4" /> Qualify Carefully ({qualifyClaims.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {qualifyClaims.map((c, i) => (
              <div key={i} className="p-2 rounded bg-yellow-500/10 text-sm">
                <p className="font-medium">{c.claim}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader><CardTitle className="text-red-400 flex items-center gap-2 text-base"><XCircle className="h-4 w-4" /> Do Not Claim ({unsafeClaims.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {unsafeClaims.map((c, i) => (
              <div key={i} className="p-2 rounded bg-red-500/10 text-sm">
                <p className="font-medium">{c.claim}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Threat Model Summary */}
      <Card>
        <CardHeader><CardTitle>Threat Model Summary ({THREAT_MODEL.length} threats)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Threat</th>
                  <th className="text-center p-2">Severity</th>
                  <th className="text-center p-2">Likelihood</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-left p-2">Residual Risk</th>
                </tr>
              </thead>
              <tbody>
                {THREAT_MODEL.map(t => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="p-2 font-mono text-xs">{t.id}</td>
                    <td className="p-2 font-medium text-xs">{t.name}</td>
                    <td className="p-2 text-center">
                      <Badge variant={t.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">{t.severity}</Badge>
                    </td>
                    <td className="p-2 text-center text-xs">{t.likelihood}</td>
                    <td className="p-2 text-center">
                      <Badge variant={t.status === 'secure_verified' ? 'secondary' : 'outline'} className="text-xs">
                        {t.status === 'secure_verified' ? '✅ Verified' : '⚠️ Partial'}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{t.residualWeakness}</td>
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
