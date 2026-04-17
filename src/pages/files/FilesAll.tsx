import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { fileTypeIcon, SensitivityBadge, ProcessingStageBadge, type SensitivityLevel, type ProcessingStage } from "@/components/sita/FilesComponents";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { useState, useMemo } from "react";
import { FolderOpen, Search, Eye, Link2, Shield, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useAllFiles } from "@/hooks/use-domain-data";
import { FileUploader } from "@/components/sita/FileUploader";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

type FileCategory = "all" | "business" | "money" | "household" | "travel" | "legal" | "sensitive";

function classifyDomain(f: Record<string, any>): string {
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
  const { data: rawFiles = [], isLoading } = useAllFiles();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<FileCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ["all-files"] });
    queryClient.invalidateQueries({ queryKey: ["files-overview"] });
    queryClient.invalidateQueries({ queryKey: ["file-kpis"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const files = useMemo(() => rawFiles.map((f: any) => ({
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

  const selected = filtered.find(f => f.id === selectedFile);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <PageTruthBanner />

      <FileUploader onUploaded={handleUploaded} />

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            <SectionSkeleton cards={4} columns={1} />
          ) : filtered.length === 0 ? (
            <PremiumEmptyState variant="no-data" icon={FolderOpen}
              title={searchQuery ? "No files match your search" : "No files yet"}
              description={searchQuery ? "Try adjusting your search terms or filters" : "Upload files to get started — they'll be automatically classified and linked."}
            />
          ) : (
            filtered.map((file: Record<string, any>) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file.id)}
                className={`rounded-xl border p-4 micro-hover-lift cursor-pointer transition-all ${
                  selectedFile === file.id
                    ? "border-primary/30 bg-primary/5"
                    : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)]"
                }`}
              >
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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5 micro-hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-secondary p-3">{fileTypeIcon(selected.mime_type?.split("/")[1] || "file")}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{selected.filename}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(selected.size_bytes)} · {format(new Date(selected.created_at), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span className="text-foreground capitalize">{selected.domain}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Classification</span><span className="text-foreground">{selected.classification || "Unclassified"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sensitivity</span><SensitivityBadge level={selected.sensitivity as SensitivityLevel} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Processing</span><ProcessingStageBadge stage={selected.stage} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Trust</span><TrustBadge level={selected.trust} size="sm" /></div>
                {selected.extracted_data?.text && (
                  <div className="border-t border-border/30 pt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">EXTRACTED CONTENT</p>
                    <p className="text-xs text-foreground/80 line-clamp-6">{selected.extracted_data.text}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors micro-press">
                  <Eye className="h-3 w-3 inline mr-1" /> View
                </button>
                <button className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors micro-press">
                  <Link2 className="h-3 w-3 inline mr-1" /> Link
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/30 p-8 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Select a file to view details</p>
            </div>
          )}

          <ModuleAdvisorInsight advisorName="File Intelligence Advisor" domain="business" insight={files.length > 0
                ? `${files.length} files indexed across ${new Set(files.map(f => f.domain)).size} domains. ${files.filter(f => !f.linked).length} files still need linking.`
                : "Upload your first files to start building your knowledge base."} linkedItems={["Classification status", "Extraction pipeline"]} />
        </div>
      </div>
    </motion.div>
  );
};

export default FilesAll;
