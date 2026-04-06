import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RoleDomainBadge, BudgetClassBadge, AutonomyBadge, LaunchHonestyBadge } from "./AIWorkforceBadge";
import { StatusPill } from "./AIWorkforceStatusPill";
import { ChevronRight } from "lucide-react";

interface RoleRow {
  id: string;
  role_key: string;
  display_name: string;
  domain_family?: string;
  budget_class: string;
  autonomy_level?: string;
  launch_honesty_class?: string;
  is_active: boolean;
  total_invocations: number;
  total_cost_cents: number;
  health_state?: string;
}

interface Props {
  roles: RoleRow[];
  onSelectRole?: (role: RoleRow) => void;
}

export function AIWorkforceRoleTable({ roles, onSelectRole }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Autonomy</TableHead>
            <TableHead>Launch</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="text-right">Invocations</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map(role => (
            <TableRow key={role.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectRole?.(role)}>
              <TableCell className="font-medium">{role.display_name}</TableCell>
              <TableCell><RoleDomainBadge domain={role.domain_family || "general"} /></TableCell>
              <TableCell><BudgetClassBadge budgetClass={role.budget_class} /></TableCell>
              <TableCell><AutonomyBadge level={role.autonomy_level || "recommend_only"} /></TableCell>
              <TableCell><LaunchHonestyBadge cls={role.launch_honesty_class || "internal_only"} /></TableCell>
              <TableCell><StatusPill status={role.health_state || "healthy"} type="health" /></TableCell>
              <TableCell className="text-right font-mono text-sm">{role.total_invocations}</TableCell>
              <TableCell className="text-right font-mono text-sm">${(role.total_cost_cents / 100).toFixed(2)}</TableCell>
              <TableCell><Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
          {roles.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No roles configured. Run seed data to populate.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
