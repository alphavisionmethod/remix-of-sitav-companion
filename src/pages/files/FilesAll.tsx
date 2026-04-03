import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { fileTypeIcon, SensitivityBadge, ProcessingStageBadge, type SensitivityLevel, type ProcessingStage } from "@/components/sita/FilesComponents";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { FolderOpen, Search, Eye, Link2, Shield, Upload, Filter } from "lucide-react";
import { motion } from "framer-motion";

type FileCategory = "all" | "business" | "money" | "household" | "travel" | "legal" | "sensitive";

const allFiles = [
  { name: "Invoice_1038_Marcus_Johnson.pdf", fileType: "invoice", category: "business", size: "245 KB", date: "Mar 28", trust: "verified" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Business" },
  { name: "Service_Agreement_Apex_Corp.pdf", fileType: "contract", category: "business", size: "1.2 MB", date: "Mar 15", trust: "verified" as TrustLevel, sensitivity: "confidential" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Business" },
  { name: "Receipt_AWS_March2024.pdf", fileType: "receipt", category: "money", size: "89 KB", date: "Mar 25", trust: "verified" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Money" },
  { name: "Q1_Financial_Statement.xlsx", fileType: "xlsx", category: "money", size: "890 KB", date: "Mar 31", trust: "review" as TrustLevel, sensitivity: "confidential" as SensitivityLevel, stage: "review-needed" as ProcessingStage, linked: true, extracted: true, domain: "Money" },
  { name: "Business_Plan_2024.docx", fileType: "docx", category: "business", size: "3.4 MB", date: "Feb 10", trust: "review" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "extraction-complete" as ProcessingStage, linked: false, extracted: false, domain: "Business" },
  { name: "Office_Lease_Agreement.pdf", fileType: "contract", category: "legal", size: "2.1 MB", date: "Jan 5", trust: "verified" as TrustLevel, sensitivity: "confidential" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Legal" },
  { name: "Product_Photos_Batch1.zip", fileType: "image", category: "business", size: "15 MB", date: "Mar 20", trust: "safe" as TrustLevel, sensitivity: "public" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: false, extracted: false, domain: "Business" },
  { name: "School_Enrollment_2024.pdf", fileType: "form", category: "household", size: "340 KB", date: "Mar 22", trust: "verified" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Household" },
  { name: "Travel_Confirmation_Hawaii.pdf", fileType: "pdf", category: "travel", size: "120 KB", date: "Mar 18", trust: "verified" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "workflow-ready" as ProcessingStage, linked: true, extracted: true, domain: "Travel" },
  { name: "Insurance_Policy_2024.pdf", fileType: "pdf", category: "sensitive", size: "2.8 MB", date: "Jan 15", trust: "verified" as TrustLevel, sensitivity: "governed" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Governed" },
  { name: "Voice_Note_Meeting.m4a", fileType: "voice", category: "business", size: "4.2 MB", date: "Mar 27", trust: "safe" as TrustLevel, sensitivity: "internal" as SensitivityLevel, stage: "extraction-complete" as ProcessingStage, linked: false, extracted: true, domain: "Business" },
  { name: "Bank_Statement_Feb.pdf", fileType: "statement", category: "money", size: "560 KB", date: "Mar 5", trust: "verified" as TrustLevel, sensitivity: "restricted" as SensitivityLevel, stage: "linked" as ProcessingStage, linked: true, extracted: true, domain: "Money" },
];

const FilesAll = () => {
  const [category, setCategory] = useState<FileCategory>("all");
  const filtered = category === "all" ? allFiles : allFiles.filter(f => f.category === category);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <SitaPageHeader
        title="All Files"
        subtitle={`${allFiles.length} files across all domains`}
        actions={<SitaButton variant="primary"><Upload className="h-4 w-4" /> Upload</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Files" value={allFiles.length} icon={FolderOpen} />
        <KPITile label="Verified" value={allFiles.filter(f => f.trust === "verified").length} icon={Shield} />
        <KPITile label="Linked" value={allFiles.filter(f => f.linked).length} icon={Link2} />
        <KPITile label="Extracted" value={allFiles.filter(f => f.extracted).length} sub="OCR & classification done" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search files by name, content, entity, or extracted fact..." />
        </div>
        <SitaTabs
          tabs={[
            { key: "all", label: "All" },
            { key: "business", label: "Business" },
            { key: "money", label: "Money" },
            { key: "household", label: "Household" },
            { key: "travel", label: "Travel" },
            { key: "legal", label: "Legal" },
            { key: "sensitive", label: "Sensitive" },
          ]}
          active={category}
          onChange={(k) => setCategory(k as FileCategory)}
        />
      </div>

      <div className="space-y-2">
        {filtered.map((file, i) => (
          <SitaCard key={i} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(file.fileType)}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <span className="text-xs text-muted-foreground">{file.date}</span>
                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{file.domain}</span>
                    {file.linked && <span className="flex items-center gap-1 text-xs text-primary"><Link2 className="h-3 w-3" /> Linked</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ProcessingStageBadge stage={file.stage} />
                <SensitivityBadge level={file.sensitivity} />
                <TrustBadge level={file.trust} size="sm" />
                <SitaButton variant="ghost" size="sm"><Eye className="h-4 w-4" /></SitaButton>
              </div>
            </div>
          </SitaCard>
        ))}
      </div>
    </motion.div>
  );
};

export default FilesAll;
