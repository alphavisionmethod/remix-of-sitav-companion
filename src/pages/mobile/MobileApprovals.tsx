// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Approvals
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { ApprovalCard, type ApprovalItem } from "@/components/mobile/ApprovalCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { MOCK_MOBILE_APPROVALS } from "@/lib/mock-data";

=======
import { DEMO_MOBILE_APPROVALS } from "@/lib/demo-data";

const mockApprovals = DEMO_MOBILE_APPROVALS as unknown as ApprovalItem[];
>>>>>>> 622190ca50c098af187c5feed1ffac931cae5666

const filters = ["All", "Critical", "Finance", "Business", "Concierge"];

const MobileApprovals = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_MOBILE_APPROVALS.filter((a) => {
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
