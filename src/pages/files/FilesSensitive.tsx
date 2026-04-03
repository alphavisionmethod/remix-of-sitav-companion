import { SitaPageHeader, SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { PrivacyScopeCard, SensitivityBadge, fileTypeIcon } from "@/components/sita/FilesComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Shield, Lock, Eye, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { motion } from "framer-motion";

const governedFiles = [
  { name: "Insurance_Policy_2024.pdf", sensitivity: "governed" as const, visibility: "Owner only", retention: "7 years", memoryWrite: false, workflowTrigger: false },
  { name: "Medical_Records_Annual.pdf", sensitivity: "governed" as const, visibility: "Owner only", retention: "Permanent", memoryWrite: false, workflowTrigger: false },
  { name: "Identity_Documents.pdf", sensitivity: "governed" as const, visibility: "Owner only", retention: "Permanent", memoryWrite: false, workflowTrigger: false },
  { name: "Estate_Planning_Draft.pdf", sensitivity: "governed" as const, visibility: "Owner + Spouse", retention: "Permanent", memoryWrite: false, workflowTrigger: false },
];

const restrictedFiles = [
  { name: "Bank_Statement_Feb.pdf", sensitivity: "restricted" as const, visibility: "Owner only", retention: "7 years", memoryWrite: true, workflowTrigger: true },
  { name: "Tax_Return_2023.pdf", sensitivity: "restricted" as const, visibility: "Owner + Accountant", retention: "10 years", memoryWrite: true, workflowTrigger: false },
];

const FilesSensitive = () => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
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
            Documents in governed mode have stricter privacy controls. No auto-triggered workflows, no memory writes without explicit consent, restricted sharing, and full audit visibility. This is not a clinical decision system — it is a governed organization and coordination mode.
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
      <KPITile label="Governed Files" value={governedFiles.length} icon={Shield} sub="Maximum protection" />
      <KPITile label="Restricted Files" value={restrictedFiles.length} icon={Lock} />
      <KPITile label="Memory Writes" value={0} icon={Eye} sub="From governed files" />
      <KPITile label="Auto-Triggers" value={0} icon={AlertTriangle} sub="Blocked in governed mode" />
    </div>

    <SitaSectionHeader title="Governed Documents" subtitle="Maximum privacy — no auto-triggers, no memory writes, consent required" />
    <div className="grid gap-3 sm:grid-cols-2">
      {governedFiles.map((f, i) => <PrivacyScopeCard key={i} fileName={f.name} {...f} />)}
    </div>

    <SitaSectionHeader title="Restricted Documents" subtitle="Limited visibility — controlled memory and workflow access" />
    <div className="grid gap-3 sm:grid-cols-2">
      {restrictedFiles.map((f, i) => <PrivacyScopeCard key={i} fileName={f.name} {...f} />)}
    </div>
  </motion.div>
);

export default FilesSensitive;
