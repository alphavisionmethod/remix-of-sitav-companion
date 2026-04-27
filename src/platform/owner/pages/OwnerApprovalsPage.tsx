// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Approvals Control Center
// Pending, recent, rejected, delegated, ladders, intervention
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle, XCircle, Clock, Shield, AlertTriangle, ChevronRight,
  Users, Zap, Eye, Lock, ThumbsUp, ThumbsDown, RotateCcw,
} from "lucide-react";

import { useOwnerApprovals } from "@/modules/business/hooks/use-domain-data";
import type { OwnerApprovalItem as ApprovalItem } from "@/data/fixtures/mock-data/owner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const riskStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-accent/10 text-accent",
  medium: "bg-primary/10 text-primary",
  low: "bg-secondary text-muted-foreground",
};

const statusIcon = (s: string) => {
  if (s === "pending") return <Clock className="h-4 w-4 text-accent" />;
  if (s === "approved") return <CheckCircle className="h-4 w-4 text-trust-safe" />;
  if (s === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Users className="h-4 w-4 text-primary" />;
};

function ApprovalList({ items }: { items: ApprovalItem[] }) {
  const [actioned, setActioned] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-gradient-to-b from-secondary/20 to-transparent p-8 text-center">
          <CheckCircle className="h-8 w-8 text-trust-safe mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">All Clear</p>
          <p className="text-xs text-muted-foreground">No pending items in this category</p>
        </div>
      ) : items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <SitaCard hover className={cn(actioned.has(item.id) ? "opacity-50" : "")}>
            <div className="flex items-start gap-3">
              {statusIcon(item.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <Badge variant="outline" className={cn("text-[9px]", riskStyles[item.riskTier])}>{item.riskTier}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>by {item.requestedBy}</span>
                  <span>•</span>
                  <span>{item.domain}</span>
                  {item.amount && <><span>•</span><span className="font-medium">${item.amount.toLocaleString()}</span></>}
                </div>
                {item.reason && <p className="text-[10px] text-destructive mt-1">{item.reason}</p>}
              </div>
              {item.status === "pending" && !actioned.has(item.id) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setActioned(s => new Set(s).add(item.id))}
                    className="flex items-center gap-1 rounded-lg bg-trust-verified/10 px-2.5 py-1.5 text-[10px] font-medium text-trust-safe hover:bg-trust-verified/20 transition-colors"
                  ><ThumbsUp className="h-3 w-3" /> Approve</button>
                  <button onClick={() => setActioned(s => new Set(s).add(item.id))}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors"
                  ><ThumbsDown className="h-3 w-3" /> Deny</button>
                </div>
              )}
            </div>
          </SitaCard>
        </motion.div>
      ))}
    </div>
  );
}

export default function OwnerApprovalsPage() {
  const { data: approvalsData = [] } = useOwnerApprovals();

  const pending = approvalsData.filter(a => a.status === "pending");
  const approved = approvalsData.filter(a => a.status === "approved");
  const rejected = approvalsData.filter(a => a.status === "rejected");
  const delegated = approvalsData.filter(a => a.status === "delegated");

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Approval Control</h1>
            <p className="text-sm text-muted-foreground">Review, approve, deny, and delegate actions across all domains</p>
          </div>
          <Badge variant="outline" className="ml-auto bg-accent/10 text-accent">
            {pending.length} pending
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending", count: pending.length, color: "text-accent", bg: "bg-accent/10" },
          { label: "Approved", count: approved.length, color: "text-trust-safe", bg: "bg-trust-verified/10" },
          { label: "Rejected", count: rejected.length, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Delegated", count: delegated.length, color: "text-primary", bg: "bg-primary/10" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <p className={cn("font-display text-2xl font-bold", s.color)}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-secondary/30 p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5" />Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <XCircle className="h-3.5 w-3.5 mr-1.5" />Rejected
          </TabsTrigger>
          <TabsTrigger value="delegated" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5 mr-1.5" />Delegated
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending"><ApprovalList items={pending} /></TabsContent>
        <TabsContent value="approved"><ApprovalList items={approved} /></TabsContent>
        <TabsContent value="rejected"><ApprovalList items={rejected} /></TabsContent>
        <TabsContent value="delegated"><ApprovalList items={delegated} /></TabsContent>
      </Tabs>
    </div>
  );
}
