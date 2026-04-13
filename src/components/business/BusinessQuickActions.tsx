import { useNavigate } from "react-router-dom";
import { FileText, UserPlus, Phone, Receipt } from "lucide-react";

const ACTIONS = [
  { label: "Send Invoice", icon: FileText, path: "/business/invoices", color: "text-emerald-400" },
  { label: "Add Lead", icon: UserPlus, path: "/business/leads", color: "text-violet-400" },
  { label: "Schedule Call", icon: Phone, path: "/business/follow-through", color: "text-blue-400" },
  { label: "Create Quote", icon: Receipt, path: "/business/quotes", color: "text-amber-400" },
];

export function BusinessQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-[#12121e] border border-[#1a1a2e] p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
              <a.icon className={`h-5 w-5 ${a.color}`} />
            </div>
            <span className="text-[11px] font-medium text-white/60">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
