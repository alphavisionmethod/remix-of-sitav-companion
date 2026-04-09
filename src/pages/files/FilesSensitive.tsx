import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { PrivacyScopeCard, SensitivityBadge } from "@/components/sita/FilesComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Shield, Lock, Eye, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useFilesBySensitivity } from "@/hooks/use-domain-data";
import { useMemo } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



function retentionFromClassification(c: string | null): string {
  if (!c) return "7 years";
  const cl = c.toLowerCase();
  if (cl.includes("tax")) return "10 years";
  if (cl.includes("medical") || cl.includes("identity") || cl.includes("estate")) return "Permanent";
  if (cl.includes("contract")) return "Term + 3 years";
  return "7 years";
}

const FilesSensitive = () => {
  const { isDemoMode } = useDataMode();
  const { data: sensitiveFiles = [], isLoading } = useFilesBySensitivity(["restricted", "confidential", "governed"]);

  const governed = useMemo(() =>
    sensitiveFiles.filter((f: any) => f.sensitivity === "governed" || (f.extracted_data?.text || "").toLowerCase().match(/medical|insurance|identity|estate|passport/))
      .map((f: any) => ({
        fileName: f.filename,
        sensitivity: "governed" as const,
        visibility: "Owner only",
        retention: retentionFromClassification(f.classification),
        memoryWrite: false,
        workflowTrigger: false,
      })),
    [sensitiveFiles]
  );

  const restricted = useMemo(() =>
    sensitiveFiles.filter((f: any) => f.sensitivity === "restricted" || f.sensitivity === "confidential")
      .filter((f: any) => !governed.some(g => g.fileName === f.filename))
      .map((f: any) => ({
        fileName: f.filename,
        sensitivity: f.sensitivity as "restricted" | "confidential",
        visibility: f.sensitivity === "restricted" ? "Owner only" : "Owner + Trusted",
        retention: retentionFromClassification(f.classification),
        memoryWrite: f.sensitivity !== "restricted",
        workflowTrigger: f.sensitivity !== "restricted",
      })),
    [sensitiveFiles, governed]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="Sensitive & Governed Documents"
        subtitle="Stricter privacy, consent-aware, restricted memory — organization & coordination only"
      />

      <SitaCard className="p-4" glow>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-400/10 p-2.5 shrink-0"><ShieldCheck className="h-5 w-5 text-red-400" /></div>
          <div>
            <p className="text-sm font-semibold text-foreground">Governed Mode Active</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Documents in governed mode have stricter privacy controls. No auto-triggered workflows, no memory writes without explicit consent, restricted sharing, and full audit visibility.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TrustBadge level="blocked" label="No Auto-Trigger" size="sm" />
              <TrustBadge level="approval" label="Consent Required" size="sm" />
              <TrustBadge level="safe" label="Audit Visible" size="sm" />
            </div>
          </div>
        </div>
      </SitaCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Governed Files" value={governed.length} icon={Shield} sub="Maximum protection" />
        <KPITile label="Restricted Files" value={restricted.length} icon={Lock} />
        <KPITile label="Memory Writes" value={0} icon={Eye} sub="From governed files" />
        <KPITile label="Auto-Triggers" value={0} icon={AlertTriangle} sub="Blocked in governed mode" />
      </div>

      {isLoading ? (
        <SectionSkeleton cards={4} columns={2} />
      ) : (
        <>
          <SitaSectionHeader title="Governed Documents" subtitle="Maximum privacy — no auto-triggers, no memory writes, consent required" />
          {governed.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {governed.map((f, i) => <PrivacyScopeCard key={i} {...f} />)}
            </div>
          ) : (
            <EmptyState icon={Shield} title="No governed documents" description="Files with medical, legal, or identity content will appear here" />
          )}

          <SitaSectionHeader title="Restricted Documents" subtitle="Limited visibility — controlled memory and workflow access" />
          {restricted.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {restricted.map((f, i) => <PrivacyScopeCard key={i} {...f} />)}
            </div>
          ) : (
            <EmptyState icon={Lock} title="No restricted documents" description="Files flagged as restricted or confidential will appear here" />
          )}
        </>
      )}
    </motion.div>
  );
};

export default FilesSensitive;
