import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { ApprovalCard } from "@/platform/experience/components/mobile/ApprovalCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMobileApprovals } from "@/hooks/use-domain-data";
import { ClipboardCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const filters = ["All", "Critical", "Finance", "Business", "Concierge"];

const MobileApprovals = () => {
  const navigate = useNavigate();
  const { data: approvals = [] } = useMobileApprovals();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = approvals.filter((a) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Critical") return a.urgency === "critical";
    return a.domain === activeFilter.toLowerCase();
  });

  return (
    <MobileShell title="Approvals">
      {/* Queue Summary */}
      <div className="mb-4 p-3 rounded-xl bg-card border border-border/40">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Approval Queue</p>
          </div>
          {approvals.filter(a => a.urgency === "critical").length > 0 && (
            <Badge variant="destructive" className="text-[10px] gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              {approvals.filter(a => a.urgency === "critical").length} critical
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{approvals.length} pending across all domains</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border", activeFilter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground hover:text-foreground")}>{f}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-3">{filtered.length} pending approval{filtered.length !== 1 ? "s" : ""}</p>
      <div className="space-y-2">
        {filtered.map((item) => (<ApprovalCard key={item.id} item={item} onClick={() => navigate(`/mobile/approval/${item.id}`)} />))}
      </div>
    </MobileShell>
  );
};

export default MobileApprovals;
