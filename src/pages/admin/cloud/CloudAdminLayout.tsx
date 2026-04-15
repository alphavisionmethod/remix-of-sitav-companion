import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Smartphone, HardDrive, RefreshCw,
  Shield, Wrench, Settings2, Cloud, HeartPulse, Activity,
  Share2, RotateCcw, Database, Fingerprint, Lock, Layers, Scale,
  Building2, Server, Cog, DollarSign, LifeBuoy, FileCheck,
  Timer, ShieldCheck, Flag, PauseCircle, BarChart3, Rocket,
  Key, Globe, Search, Network, ShieldAlert, History, MessageSquare
} from "lucide-react";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "tenants", label: "Tenants", icon: Building2 },
  { key: "devices", label: "Devices", icon: Smartphone },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "storage-health", label: "Storage Health", icon: Server },
  { key: "sync", label: "Sync Ops", icon: RefreshCw },
  { key: "sync-objects", label: "Sync Objects", icon: Database },
  { key: "device-identity", label: "Device Identity", icon: Fingerprint },
  { key: "encryption", label: "Encryption", icon: Lock },
  { key: "namespaces", label: "Namespaces", icon: Layers },
  { key: "workers", label: "Workers", icon: Cog },
  { key: "lifecycle", label: "Lifecycle", icon: Timer },
  { key: "cost", label: "Cost", icon: DollarSign },
  { key: "integrity", label: "Integrity", icon: FileCheck },
  { key: "audit", label: "Audit", icon: Shield },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "feature-flags", label: "Flags", icon: Flag },
  { key: "maintenance", label: "Maintenance", icon: PauseCircle },
  { key: "observability", label: "Observability", icon: BarChart3 },
  { key: "bootstrap", label: "Bootstrap", icon: Rocket },
  { key: "jobs", label: "Jobs & Repair", icon: Wrench },
  { key: "recovery", label: "Recovery", icon: RotateCcw },
  { key: "monitoring", label: "Monitoring", icon: HeartPulse },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "collaboration", label: "Collaboration", icon: Share2 },
  { key: "sharing", label: "Sharing", icon: Share2 },
  { key: "governance", label: "Governance", icon: Shield },
  { key: "policy", label: "Policy", icon: Settings2 },
  // Platform Plane tabs
  { key: "planes", label: "Planes", icon: Layers },
  { key: "rbac", label: "RBAC", icon: Shield },
  { key: "admin-audit", label: "Admin Audit", icon: Search },
  { key: "environments", label: "Environments", icon: Globe },
  { key: "support-safe", label: "Support Safe", icon: LifeBuoy },
  { key: "tokens", label: "Tokens", icon: Key },
  { key: "gateway-routes", label: "Gateway", icon: Network },
  // Part 2 — Platform Glue tabs
  { key: "domain-ownership", label: "Domains", icon: Network },
  { key: "service-identity", label: "Service Auth", icon: Fingerprint },
  { key: "safety-rails", label: "Safety Rails", icon: ShieldAlert },
  { key: "support-cases", label: "Cases", icon: MessageSquare },
  { key: "config-history", label: "Config History", icon: History },
] as const;

export type CloudTab = (typeof tabs)[number]["key"];

interface CloudAdminLayoutProps {
  activeTab: CloudTab;
  onTabChange: (tab: CloudTab) => void;
  children: React.ReactNode;
}

const TAB_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Core", keys: ["dashboard", "users", "tenants", "devices"] },
  { label: "Storage & Sync", keys: ["storage", "storage-health", "sync", "sync-objects"] },
  { label: "Identity & Security", keys: ["device-identity", "encryption", "namespaces", "compliance", "audit"] },
  { label: "Operations", keys: ["workers", "lifecycle", "cost", "integrity", "jobs", "recovery", "monitoring"] },
  { label: "Governance", keys: ["policy", "governance", "feature-flags", "maintenance"] },
  { label: "Collaboration", keys: ["activity", "collaboration", "sharing", "support", "observability", "bootstrap"] },
  { label: "Platform", keys: ["planes", "rbac", "admin-audit", "environments", "support-safe", "tokens", "gateway-routes"] },
  { label: "Platform Glue", keys: ["domain-ownership", "service-identity", "safety-rails", "support-cases", "config-history"] },
];

function getEnvironmentBadge(): { label: string; colorClass: string } {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return { label: "DEV", colorClass: "bg-green-500/20 text-green-400 border-green-500/30" };
  }
  if (url.includes("staging")) {
    return { label: "STAGING", colorClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  }
  return { label: "PROD", colorClass: "bg-destructive/20 text-destructive border-destructive/30" };
}

export function CloudAdminLayout({ activeTab, onTabChange, children }: CloudAdminLayoutProps) {
  const envBadge = getEnvironmentBadge();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Cloud className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cloud Backbone</h1>
          <p className="text-sm text-muted-foreground">Platform administration & operations</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            envBadge.colorClass
          )}>
            <Globe className="h-2.5 w-2.5" />
            {envBadge.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <Shield className="h-2.5 w-2.5" />
            Control Plane
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto p-1 bg-muted/30 rounded-lg border border-border/50">
        {TAB_GROUPS.map((group) => {
          const groupTabs = tabs.filter((t) => group.keys.includes(t.key));
          if (groupTabs.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold px-2 pt-1 pb-0.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {groupTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => onTabChange(tab.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        isActive
                          ? "bg-background text-foreground shadow-sm border border-border/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

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
