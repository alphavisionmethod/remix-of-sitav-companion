import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Briefcase, DollarSign, Headphones, FolderOpen, CheckCircle, BarChart3,
  Settings, MessageSquare, Bell, Users, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color?: string;
}

const dockApps: DockItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Business", path: "/business" },
  { icon: DollarSign, label: "Money", path: "/money" },
  { icon: Headphones, label: "Concierge", path: "/concierge" },
  { icon: FolderOpen, label: "Files", path: "/files" },
  { icon: CheckCircle, label: "Approvals", path: "/approvals" },
  { icon: BarChart3, label: "Boardroom", path: "/boardroom" },
  { icon: Users, label: "Household", path: "/concierge/tasks" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const DockIcon = ({ item, isActive }: { item: DockItem; isActive: boolean }) => {
  const navigate = useNavigate();
  const Icon = item.icon;

  return (
    <button
      onClick={() => navigate(item.path)}
      className="dock-icon group relative flex flex-col items-center"
      title={item.label}
    >
      <div className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
        "hover:scale-125 hover:-translate-y-2 hover:shadow-glow-purple",
        isActive
          ? "bg-primary/20 shadow-glow-purple"
          : "bg-secondary/60 hover:bg-secondary"
      )}>
        <Icon className={cn(
          "h-5 w-5 transition-colors",
          isActive ? "text-primary" : "text-foreground/70 group-hover:text-foreground"
        )} strokeWidth={1.8} />
      </div>
      {/* Active dot */}
      {isActive && (
        <div className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-primary" />
      )}
      {/* Tooltip */}
      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="rounded-md bg-foreground/90 px-2 py-0.5 text-[11px] font-medium text-background whitespace-nowrap">
          {item.label}
        </div>
      </div>
    </button>
  );
};

export const MacDock = ({
  onChatOpen,
  onNotifOpen,
  onTimelineOpen,
}: {
  onChatOpen: () => void;
  onNotifOpen: () => void;
  onTimelineOpen: () => void;
}) => {
  const location = useLocation();
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="mac-dock fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1.5 rounded-2xl border border-border/40 glass-heavy px-3 py-2 shadow-lg">
        {/* App icons */}
        {dockApps.map((item) => (
          <DockIcon key={item.path} item={item} isActive={isActive(item.path)} />
        ))}

        {/* Separator */}
        <div className="mx-1.5 h-8 w-px bg-border/40" />

        {/* System: Timeline */}
        <button
          onClick={onTimelineOpen}
          className="dock-icon group relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary hover:scale-125 hover:-translate-y-2 transition-all duration-200"
          title="Timeline"
        >
          <Clock className="h-5 w-5 text-foreground/70 group-hover:text-foreground" strokeWidth={1.8} />
        </button>

        {/* System: Notifications */}
        <button
          onClick={onNotifOpen}
          className="dock-icon group relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary hover:scale-125 hover:-translate-y-2 transition-all duration-200"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground/70 group-hover:text-foreground" strokeWidth={1.8} />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        </button>

        {/* System: Advisor Chat */}
        <button
          onClick={onChatOpen}
          className="dock-icon group relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary hover:scale-125 hover:-translate-y-2 transition-all duration-200"
          title="Advisor Chat"
        >
          <MessageSquare className="h-5 w-5 text-foreground/70 group-hover:text-foreground" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
