// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Home (Pulse Summary)
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { PulseCard } from "@/components/mobile/PulseCard";
import { useNavigate } from "react-router-dom";
import { Heart, TrendingUp, Shield, Wallet, Calendar, Users, ArrowRight } from "lucide-react";

const quickActions = [
  { label: "Approvals", path: "/mobile/approvals", count: 3 },
  { label: "Alerts", path: "/mobile/alerts", count: 5 },
  { label: "Proof Log", path: "/mobile/proof", count: 12 },
  { label: "Boardroom", path: "/mobile/boardroom", count: 0 },
];

const MobileHome = () => {
  const navigate = useNavigate();

  return (
    <MobileShell title="Pulse">
      {/* Health summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <PulseCard icon={Heart} label="System Health" value="97%" trend="up" accent="green" />
        <PulseCard icon={TrendingUp} label="Revenue MTD" value="$42.8K" trend="up" accent="purple" />
        <PulseCard icon={Shield} label="Trust Score" value="94/100" trend="stable" accent="green" />
        <PulseCard icon={Wallet} label="Safe to Spend" value="$8,240" trend="down" accent="amber" />
        <PulseCard icon={Calendar} label="Tasks Today" value="6 items" accent="purple" />
        <PulseCard icon={Users} label="Active Leads" value="23" trend="up" accent="green" />
      </div>

      {/* Quick actions */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h2>
      <div className="space-y-1.5">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">{action.label}</span>
            <div className="flex items-center gap-2">
              {action.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  {action.count}
                </span>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Latest Activity</h2>
      <div className="space-y-2">
        {[
          { time: "2m ago", action: "Invoice #1042 payment received", domain: "business" },
          { time: "15m ago", action: "Reserve contribution auto-executed", domain: "finance" },
          { time: "1h ago", action: "Grocery list generated for the week", domain: "concierge" },
          { time: "3h ago", action: "Lead scoring recalculated — 4 promoted", domain: "business" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/20 bg-card/50">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs">{item.action}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground capitalize">{item.domain}</span>
                <span className="text-[10px] text-muted-foreground">· {item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileHome;
