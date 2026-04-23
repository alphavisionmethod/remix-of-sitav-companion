import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, AlertTriangle, Database, Cpu } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const CORE_SERVICES: any[] = [];

interface CoreService {
  name: string;
  backing: "memory-only" | "localStorage" | "demo" | "db" | "hybrid";
  domains: string[];
  persistenceTarget: string;
  stateLossSeverity: "critical" | "high" | "medium" | "low";
  migrationStatus: "not_started" | "planned" | "in_progress" | "completed";
  owner: string;
}

const SEVERITY_COLORS: Record<string, string> = { critical: "text-destructive", high: "text-orange-400", medium: "text-yellow-400", low: "text-muted-foreground" };
const BACKING_ICONS: Record<string, typeof Server> = { "memory-only": Cpu, localStorage: Database, demo: AlertTriangle, db: Database, hybrid: Server };
const STATUS_COLORS: Record<string, string> = { not_started: "bg-muted text-muted-foreground", planned: "bg-blue-500/20 text-blue-400", in_progress: "bg-yellow-500/20 text-yellow-400", completed: "bg-emerald-500/20 text-emerald-400" };

export default function SimulatedCoreServicesBoard() {
  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Simulated Core Services</h1>
        <p className="text-sm text-muted-foreground">In-memory foundational services needing persistence — RCP06</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map(sev => {
          const count = ([] as any[]).filter(s => s.stateLossSeverity === sev).length;
          return (
            <Card key={sev}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${SEVERITY_COLORS[sev]}`}>{count}</div>
                <div className="text-xs text-muted-foreground capitalize">{sev} state-loss severity</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Current Backing</TableHead>
                <TableHead>Domains</TableHead>
                <TableHead>Persistence Target</TableHead>
                <TableHead>State Loss Severity</TableHead>
                <TableHead>Migration Status</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([] as any[]).map(s => {
                const Icon = BACKING_ICONS[s.backing] ?? Server;
                return (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="outline" className="gap-1"><Icon className="h-3 w-3" />{s.backing}</Badge></TableCell>
                    <TableCell className="text-xs">{s.domains.join(", ")}</TableCell>
                    <TableCell className="font-mono text-xs">{s.persistenceTarget}</TableCell>
                    <TableCell><span className={`font-medium capitalize ${SEVERITY_COLORS[s.stateLossSeverity]}`}>{s.stateLossSeverity}</span></TableCell>
                    <TableCell><Badge className={STATUS_COLORS[s.migrationStatus]}>{s.migrationStatus.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{s.owner}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
