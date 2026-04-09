import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Lock, Eye, Smartphone, Key, Pause, Play, AlertTriangle, CheckCircle2, Settings2, ChevronRight, Fingerprint, Bell, Globe, RotateCcw, ShieldCheck, ShieldAlert, Wifi, WifiOff, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";


const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const TrustCenter = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [automationsPaused, setAutomationsPaused] = useState(false);
  const [trustMode, setTrustMode] = useState<"suggest" | "approve-execute" | "autonomous">("approve-execute");

  const { data: devices = [] } = useQuery({
    queryKey: ["trust_devices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("device_statuses").select("*").eq("user_id", user.id).order("last_seen", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: recentApprovals = [] } = useQuery({
    queryKey: ["trust_approvals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("approval_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: recentReceipts = [] } = useQuery({
    queryKey: ["trust_receipts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("proof_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const displayDevices = devices.length > 0 ? devices : [
    { id: "d1", device_name: "MacBook Pro", device_type: "desktop", os: "macOS 14.3", status: "online", last_seen: new Date().toISOString(), ip_address: "192.168.1.5" },
    { id: "d2", device_name: "iPhone 15 Pro", device_type: "mobile", os: "iOS 17.4", status: "online", last_seen: new Date(Date.now() - 300000).toISOString() },
    { id: "d3", device_name: "iPad Air", device_type: "tablet", os: "iPadOS 17.3", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() },
  ];

  return (
    <div className="min-h-screen pb-12">
      <DemoModeBadge />
      <SitaPageHeader title="Trust Center" subtitle="Control how SITA behaves, what it can do, and what requires your approval" actions={
        <Button size="sm" variant={automationsPaused ? "default" : "outline"} onClick={() => setAutomationsPaused(!automationsPaused)}
          className={cn("gap-1.5 text-xs", automationsPaused && "bg-amber-500 hover:bg-amber-600 text-black")}>
          {automationsPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {automationsPaused ? "Resume Automations" : "Pause All Automations"}
        </Button>
      } />

      {/* Trust Score Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <SitaCard className="p-5 mb-6 bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">Trust Posture: Secure</div>
                <div className="text-xs text-muted-foreground">All systems nominal · {displayDevices.filter((d: any) => d.status === "online").length} devices online · Approvals up to date</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div><div className="text-2xl font-bold text-emerald-400">{recentApprovals.length || 3}</div><div className="text-[10px] text-muted-foreground">Recent Approvals</div></div>
              <div><div className="text-2xl font-bold">{recentReceipts.length || 7}</div><div className="text-[10px] text-muted-foreground">Proof Records</div></div>
              <div><div className="text-2xl font-bold">{displayDevices.length}</div><div className="text-[10px] text-muted-foreground">Trusted Devices</div></div>
            </div>
          </div>
        </SitaCard>
      </motion.div>

      <SitaTabs tabs={[
        { key: "overview", label: "Overview" },
        { key: "autonomy", label: "Autonomy" },
        { key: "devices", label: "Devices" },
        { key: "privacy", label: "Privacy" },
        { key: "permissions", label: "Permissions" },
        { key: "history", label: "History" },
      ]} active={tab} onChange={setTab} className="mb-6" />

      {tab === "overview" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Autonomy level */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4">
              <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Settings2 className="w-3 h-3" /> Autonomy Level</SitaCardTitle>
              <div className="space-y-2">
                {(["suggest", "approve-execute", "autonomous"] as const).map(mode => (
                  <button key={mode} onClick={() => setTrustMode(mode)} className={cn("w-full text-left p-3 rounded-xl border transition-all", trustMode === mode ? "bg-primary/10 border-primary/30" : "border-border/20 hover:bg-accent/20")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium capitalize">{mode.replace("-", " & ")}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {mode === "suggest" && "SITA suggests, you decide and execute everything"}
                          {mode === "approve-execute" && "SITA plans, you approve, SITA executes"}
                          {mode === "autonomous" && "SITA acts within boundaries, you review after"}
                        </div>
                      </div>
                      <div className={cn("w-3 h-3 rounded-full border-2 transition-colors", trustMode === mode ? "bg-primary border-primary" : "border-border/50")} />
                    </div>
                  </button>
                ))}
              </div>
            </SitaCard>
          </motion.div>

          {/* Quick toggles */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4">
              <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Quick Controls</SitaCardTitle>
              <div className="space-y-3">
                {[
                  { label: "Require approval for payments > $500", key: "payments", defaultOn: true },
                  { label: "Require approval for outbound emails", key: "emails", defaultOn: true },
                  { label: "Allow automated follow-up reminders", key: "reminders", defaultOn: true },
                  { label: "Enable learning from my actions", key: "learning", defaultOn: false },
                  { label: "Show proof badges on actions", key: "proof", defaultOn: true },
                ].map(toggle => (
                  <div key={toggle.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 transition-colors">
                    <span className="text-xs">{toggle.label}</span>
                    <Switch defaultChecked={toggle.defaultOn} />
                  </div>
                ))}
              </div>
            </SitaCard>
          </motion.div>

          {/* Trusted devices */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4">
              <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> Trusted Devices</SitaCardTitle>
              <div className="space-y-2">
                {displayDevices.map((dev: any) => (
                  <div key={dev.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full", dev.status === "online" ? "bg-emerald-400" : "bg-muted-foreground/30")} />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{dev.device_name}</div>
                      <div className="text-[10px] text-muted-foreground">{dev.os || dev.device_type}</div>
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1.5 border-border/20">{dev.status}</Badge>
                  </div>
                ))}
              </div>
            </SitaCard>
          </motion.div>

          {/* Emergency actions */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4 border-red-500/10">
              <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-red-400" /> Emergency Actions</SitaCardTitle>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-xs gap-2 border-amber-500/20 text-amber-400 hover:bg-amber-500/10"><Pause className="w-3 h-3" /> Pause All Automations</Button>
                <Button variant="outline" className="w-full justify-start text-xs gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"><Lock className="w-3 h-3" /> Lock to Suggest-Only Mode</Button>
                <Button variant="outline" className="w-full justify-start text-xs gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"><RotateCcw className="w-3 h-3" /> Revoke All Device Trust</Button>
              </div>
            </SitaCard>
          </motion.div>
        </motion.div>
      )}

      {tab === "devices" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {displayDevices.map((dev: any) => (
            <SitaCard key={dev.id} className="p-4" hover>
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", dev.status === "online" ? "bg-emerald-500/15" : "bg-muted/20")}>
                  {dev.device_type === "mobile" ? <Smartphone className={cn("w-5 h-5", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")} /> :
                    dev.device_type === "tablet" ? <Smartphone className={cn("w-5 h-5", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")} /> :
                    <Globe className={cn("w-5 h-5", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")} />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{dev.device_name}</div>
                  <div className="text-xs text-muted-foreground">{dev.os} {dev.ip_address ? `· ${dev.ip_address}` : ""}</div>
                </div>
                <div className={cn("flex items-center gap-1.5 text-xs", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")}>
                  {dev.status === "online" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {dev.status}
                </div>
                <Button size="sm" variant="outline" className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">Revoke</Button>
              </div>
            </SitaCard>
          ))}
        </motion.div>
      )}

      {(tab === "autonomy" || tab === "privacy" || tab === "permissions" || tab === "history") && (
        <EmptyState icon={Shield} title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Settings`} description={`Detailed ${tab} controls and history will be available here`} />
      )}
    </div>
  );
};

export default TrustCenter;
