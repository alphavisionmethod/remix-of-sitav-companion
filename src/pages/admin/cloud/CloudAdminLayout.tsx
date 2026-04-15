import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Smartphone, HardDrive, RefreshCw,
  Shield, Wrench, Settings2, Cloud, HeartPulse, Activity,
  Share2, RotateCcw, Database, Fingerprint, Lock, Layers
} from "lucide-react";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "devices", label: "Devices", icon: Smartphone },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "sync", label: "Sync Ops", icon: RefreshCw },
  { key: "sync-objects", label: "Sync Objects", icon: Database },
  { key: "device-identity", label: "Device Identity", icon: Fingerprint },
  { key: "encryption", label: "Encryption", icon: Lock },
  { key: "namespaces", label: "Namespaces", icon: Layers },
  { key: "audit", label: "Audit & Security", icon: Shield },
  { key: "jobs", label: "Jobs & Repair", icon: Wrench },
  { key: "recovery", label: "Recovery", icon: RotateCcw },
  { key: "monitoring", label: "Monitoring", icon: HeartPulse },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "collaboration", label: "Collaboration", icon: Share2 },
  { key: "policy", label: "Policy & Config", icon: Settings2 },
] as const;

export type CloudTab = (typeof tabs)[number]["key"];

interface CloudAdminLayoutProps {
  activeTab: CloudTab;
  onTabChange: (tab: CloudTab) => void;
  children: React.ReactNode;
}

export function CloudAdminLayout({ activeTab, onTabChange, children }: CloudAdminLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Cloud className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cloud Backbone</h1>
          <p className="text-sm text-muted-foreground">Platform administration & operations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export { tabs as cloudTabs };
