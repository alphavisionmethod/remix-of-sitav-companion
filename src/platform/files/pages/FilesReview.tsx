import { KPITile, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { ClassificationCard, ExtractionReviewCard } from "@/platform/sita/components/sita/FilesComponents";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { useState, useMemo } from "react";
import { Eye, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useFilesByStatus, useAllFiles } from "@/hooks/use-domain-data";

function classifyDomainFromFile(f: Record<string, any>): string {
  const text = `${f.filename} ${f.extracted_data?.text || ""} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract")) return "Business";
  if (text.includes("bank") || text.includes("receipt")) return "Finance";
  if (text.includes("school") || text.includes("kid")) return "Household";
  if (text.includes("travel") || text.includes("hotel")) return "Travel";
  return "General";
}

const FilesReview = () => {
  const [tab, setTab] = useState<"classification" | "extraction">("classification");
  const { data: reviewFiles = [], isLoading: loadingReview } = useFilesByStatus("review");
  const { data: allFiles = [], isLoading: loadingAll } = useAllFiles();

  const classificationItems = useMemo(() =>
    allFiles
      .filter((f: Record<string, any>) => !f.classification || f.status === "review")
      .map((f: Record<string, any>) => ({
        name: f.filename,
        fileType: f.mime_type?.split("/")[1] || "file",
        inferredDomain: classifyDomainFromFile(f),
        inferredType: f.classification || "Unknown",
        confidence: f.classification ? 72 : 45,
        reason: f.extracted_data?.text
          ? `Contains: ${(f.extracted_data.text as string).slice(0, 100)}...`
          : "No text extracted — manual review needed",
        sensitivity: (f.sensitivity || "internal") as "internal" | "confidential" | "restricted" | "governed",
      })),
    [allFiles]
  );

  const extractionItems = useMemo(() =>
    allFiles
      .filter((f: Record<string, any>) => f.extracted_data?.text && f.status !== "processing")
      .slice(0, 10)
      .map((f: Record<string, any>) => {
        const text = (f.extracted_data?.text || "") as string;
        const facts: Array<{ label: string; value: string; type: "entity" | "amount" | "obligation" | "deadline"; confirmed?: boolean }> = [];
        const amounts = text.match(/\$[\d,]+\.?\d*/g);
        if (amounts) amounts.slice(0, 2).forEach(a => facts.push({ label: "Amount", value: a, type: "amount" }));
        const dates = text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s*\d{4}\b/gi);
        if (dates) dates.slice(0, 2).forEach(d => facts.push({ label: "Date", value: d, type: "deadline" }));
        if (facts.length === 0) {
          facts.push({ label: "Content", value: text.slice(0, 80), type: "entity" });
        }
        return { name: f.filename, fileType: f.mime_type?.split("/")[1] || "file", facts };
      }),
    [allFiles]
  );

  const isLoading = loadingReview || loadingAll;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Classification Review" value={classificationItems.length} icon={Eye} sub="Need confirmation" />
        <KPITile label="Extraction Review" value={extractionItems.length} icon={FileText} sub="Facts to verify" />
        <KPITile label="Review Queue" value={reviewFiles.length} icon={AlertTriangle} sub="Pending" />
        <KPITile label="Total Files" value={allFiles.length} icon={CheckCircle} />
      </div>

      <SitaTabs
        tabs={[
          { key: "classification", label: "Classification", count: classificationItems.length },
          { key: "extraction", label: "Extraction", count: extractionItems.length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "classification" | "extraction")}
      />

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : tab === "classification" ? (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Awaiting Classification Confirmation</h3>
          {classificationItems.length > 0 ? (
            classificationItems.map((item, i) => <ClassificationCard key={i} {...item} />)
          ) : (
            <PremiumEmptyState variant="no-data" icon={CheckCircle} title="All files classified" description="No files need classification review right now." />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Extracted Facts Review</h3>
          {extractionItems.length > 0 ? (
            extractionItems.map((item, i) => <ExtractionReviewCard key={i} {...item} />)
          ) : (
            <PremiumEmptyState variant="no-data" icon={FileText} title="No extractions to review" description="Upload files with text content to extract facts." />
          )}
        </div>
      )}

      <ModuleAdvisorInsight advisorName="Review Center Advisor" domain="business" insight={classificationItems.length + extractionItems.length > 0
            ? `${classificationItems.length} classifications and ${extractionItems.length} extractions awaiting your review. Confirming these improves future accuracy.`
            : "All reviews complete. The system will flag new items as files are processed."} linkedItems={["Classification accuracy", "Extraction quality"]} />
    </motion.div>
  );
};

export default FilesReview;
