// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Approvals
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { ApprovalCard, type ApprovalItem } from "@/components/mobile/ApprovalCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockApprovals: ApprovalItem[] = [
  { id: "apr-001", title: "Payment to vendor — Atlas Corp", domain: "finance", urgency: "high", requestedAt: new Date(Date.now() - 3600000).toISOString(), summary: "Wire transfer $12,500 for Q2 consulting retainer", amountCents: 1250000 },
  { id: "apr-002", title: "Lead reassignment — 8 stale leads", domain: "business", urgency: "medium", requestedAt: new Date(Date.now() - 7200000).toISOString(), summary: "Auto-detected 8 leads with 30+ days no contact. Reassigning to active reps." },
  { id: "apr-003", title: "Cancel subscription — Notion Teams", domain: "finance", urgency: "low", requestedAt: new Date(Date.now() - 14400000).toISOString(), summary: "Detected low usage (12%). Annual renewal in 14 days. Potential savings: $2,400/yr", amountCents: 240000 },
  { id: "apr-004", title: "Travel booking — NYC client visit", domain: "concierge", urgency: "medium", requestedAt: new Date(Date.now() - 21600000).toISOString(), summary: "Flight + hotel for March 15-17 client meeting. Budget: $1,800", amountCents: 180000 },
  { id: "apr-005", title: "Collections escalation — Invoice #892", domain: "business", urgency: "critical", requestedAt: new Date(Date.now() - 1800000).toISOString(), summary: "Invoice 92 days overdue. $8,400 outstanding. Recommend payment plan offer.", amountCents: 840000 },
];

const filters = ["All", "Critical", "Finance", "Business", "Concierge"];

const MobileApprovals = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = mockApprovals.filter((a) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Critical") return a.urgency === "critical";
    return a.domain === activeFilter.toLowerCase();
  });

  return (
    <MobileShell title="Approvals">
      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
              activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} pending approval{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {filtered.map((item) => (
          <ApprovalCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/mobile/approval/${item.id}`)}
          />
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileApprovals;
