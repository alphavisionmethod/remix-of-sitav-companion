// ═══════════════════════════════════════════════════════════════
// SITA OS — Delegation Registry Table
// Proof-backed recurring delegation with tier progression,
// promotion/demotion history, and safety controls.
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useDelegationRegistry } from "@/hooks/use-meta-governance";
import { motion } from "framer-motion";
import { GitBranch, Shield, TrendingUp, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DelegationTier, RecurringDelegationRecord } from "@/packages/contracts";

const TIER_COLORS: Record<DelegationTier, string> = {
  observe: "bg-muted text-muted-foreground",
  suggest: "bg-muted text-foreground",
  draft: "bg-accent/10 text-accent border-accent/30",
  approval_every: "bg-accent/15 text-accent",
  approval_exceptions: "bg-primary/10 text-primary border-primary/30",
  bounded_recurring: "bg-trust-safe/10 text-trust-safe border-trust-safe/30",
  expanded_recurring: "bg-trust-safe/20 text-trust-safe border-trust-safe/40",
};

const TIER_LABELS: Record<DelegationTier, string> = {
  observe: "Observe",
  suggest: "Suggest",
  draft: "Draft",
  approval_every: "Approve All",
  approval_exceptions: "Approve Exceptions",
  bounded_recurring: "Bounded",
  expanded_recurring: "Expanded",
};

const TIER_ORDER: DelegationTier[] = [
  "observe", "suggest", "draft", "approval_every",
  "approval_exceptions", "bounded_recurring", "expanded_recurring",
];

function tierProgress(tier: DelegationTier): number {
  const idx = TIER_ORDER.indexOf(tier);
  return ((idx + 1) / TIER_ORDER.length) * 100;
}

const DelegationRow = ({ record }: { record: RecurringDelegationRecord }) => {
  const successRate = record.totalExecutions > 0
    ? ((record.totalExecutions - record.totalFailures) / record.totalExecutions * 100).toFixed(0)
    : "N/A";
  const lastPromotion = record.promotionHistory[record.promotionHistory.length - 1];
  const lastDemotion = record.demotionHistory[record.demotionHistory.length - 1];

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium text-sm">{record.workflowFamily}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", TIER_COLORS[record.currentTier])}>
          {TIER_LABELS[record.currentTier]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="w-20">
          <Progress value={tierProgress(record.currentTier)} className="h-1.5" />
        </div>
      </TableCell>
      <TableCell className="text-xs font-mono">{record.totalExecutions}</TableCell>
      <TableCell className={cn(
        "text-xs font-mono",
        Number(successRate) >= 95 ? "text-trust-safe" :
        Number(successRate) >= 80 ? "text-accent" : "text-urgency-high"
      )}>
        {successRate}%
      </TableCell>
      <TableCell className="text-xs font-mono">{record.consecutiveSuccesses}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {lastPromotion && (
            <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/30">
              <ChevronUp className="h-2.5 w-2.5 mr-0.5" />
              {TIER_LABELS[lastPromotion.to]}
            </Badge>
          )}
          {lastDemotion && (
            <Badge variant="outline" className="text-[9px] text-urgency-high border-urgency-high/30">
              <ChevronDown className="h-2.5 w-2.5 mr-0.5" />
              {TIER_LABELS[lastDemotion.to]}
            </Badge>
          )}
          {!lastPromotion && !lastDemotion && (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[9px]">{record.domain}</Badge>
      </TableCell>
    </TableRow>
  );
};

export function DelegationRegistryTable() {
  const { registry, boardroomSection } = useDelegationRegistry();

  return (
    <SitaCard hover={false} className="space-y-4">
      <div className="flex items-center justify-between">
        <SitaCardTitle sub="Proof-backed recurring delegation with graduation ladder">
          <span className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Delegation Registry
          </span>
        </SitaCardTitle>
        <Badge variant="outline" className="text-xs">
          {registry.length} delegations
        </Badge>
      </div>

      {registry.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          No delegations registered yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-wider">Workflow</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Tier</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Progress</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Runs</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Success</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Streak</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">History</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Domain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registry.map(r => (
                <DelegationRow key={r.id} record={r} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SitaCard>
  );
}

export default DelegationRegistryTable;
