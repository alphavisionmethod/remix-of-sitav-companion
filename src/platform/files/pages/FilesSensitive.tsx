import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { PrivacyScopeCard, SensitivityBadge } from "@/platform/sita/components/sita/FilesComponents";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { Shield, Lock, Eye, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useFilesBySensitivity } from "@/hooks/use-domain-data";
import { useMemo } from "react";

function retentionFromClassification(c: string | null): string {
  if (!c) return "7 years";
  const cl = c.toLowerCase();
  if (cl.includes("tax")) return "10 years";
  if (cl.includes("medical") || cl.includes("identity") || cl.includes("estate")) return "Permanent";
  if (cl.includes("contract")) return "Term + 3 years";
  return "7 years";
}

const FilesSensitive = () => {
  const { data: sensitiveFiles = [], isLoading } = useFilesBySensitivity(["restricted", "confidential", "governed"]);

  const governed = useMemo(() =>
    sensitiveFiles.filter((f: Record<string, any>) => f.sensitivity === "governed" || (f.extracted_data?.text || "").toLowerCase().match(/medical|insurance|identity|estate|passport/))
      .map((f: Record<string, any>) => ({
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
    sensitiveFiles.filter((f: Record<string, any>) => f.sensitivity === "restricted" || f.sensitivity === "confidential")
      .filter((f: Record<string, any>) => !governed.some(g => g.fileName === f.filename))
      .map((f: Record<string, any>) => ({
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
      <PageTruthBanner />

      {/* Governed Mode Banner */}
      <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-destructive/10 p-2.5 shrink-0"><ShieldCheck className="h-5 w-5 text-destructive" /></div>
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
      </div>

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
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Governed Documents</h3>
            {governed.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {governed.map((f, i) => <PrivacyScopeCard key={i} {...f} />)}
              </div>
            ) : (
              <PremiumEmptyState variant="no-data" icon={Shield} title="No governed documents" description="Files with medical, legal, or identity content will appear here with maximum protection." />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Restricted Documents</h3>
            {restricted.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {restricted.map((f, i) => <PrivacyScopeCard key={i} {...f} />)}
              </div>
            ) : (
              <PremiumEmptyState variant="no-data" icon={Lock} title="No restricted documents" description="Files flagged as restricted or confidential will appear here." />
            )}
          </div>
        </>
      )}

      <ModuleAdvisorInsight advisorName="Privacy & Governance Advisor" domain="business" insight={governed.length + restricted.length > 0
            ? `${governed.length} governed and ${restricted.length} restricted documents under protection. All auto-triggers are blocked. Memory writes require explicit consent.`
            : "No sensitive documents detected yet. Upload documents containing medical, legal, identity, or financial information for automatic protection."} linkedItems={["Privacy policy", "Data retention", "Audit trail"]} />
    </motion.div>
  );
};

export default FilesSensitive;
