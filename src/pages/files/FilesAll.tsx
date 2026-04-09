import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { fileTypeIcon, SensitivityBadge, ProcessingStageBadge, type SensitivityLevel, type ProcessingStage } from "@/components/sita/FilesComponents";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { FolderOpen, Search, Eye, Link2, Shield, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useAllFiles } from "@/hooks/use-domain-data";
import { FileUploader } from "@/components/sita/FileUploader";
import { classifyFile, detectSensitivity } from "@/lib/core-services/file-ingestion";
import { format } from "date-fns";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";


interface FilesAllRow {
  classification?: unknown;
  domain?: string;
  extracted_data?: unknown;
  filename?: unknown;
  id?: string;
  mime_type?: unknown;
  sensitivity?: unknown;
  status?: string;
}

type FileCategory = "all" | "business" | "money" | "household" | "travel" | "legal" | "sensitive";

function classifyDomain(f: FilesAllRow): string {
  const text = `${f.filename} ${f.extracted_data?.text || ""} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract") || text.includes("nda")) return "business";
  if (text.includes("bank") || text.includes("statement") || text.includes("receipt") || text.includes("bill")) return "money";
  if (text.includes("school") || text.includes("kid") || text.includes("family")) return "household";
  if (text.includes("travel") || text.includes("hotel") || text.includes("flight")) return "travel";
  if (text.includes("insurance") || text.includes("legal") || text.includes("lease")) return "legal";
  if (["restricted", "governed", "confidential"].includes(f.sensitivity)) return "sensitive";
  return "business";
}

function trustFromSensitivity(s: string): TrustLevel {
  if (s === "restricted") return "low-confidence";
  if (s === "confidential") return "review";
  return "verified";
}

function stageFromStatus(status: string): ProcessingStage {
  if (status === "processing") return "parsing";
  if (status === "review") return "review-needed";
  if (status === "complete") return "linked";
  return "extraction-complete";
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FilesAll = () => {
  const { isDemoMode } = useDataMode();
  const { data: rawFiles = [], isLoading } = useAllFiles();
  const [category, setCategory] = useState<FileCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const files = useMemo(() => rawFiles.map((f: FilesAllRow) => ({
    ...f,
    domain: classifyDomain(f),
    trust: trustFromSensitivity(f.sensitivity),
    stage: stageFromStatus(f.status),
    linked: f.status === "complete",
    extracted: !!f.extracted_data?.text,
  })), [rawFiles]);

  const filtered = useMemo(() => {
    let result = category === "all" ? files : files.filter(f => f.domain === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.filename.toLowerCase().includes(q) ||
        (f.extracted_data?.text || "").toLowerCase().includes(q) ||
        (f.classification || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [files, category, searchQuery]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="All Files"
        subtitle={`${files.length} files across all domains`}
        actions={<SitaButton variant="primary"><Upload className="h-4 w-4" /> Upload</SitaButton>}
      />

      <FileUploader />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Files" value={files.length} icon={FolderOpen} />
        <KPITile label="Verified" value={files.filter(f => f.trust === "verified").length} icon={Shield} />
        <KPITile label="Linked" value={files.filter(f => f.linked).length} icon={Link2} />
        <KPITile label="Extracted" value={files.filter(f => f.extracted).length} sub="OCR & classification done" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search files by name, content, entity, or extracted fact..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
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

      {isLoading ? (
        <SectionSkeleton cards={4} columns={1} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files found" description="Upload files to get started, or adjust your filters" />
      ) : (
        <div className="space-y-2">
          {filtered.map((file: FilesAllRow) => (
            <SitaCard key={file.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(file.mime_type?.split("/")[1] || "file")}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{formatSize(file.size_bytes)}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(file.created_at), "MMM d")}</span>
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground capitalize">{file.domain}</span>
                      {file.classification && (
                        <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-primary">{file.classification}</span>
                      )}
                      {file.linked && <span className="flex items-center gap-1 text-xs text-primary"><Link2 className="h-3 w-3" /> Linked</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ProcessingStageBadge stage={file.stage} />
                  <SensitivityBadge level={file.sensitivity as SensitivityLevel} />
                  <TrustBadge level={file.trust} size="sm" />
                  <SitaButton variant="ghost" size="sm"><Eye className="h-4 w-4" /></SitaButton>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FilesAll;
