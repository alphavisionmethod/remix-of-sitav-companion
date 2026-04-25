import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldOff, Cpu, Lock, Key, Eye,
  Server, AlertTriangle, CheckCircle, XCircle, Clock, Activity,
  FileKey, Fingerprint, Wifi, Globe, Terminal, Search, Download,
  ChevronDown, ChevronRight, ArrowRight, Zap, Radio, RefreshCw,
  Bug, Target, Layers, Database, Hash, Network,
} from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { getRecoveryEngine } from "@/lib/os-security/recovery";
import { getPromptDaemon } from "@/lib/os-security/promptd";
import { getAuditDaemon } from "@/lib/os-security/auditd";
import { getSecretsDaemon } from "@/lib/os-security/secretsd";
import { getPolicyDaemon, getExtendedServices, verifyServiceIdentity } from "@/lib/os-security/policyd";
import {
  IPC_CONTRACT_REGISTRY, FAILURE_MODE_REGISTRY, THREAT_MODEL_REGISTRY,
  ACTION_AUTHORIZATION_TABLE, SERVICE_BOOT_ORDER,
  type IPCContract, type FailureMode, type ThreatEntry, type AuditSeverity,
  type DeviceSecurityPosture,
} from "@/lib/os-security/types";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

// ── Color helpers ───────────────────────────────────────────

const severityColor = (sev: string) => {
  const map: Record<string, string> = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[sev] || "bg-muted text-muted-foreground border-border";
};

const postureColor = (level: string) => {
  const map: Record<string, string> = {
    hardware_backed: "text-emerald-400",
    software_protected: "text-amber-400",
    degraded: "text-red-400",
  };
  return map[level] || "text-muted-foreground";
};

const postureBg = (level: string) => {
  const map: Record<string, string> = {
    hardware_backed: "from-emerald-500/20 to-emerald-500/5",
    software_protected: "from-amber-500/20 to-amber-500/5",
    degraded: "from-red-500/20 to-red-500/5",
  };
  return map[level] || "from-muted/20 to-muted/5";
};

// ── Tab 1: Device Security Posture ──────────────────────────

function PostureTab({ posture }: { posture: DeviceSecurityPosture }) {
  const checks = [
    { label: "Secure Hardware", value: posture.secureHwPresent, icon: Cpu, detail: "TPM / Secure Element" },
    { label: "Secure Boot", value: posture.secureBootEnabled, icon: ShieldCheck, detail: "UEFI verified chain" },
    { label: "Measured Boot", value: posture.measuredBootOk, icon: Hash, detail: "PCR integrity" },
    { label: "Attestation", value: posture.attestationSupported, icon: Fingerprint, detail: "Remote attestation" },
    { label: "System Keyring", value: posture.systemKeyringHardwareBacked, icon: Key, detail: "HW-backed keys" },
    { label: "User Keyring", value: posture.userKeyringHardwareBacked, icon: Lock, detail: "User key protection" },
    { label: "Device Root Sealed", value: posture.deviceRootSealed, icon: FileKey, detail: "TPM sealed root" },
    { label: "Hardware RNG", value: posture.hardwareRngAvailable, icon: Zap, detail: "True random source" },
  ];

  const score = checks.filter(c => c.value).length;
  const pct = Math.round((score / checks.length) * 100);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Shield Hero */}
      <motion.div variants={fadeUp} className={`relative rounded-2xl bg-gradient-to-br ${postureBg(posture.postureLevel)} border border-white/[0.06] p-8 text-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="relative">
          <div className={`inline-flex p-6 rounded-full bg-gradient-to-br ${posture.postureLevel === "hardware_backed" ? "from-emerald-500/30 to-emerald-600/10" : posture.postureLevel === "software_protected" ? "from-amber-500/30 to-amber-600/10" : "from-red-500/30 to-red-600/10"} mb-4`}>
            {posture.postureLevel === "hardware_backed" ? <ShieldCheck className="h-12 w-12 text-emerald-400" /> :
             posture.postureLevel === "software_protected" ? <Shield className="h-12 w-12 text-amber-400" /> :
             <ShieldOff className="h-12 w-12 text-red-400" />}
          </div>
          <h2 className={`text-2xl font-bold ${postureColor(posture.postureLevel)}`}>
            {posture.postureLevel === "hardware_backed" ? "Hardware Protected" :
             posture.postureLevel === "software_protected" ? "Software Protected" : "Degraded Security"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{score}/{checks.length} security checks passed</p>
          <div className="mt-4 max-w-xs mx-auto">
            <Progress value={pct} className="h-2" />
          </div>
          {posture.degradedReason && (
            <p className="text-xs text-red-400 mt-3 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {posture.degradedReason}
            </p>
          )}
        </div>
      </motion.div>

      {/* Check Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {checks.map((check, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-xl ${check.value ? "ring-1 ring-emerald-500/20" : "ring-1 ring-red-500/10"}`}>
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${check.value ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <check.icon className={`h-5 w-5 ${check.value ? "text-emerald-400" : "text-red-400"}`} />
                </div>
                <p className="text-xs font-medium text-foreground">{check.label}</p>
                <p className="text-[10px] text-muted-foreground">{check.detail}</p>
                <Badge variant={check.value ? "default" : "destructive"} className="mt-2 text-[9px]">
                  {check.value ? "PASS" : "FAIL"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* PCR Values */}
      {Object.keys(posture.pcrValues).length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-purple-400" /> PCR Values
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(posture.pcrValues).map(([pcr, val]) => (
                  <div key={pcr} className="bg-black/20 rounded-lg p-2 font-mono text-[10px]">
                    <span className="text-purple-400">{pcr}</span>
                    <span className="text-muted-foreground ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Tab 2: IPC Contracts ────────────────────────────────────

function IPCContractsTab() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = IPC_CONTRACT_REGISTRY.filter(c =>
    c.method.toLowerCase().includes(search.toLowerCase()) ||
    c.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Search */}
      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="Search IPC methods..."
        />
      </motion.div>

      {/* Architecture diagram */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">ARCHITECTURE FLOW</h3>
            <div className="flex items-center justify-center gap-2 flex-wrap text-[10px]">
              {["UI/Lockscreen", "controlcenterd", "policyd", "authd/promptd", "Target Service", "secretsd", "auditd"].map((svc, i) => (
                <div key={svc} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">{svc}</span>
                  {i < 6 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contract List */}
      <div className="space-y-2">
        {filtered.map(contract => (
          <motion.div key={contract.method} variants={fadeUp}>
            <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === contract.method ? null : contract.method)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expanded === contract.method ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <code className="text-xs font-mono text-blue-400">{contract.method}</code>
                      <p className="text-[10px] text-muted-foreground">{contract.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.requiresElevation && <Badge variant="destructive" className="text-[9px]">ELEVATION</Badge>}
                    <Badge variant="outline" className="text-[9px]">{contract.idempotency}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{contract.timeoutMs}ms</Badge>
                  </div>
                </div>
                {expanded === contract.method && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/[0.06] pt-3">
                    <div>
                      <h4 className="text-[10px] font-semibold text-emerald-400 mb-1">REQUEST</h4>
                      {contract.requestSchema.fields.map(f => (
                        <div key={f.name} className="text-[10px] font-mono text-muted-foreground">
                          <span className="text-foreground">{f.name}</span>: <span className="text-blue-400">{f.type}</span>
                          {f.required && <span className="text-red-400 ml-1">*</span>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold text-blue-400 mb-1">RESPONSE</h4>
                      {contract.responseSchema.fields.map(f => (
                        <div key={f.name} className="text-[10px] font-mono text-muted-foreground">
                          <span className="text-foreground">{f.name}</span>: <span className="text-blue-400">{f.type}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold text-amber-400 mb-1">ERRORS</h4>
                      {contract.errorCodes.map(e => (
                        <div key={e.code} className="text-[10px] font-mono text-muted-foreground">
                          <span className="text-red-400">{e.code}</span> — {e.message}
                        </div>
                      ))}
                      <div className="mt-2 text-[10px]">
                        <span className="text-muted-foreground">Callers: </span>
                        <span className="text-foreground">{contract.allowedCallers.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Tab 3: Audit Chain ──────────────────────────────────────

function AuditChainTab() {
  const auditd = getAuditDaemon();
  const events = auditd.getEvents({ limit: 30 });
  const stats = auditd.getStats();
  const checkpoints = auditd.getSealingCheckpoints();
  const [integrity, setIntegrity] = useState<{ valid: boolean; checkedEntries: number } | null>(null);

  useEffect(() => {
    auditd.getChainIntegrity().then(setIntegrity);
  }, []);

  const severityCounts = stats.severityCounts;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Integrity Bar */}
      <motion.div variants={fadeUp}>
        <Card className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-xl ${integrity?.valid ? "ring-1 ring-emerald-500/20" : "ring-1 ring-red-500/20"}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {integrity?.valid ? <CheckCircle className="h-6 w-6 text-emerald-400" /> : <XCircle className="h-6 w-6 text-red-400" />}
              <div>
                <p className="text-sm font-medium text-foreground">Chain Integrity: {integrity?.valid ? "Verified" : "BROKEN"}</p>
                <p className="text-[10px] text-muted-foreground">{integrity?.checkedEntries || 0} entries verified · {checkpoints.length} sealed checkpoints</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => auditd.sealCheckpoint().then(() => auditd.getChainIntegrity().then(setIntegrity))}>
              <Lock className="h-3 w-3 mr-1" /> Seal Now
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Severity Heatmap */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-4 gap-3">
          {(["info", "warning", "high", "critical"] as AuditSeverity[]).map(sev => (
            <Card key={sev} className={`border-white/[0.06] bg-white/[0.02] ${severityColor(sev)} backdrop-blur-xl`}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{severityCounts[sev]}</p>
                <p className="text-[10px] uppercase tracking-wider">{sev}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" /> Recent Events
              </h3>
              <Button variant="outline" size="sm" onClick={() => {
                const data = auditd.exportEvents({ redactPII: true });
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "audit-export.json"; a.click();
              }}>
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {events.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No audit events recorded</p>}
              {events.map(evt => (
                <div key={evt.eventId} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/[0.03] text-[11px]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${evt.severity === "critical" ? "bg-red-500" : evt.severity === "high" ? "bg-orange-500" : evt.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <span className="text-muted-foreground w-16 flex-shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  <code className="text-foreground flex-1 truncate">{evt.action}</code>
                  <Badge variant="outline" className={`text-[9px] ${severityColor(evt.severity)}`}>{evt.decision}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 4: Service Identities ───────────────────────────────

function ServiceIdentitiesTab() {
  const policyd = getPolicyDaemon();
  const services = policyd.getRegisteredServices();

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map(svc => {
          const verification = verifyServiceIdentity(svc.serviceName);
          return (
            <motion.div key={svc.serviceName} variants={fadeUp}>
              <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${verification.verified ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      <Server className={`h-5 w-5 ${verification.verified ? "text-emerald-400" : "text-red-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{svc.serviceName}</p>
                      <p className="text-[10px] text-muted-foreground">{svc.serviceUid}</p>
                    </div>
                    {verification.verified ?
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> :
                      <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Actions: <span className="text-foreground">{svc.allowedActions.length}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Scopes: <span className="text-foreground">{svc.secretScopes.join(", ") || "none"}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {svc.allowedActions.slice(0, 3).map(a => (
                        <Badge key={a} variant="outline" className="text-[8px]">{a}</Badge>
                      ))}
                      {svc.allowedActions.length > 3 && <Badge variant="secondary" className="text-[8px]">+{svc.allowedActions.length - 3}</Badge>}
                    </div>
                  </div>
                  {svc.privileged && <Badge variant="default" className="mt-2 text-[9px]">PRIVILEGED</Badge>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Boot Order */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-400" /> Service Boot Order
            </h3>
            <div className="flex flex-wrap gap-2">
              {SERVICE_BOOT_ORDER.map((svc, i) => (
                <div key={svc.service} className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded text-[10px] font-mono ${svc.hardFail ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                    P{svc.phase} {svc.service}
                  </span>
                  {i < SERVICE_BOOT_ORDER.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 5: Trusted Prompts ──────────────────────────────────

function TrustedPromptsTab() {
  const promptd = getPromptDaemon();
  const stats = promptd.getStats();
  const history = promptd.getHistory(20);
  const active = promptd.getActivePrompts();

  const states = ["idle", "presenting", "awaiting_input", "processing", "resolved", "timed_out", "cancelled"];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active", value: stats.activePrompts, icon: Radio, color: "text-cyan-400 bg-cyan-500/10" },
          { label: "Approved", value: stats.approvedCount, icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Denied", value: stats.deniedCount, icon: XCircle, color: "text-red-400 bg-red-500/10" },
          { label: "Timed Out", value: stats.timedOutCount, icon: Clock, color: "text-amber-400 bg-amber-500/10" },
          { label: "Remembered", value: stats.rememberedApprovals, icon: Key, color: "text-purple-400 bg-purple-500/10" },
        ].map(s => (
          <Card key={s.label} className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-3 text-center">
              <div className={`inline-flex p-1.5 rounded-lg mb-1 ${s.color.split(" ")[1]}`}>
                <s.icon className={`h-4 w-4 ${s.color.split(" ")[0]}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* State Machine */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-cyan-400" /> Prompt State Machine
            </h3>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {states.map((st, i) => (
                <div key={st} className="flex items-center gap-1">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border ${st === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : st === "timed_out" || st === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"}`}>
                    {st}
                  </span>
                  {i < states.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* History */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Prompt History</h3>
            {history.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No prompt history</p>}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {history.map(h => (
                <div key={h.promptId} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/[0.03] text-[11px]">
                  {h.approved ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                  <code className="text-foreground flex-1">{h.promptId.slice(0, 12)}...</code>
                  <Badge variant="outline" className="text-[9px]">{h.state}</Badge>
                  {h.method && <Badge variant="secondary" className="text-[9px]">{h.method}</Badge>}
                  <span className="text-muted-foreground">{new Date(h.resolvedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 6: Threat Model ─────────────────────────────────────

function ThreatModelTab() {
  const mitigated = THREAT_MODEL_REGISTRY.filter(t => t.mitigated).length;
  const pct = Math.round((mitigated / THREAT_MODEL_REGISTRY.length) * 100);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Coverage */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Threat Coverage: {pct}%</p>
              <p className="text-[10px] text-muted-foreground">{mitigated}/{THREAT_MODEL_REGISTRY.length} threats mitigated</p>
              <Progress value={pct} className="h-1.5 mt-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {THREAT_MODEL_REGISTRY.map(threat => (
          <motion.div key={threat.threatId} variants={fadeUp}>
            <Card className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-xl ${threat.mitigated ? "" : "ring-1 ring-red-500/20"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bug className={`h-4 w-4 ${threat.severity === "critical" ? "text-red-400" : "text-amber-400"}`} />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{threat.name}</p>
                      <p className="text-[10px] text-muted-foreground">{threat.threatId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-[9px] ${severityColor(threat.severity)}`}>{threat.severity}</Badge>
                    {threat.mitigated ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{threat.description}</p>
                <div className="space-y-1 text-[10px]">
                  <p><span className="text-emerald-400 font-medium">Mitigation:</span> <span className="text-foreground">{threat.mitigation}</span></p>
                  <p><span className="text-amber-400 font-medium">Residual:</span> <span className="text-foreground">{threat.residualRisk}</span></p>
                  <p><span className="text-blue-400 font-medium">Signal:</span> <span className="text-foreground">{threat.monitoringSignal}</span></p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Tab 7: Capability Matrix ────────────────────────────────

function CapabilityMatrixTab() {
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = roleFilter === "all"
    ? ACTION_AUTHORIZATION_TABLE
    : ACTION_AUTHORIZATION_TABLE.filter(p => p.requiredRole === roleFilter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
        {["all", "guest", "standard", "admin", "system"].map(r => (
          <Button key={r} variant={roleFilter === r ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setRoleFilter(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </Button>
        ))}
      </motion.div>

      {/* Matrix Grid */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left p-2 text-muted-foreground font-medium">Action</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Role</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Elevation</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Fresh Auth</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Locked</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.action} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="p-2">
                        <code className="text-foreground">{p.action}</code>
                        <p className="text-[9px] text-muted-foreground">{p.displayName}</p>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant="outline" className="text-[9px]">{p.requiredRole}</Badge>
                      </td>
                      <td className="text-center p-2">
                        {p.elevationRequired ?
                          <span className="inline-flex p-1 rounded bg-red-500/10"><Lock className="h-3 w-3 text-red-400" /></span> :
                          <span className="inline-flex p-1 rounded bg-emerald-500/10"><CheckCircle className="h-3 w-3 text-emerald-400" /></span>}
                      </td>
                      <td className="text-center p-2">
                        {p.freshAuthRequired ?
                          <span className="inline-flex p-1 rounded bg-amber-500/10"><Fingerprint className="h-3 w-3 text-amber-400" /></span> :
                          <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="text-center p-2">
                        {p.lockedSessionAllowed ?
                          <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" /> :
                          <XCircle className="h-3 w-3 text-red-400 mx-auto" />}
                      </td>
                      <td className="text-center p-2">
                        <Badge className={`text-[9px] ${severityColor(p.auditSeverity)}`}>{p.auditSeverity}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Failure Modes */}
      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Failure Mode Registry ({FAILURE_MODE_REGISTRY.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {FAILURE_MODE_REGISTRY.map(fm => (
                <div key={fm.failureId} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/[0.03] text-[11px]">
                  <Badge className={`text-[9px] ${severityColor(fm.severity)}`}>{fm.failureId}</Badge>
                  <span className="text-foreground flex-1">{fm.name}</span>
                  <Badge variant="outline" className="text-[9px]">{fm.category}</Badge>
                  <span className="text-muted-foreground">{fm.retryPolicy.retryable ? `↻${fm.retryPolicy.maxRetries}` : "✕"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SEC02 — Security Foundation Dashboard
// ═══════════════════════════════════════════════════════════════

export default function SEC02SecurityFoundation() {
  const { isAdmin, loading } = useRequireAdmin();
  const [tab, setTab] = useState("posture");

  const recovery = getRecoveryEngine();
  const posture = recovery.assessPosture();
  const recoveryStats = recovery.getStats();

  if (loading) return <PageSkeleton />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              SEC02 — Security Foundation
            </h1>
            <p className="text-xs text-muted-foreground">
              TPM · IPC Contracts · Audit Chain · Service Identity · Trusted Prompts · Threat Model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${postureColor(posture.postureLevel)} border ${posture.postureLevel === "hardware_backed" ? "border-emerald-500/20 bg-emerald-500/10" : posture.postureLevel === "software_protected" ? "border-amber-500/20 bg-amber-500/10" : "border-red-500/20 bg-red-500/10"}`}>
            {posture.postureLevel.replace("_", " ").toUpperCase()}
          </Badge>
          <Badge variant={recoveryStats.overallHealthy ? "default" : "destructive"} className="text-[10px]">
            {recoveryStats.overallHealthy ? "HEALTHY" : `${recoveryStats.activeDegradations} DEGRADED`}
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="bg-white/[0.04] border border-white/[0.06] p-1 flex-wrap h-auto">
          <TabsTrigger value="posture" className="text-xs gap-1.5 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Posture
          </TabsTrigger>
          <TabsTrigger value="ipc" className="text-xs gap-1.5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
            <Network className="h-3.5 w-3.5" /> IPC Contracts
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs gap-1.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Eye className="h-3.5 w-3.5" /> Audit Chain
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs gap-1.5 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <Server className="h-3.5 w-3.5" /> Services
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs gap-1.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
            <Fingerprint className="h-3.5 w-3.5" /> Prompts
          </TabsTrigger>
          <TabsTrigger value="threats" className="text-xs gap-1.5 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
            <Bug className="h-3.5 w-3.5" /> Threats
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
            <Database className="h-3.5 w-3.5" /> Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posture"><PostureTab posture={posture} /></TabsContent>
        <TabsContent value="ipc"><IPCContractsTab /></TabsContent>
        <TabsContent value="audit"><AuditChainTab /></TabsContent>
        <TabsContent value="services"><ServiceIdentitiesTab /></TabsContent>
        <TabsContent value="prompts"><TrustedPromptsTab /></TabsContent>
        <TabsContent value="threats"><ThreatModelTab /></TabsContent>
        <TabsContent value="matrix"><CapabilityMatrixTab /></TabsContent>
      </Tabs>
    </div>
  );
}
