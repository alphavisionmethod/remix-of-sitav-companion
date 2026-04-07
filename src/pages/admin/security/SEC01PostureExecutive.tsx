import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  computeSecurityScore,
  THREAT_MODEL,
  EDGE_FUNCTION_AUDIT,
  DEPLOYABILITY_MATRIX,
  type SecurityScore,
} from "@/lib/services/security/security-posture-engine";

const scoreColor = (score: number) =>
  score >= 85 ? "text-green-400" : score >= 70 ? "text-yellow-400" : score >= 50 ? "text-orange-400" : "text-red-400";

const scoreBg = (score: number) =>
  score >= 85 ? "bg-green-500/20" : score >= 70 ? "bg-yellow-500/20" : score >= 50 ? "bg-orange-500/20" : "bg-red-500/20";

export default function SEC01PostureExecutive() {
  const { isDemoMode } = useDataMode();
  const scores = computeSecurityScore();
  const criticalThreats = THREAT_MODEL.filter(t => t.severity === 'critical' && t.status !== 'secure_verified');
  const unhardenedFns = EDGE_FUNCTION_AUDIT.filter(f => f.missingHardening.length > 0);
  const publicUnsafe = DEPLOYABILITY_MATRIX.filter(d => !d.publicSafe);

  const dimensions: { label: string; key: keyof SecurityScore; icon: React.ReactNode }[] = [
    { label: "Auth & Sessions", key: "auth", icon: <Lock className="h-4 w-4" /> },
    { label: "RLS / Database", key: "rls", icon: <ShieldCheck className="h-4 w-4" /> },
    { label: "Edge Functions", key: "edgeFunctions", icon: <Shield className="h-4 w-4" /> },
    { label: "Secrets", key: "secrets", icon: <Lock className="h-4 w-4" /> },
    { label: "AI Security", key: "ai", icon: <Eye className="h-4 w-4" /> },
    { label: "Connectors", key: "connectors", icon: <Shield className="h-4 w-4" /> },
    { label: "File Upload", key: "fileUpload", icon: <ShieldAlert className="h-4 w-4" /> },
    { label: "Frontend", key: "frontend", icon: <Shield className="h-4 w-4" /> },
    { label: "Notifications", key: "notifications", icon: <Shield className="h-4 w-4" /> },
    { label: "Privacy/GDPR", key: "privacy", icon: <ShieldCheck className="h-4 w-4" /> },
    { label: "Incidents", key: "incidents", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 p-6" data-testid="sec01-posture-executive">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> SEC01 — Security Posture Executive Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overall security hardening status and critical gaps</p>
      </div>

      {/* Overall Score */}
      <Card className={`border ${scoreBg(scores.overall)}`}>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Composite Security Score</p>
            <p className={`text-5xl font-bold ${scoreColor(scores.overall)}`}>{scores.overall}%</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant={criticalThreats.length > 0 ? "destructive" : "secondary"}>
              {criticalThreats.length} Critical Threats Unresolved
            </Badge>
            <div><Badge variant="outline">{unhardenedFns.length} Functions Need Hardening</Badge></div>
            <div><Badge variant="outline">{publicUnsafe.length} Subsystems Not Public-Launch Safe</Badge></div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map(({ label, key, icon }) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">{icon} {label}</div>
                <span className={`text-lg font-bold ${scoreColor(scores[key])}`}>{scores[key]}%</span>
              </div>
              <Progress value={scores[key]} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Threats */}
      {criticalThreats.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-red-400 flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Unresolved Critical Threats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalThreats.map(t => (
                <div key={t.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{t.id}: {t.name}</span>
                    <Badge variant="destructive">{t.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.residualWeakness}</p>
                  <p className="text-xs text-green-400 mt-1">→ {t.mitigation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployability */}
      <Card>
        <CardHeader><CardTitle>Deployability Security Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Subsystem</th>
                  <th className="text-center p-2">Internal</th>
                  <th className="text-center p-2">Pilot</th>
                  <th className="text-center p-2">Public</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {DEPLOYABILITY_MATRIX.map(d => (
                  <tr key={d.subsystem} className="border-b border-border/50">
                    <td className="p-2 font-medium">{d.subsystem}</td>
                    <td className="p-2 text-center">{d.internalSafe ? "✅" : "❌"}</td>
                    <td className="p-2 text-center">{d.pilotSafe ? "✅" : "❌"}</td>
                    <td className="p-2 text-center">{d.publicSafe ? "✅" : "❌"}</td>
                    <td className="p-2 text-xs text-muted-foreground">{d.reason}</td>
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
