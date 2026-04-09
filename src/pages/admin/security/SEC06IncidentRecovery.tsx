import { Shield, AlertTriangle, ToggleLeft, Database, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  INCIDENT_SEVERITY_TAXONOMY,
  KILL_SWITCHES,
  BACKUP_RECOVERY_PLAN,
  MISSING_TO_SECURE_LAUNCH,
} from "@/lib/core-services/security/security-posture-engine";

const severityColor = (level: string) => {
  switch (level) {
    case 'P0': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'P1': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'P2': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function SEC06IncidentRecovery() {
  const { isDemoMode } = useDataMode();
  const publicBlockers = MISSING_TO_SECURE_LAUNCH.filter(g => g.blocksPublicLaunch);

  return (
    <div className="space-y-6 p-6" data-testid="sec06-incident-recovery">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> SEC06 — Incident Response & Recovery
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Severity taxonomy, kill switches, backup/recovery posture, and launch blockers
        </p>
      </div>

      {/* Incident Severity Taxonomy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Incident Severity Taxonomy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {INCIDENT_SEVERITY_TAXONOMY.map((entry) => (
            <div key={entry.level} className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={severityColor(entry.level)}>{entry.level}</Badge>
                <span className="font-semibold text-sm">{entry.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">Response: {entry.responseTime}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{entry.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium text-foreground">Examples:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {entry.examples.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-foreground">Actions:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {entry.actions.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Kill Switches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" /> Kill Switches & Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Subsystem</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Mechanism</th>
                  <th className="text-left p-2">Blast Radius</th>
                  <th className="text-center p-2">Ready</th>
                </tr>
              </thead>
              <tbody>
                {KILL_SWITCHES.map((ks, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 font-medium text-xs">{ks.subsystem}</td>
                    <td className="p-2"><Badge variant="outline" className="text-xs">{ks.switchType}</Badge></td>
                    <td className="p-2 text-xs text-muted-foreground">{ks.mechanism}</td>
                    <td className="p-2 text-xs text-muted-foreground">{ks.blastRadius}</td>
                    <td className="p-2 text-center">{ks.implemented ? "✅" : "⚠️"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Recovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Backup & Recovery Posture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-2">Subsystem</th>
                  <th className="text-left p-2">Backup Strategy</th>
                  <th className="text-left p-2">Recovery Time</th>
                  <th className="text-left p-2">Data Loss Risk</th>
                  <th className="text-center p-2">Tested</th>
                </tr>
              </thead>
              <tbody>
                {BACKUP_RECOVERY_PLAN.map((br, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 font-medium text-xs">{br.subsystem}</td>
                    <td className="p-2 text-xs text-muted-foreground">{br.backupStrategy}</td>
                    <td className="p-2 text-xs">{br.recoveryTime}</td>
                    <td className="p-2 text-xs text-muted-foreground">{br.dataLossRisk}</td>
                    <td className="p-2 text-center">{br.tested ? "✅" : "⚠️"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Missing-to-Secure-Launch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" /> Missing-to-Secure-Launch ({publicBlockers.length} blockers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MISSING_TO_SECURE_LAUNCH.map((g) => (
              <div key={g.id} className="p-3 rounded-lg bg-card border border-border flex items-start gap-3">
                <Badge variant={g.blocksPublicLaunch ? 'destructive' : 'secondary'} className="text-xs shrink-0 mt-0.5">
                  {g.blocksPublicLaunch ? 'BLOCKS LAUNCH' : g.severity}
                </Badge>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{g.id}</span>
                    <span className="text-sm font-medium">{g.gap}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{g.subsystem}</Badge>
                    <span>Effort: {g.effort}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{g.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
