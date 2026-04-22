import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield, Search, Monitor, Smartphone, Cloud, CheckCircle, XCircle,
  MinusCircle, ChevronDown, ChevronUp, Filter, Eye, RotateCcw,
  Lock, Unlock, Wifi, WifiOff, HelpCircle
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";
import { useDataMode } from "@/contexts/DataModeContext";

export type CommandOrigin = "os_local" | "app_remote" | "admin_control_plane";

interface AuthorityEntry {
  id: string;
  action: string;
  domain: string;
  osCanInitiate: boolean;
  appCanInitiate: boolean;
  cloudDecides: boolean;
  appApproves: boolean;
  osExecutes: boolean;
  offlineCapable: boolean;
  rollbackAvailable: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  description: string;
  decisionSurface: "os" | "cloud" | "app" | "os_cloud" | "app_cloud";
  recoverySurface: "os" | "cloud" | "app" | "os_cloud" | "app_cloud";
}

const DEMO_AUTHORITY_DATA: AuthorityEntry[] = [
  { id: "am-1", action: "Install trusted app", domain: "Apps", osCanInitiate: true, appCanInitiate: true, cloudDecides: true, appApproves: false, osExecutes: true, offlineCapable: false, rollbackAvailable: true, riskLevel: "low", description: "Install from official, policy-verified catalog. Cloud validates trust signature, OS handles installation.", decisionSurface: "cloud", recoverySurface: "os" },
  { id: "am-2", action: "Install untrusted app", domain: "Apps", osCanInitiate: true, appCanInitiate: false, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: true, riskLevel: "high", description: "Requires App approval for unknown publisher. Cloud evaluates risk score and policy compliance.", decisionSurface: "cloud", recoverySurface: "os" },
  { id: "am-3", action: "Remote device lock", domain: "Security", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: true, riskLevel: "high", description: "App-exclusive emergency action. Cloud validates identity, OS enforces lock state.", decisionSurface: "app_cloud", recoverySurface: "app_cloud" },
  { id: "am-4", action: "Sync file to device", domain: "Sync", osCanInitiate: true, appCanInitiate: false, cloudDecides: true, appApproves: false, osExecutes: true, offlineCapable: true, rollbackAvailable: false, riskLevel: "low", description: "OS initiates sync, Cloud resolves conflicts and coordinates canonical state.", decisionSurface: "cloud", recoverySurface: "os_cloud" },
  { id: "am-5", action: "Remove trusted device", domain: "Trust", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: false, offlineCapable: false, rollbackAvailable: false, riskLevel: "critical", description: "App-only action. Cloud revokes device trust. Device session terminated remotely.", decisionSurface: "app_cloud", recoverySurface: "app_cloud" },
  { id: "am-6", action: "Export encrypted data", domain: "Security", osCanInitiate: true, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: false, riskLevel: "high", description: "Both surfaces can initiate. App confirms via out-of-band approval. Cloud authorizes key release.", decisionSurface: "cloud", recoverySurface: "cloud" },
  { id: "am-7", action: "Open workspace", domain: "Continuity", osCanInitiate: true, appCanInitiate: false, cloudDecides: false, appApproves: false, osExecutes: true, offlineCapable: true, rollbackAvailable: false, riskLevel: "low", description: "OS-exclusive continuity action. Local state restored from cache or cloud.", decisionSurface: "os", recoverySurface: "os" },
  { id: "am-8", action: "Change trust threshold", domain: "Trust", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: false, offlineCapable: false, rollbackAvailable: true, riskLevel: "high", description: "Admin/App initiated. Cloud evaluates policy impact before applying new threshold.", decisionSurface: "app_cloud", recoverySurface: "cloud" },
  { id: "am-9", action: "Emergency account freeze", domain: "Security", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: false, offlineCapable: false, rollbackAvailable: true, riskLevel: "critical", description: "App-exclusive emergency action. All sessions terminated, all sync paused.", decisionSurface: "app_cloud", recoverySurface: "app_cloud" },
  { id: "am-10", action: "Resume workspace handoff", domain: "Continuity", osCanInitiate: true, appCanInitiate: false, cloudDecides: true, appApproves: false, osExecutes: true, offlineCapable: false, rollbackAvailable: false, riskLevel: "medium", description: "OS initiates continuity handoff. Cloud verifies device trust before releasing state.", decisionSurface: "cloud", recoverySurface: "os_cloud" },
  { id: "am-11", action: "Canary rollout expansion", domain: "Releases", osCanInitiate: false, appCanInitiate: false, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: true, riskLevel: "medium", description: "Admin-plane initiated. Cloud decides based on health metrics. App approves expansion.", decisionSurface: "cloud", recoverySurface: "cloud" },
  { id: "am-12", action: "AI budget policy change", domain: "Intelligence", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: false, offlineCapable: false, rollbackAvailable: true, riskLevel: "medium", description: "App/Admin initiated. Cloud enforces new budget limits across all AI workforce roles.", decisionSurface: "cloud", recoverySurface: "cloud" },
  { id: "am-13", action: "Force sign-out everywhere", domain: "Security", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: false, riskLevel: "critical", description: "App-exclusive. Cloud invalidates all sessions. All OS instances sign out immediately.", decisionSurface: "app_cloud", recoverySurface: "app_cloud" },
  { id: "am-14", action: "Local performance tuning", domain: "Performance", osCanInitiate: true, appCanInitiate: false, cloudDecides: false, appApproves: false, osExecutes: true, offlineCapable: true, rollbackAvailable: true, riskLevel: "low", description: "OS-only. Device-local optimization with no cloud dependency. Fully reversible.", decisionSurface: "os", recoverySurface: "os" },
  { id: "am-15", action: "Force sync all devices", domain: "Sync", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: true, offlineCapable: false, rollbackAvailable: false, riskLevel: "medium", description: "App initiates fleet-wide sync. Cloud orchestrates order and conflict resolution. Each OS executes its sync.", decisionSurface: "cloud", recoverySurface: "os_cloud" },
  { id: "am-16", action: "Delete trusted device", domain: "Trust", osCanInitiate: false, appCanInitiate: true, cloudDecides: true, appApproves: true, osExecutes: false, offlineCapable: false, rollbackAvailable: false, riskLevel: "critical", description: "App initiates permanent device removal. Cloud requires strong reauth. Device session and data purged per policy.", decisionSurface: "app_cloud", recoverySurface: "app_cloud" },
];

const DOMAIN_COLORS: Record<string, string> = {
  Apps: "text-blue-400", Security: "text-red-400", Sync: "text-cyan-400",
  Trust: "text-amber-400", Continuity: "text-purple-400", Releases: "text-green-400",
  Intelligence: "text-indigo-400", Performance: "text-emerald-400",
};

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

function BoolCell({ value }: { value: boolean }) {
  return value
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
    : <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />;
}

export function SurfaceAuthorityMatrix({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(compact);

  const domains = useMemo(() => [...new Set((isDemoMode ? DEMO_AUTHORITY_DATA : [] as typeof DEMO_AUTHORITY_DATA).map(d => d.domain))], []);

  const filtered = useMemo(() => {
    return (isDemoMode ? DEMO_AUTHORITY_DATA : [] as typeof DEMO_AUTHORITY_DATA).filter(e => {
      if (domainFilter !== "all" && e.domain !== domainFilter) return false;
      if (search && !e.action.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, domainFilter]);

  const headers = [
    { label: "Action", className: "text-left min-w-[160px]" },
    { label: "OS Init", icon: Monitor, tooltip: "Can be initiated from the OS" },
    { label: "App Init", icon: Smartphone, tooltip: "Can be initiated from the App" },
    { label: "Cloud Decides", icon: Cloud, tooltip: "Cloud evaluates and decides" },
    { label: "App Approves", icon: Lock, tooltip: "Requires App approval" },
    { label: "OS Executes", icon: Monitor, tooltip: "OS performs the execution" },
    { label: "Decides", icon: Cloud, tooltip: "Decision surface owner" },
    { label: "Recovery", icon: RotateCcw, tooltip: "Recovery surface owner" },
    { label: "Offline", icon: Wifi, tooltip: "Works without cloud connectivity" },
    { label: "Rollback", icon: RotateCcw, tooltip: "Action can be reversed" },
  ];

  const SURFACE_LABELS: Record<string, { label: string; color: string }> = {
    os: { label: "OS", color: "text-blue-400" },
    cloud: { label: "Cloud", color: "text-cyan-400" },
    app: { label: "App", color: "text-purple-400" },
    os_cloud: { label: "OS+Cloud", color: "text-teal-400" },
    app_cloud: { label: "App+Cloud", color: "text-indigo-400" },
  };

  return (
    <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Surface Authority Matrix
            <WhyTooltip explanation="Shows which platform surface (OS, App, Cloud) has authority for each critical action. Use this to understand the governance model." />
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CardContent className="pt-0 space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search actions..."
                    className="pl-8 h-8 text-xs bg-white/[0.02] border-white/[0.06]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={() => setDomainFilter("all")}
                    className={cn("px-2 py-1 rounded text-[10px] font-medium transition-colors",
                      domainFilter === "all" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >All</button>
                  {domains.map(d => (
                    <button
                      key={d}
                      onClick={() => setDomainFilter(d)}
                      className={cn("px-2 py-1 rounded text-[10px] font-medium transition-colors",
                        domainFilter === d ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >{d}</button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {headers.map(h => (
                        <th key={h.label} className={cn("px-3 py-2 font-medium text-muted-foreground", h.className || "text-center w-[80px]")}>
                          <div className="flex items-center justify-center gap-1">
                            {h.icon && <h.icon className="h-3 w-3" />}
                            <span className="text-[9px] uppercase tracking-wider">{h.label}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center w-[70px]">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Risk</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => (
                      <>
                        <tr
                          key={entry.id}
                          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          className={cn(
                            "border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors",
                            i % 2 === 0 && "bg-white/[0.01]"
                          )}
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{entry.action}</span>
                              <Badge variant="outline" className={cn("text-[8px] px-1 py-0", DOMAIN_COLORS[entry.domain])}>
                                {entry.domain}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.osCanInitiate} /></td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.appCanInitiate} /></td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.cloudDecides} /></td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.appApproves} /></td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.osExecutes} /></td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={cn("text-[8px] font-medium", SURFACE_LABELS[entry.decisionSurface]?.color)}>{SURFACE_LABELS[entry.decisionSurface]?.label}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={cn("text-[8px] font-medium", SURFACE_LABELS[entry.recoverySurface]?.color)}>{SURFACE_LABELS[entry.recoverySurface]?.label}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            {entry.offlineCapable
                              ? <Wifi className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                              : <WifiOff className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />}
                          </td>
                          <td className="px-3 py-2.5"><BoolCell value={entry.rollbackAvailable} /></td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0", RISK_COLORS[entry.riskLevel])}>
                              {entry.riskLevel}
                            </Badge>
                          </td>
                        </tr>
                        {expandedId === entry.id && (
                          <tr key={`${entry.id}-detail`}>
                            <td colSpan={11} className="px-4 py-3 bg-white/[0.02]">
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[11px] text-muted-foreground leading-relaxed"
                              >
                                <Eye className="h-3 w-3 inline mr-1.5 text-primary" />
                                {entry.description}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[9px] text-muted-foreground pt-1">
                <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" /> Authorized</div>
                <div className="flex items-center gap-1"><XCircle className="h-3 w-3 text-muted-foreground/40" /> Not applicable</div>
                <div className="flex items-center gap-1"><Monitor className="h-3 w-3" /> OS = execution surface</div>
                <div className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> App = control surface</div>
                <div className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Cloud = truth/decision fabric</div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
