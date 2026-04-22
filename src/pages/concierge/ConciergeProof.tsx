import { useAuth } from "@/contexts/AuthContext";
import { KPITile, SitaTabs, ProofCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConciergeProofChip, ConciergeReceiptViewer, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import type { ReceiptRecord } from "@/components/concierge";
import { useState } from "react";
import { Shield, CheckCircle, Clock, FileText, ShoppingCart, Calendar, Wrench, GraduationCap, Plane, Gift } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useDataMode } from "@/contexts/DataModeContext";


interface ProofRecord {
  id: string;
  action: string;
  category: string;
  who: string;
  timestamp: string;
  result: "completed" | "confirmed" | "submitted" | "sent" | "recorded";
  verification: "verified" | "pending" | "unverified";
  linkedItem?: string;
  details?: string;
}

const proofRecords: ProofRecord[] = [
  { id: "1", action: "Grocery order placed — 14 items for school lunches", category: "Grocery", who: "You", timestamp: "Today 9:15 AM", result: "completed", verification: "verified", linkedItem: "Weekly grocery workflow", details: "$87.42 at Whole Foods" },
  { id: "2", action: "Dentist appointment confirmed — Emma & Liam", category: "Appointment", who: "You", timestamp: "Yesterday 2:30 PM", result: "confirmed", verification: "verified", linkedItem: "Dr. Patel — Next Thursday", details: "Confirmation #DPT-4421" },
  { id: "3", action: "Permission slip signed and returned — Field trip", category: "School", who: "Partner", timestamp: "Yesterday 7:45 AM", result: "submitted", verification: "verified", linkedItem: "Lincoln Elementary — Science Museum", details: "Handed to Mrs. Thompson" },
  { id: "4", action: "HVAC maintenance scheduled", category: "Provider", who: "Partner", timestamp: "Mar 30", result: "confirmed", verification: "verified", linkedItem: "ComfortAir — Apr 8", details: "Service window 2–4 PM" },
  { id: "5", action: "Birthday gift ordered — Mom's spa card + photo book", category: "Events", who: "You", timestamp: "Mar 29", result: "completed", verification: "verified", linkedItem: "Mom's birthday — Apr 14", details: "$120 — arrives Apr 11" },
  { id: "6", action: "Travel insurance purchased — Spring break trip", category: "Travel", who: "You", timestamp: "Mar 28", result: "recorded", verification: "pending", linkedItem: "Family vacation — Apr 20", details: "Policy #TRV-88291" },
  { id: "7", action: "Carpool duty completed — morning route", category: "Transport", who: "You", timestamp: "Today 8:00 AM", result: "completed", verification: "verified", details: "3 kids dropped at Lincoln Elementary" },
  { id: "8", action: "Thank-you message sent — Johnson dinner party", category: "Social", who: "Partner", timestamp: "Today 10:00 AM", result: "sent", verification: "pending", linkedItem: "Johnson family follow-up" },
];

const ConciergeProof = () => {
  const { isDemo: isDemoMode } = useAuth();
  const { isDemoMode } = useDataMode();
  const [view, setView] = useState("all");
  const verified = proofRecords.filter(p => p.verification === "verified").length;
  const pending = proofRecords.filter(p => p.verification === "pending").length;

  const filtered = view === "verified" ? proofRecords.filter(p => p.verification === "verified")
    : view === "pending" ? proofRecords.filter(p => p.verification === "pending")
    : proofRecords;

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      {!isDemoMode ? (
        <ConciergeEmptyState domain="generic" title="No proof records yet" description="As you complete tasks and confirmations, verified records will appear here — giving you a clear audit trail of everything handled." />
      ) : (<>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Records" value={String(proofRecords.length)} icon={Shield} />
        <KPITile label="Verified" value={String(verified)} icon={CheckCircle} sub="Confirmed actions" />
        <KPITile label="Pending" value={String(pending)} icon={Clock} sub="Awaiting verification" />
        <KPITile label="This Week" value={String(proofRecords.filter(p => p.timestamp.includes("Today") || p.timestamp.includes("Yesterday")).length)} icon={FileText} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Records" },
          { key: "verified", label: "Verified" },
          { key: "pending", label: "Pending" },
        ]}
        active={view}
        onChange={setView}
      />

      {/* Receipt Viewer — expanded view */}
      <ConciergeReceiptViewer records={filtered.map(p => ({
        id: p.id,
        action: p.action,
        timestamp: p.timestamp,
        result: p.result,
        verification: p.verification === "verified" ? "verified" as const : p.verification === "pending" ? "pending" as const : "unverified" as const,
        details: p.details,
        who: p.who,
        category: p.category,
        linkedItem: p.linkedItem,
      }))} />
      </>)}
    </ConciergePageWrapper>
  );
};

export default ConciergeProof;
