import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useNavigate } from "react-router-dom";
import { Users, FileText, TrendingUp, Megaphone, ArrowRight, Plus } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const metrics = [
  { icon: Users, label: "Active Leads", value: "23", trend: "+4 this week" },
  { icon: FileText, label: "Open Invoices", value: "7", trend: "$12,400 pending" },
  { icon: TrendingUp, label: "Revenue MTD", value: "$42.8K", trend: "+12% vs last month" },
  { icon: Megaphone, label: "Campaigns", value: "3 active", trend: "2 performing well" },
];

const recentItems = [
  { type: "lead", title: "Sarah Chen — Discovery call scheduled", time: "30m ago" },
  { type: "invoice", title: "Invoice #1042 — Payment received", time: "2h ago" },
  { type: "lead", title: "Marcus Johnson — Proposal sent", time: "4h ago" },
  { type: "invoice", title: "Invoice #1038 — Overdue 3 days", time: "1d ago" },
];

const MobileBusiness = () => {
  const navigate = useNavigate();

  return (
    <MobileShell title="Business">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      {/* Quick add */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
        <Plus className="h-4 w-4" />
        New Lead or Invoice
      </button>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-3 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-lg font-semibold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Recent */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h2>
      <div className="space-y-1.5">
        {recentItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border/20 bg-card/50">
            <div className={`h-2 w-2 rounded-full shrink-0 ${item.type === "lead" ? "bg-primary" : "bg-accent"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.time}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileBusiness;
