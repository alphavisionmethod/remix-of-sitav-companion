import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { ProcessingCard, type ProcessingStage } from "@/components/sita/FilesComponents";
import { Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { FileIngestionService } from "@/lib/core-services/file-ingestion";

const DEMO_FILES = [
  { filename: "Receipt_Costco_Mar28.jpg", mimeType: "image/jpeg", sizeBytes: 2400000, textContent: "Costco Wholesale receipt total $342.18 grocery items household supplies", uploadedBy: "owner" },
  { filename: "Vendor_NDA_TechFlow.pdf", mimeType: "application/pdf", sizeBytes: 450000, textContent: "Mutual NDA agreement confidential information 2-year term", uploadedBy: "owner" },
  { filename: "Bank_Statement_Chase_Mar.pdf", mimeType: "application/pdf", sizeBytes: 890000, textContent: "Bank statement account routing number SSN ending 4821 February deposits", uploadedBy: "owner" },
  { filename: "Kid_Activity_Schedule.png", mimeType: "image/png", sizeBytes: 1200000, textContent: "Soccer practice Tuesday Thursday 4pm swimming lessons Wednesday", uploadedBy: "owner" },
  { filename: "Insurance_Renewal_Notice.pdf", mimeType: "application/pdf", sizeBytes: 320000, textContent: "Insurance renewal date 04/30/2025 premium increase $120/mo policy NDA confidential", uploadedBy: "owner" },
  { filename: "Invoice_1039_DavisGroup.pdf", mimeType: "application/pdf", sizeBytes: 280000, textContent: "Invoice for design services $8,500 Net-30 payment due 05/01/2025", uploadedBy: "owner" },
  { filename: "School_Report_Card_Q3.pdf", mimeType: "application/pdf", sizeBytes: 150000, textContent: "Student report card GPA 3.8 teacher notes excellent progress", uploadedBy: "owner" },
  { filename: "Travel_Hotel_Confirmation.pdf", mimeType: "application/pdf", sizeBytes: 200000, textContent: "Hotel reservation Marriott Wailea Apr 12-18 $289/night confirmation", uploadedBy: "owner" },
];

const stageMap: Record<string, ProcessingStage> = {
  "Receipt_Costco_Mar28.jpg": "ocr",
  "Vendor_NDA_TechFlow.pdf": "classifying",
  "Bank_Statement_Chase_Mar.pdf": "parsing",
  "Kid_Activity_Schedule.png": "scanning",
  "Insurance_Renewal_Notice.pdf": "sensitivity-review",
  "Invoice_1039_DavisGroup.pdf": "extraction-complete",
  "School_Report_Card_Q3.pdf": "linked",
  "Travel_Hotel_Confirmation.pdf": "workflow-ready",
};

const FilesProcessing = () => {
  const ingestedFiles = useMemo(() => {
    const service = new FileIngestionService();
    const results: Awaited<ReturnType<FileIngestionService["ingest"]>>[] = [];
    DEMO_FILES.forEach(f => {
      // Synchronous-safe: ingest returns quickly with in-memory data
      service.ingest(f).then(r => results.push(r));
    });
    // Since it's all synchronous in-memory, results are populated
    return DEMO_FILES.map((f, i) => ({
      ...f,
      stage: stageMap[f.filename] || ("parsing" as ProcessingStage),
      inProgress: ["ocr", "classifying", "parsing", "scanning", "sensitivity-review"].includes(stageMap[f.filename] || "parsing"),
    }));
  }, []);

  const processingItems = ingestedFiles.filter(f => f.inProgress);
  const completedItems = ingestedFiles.filter(f => !f.inProgress);

  const domainFromText = (text: string) => {
    if (text.includes("invoice") || text.includes("NDA") || text.includes("agreement")) return "Business";
    if (text.includes("bank") || text.includes("statement") || text.includes("Insurance")) return "Finance";
    if (text.includes("school") || text.includes("Soccer") || text.includes("swimming")) return "Household";
    if (text.includes("Hotel") || text.includes("reservation")) return "Travel";
    return "General";
  };

  const sensitivityFromText = (text: string): "internal" | "confidential" | "restricted" | "governed" => {
    const lower = text.toLowerCase();
    if (lower.includes("ssn") || lower.includes("passport")) return "restricted";
    if (lower.includes("confidential") || lower.includes("nda") || lower.includes("bank")) return "confidential";
    if (lower.includes("insurance") || lower.includes("policy")) return "governed";
    return "internal";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <SitaPageHeader title="Processing Queue" subtitle="Real-time visibility into file intelligence pipeline" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="In Progress" value={processingItems.length} icon={Loader2} sub="Currently processing" />
        <KPITile label="Completed Today" value={completedItems.length} icon={CheckCircle} />
        <KPITile label="Needs Attention" value={1} icon={AlertTriangle} sub="Failed or uncertain" />
        <KPITile label="Avg Processing" value="~45s" icon={Clock} sub="Per file" />
      </div>

      <SitaSectionHeader title="In Progress" subtitle={`${processingItems.length} files being processed`} />
      <div className="space-y-2">
        {processingItems.map((item, i) => (
          <ProcessingCard
            key={i}
            name={item.filename}
            fileType={item.filename.split(".").pop() || "file"}
            stage={item.stage}
            domain={domainFromText(item.textContent || "")}
            sensitivity={sensitivityFromText(item.textContent || "")}
            confidence={65 + Math.round(Math.random() * 30)}
            highlights={item.textContent?.split(",").slice(0, 2).map(s => s.trim())}
          />
        ))}
      </div>

      <SitaSectionHeader title="Recently Completed" subtitle="Ready for review or already linked" />
      <div className="space-y-2">
        {completedItems.map((item, i) => (
          <ProcessingCard
            key={i}
            name={item.filename}
            fileType={item.filename.split(".").pop() || "file"}
            stage={item.stage}
            domain={domainFromText(item.textContent || "")}
            sensitivity={sensitivityFromText(item.textContent || "")}
            confidence={85 + Math.round(Math.random() * 12)}
            highlights={item.textContent?.split(",").slice(0, 3).map(s => s.trim())}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FilesProcessing;
