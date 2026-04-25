import { DollarSign, UserPlus, AlertTriangle, Phone, FileText } from "lucide-react";

const ACTIVITIES = [
  { id: "1", icon: DollarSign, iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400", desc: "Invoice #1038 paid", date: "2h ago", amount: "+$4,200", status: "success" as const },
  { id: "2", icon: UserPlus, iconBg: "bg-violet-500/20", iconColor: "text-violet-400", desc: "New lead: Michael Park", date: "4h ago", amount: "", status: "pending" as const },
  { id: "3", icon: AlertTriangle, iconBg: "bg-red-500/20", iconColor: "text-red-400", desc: "Invoice #1035 overdue", date: "Today", amount: "$1,800", status: "overdue" as const },
  { id: "4", icon: Phone, iconBg: "bg-blue-500/20", iconColor: "text-blue-400", desc: "Callback: James Rodriguez", date: "Yesterday", amount: "", status: "success" as const },
  { id: "5", icon: FileText, iconBg: "bg-amber-500/20", iconColor: "text-amber-400", desc: "Quote #1039 sent", date: "Yesterday", amount: "$3,200", status: "pending" as const },
];

const STATUS_STYLES = {
  success: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  overdue: "bg-red-500/15 text-red-400",
};

const STATUS_LABELS = { success: "Paid", pending: "Pending", overdue: "Overdue" };

export function BusinessRecentActivity() {
  return (
    <div className="rounded-2xl bg-[#12121e] border border-[#1a1a2e] p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90">Recent Activity</h3>
        <button className="text-[10px] text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-1 flex-1">
        {ACTIVITIES.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center shrink-0`}>
              <a.icon className={`h-3.5 w-3.5 ${a.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/80 truncate">{a.desc}</p>
              <p className="text-[10px] text-white/30">{a.date}</p>
            </div>
            {a.amount && (
              <span className={`text-[12px] font-semibold ${a.amount.startsWith("+") ? "text-emerald-400" : "text-white/60"}`}>
                {a.amount}
              </span>
            )}
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status]}`}>
              {STATUS_LABELS[a.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
