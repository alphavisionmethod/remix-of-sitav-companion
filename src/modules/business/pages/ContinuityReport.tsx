// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Continuity Report (Phase 9)
// Honest, runtime-verifiable closure surface for the cross-module
// remediation work shipped across Phases 1–8. Renders the live
// output of `runContinuityVerification()` without fabrication:
// every probe is sourced from an existing handler / table / file.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Hourglass,
  RefreshCw,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { cn } from "@/lib/utils";
import {
  runContinuityVerification,
  type ContinuityProbe,
  type ContinuityReport as Report,
  type ProbeStatus,
} from "@/lib/services/business-os/continuity-verification.service";

const STATUS_META: Record<
  ProbeStatus,
  { label: string; icon: typeof CheckCircle2; tone: string; ring: string }
> = {
  pass: {
    label: "Verified",
    icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-300",
    ring: "border-emerald-500/30 bg-emerald-500/5",
  },
  fail: {
    label: "Failing",
    icon: AlertTriangle,
    tone: "text-rose-600 dark:text-rose-300",
    ring: "border-rose-500/40 bg-rose-500/5",
  },
  unknown: {
    label: "Empty / not yet exercised",
    icon: HelpCircle,
    tone: "text-amber-600 dark:text-amber-300",
    ring: "border-amber-500/30 bg-amber-500/5",
  },
  deferred: {
    label: "Honestly deferred",
    icon: Hourglass,
    tone: "text-slate-500 dark:text-slate-300",
    ring: "border-slate-500/30 bg-slate-500/5",
  },
};

function ProbeRow({ probe }: { probe: ContinuityProbe }) {
  const meta = STATUS_META[probe.status];
  const Icon = meta.icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3", meta.ring)}>
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.tone)} aria-hidden="true" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-foreground">{probe.title}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Phase {probe.phase}
          </span>
          <span className={cn("text-[10px] uppercase tracking-wide font-semibold", meta.tone)}>
            {meta.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{probe.detail}</p>
        <p className="text-[10px] font-mono text-muted-foreground/80 truncate" title={probe.evidenceRef}>
          ↳ {probe.evidenceRef}
        </p>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] px-3 py-2">
      <div className={cn("text-[18px] font-semibold leading-none", tone)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const ContinuityReportPage = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runContinuityVerification();
      setReport(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      <PageTruthBanner />

      <SitaCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <SitaCardTitle>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                Business OS Continuity Report
              </span>
            </SitaCardTitle>
            <p className="text-[11px] text-muted-foreground max-w-2xl">
              Live, read-only verification that the Phase 1–8 cross-module wiring still
              holds. Each row is sourced from a real handler, table or page — nothing is
              fabricated. Items with empty data return <span className="font-semibold">unknown</span>,
              never a fake pass.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-[hsl(0_0%_100%/0.08)] px-2.5 py-1 text-[11px] font-medium transition-colors",
              "hover:border-primary/40 hover:text-primary disabled:opacity-50",
            )}
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} aria-hidden="true" />
            {loading ? "Running…" : "Re-run probes"}
          </button>
        </div>

        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            <StatChip label="Total" value={report.totalProbes} tone="text-foreground" />
            <StatChip label="Verified" value={report.passed} tone="text-emerald-500" />
            <StatChip label="Failing" value={report.failed} tone="text-rose-500" />
            <StatChip label="Unknown" value={report.unknown} tone="text-amber-500" />
            <StatChip label="Deferred" value={report.deferred} tone="text-slate-400" />
          </div>
        )}

        {report && (
          <p className="text-[10px] text-muted-foreground mt-3 inline-flex items-center gap-1">
            <Activity className="h-3 w-3" aria-hidden="true" />
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        )}
      </SitaCard>

      {error && (
        <SitaCard className="p-4 border border-rose-500/30 bg-rose-500/5">
          <p className="text-[12px] text-rose-500">Continuity verification failed: {error}</p>
        </SitaCard>
      )}

      {loading && !report && (
        <SitaCard className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground text-[12px]">
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            Running runtime probes against live tables…
          </div>
        </SitaCard>
      )}

      {report && report.probes.length === 0 && (
        <PremiumEmptyState
          variant="no-data"
          icon={ShieldCheck}
          title="No probes registered"
          description="The verification suite did not return any probes."
          domain="business"
        />
      )}

      {report && report.probes.length > 0 && (
        <SitaCard className="p-4 space-y-2">
          <SitaCardTitle>Probe Results</SitaCardTitle>
          <div className="space-y-2">
            {report.probes.map((probe) => (
              <ProbeRow key={probe.id} probe={probe} />
            ))}
          </div>
        </SitaCard>
      )}
    </motion.div>
  );
};

export default ContinuityReportPage;
