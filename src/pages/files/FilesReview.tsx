import { SitaPageHeader, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { ClassificationCard, ExtractionReviewCard } from "@/components/sita/FilesComponents";
import { useState } from "react";
import { Eye, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";

const classificationItems = [
  { name: "Business_Plan_2024.docx", fileType: "docx", inferredDomain: "Business", inferredType: "Strategic Document", confidence: 78, reason: "Contains revenue projections, market analysis, and growth targets", sensitivity: "internal" as const },
  { name: "Mystery_Document_Jan.pdf", fileType: "pdf", inferredDomain: "Finance", inferredType: "Bank Statement", confidence: 62, reason: "Contains transaction rows and account numbers — low image quality reduced confidence", sensitivity: "restricted" as const },
  { name: "Photo_Receipt_Target.jpg", fileType: "screenshot", inferredDomain: "Household", inferredType: "Retail Receipt", confidence: 85, reason: "Retail items detected — household supplies and groceries", sensitivity: "internal" as const },
];

const extractionItems = [
  {
    name: "Service_Agreement_Apex_Corp.pdf", fileType: "contract",
    facts: [
      { label: "Vendor", value: "Apex Corp", type: "entity" as const, confirmed: true },
      { label: "Annual Value", value: "$24,000", type: "amount" as const },
      { label: "Term", value: "12 months", type: "obligation" as const },
      { label: "Auto-Renew", value: "Mar 15, 2025", type: "deadline" as const },
      { label: "Payment Terms", value: "Net-30", type: "obligation" as const },
      { label: "Termination Notice", value: "60 days", type: "deadline" as const },
    ]
  },
  {
    name: "Invoice_1038_Marcus_Johnson.pdf", fileType: "invoice",
    facts: [
      { label: "Customer", value: "Marcus Johnson", type: "entity" as const, confirmed: true },
      { label: "Amount", value: "$4,200", type: "amount" as const },
      { label: "Due Date", value: "Apr 15, 2024", type: "deadline" as const },
      { label: "Service", value: "Brand Strategy Q1", type: "entity" as const },
    ]
  },
  {
    name: "School_Enrollment_2024.pdf", fileType: "form",
    facts: [
      { label: "School", value: "Westwood Academy", type: "entity" as const },
      { label: "Deadline", value: "Apr 15, 2024", type: "deadline" as const },
      { label: "Fee", value: "$850", type: "amount" as const },
      { label: "Documents Needed", value: "Immunization records, proof of residency", type: "obligation" as const },
    ]
  },
];

const FilesReview = () => {
  const [tab, setTab] = useState<"classification" | "extraction">("classification");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <SitaPageHeader title="Review Center" subtitle="Confirm classifications and verify extracted intelligence" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Classification Review" value={classificationItems.length} icon={Eye} sub="Need confirmation" />
        <KPITile label="Extraction Review" value={extractionItems.length} icon={FileText} sub="Facts to verify" />
        <KPITile label="Confirmed Today" value={8} icon={CheckCircle} />
        <KPITile label="Corrections Made" value={2} icon={AlertTriangle} sub="User corrections this week" />
      </div>

      <SitaTabs
        tabs={[
          { key: "classification", label: "Classification", count: classificationItems.length },
          { key: "extraction", label: "Extraction", count: extractionItems.length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "classification" | "extraction")}
      />

      {tab === "classification" && (
        <div className="space-y-3">
          <SitaSectionHeader title="Awaiting Classification Confirmation" subtitle="Review what the system inferred — confirm or adjust" />
          {classificationItems.map((item, i) => <ClassificationCard key={i} {...item} />)}
        </div>
      )}

      {tab === "extraction" && (
        <div className="space-y-3">
          <SitaSectionHeader title="Extracted Facts Review" subtitle="Verify people, dates, amounts, and obligations found in files" />
          {extractionItems.map((item, i) => <ExtractionReviewCard key={i} {...item} />)}
        </div>
      )}
    </motion.div>
  );
};

export default FilesReview;
