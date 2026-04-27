import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, ShieldCheck, Bell, FileText, TrendingUp, FolderOpen,
  Smartphone, AlertTriangle, Camera, Settings, Briefcase, Gavel,
  Terminal, Bot, Activity, RefreshCw, Clock, Mail,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const links = [
  { icon: Terminal, label: "Command", path: "/mobile/command", color: "bg-primary/15 text-primary" },
  { icon: Bot, label: "AI Chat", path: "/mobile/ai-chat", color: "bg-purple-500/15 text-purple-400" },
  { icon: Activity, label: "Monitor", path: "/mobile/system-monitor", color: "bg-cyan-500/15 text-cyan-400" },
  { icon: RefreshCw, label: "Sync", path: "/mobile/sync", color: "bg-blue-500/15 text-blue-400" },
  { icon: Bell, label: "Notifications", path: "/mobile/notifications", color: "bg-amber-500/15 text-amber-400" },
  { icon: Clock, label: "Timeline", path: "/mobile/timeline", color: "bg-teal-500/15 text-teal-400" },
  { icon: Mail, label: "Inbox", path: "/mobile/inbox", color: "bg-rose-500/15 text-rose-400" },
  { icon: Gavel, label: "Boardroom", path: "/mobile/boardroom", color: "bg-violet-500/15 text-violet-400" },
  { icon: ShieldCheck, label: "Approvals", path: "/mobile/approvals", color: "bg-blue-500/15 text-blue-400" },
  { icon: TrendingUp, label: "Investment", path: "/mobile/investment", color: "bg-emerald-500/15 text-emerald-400" },
  { icon: FileText, label: "Proof Log", path: "/mobile/proof", color: "bg-cyan-500/15 text-cyan-400" },
  { icon: FolderOpen, label: "Files", path: "/mobile/files", color: "bg-orange-500/15 text-orange-400" },
  { icon: Camera, label: "Quick Capture", path: "/mobile/capture", color: "bg-pink-500/15 text-pink-400" },
  { icon: Smartphone, label: "Device Trust", path: "/mobile/device-trust", color: "bg-indigo-500/15 text-indigo-400" },
  { icon: AlertTriangle, label: "Emergency", path: "/mobile/emergency", color: "bg-red-500/15 text-red-400" },
  { icon: Settings, label: "Settings", path: "/mobile/settings", color: "bg-muted text-muted-foreground" },
];

const MobileMore = () => {
  const navigate = useNavigate();

  return (
    <MobileShell title="More">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      <div className="grid grid-cols-3 gap-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>
    </MobileShell>
  );
};

export default MobileMore;
