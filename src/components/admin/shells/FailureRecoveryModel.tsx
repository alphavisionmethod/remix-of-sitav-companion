import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, RotateCcw, Monitor, Smartphone, Cloud, Eye,
  ChevronDown, ChevronUp, ShieldCheck, ArrowRight, Activity,
  RefreshCw, Lock, Zap, FileText, Cpu, HardDrive, Layers,
  CheckCircle, XCircle
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

type OwnerLayer = "os" | "cloud" | "app" | "os_cloud" | "app_cloud" | "os_app";

const LAYER_STYLE: Record<OwnerLayer, { label: string; color: string; icon: React.ElementType }> = {
  os: { label: "OS", color: "text-blue-400", icon: Monitor },
  cloud: { label: "Cloud", color: "text-cyan-400", icon: Cloud },
  app: { label: "App", color: "text-purple-400", icon: Smartphone },
  os_cloud: { label: "OS + Cloud", color: "text-teal-400", icon: Layers },
  app_cloud: { label: "App + Cloud", color: "text-indigo-400", icon: ShieldCheck },
  os_app: { label: "OS + App", color: "text-pink-400", icon: Activity },
};

interface FailureEntry {
  feature: string;
  icon: React.ElementType;
  detector: OwnerLayer;
  visibleSurface: OwnerLayer;
  recoveryAuthority: OwnerLayer;
  repairExecutor: OwnerLayer;
}

const FAILURE_MATRIX: FailureEntry[] = [
  { feature: "File Open / Edit", icon: FileText, detector: "os", visibleSurface: "os", recoveryAuthority: "os", repairExecutor: "os" },
  { feature: "File Sync", icon: RefreshCw, detector: "os_cloud", visibleSurface: "os_app", recoveryAuthority: "cloud", repairExecutor: "os" },
  { feature: "App Execution", icon: Cpu, detector: "os", visibleSurface: "os", recoveryAuthority: "os", repairExecutor: "os" },
  { feature: "App Install", icon: HardDrive, detector: "os_cloud", visibleSurface: "os_app", recoveryAuthority: "cloud", repairExecutor: "os" },
  { feature: "Device Trust", icon: ShieldCheck, detector: "cloud", visibleSurface: "app", recoveryAuthority: "app_cloud", repairExecutor: "cloud" },
  { feature: "Remote Lock", icon: Lock, detector: "cloud", visibleSurface: "app", recoveryAuthority: "app_cloud", repairExecutor: "os" },
  { feature: "System Update", icon: Zap, detector: "os_cloud", visibleSurface: "os_app", recoveryAuthority: "cloud", repairExecutor: "os" },
  { feature: "Security Alert", icon: AlertTriangle, detector: "os_cloud", visibleSurface: "app", recoveryAuthority: "app_cloud", repairExecutor: "os_cloud" },
  { feature: "Workspace Continuity", icon: Layers, detector: "os_cloud", visibleSurface: "os_app", recoveryAuthority: "cloud", repairExecutor: "os" },
  { feature: "Command Execution", icon: Activity, detector: "os_cloud", visibleSurface: "app", recoveryAuthority: "cloud", repairExecutor: "os" },
];

interface CaseStudy {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  steps: { actor: string; surface: OwnerLayer; action: string }[];
}

const FAILURE_CASES: CaseStudy[] = [
  {
    id: "fc-1", title: "Sync Upload Failure", icon: RefreshCw, color: "text-cyan-400",
    steps: [
      { actor: "Detector", surface: "os_cloud", action: "OS detects upload timeout; Cloud confirms no data received for file 'quarterly-report.xlsx'" },
      { actor: "Truth", surface: "cloud", action: "Cloud records failure in sync event log with correlation ID and error classification (timeout, 408)" },
      { actor: "Visibility", surface: "os_app", action: "OS shows inline sync error icon; App shows sync health alert with affected file details" },
      { actor: "Recovery Planner", surface: "cloud", action: "Cloud analyzes failure pattern — identifies network congestion, schedules retry with exponential backoff" },
      { actor: "Recovery Executor", surface: "os", action: "OS re-queues upload with chunked transfer; uses local cache to avoid re-reading from disk" },
      { actor: "Approval Gate", surface: "app", action: "No approval needed — automatic retry for transient failure. App notified of recovery progress" },
      { actor: "Verification", surface: "cloud", action: "Cloud confirms file received, checksum validated, version history updated, sync health restored" },
    ],
  },
  {
    id: "fc-2", title: "Trust Anomaly Detected", icon: AlertTriangle, color: "text-red-400",
    steps: [
      { actor: "Detector", surface: "cloud", action: "Cloud detects unusual login pattern — new IP, new geo, unusual time — trust score drops below threshold" },
      { actor: "Truth", surface: "cloud", action: "Cloud records anomaly in security event log with risk score (0.82), contributing signals, and recommended action" },
      { actor: "Visibility", surface: "app", action: "App receives high-priority security alert with device info, location, and recommended actions" },
      { actor: "Local Enforcer", surface: "os", action: "OS restricts sensitive operations — pauses sync of encrypted data, limits app installs, enables enhanced logging" },
      { actor: "Recovery Authority", surface: "app_cloud", action: "Cloud generates remediation options; App presents them: verify identity, lock device, revoke session" },
      { actor: "Approval Gate", surface: "app", action: "User confirms identity via biometric or 2FA in App — approves 'keep access' or 'revoke session'" },
      { actor: "Resolution", surface: "cloud", action: "Cloud updates trust score, lifts OS restrictions if identity confirmed, records resolution in audit trail" },
    ],
  },
];

interface RecoveryEntry {
  feature: string;
  icon: React.ElementType;
  planner: OwnerLayer;
  authorizer: OwnerLayer;
  executor: OwnerLayer;
  visibility: OwnerLayer;
}

const RECOVERY_MATRIX: RecoveryEntry[] = [
  { feature: "Local File Conflict", icon: FileText, planner: "cloud", authorizer: "app", executor: "os", visibility: "os_app" },
  { feature: "Device Compromise", icon: AlertTriangle, planner: "cloud", authorizer: "app", executor: "os_cloud", visibility: "app" },
  { feature: "Sync State Corruption", icon: RefreshCw, planner: "cloud", authorizer: "cloud", executor: "os", visibility: "os_app" },
  { feature: "Update Rollback", icon: RotateCcw, planner: "cloud", authorizer: "app", executor: "os", visibility: "os_app" },
  { feature: "Session Hijack", icon: Lock, planner: "cloud", authorizer: "app", executor: "cloud", visibility: "app" },
  { feature: "Trust Revocation", icon: ShieldCheck, planner: "app_cloud", authorizer: "app", executor: "cloud", visibility: "app" },
  { feature: "Workspace Restore", icon: Layers, planner: "cloud", authorizer: "os", executor: "os", visibility: "os" },
  { feature: "Emergency Freeze", icon: Zap, planner: "app", authorizer: "app", executor: "cloud", visibility: "app" },
  { feature: "Data Export Failure", icon: HardDrive, planner: "cloud", authorizer: "app", executor: "os", visibility: "os_app" },
  { feature: "App Crash Recovery", icon: Cpu, planner: "os", authorizer: "os", executor: "os", visibility: "os" },
];

const RECOVERY_CASES: CaseStudy[] = [
  {
    id: "rc-1", title: "Local File Conflict Recovery", icon: FileText, color: "text-amber-400",
    steps: [
      { actor: "Detection", surface: "cloud", action: "Cloud detects version conflict — Desktop-01 and Laptop-02 both modified 'budget.xlsx' offline" },
      { actor: "Planning", surface: "cloud", action: "Cloud analyzes change deltas — Desktop has 3 cell changes, Laptop has new sheet added — merge possible" },
      { actor: "Authorization", surface: "app", action: "Cloud presents merge preview to App — user reviews diff showing both changes preserved" },
      { actor: "Execution", surface: "os", action: "OS on both devices receives merged version; local caches updated; backup of conflicting versions stored" },
      { actor: "Verification", surface: "cloud", action: "Cloud confirms both devices synced to merged version; conflict resolution recorded in file history" },
    ],
  },
  {
    id: "rc-2", title: "Device Compromise Recovery", icon: AlertTriangle, color: "text-red-400",
    steps: [
      { actor: "Detection", surface: "cloud", action: "Cloud identifies potential compromise — multiple failed auth attempts followed by suspicious data access pattern" },
      { actor: "Containment", surface: "cloud", action: "Cloud immediately revokes device session tokens; queues encrypted data key rotation" },
      { actor: "Authorization", surface: "app", action: "App receives emergency alert — user confirms compromise and authorizes full device revocation" },
      { actor: "Execution", surface: "os_cloud", action: "Cloud removes device from trusted registry; OS on compromised device locked and local encryption keys wiped" },
      { actor: "Recovery", surface: "app", action: "App guides user through re-enrollment or replacement device setup with fresh trust ceremony" },
    ],
  },
];

function LayerCell({ layer }: { layer: OwnerLayer }) {
  const s = LAYER_STYLE[layer];
  return (
    <div className="flex items-center justify-center gap-1">
      <s.icon className={cn("h-3 w-3", s.color)} />
      <span className={cn("text-[9px] font-medium", s.color)}>{s.label}</span>
    </div>
  );
}

function CaseStudyPanel({ cases }: { cases: CaseStudy[] }) {
  const [expanded, setExpanded] = useState<string | null>(cases[0]?.id);

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" /> Worked Examples
      </h4>
      {cases.map(c => (
        <Card key={c.id} className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="py-2 px-3">
            <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="w-full flex items-center gap-2">
              <c.icon className={cn("h-3.5 w-3.5", c.color)} />
              <span className="text-[11px] font-medium text-foreground">{c.title}</span>
              <div className="ml-auto">{expanded === c.id ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}</div>
            </button>
          </CardHeader>
          <AnimatePresence>
            {expanded === c.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <CardContent className="pt-0 px-3 pb-3">
                  <div className="space-y-1.5">
                    {c.steps.map((step, si) => {
                      const ls = LAYER_STYLE[step.surface];
                      return (
                        <motion.div key={si} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.05 }} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02]">
                          <div className="flex items-center gap-1 shrink-0 min-w-[90px]">
                            <div className="h-4 w-4 rounded-full bg-primary/15 flex items-center justify-center text-[8px] font-bold text-primary">{si + 1}</div>
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium">{step.actor}</span>
                          </div>
                          <p className="text-[10px] text-foreground flex-1 leading-relaxed">{step.action}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <ls.icon className={cn("h-2.5 w-2.5", ls.color)} />
                            <span className={cn("text-[8px]", ls.color)}>{ls.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}

export function FailureRecoveryModel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Failure & Recovery Ownership
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Who detects, recovers, and is responsible for every failure scenario across the ecosystem
        </p>
      </div>

      <Tabs defaultValue="failure" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/[0.03]">
          <TabsTrigger value="failure" className="gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" /> Failure Ownership
          </TabsTrigger>
          <TabsTrigger value="recovery" className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Recovery Ownership
          </TabsTrigger>
        </TabsList>

        <TabsContent value="failure" className="mt-3 space-y-4">
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium min-w-[150px]">Feature</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Detector</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Visible Surface</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Recovery Authority</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Repair Executor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FAILURE_MATRIX.map((entry, i) => (
                      <motion.tr key={entry.feature} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={cn("border-b border-white/[0.04]", i % 2 === 0 && "bg-white/[0.01]")}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <entry.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">{entry.feature}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.detector} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.visibleSurface} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.recoveryAuthority} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.repairExecutor} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <CaseStudyPanel cases={FAILURE_CASES} />
        </TabsContent>

        <TabsContent value="recovery" className="mt-3 space-y-4">
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium min-w-[150px]">Recovery Scenario</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Planner</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Authorizer</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Executor</th>
                      <th className="px-3 py-2.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECOVERY_MATRIX.map((entry, i) => (
                      <motion.tr key={entry.feature} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={cn("border-b border-white/[0.04]", i % 2 === 0 && "bg-white/[0.01]")}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <entry.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">{entry.feature}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.planner} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.authorizer} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.executor} /></td>
                        <td className="px-3 py-2.5"><LayerCell layer={entry.visibility} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <CaseStudyPanel cases={RECOVERY_CASES} />
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-[9px] text-muted-foreground">
        {Object.entries(LAYER_STYLE).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <cfg.icon className={cn("h-3 w-3", cfg.color)} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
