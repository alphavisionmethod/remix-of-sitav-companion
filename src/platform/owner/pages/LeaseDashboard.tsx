// ═══════════════════════════════════════════════════════════════
// SITA OS — Lease Dashboard
// Intent-bound capability lease management
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { useCapabilityLease } from "@/contexts/SitaKernelContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Shield, Clock, AlertTriangle, XCircle, CheckCircle, DollarSign,
  Zap, Ban, RotateCcw, ChevronRight, Filter, Eye
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CapabilityLease, LeaseViolation } from "@/lib/services/lease-manager";
import { useLeases } from "@/hooks/use-domain-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// ── Status helpers ──────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "text-trust-safe bg-trust-safe/10 border-trust-safe/20", icon: CheckCircle },
  expired: { label: "Expired", color: "text-muted-foreground bg-muted/50 border-border/20", icon: Clock },
  revoked: { label: "Revoked", color: "text-destructive bg-destructive/10 border-destructive/20", icon: Ban },
  exhausted: { label: "Exhausted", color: "text-accent bg-accent/10 border-accent/20", icon: Zap },
  violated: { label: "Violated", color: "text-destructive bg-destructive/10 border-destructive/20", icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", config.color)}>
<Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ── Lease Card ──────────────────────────────────────────────────

function LeaseCard({
  lease,
  onRevoke,
  onInspect,
}: {
  lease: CapabilityLease;
  onRevoke: (id: string) => void;
  onInspect: (lease: CapabilityLease) => void;
}) {
  const now = Date.now();
  const timeRemaining = Math.max(0, lease.expiresAt - now);
  const spendPercent = lease.spendCap > 0 ? Math.round((lease.spendUsed / lease.spendCap) * 100) : 0;
  const invocPercent = lease.maxInvocations > 0 ? Math.round((lease.invocationCount / lease.maxInvocations) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">{lease.intent}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {lease.advisorId} → {lease.allowedSystems.join(", ")} · {lease.capabilityId}
          </p>
        </div>
        <StatusBadge status={lease.status} />
      </div>

      {/* Progress bars */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[9px] text-muted-foreground mb-1">Spend</p>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", spendPercent > 80 ? "bg-destructive" : "bg-primary")}
              style={{ width: `${Math.min(100, spendPercent)}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            ${lease.spendUsed.toFixed(0)} / ${lease.spendCap.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground mb-1">Invocations</p>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", invocPercent > 80 ? "bg-accent" : "bg-primary")}
              style={{ width: `${Math.min(100, invocPercent)}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {lease.invocationCount} / {lease.maxInvocations}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground mb-1">Time</p>
          <p className={cn("text-xs font-semibold", timeRemaining <= 0 ? "text-muted-foreground" : timeRemaining < 3600000 ? "text-destructive" : "text-foreground")}>
            {formatTimeRemaining(timeRemaining)}
          </p>
        </div>
      </div>

      {/* Violations */}
      {lease.violations.length > 0 && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-2 mb-3">
          <p className="text-[9px] font-semibold text-destructive mb-1">{lease.violations.length} Violation(s)</p>
          {lease.violations.slice(0, 2).map((v) => (
            <p key={v.id} className="text-[9px] text-muted-foreground truncate">
              {v.type}: {v.details}
            </p>
          ))}
        </div>
      )}

      {/* Guards */}
      <div className="flex flex-wrap gap-1 mb-3">
        {lease.requireReceipt && <span className="text-[8px] rounded px-1.5 py-0.5 bg-primary/10 text-primary font-medium">Receipt Required</span>}
        {lease.requireRollbackPosture && <span className="text-[8px] rounded px-1.5 py-0.5 bg-accent/10 text-accent font-medium">Rollback Posture</span>}
        {lease.requireSimulation && <span className="text-[8px] rounded px-1.5 py-0.5 bg-secondary text-muted-foreground font-medium">Simulation First</span>}
        {lease.requireApprovalAbove !== null && (
          <span className="text-[8px] rounded px-1.5 py-0.5 bg-trust-safe/10 text-trust-safe font-medium">
            Approval &gt;${lease.requireApprovalAbove}
          </span>
        )}
        <span className={cn("text-[8px] rounded px-1.5 py-0.5 font-medium",
          lease.riskCeiling === "low" ? "bg-trust-safe/10 text-trust-safe" :
          lease.riskCeiling === "medium" ? "bg-accent/10 text-accent" :
          "bg-destructive/10 text-destructive"
        )}>
          Risk: {lease.riskCeiling}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onInspect(lease)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Eye className="h-3 w-3" /> Inspect
        </button>
        {lease.status === "active" && (
          <SitaButton size="sm" variant="danger" onClick={() => onRevoke(lease.id)}>
            <Ban className="h-3 w-3 mr-1" /> Revoke
          </SitaButton>
        )}
      </div>
    </motion.div>
  );
}

// ── Violation Log ───────────────────────────────────────────────

function ViolationLog({ violations }: { violations: LeaseViolation[] }) {
  if (violations.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">No violations recorded</p>;
  }

  return (
    <div className="space-y-2">
      {violations.map((v) => (
        <div key={v.id} className="flex items-start gap-3 rounded-lg border border-border/30 bg-card/30 p-3">
          <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5",
            v.severity === "revoke" ? "text-destructive" :
            v.severity === "block" ? "text-accent" : "text-muted-foreground"
          )} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">{v.type}</p>
              <span className="text-[9px] text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{v.details}</p>
            <Badge variant="outline" className={cn("mt-1 text-[8px]",
              v.severity === "revoke" ? "border-destructive/30 text-destructive" :
              v.severity === "block" ? "border-accent/30 text-accent" : ""
            )}>
              {v.severity}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lease Inspector Drawer ──────────────────────────────────────

function LeaseInspector({ lease, onClose }: { lease: CapabilityLease | null; onClose: () => void }) {
  if (!lease) return null;

  const now = Date.now();
  const elapsed = now - lease.issuedAt;
  const total = lease.expiresAt - lease.issuedAt;
  const timePercent = Math.min(100, Math.round((elapsed / total) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-background border-l border-border z-50 overflow-hidden"
    >
      <ScrollArea className="h-full">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">Lease Inspector</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{lease.intent}</p>
              <StatusBadge status={lease.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{lease.id.slice(0, 12)}…</span></div>
              <div><span className="text-muted-foreground">Advisor:</span> {lease.advisorId}</div>
              <div><span className="text-muted-foreground">Entity:</span> {lease.entityId}</div>
              <div><span className="text-muted-foreground">User:</span> {lease.userId}</div>
              <div><span className="text-muted-foreground">Capability:</span> {lease.capabilityId}</div>
              <div><span className="text-muted-foreground">Risk Ceiling:</span> {lease.riskCeiling}</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Time Usage</p>
            <ConfidenceBar value={timePercent} label={`${timePercent}% elapsed`} size="md" />
            <p className="text-[9px] text-muted-foreground">
              Issued: {new Date(lease.issuedAt).toLocaleString()} · Expires: {new Date(lease.expiresAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Spend Usage</p>
            <ConfidenceBar
              value={lease.spendCap > 0 ? Math.round((lease.spendUsed / lease.spendCap) * 100) : 0}
              label={`$${lease.spendUsed.toFixed(2)} / $${lease.spendCap.toFixed(2)}`}
              size="md"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Allowed Systems</p>
            <div className="flex flex-wrap gap-1">
              {lease.allowedSystems.map(s => (
                <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Allowed Actions</p>
            <div className="flex flex-wrap gap-1">
              {lease.allowedActions.map(a => (
                <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>
              ))}
            </div>
          </div>

          {lease.delegatedBy && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-[10px] text-primary font-semibold">Delegated Lease</p>
              <p className="text-[9px] text-muted-foreground">Parent: {lease.delegatedBy.slice(0, 12)}… · Depth: {lease.delegationDepth}/{lease.maxDelegationDepth}</p>
            </div>
          )}

          {lease.revokedAt && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
              <p className="text-[10px] text-destructive font-semibold">Revoked</p>
              <p className="text-[9px] text-muted-foreground">By: {lease.revokedBy} · {new Date(lease.revokedAt).toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">{lease.revocationReason}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Violations ({lease.violations.length})</p>
            <ViolationLog violations={lease.violations} />
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// ── Seed demo leases ────────────────────────────────────────────

function useSeedLeases(leasesData: any[]) {
  const { leaseManager } = useCapabilityLease();
  const [seeded, setSeeded] = useState(false);

  if (!seeded && leaseManager.getAllLeases().length === 0 && leasesData.length > 0) {
    // Seed demo leases
    leasesData.forEach(d => leaseManager.issueLease(d));

    // Expire one, revoke one
    const all = leaseManager.getAllLeases();
    if (all.length >= 4) {
      // Manually expire the CRM one
      const crmLease = all.find(l => l.capabilityId === "business.update-lead");
      if (crmLease) {
        leaseManager.expireLease(crmLease.id);
      }
    }

    setSeeded(true);
  }
}

// ── Main Page ───────────────────────────────────────────────────

export default function LeaseDashboard() {
  const { data: leasesData = [] } = useLeases();

  const { leaseManager, revokeLease: revokeLeaseHook } = useCapabilityLease();
  useSeedLeases(leasesData);

  const [inspecting, setInspecting] = useState<CapabilityLease | null>(null);
  const [tab, setTab] = useState("all");

  const allLeases = leaseManager.getAllLeases();
  const stats = leaseManager.getLeaseStats();

  const filtered = useMemo(() => {
    if (tab === "all") return allLeases;
    return allLeases.filter(l => l.status === tab);
  }, [allLeases, tab]);

  const allViolations = useMemo(() => {
    return allLeases.flatMap(l => l.violations).sort((a, b) => b.timestamp - a.timestamp);
  }, [allLeases]);

  const handleRevoke = useCallback((id: string) => {
    revokeLeaseHook(id, "Manually revoked by owner");
  }, [revokeLeaseHook]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      <SitaPageHeader
        title="Capability Leases"
        subtitle="Intent-bound execution authority — every advisor action is scoped, timed, and capped"
      />

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Leases" value={String(stats.total)} icon={Key} sub="Lifetime" />
        <KPITile label="Active" value={String(stats.active)} icon={CheckCircle} sub="Currently valid" />
        <KPITile label="Spend Used" value={`$${stats.totalSpendUsed.toFixed(0)}`} icon={DollarSign} sub={`of $${stats.totalSpendCap.toFixed(0)} cap`} />
        <KPITile label="Invocations" value={String(stats.totalInvocations)} icon={Zap} sub="Total calls" />
        <KPITile label="Violations" value={String(stats.totalViolations)} icon={AlertTriangle} sub={stats.totalViolations === 0 ? "Clean" : "Review needed"} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass-panel">
          <TabsTrigger value="all">All ({allLeases.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
          <TabsTrigger value="revoked">Revoked ({stats.revoked})</TabsTrigger>
          <TabsTrigger value="violations">Violations ({allViolations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="mt-4">
          <SitaCard hover={false} className="p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-4">All Violations</h3>
            <ViolationLog violations={allViolations} />
          </SitaCard>
        </TabsContent>

        {["all", "active", "expired", "revoked"].map(t => (
          <TabsContent key={t} value={t} className="mt-4">
            {filtered.length === 0 ? (
              <div className="empty-state-premium">
                <Key className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground mt-3">No {t === "all" ? "" : t + " "}leases</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(lease => (
                  <LeaseCard
                    key={lease.id}
                    lease={lease}
                    onRevoke={handleRevoke}
                    onInspect={setInspecting}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AnimatePresence>
        {inspecting && <LeaseInspector lease={inspecting} onClose={() => setInspecting(null)} />}
      </AnimatePresence>
    </div>
  );
}
