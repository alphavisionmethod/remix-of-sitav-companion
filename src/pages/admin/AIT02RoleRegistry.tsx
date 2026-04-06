// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT02: Role Registry Board
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getWorkforceRoles } from "@/lib/services/ai-workforce/workforce-orchestrator";
import { Users } from "lucide-react";

export default function AIT02RoleRegistry() {
  const { data: roles = [] } = useQuery({
    queryKey: ["ai-workforce-roles"],
    queryFn: getWorkforceRoles,
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> AIT02 — Role Registry
        </h1>
        <p className="text-muted-foreground mt-1">All AI workforce role definitions and their configuration</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Registered Roles ({roles.length})</CardTitle></CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workforce roles registered. The AI team needs role definitions to operate.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Model Tier</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Autonomy</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Invocations</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.display_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.purpose}</TableCell>
                    <TableCell><Badge variant="outline">{r.default_model_tier}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{r.budget_class}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{r.max_autonomy}</Badge></TableCell>
                    <TableCell><Badge variant={r.launch_stage === "production" ? "default" : "secondary"}>{r.launch_stage}</Badge></TableCell>
                    <TableCell>{r.total_invocations}</TableCell>
                    <TableCell>${(r.total_cost_cents / 100).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
