import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { getModuleAdaptation } from "@/lib/engines/business-module-adaptations";
import { DollarSign, Users, TrendingUp, Target, Briefcase, Sparkles, CalendarDays, ShoppingCart, Layers, Package } from "lucide-react";
import { BusinessStatCard } from "@/components/business/BusinessStatCard";
import { BusinessMoneyFlow } from "@/components/business/BusinessMoneyFlow";
import { BusinessRecentActivity } from "@/components/business/BusinessRecentActivity";
import { BusinessQuickActions } from "@/components/business/BusinessQuickActions";
import { useMemo } from "react";

const ARCHETYPE_STATS: Record<string, Array<{ label: string; value: string; change: string; icon: any; gradientFrom: string; gradientTo: string }>> = {
  ecommerce: [
    { label: "Orders Today", value: "86", change: "+24% vs yesterday", icon: ShoppingCart, gradientFrom: "hsl(265 55% 40%)", gradientTo: "hsl(285 50% 30%)" },
    { label: "Revenue", value: "$12.4K", change: "+18% this week", icon: DollarSign, gradientFrom: "hsl(160 55% 35%)", gradientTo: "hsl(175 50% 28%)" },
    { label: "Active Buyers", value: "342", change: "+12 today", icon: Users, gradientFrom: "hsl(35 70% 45%)", gradientTo: "hsl(25 65% 35%)" },
    { label: "Conversion Rate", value: "3.8%", change: "+0.4pts this week", icon: TrendingUp, gradientFrom: "hsl(195 60% 40%)", gradientTo: "hsl(210 55% 32%)" },
  ],
  "appointment-based": [
    { label: "Bookings Today", value: "12", change: "2 unconfirmed", icon: CalendarDays, gradientFrom: "hsl(265 55% 40%)", gradientTo: "hsl(285 50% 30%)" },
    { label: "Revenue", value: "$3.6K", change: "+15% vs last week", icon: DollarSign, gradientFrom: "hsl(160 55% 35%)", gradientTo: "hsl(175 50% 28%)" },
    { label: "Clients", value: "84", change: "+5 new this month", icon: Users, gradientFrom: "hsl(35 70% 45%)", gradientTo: "hsl(25 65% 35%)" },
    { label: "No-Show Rate", value: "4%", change: "−2pts vs last month", icon: TrendingUp, gradientFrom: "hsl(195 60% 40%)", gradientTo: "hsl(210 55% 32%)" },
  ],
  "employee-based": [
    { label: "Active Assignments", value: "34", change: "6 overdue", icon: Layers, gradientFrom: "hsl(265 55% 40%)", gradientTo: "hsl(285 50% 30%)" },
    { label: "Revenue", value: "$28.1K", change: "+5% this month", icon: DollarSign, gradientFrom: "hsl(160 55% 35%)", gradientTo: "hsl(175 50% 28%)" },
    { label: "Team Members", value: "18", change: "92% utilization", icon: Users, gradientFrom: "hsl(35 70% 45%)", gradientTo: "hsl(25 65% 35%)" },
    { label: "Completion Rate", value: "87%", change: "+3pts this week", icon: TrendingUp, gradientFrom: "hsl(195 60% 40%)", gradientTo: "hsl(210 55% 32%)" },
  ],
  "brick-and-mortar": [
    { label: "Daily Revenue", value: "$4.2K", change: "+8% vs yesterday", icon: DollarSign, gradientFrom: "hsl(265 55% 40%)", gradientTo: "hsl(285 50% 30%)" },
    { label: "Walk-Ins", value: "47", change: "+12 today", icon: Users, gradientFrom: "hsl(160 55% 35%)", gradientTo: "hsl(175 50% 28%)" },
    { label: "Staff Coverage", value: "94%", change: "1 gap tomorrow", icon: Layers, gradientFrom: "hsl(35 70% 45%)", gradientTo: "hsl(25 65% 35%)" },
    { label: "Inventory Health", value: "Good", change: "3 low-stock SKUs", icon: Package, gradientFrom: "hsl(195 60% 40%)", gradientTo: "hsl(210 55% 32%)" },
  ],
};

const DEFAULT_STATS = [
  { label: "Pipeline Value", value: "$42.8K", change: "+12.5% vs last month", icon: Target, gradientFrom: "hsl(265 55% 40%)", gradientTo: "hsl(285 50% 30%)" },
  { label: "Revenue", value: "$18.4K", change: "+8.2% this month", icon: DollarSign, gradientFrom: "hsl(160 55% 35%)", gradientTo: "hsl(175 50% 28%)" },
  { label: "Customers", value: "124", change: "+3 new this week", icon: Users, gradientFrom: "hsl(35 70% 45%)", gradientTo: "hsl(25 65% 35%)" },
  { label: "Conversion", value: "34%", change: "+4pts vs last quarter", icon: TrendingUp, gradientFrom: "hsl(195 60% 40%)", gradientTo: "hsl(210 55% 32%)" },
];

const BusinessOverview = () => {
  const { navigateTo } = useBusinessNavigation();
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const moduleConfig = getModuleAdaptation("overview", primaryMode);

  const stats = useMemo(() => ARCHETYPE_STATS[primaryMode] || DEFAULT_STATS, [primaryMode]);
  const advisorInsight = useMemo(() => {
    const insights: Record<string, string> = {
      ecommerce: `Cart abandon rate is 68% — recovery automations recaptured <span class="text-emerald-400 font-medium">$2,100</span> this week. 3 high-value carts are still recoverable.`,
      service: `3 proposals aging past 5 days — win rate drops 40% after day 7. Consider prioritizing follow-ups today.`,
      "appointment-based": `2 unconfirmed bookings for today — no-show risk is elevated. Auto-reminders sent, but a direct call may help.`,
      "employee-based": `6 assignments overdue across 3 team members. Jordan T. is at 95% capacity — consider redistribution.`,
      "brick-and-mortar": `Foot traffic is 12% above forecast today. Consider extending evening hours or adding staff coverage.`,
    };
    return insights[primaryMode] || `3 leads aging past 5 days — conversion drops 40% after day 7. Revenue autopilot recovered <span class="text-emerald-400 font-medium">$4,200</span> this week. Consider prioritizing Emily Watson's follow-up today.`;
  }, [primaryMode]);

  return (
    <div className="min-h-full bg-[#0a0a12] p-6 space-y-5">
      {/* Stat Cards — adapted per archetype */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <BusinessStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend="up"
            icon={stat.icon}
            gradientFrom={stat.gradientFrom}
            gradientTo={stat.gradientTo}
          />
        ))}
      </div>

      {/* Middle: Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <BusinessMoneyFlow />
        </div>
        <div className="lg:col-span-2">
          <BusinessRecentActivity />
        </div>
      </div>

      {/* Bottom: Quick Actions + Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BusinessQuickActions />
        <div className="lg:col-span-2 rounded-2xl bg-[#12121e] border border-[#1a1a2e] p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-white/90">{moduleConfig.advisorName}</h3>
          </div>
          <p className="text-[12px] text-white/50 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: advisorInsight }} />
          <button
            onClick={() => navigateTo("leads")}
            className="mt-4 self-start px-4 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-[11px] font-medium hover:bg-violet-500/25 transition-colors"
          >
            {moduleConfig.quickActions[0]} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverview;
