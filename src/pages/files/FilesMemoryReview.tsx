import { SitaPageHeader, SitaSectionHeader, SitaCard } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { MemoryReviewCard } from "@/components/sita/FilesComponents";
import { Brain, Eye, Shield, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const memoryItems = [
  { learned: "Apex Corp contract auto-renews on March 15, 2025 with 60-day termination notice", source: "Service_Agreement_Apex_Corp.pdf", writtenTo: "Business Memory · Customer Graph", canCorrect: true, canForget: true },
  { learned: "Marcus Johnson prefers Net-30 payment terms and typically pays within 22 days", source: "Invoice history (3 invoices)", writtenTo: "Customer Graph · Payment Patterns", canCorrect: true, canForget: true },
  { learned: "Monthly AWS spend averages $2,340 with Q1 spike pattern", source: "Bank statements + receipts (6 files)", writtenTo: "Money Memory · Subscription Intelligence", canCorrect: true, canForget: false },
  { learned: "School enrollment deadline is April 15 — requires immunization records + proof of residency", source: "School_Enrollment_2024.pdf", writtenTo: "Household Memory · Calendar", canCorrect: true, canForget: true },
  { learned: "Home insurance renews April 30 with $120/mo premium increase", source: "Insurance_Renewal_Notice.pdf", writtenTo: "Money Memory · Bills · Governed Docs", canCorrect: true, canForget: false },
  { learned: "Hawaii trip Apr 12-18, Marriott Wailea at $289/night — total estimated $2,023", source: "Travel_Hotel_Confirmation.pdf", writtenTo: "Travel Memory · Calendar · Money", canCorrect: true, canForget: true },
];

const graphLinks = [
  { entity: "Apex Corp", linkedItems: ["Contract", "Invoice #1038", "Bill reminder", "Business Boardroom"], linkCount: 4 },
  { entity: "Marcus Johnson", linkedItems: ["3 Invoices", "2 Quotes", "Customer record"], linkCount: 6 },
  { entity: "Hawaii Trip", linkedItems: ["Hotel confirmation", "Calendar block", "Prep checklist", "Budget item"], linkCount: 4 },
  { entity: "Westwood Academy", linkedItems: ["Enrollment form", "Calendar deadline", "Household task"], linkCount: 3 },
];

const FilesMemoryReview = () => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
    <SitaPageHeader title="Memory Review" subtitle="What the system learned from your files — review, correct, or forget" />

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPITile label="Memory Items" value={memoryItems.length} icon={Brain} sub="From uploaded files" />
      <KPITile label="Graph Links" value={graphLinks.reduce((s, g) => s + g.linkCount, 0)} icon={Eye} sub="Cross-domain connections" />
      <KPITile label="Corrections" value={2} icon={RotateCcw} sub="This month" />
      <KPITile label="Forgotten Items" value={0} icon={Trash2} sub="User-removed" />
    </div>

    <SitaSectionHeader title="What the System Learned" subtitle="Each item shows source, destination, and your control options" />
    <div className="space-y-3">
      {memoryItems.map((item, i) => <MemoryReviewCard key={i} {...item} />)}
    </div>

    <SitaSectionHeader title="Entity Graph Links" subtitle="How files created cross-domain connections" />
    <div className="grid gap-3 sm:grid-cols-2">
      {graphLinks.map((g, i) => (
        <SitaCard key={i} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 font-display text-xs font-semibold text-primary">
              {g.entity.split(" ").map(w => w[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{g.entity}</p>
              <p className="text-[10px] text-muted-foreground">{g.linkCount} connections</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.linkedItems.map((item, j) => (
              <span key={j} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{item}</span>
            ))}
          </div>
        </SitaCard>
      ))}
    </div>
  </motion.div>
);

export default FilesMemoryReview;
