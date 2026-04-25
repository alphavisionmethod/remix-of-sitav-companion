import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiskTierBadge } from "./AIWorkforceBadge";
import { StatusPill } from "./AIWorkforceStatusPill";
import { ChevronRight, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QueueItem {
  id: string;
  title: string;
  risk_tier?: string;
  severity?: string;
  status: string;
  impacted_domain?: string;
  budget_impact_class?: string;
  created_at: string;
}

interface Props {
  items: QueueItem[];
  onSelectItem?: (item: QueueItem) => void;
}

export function AIWorkforceApprovalQueueTable({ items, onSelectItem }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectItem?.(item)}>
              <TableCell className="font-medium text-sm max-w-[300px] truncate">{item.title}</TableCell>
              <TableCell><RiskTierBadge tier={item.risk_tier || "standard"} /></TableCell>
              <TableCell><Badge variant={item.severity === "critical" || item.severity === "high" ? "destructive" : "outline"} className="text-xs">{item.severity || "—"}</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">{item.impacted_domain || "—"}</TableCell>
              <TableCell><StatusPill status={item.status} type="recommendation" /></TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
              <TableCell><Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No items in approval queue
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
