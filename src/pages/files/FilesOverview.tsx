import { SitaPageHeader, SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { UniversalIntakeBox, ProcessingCard, WorkflowSuggestionCard, ConnectorStatusCard } from "@/components/sita/FilesComponents";
import { Upload, FolderOpen, Brain, Shield, FileText, Sparkles, Link2, AlertTriangle, Calendar, Bookmark } from "lucide-react";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState, useMemo } from "react";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { classifyFile, detectSensitivity, type FileClassification, type SensitivityLevel } from "@/lib/core-services/file-ingestion";
import { FileUploader } from "@/components/sita/FileUploader";

type ViewVariant = "founder" | "household" | "finance" | "premium";

const MOCK_FILES = [
  { name: "Q1_Financial_Statement.pdf", mime: "application/pdf", text: "Revenue figures, tax obligations, quarterly earnings report" },
  { name: "School_Enrollment_Form.pdf", mime: "application/pdf", text: "Student enrollment form for Spring semester" },
  { name: "Vendor_Contract_Apex.docx", mime: "application/msword", text: "Service agreement NDA with auto-renew clause, Net-30 terms, $24,000/yr" },
  { name: "Invoice_1042_Marcus.pdf", mime: "application/pdf", text: "Invoice for design services, payment due 04/15/2025" },
  { name: "Passport_Scan.jpg", mime: "image/jpeg", text: "Passport identification document scan" },
  { name: "Bank_Statement_Mar.pdf", mime: "application/pdf", text: "Bank statement with account routing and SSN information" },
  { name: "Travel_Itinerary_Hawaii.pdf", mime: "application/pdf", text: "Flight confirmation and hotel reservation for trip" },
  { name: "Medical_Records_2024.pdf", mime: "application/pdf", text: "Annual medical checkup results, prescription details" },
];

const sensitivityColor: Record<SensitivityLevel, string> = {
  public: "text-trust-safe",
  internal: "text-muted-foreground",
  confidential: "text-accent",
  restricted: "text-destructive",
};

const FilesOverview = () => {
  const [view, setView] = useState<ViewVariant>("founder");

  const classifiedFiles = useMemo(() =>
    MOCK_FILES.map(f => ({
      ...f,
      classification: classifyFile(f.name, f.mime, f.text),
      sensitivity: detectSensitivity(f.text),
    })),
  []);

  const sensitiveCount = classifiedFiles.filter(f => f.sensitivity === "confidential" || f.sensitivity === "restricted").length;
  const classificationCounts = classifiedFiles.reduce((acc, f) => {
    acc[f.classification] = (acc[f.classification] || 0) + 1;
    return acc;
  }, {} as Record<FileClassification, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <SitaPageHeader
        title="Files & Knowledge"
        subtitle="Intelligence intake layer — upload, scan, extract, link, and act"
        actions={<SitaButton variant="primary"><Upload className="h-4 w-4" /> Upload</SitaButton>}
      />

      <SitaTabs
        tabs={[
          { key: "founder", label: "Founder" },
          { key: "household", label: "Household" },
          { key: "finance", label: "Finance" },
          { key: "premium", label: "Premium" },
        ]}
        active={view}
        onChange={(k) => setView(k as ViewVariant)}
      />

      <FileUploader />
      <UniversalIntakeBox />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Files This Week" value={classifiedFiles.length} trend="up" icon={FolderOpen} />
        <KPITile label="Sensitive Files" value={sensitiveCount} icon={Shield} sub="Confidential + Restricted" />
        <KPITile label="Obligations Found" value={7} icon={Calendar} sub="From uploaded docs" />
        <KPITile label="Linked to Workflows" value={18} icon={Link2} />
      </div>

      {/* Classification breakdown */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(classificationCounts).slice(0, 4).map(([cls, count]) => (
          <KPITile key={cls} label={cls.charAt(0).toUpperCase() + cls.slice(1).replace("-", " ")} value={count} icon={FileText} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SitaSectionHeader title="Classified Files" subtitle="Auto-classified with sensitivity detection" />
          {classifiedFiles.map((f, i) => (
            <SitaCard key={i} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/8 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center rounded-md border border-border bg-secondary/40 px-1.5 py-px text-[10px] font-medium text-foreground">
                        {f.classification}
                      </span>
                      <span className={`text-[10px] font-medium ${sensitivityColor[f.sensitivity]}`}>
                        {f.sensitivity}
                      </span>
                    </div>
                  </div>
                </div>
                <TrustBadge level={f.sensitivity === "restricted" ? "degraded" : f.sensitivity === "confidential" ? "review" : "verified"} size="sm" />
              </div>
            </SitaCard>
          ))}

          <SitaSectionHeader title="Workflow Suggestions" subtitle="Generated from recent uploads" />
          <WorkflowSuggestionCard title="Create bill reminder for Apex Corp contract" reason="Auto-renew clause detected — renewal date Mar 15, 2025" domain="Business · Money" affectsWho="Business operations" confidence={91} needsApproval />
          <WorkflowSuggestionCard title="Add school enrollment deadline to family calendar" reason="Form due date detected: April 15, 2024" domain="Household" affectsWho="Family" confidence={87} />
        </div>

        <div className="space-y-4">
          <SitaSectionHeader title="Knowledge Health" />
          <LiveAdvisorCard advisor="general" intent="knowledge_health" demoName="Knowledge Advisor" demoRole="Files Intelligence" demoConfidence="High" demoRecommendation={`${sensitiveCount} sensitive files detected. ${classifiedFiles.length} files auto-classified. Review restricted items.`} demoReasoning="Unlinked obligations may cause missed deadlines" />

          <SitaSectionHeader title="Recent Changes" />
          <SitaCard className="p-3">
            <div className="space-y-2.5">
              {[
                { action: "Contract uploaded & classified", time: "2h ago", trust: "verified" as const },
                { action: "Receipt OCR completed", time: "4h ago", trust: "safe" as const },
                { action: "Statement extraction corrected", time: "Yesterday", trust: "review" as const },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground">{c.action}</p>
                    <p className="text-[10px] text-muted-foreground">{c.time}</p>
                  </div>
                  <TrustBadge level={c.trust} size="sm" />
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaSectionHeader title="Sources & Connectors" />
          <ConnectorStatusCard name="Direct Upload" status="connected" lastSync="Now" />
          <ConnectorStatusCard name="Email Intake" status="disconnected" />
          <ConnectorStatusCard name="Cloud Drive" status="disconnected" />
          <ConnectorStatusCard name="Bank Statements" status="disconnected" />
        </div>
      </div>
    </motion.div>
  );
};

export default FilesOverview;
