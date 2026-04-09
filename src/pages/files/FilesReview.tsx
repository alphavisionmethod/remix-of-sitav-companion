import { SitaPageHeader, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { ClassificationCard, ExtractionReviewCard } from "@/components/sita/FilesComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { Eye, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useFilesByStatus, useAllFiles } from "@/hooks/use-domain-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



function classifyDomainFromFile(f: any): string {
  const text = `${f.filename} ${f.extracted_data?.text || ""} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract")) return "Business";
  if (text.includes("bank") || text.includes("receipt")) return "Finance";
  if (text.includes("school") || text.includes("kid")) return "Household";
  if (text.includes("travel") || text.includes("hotel")) return "Travel";
  return "General";
}

const FilesReview = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState<"classification" | "extraction">("classification");
  const { data: reviewFiles = [], isLoading: loadingReview } = useFilesByStatus("review");
  const { data: allFiles = [], isLoading: loadingAll } = useAllFiles();

  // Files needing classification review: low-confidence or missing classification
  const classificationItems = useMemo(() =>
    allFiles
      .filter((f: any) => !f.classification || f.status === "review")
      .map((f: any) => ({
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

  // Files with extracted data for fact verification
  const extractionItems = useMemo(() =>
    allFiles
      .filter((f: any) => f.extracted_data?.text && f.status !== "processing")
      .slice(0, 10)
      .map((f: any) => {
        const text = (f.extracted_data?.text || "") as string;
        const facts: Array<{ label: string; value: string; type: "entity" | "amount" | "obligation" | "deadline"; confirmed?: boolean }> = [];

        // Auto-extract facts from text
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
      <DemoModeBadge />
      <SitaPageHeader title="Review Center" subtitle="Confirm classifications and verify extracted intelligence" />

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
          <SitaSectionHeader title="Awaiting Classification Confirmation" subtitle="Review what the system inferred — confirm or adjust" />
          {classificationItems.length > 0 ? (
            classificationItems.map((item, i) => <ClassificationCard key={i} {...item} />)
          ) : (
            <EmptyState icon={CheckCircle} title="All files classified" description="No files need classification review" />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <SitaSectionHeader title="Extracted Facts Review" subtitle="Verify people, dates, amounts, and obligations found in files" />
          {extractionItems.length > 0 ? (
            extractionItems.map((item, i) => <ExtractionReviewCard key={i} {...item} />)
          ) : (
            <EmptyState icon={FileText} title="No extractions to review" description="Upload files with text content to extract facts" />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FilesReview;
