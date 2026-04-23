import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Collections Command Center (Migrated to OS-native cards)
// Escalation ladders, aging buckets, automated chase sequences
// ═══════════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import {
  DollarSign, AlertTriangle, Clock, CheckCircle, ArrowRight, Zap,
  Send, Phone, Mail, MessageSquare, Shield, FileText, Scale
} from "lucide-react";
import { useCollectionsAccounts } from "@/hooks/use-domain-data";
import type { CollectionsAccount } from "@/data/fixtures/mock-data/collections";

import { HeroCard, QueueCard, StatusCard, ActionCard, SummaryCard, TimelineCard } from "@/components/sita/cards";
import { ExecutionBadge, UrgencyBadge } from "@/components/sita/badges";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { cn } from "@/lib/utils";
import { CrossAppAction } from "@/components/sita/CrossAppAction";


// ── Chase Sequence ──────────────────────────────────────────────

interface ChaseStep {
  step: number;
  dayAfterDue: number;
  action: string;
  channel: "email" | "phone" | "sms" | "letter" | "legal";
  icon: typeof Mail;
  escalationLevel: 0 | 1 | 2 | 3 | 4;
  autoExecute: boolean;
  requiresApproval: boolean;
}

const CHASE_SEQUENCE: ChaseStep[] = [
  { step: 1, dayAfterDue: 1, action: "Friendly reminder email", channel: "email", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 2, dayAfterDue: 7, action: "Second reminder with invoice", channel: "email", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 3, dayAfterDue: 14, action: "Phone call follow-up", channel: "phone", icon: Phone, escalationLevel: 1, autoExecute: false, requiresApproval: false },
  { step: 4, dayAfterDue: 21, action: "Urgent payment request", channel: "email", icon: Mail, escalationLevel: 1, autoExecute: true, requiresApproval: true },
  { step: 5, dayAfterDue: 30, action: "Final notice before escalation", channel: "email", icon: AlertTriangle, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 6, dayAfterDue: 45, action: "Executive escalation call", channel: "phone", icon: Phone, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 7, dayAfterDue: 60, action: "Payment plan offer", channel: "email", icon: DollarSign, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 8, dayAfterDue: 75, action: "Formal demand letter", channel: "letter", icon: FileText, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 9, dayAfterDue: 90, action: "Collections agency referral", channel: "legal", icon: Scale, escalationLevel: 4, autoExecute: false, requiresApproval: true },
];

const formatCents = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const escalationLabel = ["Friendly", "Firm", "Urgent", "Formal", "Legal"];

const riskColor = (score: number) =>
  score >= 80 ? "hsl(0 70% 55%)" : score >= 50 ? "hsl(38 85% 58%)" : score >= 25 ? "hsl(265 55% 58%)" : "hsl(152 55% 48%)";

const riskUrgency = (score: number): "critical" | "high" | "normal" | "low" =>
  score >= 80 ? "critical" : score >= 50 ? "high" : score >= 25 ? "normal" : "low";

// ── Main Component ──────────────────────────────────────────────

const CollectionsCommandCenter = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("collections", primaryMode);
  const { data: accounts = [] } = useCollectionsAccounts();
  const [tab, setTab] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalOutstanding = useMemo(() => accounts.reduce((s, a) => s + a.amountCents, 0), [accounts]);
  const atRisk = useMemo(() => accounts.filter(a => a.riskScore >= 70), [accounts]);
  const avgAging = useMemo(() => accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.agingDays, 0) / accounts.length) : 0, [accounts]);
  const promised = useMemo(() => accounts.filter(a => a.status === "promised"), [accounts]);
  const selected = accounts.find(a => a.id === selectedId) || null;

  // Queue items sorted by risk
  const queueItems = useMemo(() =>
    [...accounts].sort((a, b) => b.riskScore - a.riskScore).map(a => ({
      id: a.id,
      label: `${a.customerName} — ${formatCents(a.amountCents)}`,
      meta: `${a.agingDays}d · Risk ${a.riskScore}`,
      urgency: riskUrgency(a.riskScore),
      badge: <ExecutionBadge state={a.status === "recovered" ? "complete" : a.status === "escalated" ? "failed" : a.chaseSequenceActive ? "executing" : "drafted"} />,
    })),
    [accounts]
  );

  // Escalation timeline
  const escalationTimeline = CHASE_SEQUENCE.map(step => ({
    id: `step-${step.step}`,
    title: `Step ${step.step}: ${step.action}`,
    timestamp: `Day +${step.dayAfterDue}`,
    detail: `${step.channel.toUpperCase()} · ${escalationLabel[step.escalationLevel]}${step.requiresApproval ? " · Approval" : ""}${step.autoExecute ? " · Auto" : ""}`,
    accentColor: step.escalationLevel >= 3 ? "hsl(0 70% 55%)" : step.escalationLevel >= 2 ? "hsl(38 85% 58%)" : "hsl(265 55% 58%)",
  }));

  // ── List Pane ──────────────────────────────────────────────
  const listPane = (
    <div className="p-3 space-y-3">
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2">
        <StatusCard label="Outstanding" status={totalOutstanding > 300000 ? "degraded" : "healthy"} lastChecked={formatCents(totalOutstanding)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatusCard label="Avg Aging" status={avgAging > 45 ? "down" : avgAging > 20 ? "degraded" : "healthy"} lastChecked={`${avgAging} days`} icon={<Clock className="h-3.5 w-3.5" />} />
        <StatusCard label="At Risk" status={atRisk.length > 2 ? "down" : atRisk.length > 0 ? "degraded" : "healthy"} lastChecked={`${atRisk.length} accounts`} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        <StatusCard label="Promised" status="healthy" lastChecked={`${promised.length} payments`} icon={<CheckCircle className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "overview", label: "Queue", count: accounts.length },
          { key: "escalation", label: "Ladder" },
          { key: "chases", label: "Active", count: accounts.filter(a => a.chaseSequenceActive).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <QueueCard
          title="COLLECTIONS QUEUE"
          items={queueItems}
          maxVisible={10}
          onItemClick={(id) => setSelectedId(id)}
        />
      )}

      {tab === "escalation" && (
        <TimelineCard title="9-Step Escalation Ladder" events={escalationTimeline} maxVisible={9} />
      )}

      {tab === "chases" && (
        <div className="space-y-2">
          <ListReveal>
            {accounts.filter(a => a.chaseSequenceActive).sort((a, b) => b.riskScore - a.riskScore).map((acc) => {
              const nextStep = CHASE_SEQUENCE[acc.currentStep];
              return (
                <ListRevealItem key={acc.id}>
                  <button
                    onClick={() => setSelectedId(acc.id)}
                    className={cn(
                      "w-full text-left rounded-xl p-3 border transition-colors micro-hover-lift",
                      selectedId === acc.id
                        ? "border-[hsl(265_55%_58%/0.3)] bg-[hsl(265_55%_58%/0.06)]"
                        : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: `${riskColor(acc.riskScore)} / 0.12`, color: riskColor(acc.riskScore) }}>
                        {acc.riskScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[hsl(0_0%_85%)] truncate">{acc.customerName}</p>
                        <p className="text-[9px] text-[hsl(0_0%_45%)]">Step {acc.currentStep}/{acc.totalSteps} · {formatCents(acc.amountCents)}</p>
                      </div>
                      {nextStep?.requiresApproval && (
                        <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_68%)]">APPROVE</span>
                      )}
                    </div>
                    {nextStep && (
                      <p className="text-[9px] text-[hsl(0_0%_50%)] mt-1.5 flex items-center gap-1">
                        <ArrowRight className="h-2.5 w-2.5" /> Next: {nextStep.action}
                      </p>
                    )}
                  </button>
                </ListRevealItem>
              );
            })}
          </ListReveal>
        </div>
      )}

      {/* Aging Distribution Bar */}
      <AppSurface level={1} className="p-3">
        <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-2">Aging Distribution</p>
        <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
          {(["1-30", "31-60", "61-90", "90+"] as const).map(bucket => {
            const bucketAccounts = accounts.filter(a => a.agingBucket === bucket);
            const total = accounts.reduce((s, a) => s + a.amountCents, 0);
            const pct = total > 0 ? (bucketAccounts.reduce((s, a) => s + a.amountCents, 0) / total) * 100 : 0;
            if (pct < 1) return null;
            const colors: Record<string, string> = { "1-30": "bg-[hsl(152_55%_48%)]", "31-60": "bg-[hsl(38_85%_58%)]", "61-90": "bg-[hsl(0_70%_55%/0.8)]", "90+": "bg-[hsl(0_70%_55%)]" };
            return (
              <div key={bucket} className={`${colors[bucket]} flex items-center justify-center transition-all`} style={{ width: `${Math.max(pct, 8)}%` }}>
                <span className="text-[8px] font-bold text-white/90">{bucket}</span>
              </div>
            );
          })}
        </div>
      </AppSurface>
    </div>
  );

  // ── Detail Pane ────────────────────────────────────────────
  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <HeroCard
        title={selected.customerName}
        metric={formatCents(selected.amountCents)}
        subtitle={`${selected.invoiceNumber} · ${selected.agingDays} days overdue`}
        accentFrom={riskColor(selected.riskScore)}
        accentTo="hsl(265 55% 58%)"
      >
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={riskUrgency(selected.riskScore)} />
          <ExecutionBadge state={selected.status === "recovered" ? "complete" : selected.status === "escalated" ? "failed" : "executing"} />
        </div>
      </HeroCard>

      <AppSurface level={2} className="p-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Status</span>
          <span className="text-[hsl(0_0%_85%)] capitalize font-medium">{selected.status}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Risk Score</span>
          <span className="font-bold" style={{ color: riskColor(selected.riskScore) }}>{selected.riskScore}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Escalation</span>
          <span className="text-[hsl(0_0%_85%)]">Level {selected.escalationLevel} — {escalationLabel[selected.escalationLevel]}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Chase Progress</span>
          <span className="text-[hsl(0_0%_85%)]">{selected.currentStep}/{selected.totalSteps}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Last Contact</span>
          <span className="text-[hsl(0_0%_85%)]">{selected.lastContactAt} via {selected.lastContactMethod}</span>
        </div>
        {selected.promisedPayDate && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Promised Pay</span>
            <span className="text-[hsl(152_55%_48%)] font-medium">{selected.promisedPayDate}</span>
          </div>
        )}
        {selected.notes && (
          <div className="pt-2 border-t border-[hsl(0_0%_100%/0.06)]">
            <p className="text-[10px] text-[hsl(0_0%_45%)] mb-1">Notes</p>
            <p className="text-[11px] text-[hsl(0_0%_70%)]">{selected.notes}</p>
          </div>
        )}
      </AppSurface>

      {/* Cross-App Links */}
      <div className="flex flex-wrap gap-2">
        <CrossAppAction to="/money/receivables" label="View in Finance" context={{ entityType: "customer", entityId: selected.customerName, entityLabel: selected.customerName }} variant="button" />
        <CrossAppAction to="/business/invoices" label="View Invoice" context={{ entityType: "invoice", entityId: selected.invoiceNumber, entityLabel: selected.invoiceNumber }} variant="button" />
        <CrossAppAction to="/files/search" label="Related Files" context={{ entityType: "customer", entityId: selected.customerName, entityLabel: selected.customerName }} variant="chip" />
      </div>

      <AppSurface level={1} className="p-3">
        <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-2">Chase Sequence</p>
        <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(selected.currentStep / selected.totalSteps) * 100}%`,
              background: `linear-gradient(90deg, ${riskColor(selected.riskScore)}, hsl(265 55% 58%))`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[hsl(0_0%_45%)]">Step {selected.currentStep}</span>
          <span className="text-[9px] text-[hsl(0_0%_45%)]">of {selected.totalSteps}</span>
        </div>
      </AppSurface>

      {/* Actions */}
      <div className="space-y-2">
        {CHASE_SEQUENCE[selected.currentStep]?.requiresApproval && (
          <ActionCard
            title="Approve Next Step"
            description={CHASE_SEQUENCE[selected.currentStep]?.action || "Proceed to next escalation"}
            accentColor="hsl(265 55% 58%)"
            onApprove={() => toast.info("Recommendation noted")}
          />
        )}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_80%)] text-[11px] font-medium transition-colors micro-press">
            <Phone className="h-3 w-3 inline mr-1" /> Log Call
          </button>
          <button className="flex-1 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_80%)] text-[11px] font-medium transition-colors micro-press">
            <Mail className="h-3 w-3 inline mr-1" /> Send Reminder
          </button>
        </div>
      </div>

      <ModuleAdvisorInsight
        advisorName="Collections Advisor"
        domain="business"
        insight={
          selected.riskScore >= 80
            ? `${selected.customerName} is high-risk at ${selected.agingDays}d overdue. Consider escalating to formal demand or collections agency.`
            : selected.promisedPayDate
            ? `Payment promised by ${selected.promisedPayDate}. Set a verification reminder for that date.`
            : `Follow up with a direct call — phone contact has 3x higher recovery rate at this aging stage.`
        }
        confidence={selected.riskScore >= 80 ? 92 : 78}
        actions={[{ label: "View History", onClick: () => toast.info("History view planned — coming in a future update") }]}
      />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <DollarSign className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select an account to view details</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={45}
      />
    </div>
  );
};

export default CollectionsCommandCenter;
