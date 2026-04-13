import { useNavigate } from "react-router-dom";
import { DollarSign, Users, TrendingUp, Target, Briefcase, Sparkles } from "lucide-react";
import { BusinessStatCard } from "@/components/business/BusinessStatCard";
import { BusinessMoneyFlow } from "@/components/business/BusinessMoneyFlow";
import { BusinessRecentActivity } from "@/components/business/BusinessRecentActivity";
import { BusinessQuickActions } from "@/components/business/BusinessQuickActions";

const BusinessOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#0a0a12] p-6 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BusinessStatCard
          label="Pipeline Value"
          value="$42.8K"
          change="+12.5% vs last month"
          trend="up"
          icon={Target}
          gradientFrom="hsl(265 55% 40%)"
          gradientTo="hsl(285 50% 30%)"
        />
        <BusinessStatCard
          label="Revenue"
          value="$18.4K"
          change="+8.2% this month"
          trend="up"
          icon={DollarSign}
          gradientFrom="hsl(160 55% 35%)"
          gradientTo="hsl(175 50% 28%)"
        />
        <BusinessStatCard
          label="Customers"
          value="124"
          change="+3 new this week"
          trend="up"
          icon={Users}
          gradientFrom="hsl(35 70% 45%)"
          gradientTo="hsl(25 65% 35%)"
        />
        <BusinessStatCard
          label="Conversion"
          value="34%"
          change="+4pts vs last quarter"
          trend="up"
          icon={TrendingUp}
          gradientFrom="hsl(195 60% 40%)"
          gradientTo="hsl(210 55% 32%)"
        />
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
            <h3 className="text-sm font-semibold text-white/90">Business Advisor</h3>
          </div>
          <p className="text-[12px] text-white/50 leading-relaxed flex-1">
            3 leads aging past 5 days — conversion drops 40% after day 7. Revenue autopilot recovered <span className="text-emerald-400 font-medium">$4,200</span> this week. Consider prioritizing Emily Watson's follow-up today.
          </p>
          <button
            onClick={() => navigate("/business/leads")}
            className="mt-4 self-start px-4 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-[11px] font-medium hover:bg-violet-500/25 transition-colors"
          >
            Review Leads →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverview;
