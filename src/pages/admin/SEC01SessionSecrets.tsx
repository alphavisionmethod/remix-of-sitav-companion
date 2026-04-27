import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Key, Lock, Unlock, Users, Clock, Eye, Database,
  RefreshCw, Trash2, AlertTriangle, CheckCircle, XCircle,
  Monitor, Cpu, HardDrive, Activity, Layers, ArrowRight,
  Fingerprint, Wifi, Globe, Server, Terminal, ChevronDown, ChevronRight,
} from "lucide-react";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { getSessionDaemon, type ExtendedOSSession } from "@/lib/os-security/sessiond";
import { getSecretsDaemon } from "@/lib/os-security/secretsd";
import {
  LOCKSCREEN_ACTION_MATRIX, type LockscreenActionRule,
  type SecretStatus, type KeyHierarchyNode,
} from "@/lib/os-security/types";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

// ── Color helpers ───────────────────────────────────────────

const stateColor = (state: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    locked: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    suspended: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    inactive: "bg-muted text-muted-foreground border-border",
    authenticating: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    terminating: "bg-red-500/10 text-red-400 border-red-500/20",
    creating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    revoked: "bg-red-500/10 text-red-400 border-red-500/20",
    expired: "bg-muted text-muted-foreground border-border",
  };
  return map[state] || "bg-muted text-muted-foreground border-border";
};

const decisionBadge = (d: string) => {
  if (d === "allowed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (d === "denied") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
};

const secretStatusColor = (s: SecretStatus) => {
  const map: Record<SecretStatus, string> = {
    active: "bg-emerald-500/10 text-emerald-400",
    revoked: "bg-red-500/10 text-red-400",
    soft_deleted: "bg-amber-500/10 text-amber-400",
    destroyed: "bg-muted text-muted-foreground",
  };
  return map[s];
};

const severityColor = (s: string) => {
  if (s === "critical") return "text-red-400";
  if (s === "high") return "text-orange-400";
  if (s === "warning") return "text-amber-400";
  return "text-muted-foreground";
};

// ── Key Hierarchy Tree ──────────────────────────────────────

function KeyNode({ node, depth = 0 }: { node: KeyHierarchyNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const typeColors: Record<string, string> = {
    root_device_key: "text-purple-400",
    kek: "text-amber-400",
    keyring_master: "text-emerald-400",
    dek: "text-blue-400",
  };

  return (
    <div className="ml-4">
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="flex items-center gap-2 py-1 w-full text-left hover:bg-white/[0.02] rounded px-1 transition-colors"
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : <span className="w-3" />}
        <span className={`h-2 w-2 rounded-full ${node.hardwareBacked ? "bg-purple-500" : "bg-blue-500"}`} />
        <span className={`text-xs font-mono ${typeColors[node.type] || "text-foreground"}`}>{node.label}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{node.algorithm}</span>
      </button>
      {expanded && hasChildren && (
        <div className="border-l border-white/[0.06] ml-2">
          {node.children!.map(child => (
            <KeyNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function SEC01SessionSecrets() {
  const { isAdmin, loading } = useRequireAdmin();
  const [tab, setTab] = useState("sessions");
  const [refreshKey, setRefreshKey] = useState(0);

  const sessiond = useMemo(() => getSessionDaemon(), []);
  const secretsd = useMemo(() => getSecretsDaemon(), []);

  const [sessions, setSessions] = useState<ExtendedOSSession[]>([]);
  const [sessionStats, setSessionStats] = useState<ReturnType<typeof sessiond.getStats> | null>(null);
  const [secretStats, setSecretStats] = useState<ReturnType<typeof secretsd.getStats> | null>(null);

  useEffect(() => {
    const init = async () => {
      await sessiond.initialize();
      await secretsd.initialize();
      setSessions(sessiond.getAllSessions());
      setSessionStats(sessiond.getStats());
      setSecretStats(secretsd.getStats());
    };
    init();
  }, [refreshKey, sessiond, secretsd]);

  if (loading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  const tokens = sessiond.tokenIssuer.getAllTokens();
  const tokenStats = sessiond.tokenIssuer.getStats();
  const keyrings = secretsd.getAllKeyrings();
  const allSecrets = secretsd.listSecrets(undefined, undefined, true);
  const accessLog = secretsd.getAccessLog(50);
  const activeHandles = secretsd.getActiveHandles();
  const deletionQueue = secretsd.getDeletionQueue();
  const policies = secretsd.getPolicies();
  const tpmState = secretsd.getTPMState();
  const keyTree = secretsd.getKeyHierarchyTree();
  const lockMatrix = LOCKSCREEN_ACTION_MATRIX;

  const now = Date.now();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Session & Secrets Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Session lifecycle · Token management · Secrets vault · Key hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`gap-1 ${tpmState.present ? "text-purple-400 border-purple-500/30" : "text-amber-400 border-amber-500/30"}`}>
            <Cpu className="h-3 w-3" />
            {tpmState.present ? "TPM Sealed" : "Software Fallback"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Sessions", value: sessionStats?.totalSessions ?? 0, icon: Monitor, color: "bg-blue-500/10 text-blue-400" },
          { label: "Active Tokens", value: tokenStats.active, icon: Key, color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Keyrings", value: secretStats?.totalKeyrings ?? 0, icon: Database, color: "bg-amber-500/10 text-amber-400" },
          { label: "Active Secrets", value: secretStats?.activeSecrets ?? 0, icon: Lock, color: "bg-purple-500/10 text-purple-400" },
          { label: "Open Handles", value: secretStats?.activeHandles ?? 0, icon: Fingerprint, color: "bg-rose-500/10 text-rose-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp}>
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.04] border border-white/[0.06]">
          <TabsTrigger value="sessions" className="gap-1.5 text-xs"><Monitor className="h-3.5 w-3.5" /> Sessions</TabsTrigger>
          <TabsTrigger value="lockscreen" className="gap-1.5 text-xs"><Lock className="h-3.5 w-3.5" /> Lockscreen</TabsTrigger>
          <TabsTrigger value="secrets" className="gap-1.5 text-xs"><Key className="h-3.5 w-3.5" /> Secrets</TabsTrigger>
          <TabsTrigger value="hierarchy" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" /> Key Hierarchy</TabsTrigger>
          <TabsTrigger value="diagnostics" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Diagnostics</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Sessions ────────────────────────────────── */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sessions Table */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" /> Active Sessions
                </CardTitle>
                <CardDescription className="text-xs">{sessions.length} sessions tracked</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No active sessions. Sessions are created on login.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map(s => (
                      <div key={s.sessionId} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className={`p-1.5 rounded ${s.sessionType === "guest" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
                          {s.sessionType === "guest" ? <Globe className="h-3.5 w-3.5 text-amber-400" /> : <Monitor className="h-3.5 w-3.5 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{s.userId}</p>
                          <p className="text-[10px] text-muted-foreground">{s.sessionType} · {s.seatId}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${stateColor(s.extendedState)}`}>
                          {s.extendedState}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{s.tokenIds.length} tokens</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Overview */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" /> Session Tokens
                </CardTitle>
                <CardDescription className="text-xs">{tokenStats.active} active · {tokenStats.revoked} revoked · {tokenStats.expired} expired</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Token class breakdown */}
                {Object.entries(tokenStats.byClass).map(([cls, count]) => (
                  <div key={cls} className="flex items-center justify-between">
                    <span className="text-xs text-foreground font-mono">{cls}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={tokenStats.active > 0 ? ((count as number) / tokenStats.active) * 100 : 0} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground w-6 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}

                {/* Recent tokens */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Recent Tokens</p>
                  {tokens.slice(-5).reverse().map(t => (
                    <div key={t.tokenId} className="flex items-center gap-2 py-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${t.revoked ? "bg-red-500" : t.expiresAt < now ? "bg-muted-foreground" : "bg-emerald-500"}`} />
                      <span className="text-[10px] font-mono text-foreground truncate flex-1">{t.tokenId.slice(0, 12)}…</span>
                      <span className="text-[10px] text-muted-foreground">{t.tokenClass}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Idle & Suspend Policy */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" /> Idle & Suspend Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Idle Timeout", value: "15 min", desc: "Screen → Screensaver" },
                  { label: "Screensaver Delay", value: "5 min", desc: "Screensaver → Lock" },
                  { label: "Grace Interval", value: "30 sec", desc: "Warning before lock" },
                  { label: "Suspend Mode", value: "Always Lock", desc: "Lock on suspend/resume" },
                ].map(p => (
                  <div key={p.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-xs font-medium text-foreground">{p.label}</p>
                    <p className="text-lg font-bold text-primary mt-1">{p.value}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Lockscreen Matrix ───────────────────────── */}
        <TabsContent value="lockscreen" className="space-y-4 mt-4">
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" /> Lockscreen Action Matrix
              </CardTitle>
              <CardDescription className="text-xs">{lockMatrix.length} action rules defined</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-[10px]">Action</TableHead>
                    <TableHead className="text-[10px]">Decision</TableHead>
                    <TableHead className="text-[10px]">Policy Source</TableHead>
                    <TableHead className="text-[10px]">Auth Required</TableHead>
                    <TableHead className="text-[10px]">Severity</TableHead>
                    <TableHead className="text-[10px]">Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockMatrix.map(rule => (
                    <TableRow key={rule.action} className="border-white/[0.04]">
                      <TableCell className="py-2">
                        <span className="text-xs font-medium text-foreground">{rule.displayName}</span>
                        <br />
                        <span className="text-[10px] font-mono text-muted-foreground">{rule.action}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${decisionBadge(rule.decision)}`}>
                          {rule.decision === "allowed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {rule.decision === "denied" && <XCircle className="h-3 w-3 mr-1" />}
                          {rule.decision === "conditional" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {rule.decision}
                        </Badge>
                      </TableCell>
                      <TableCell><span className="text-[10px] text-muted-foreground">{rule.policySource}</span></TableCell>
                      <TableCell>
                        {rule.authRequired ? (
                          <Fingerprint className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell><span className={`text-[10px] font-medium ${severityColor(rule.auditSeverity)}`}>{rule.auditSeverity}</span></TableCell>
                      <TableCell><span className="text-[10px] text-muted-foreground">{rule.condition || "—"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Secrets Vault ───────────────────────────── */}
        <TabsContent value="secrets" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Keyrings */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-400" /> Keyrings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {keyrings.map(kr => (
                  <div key={kr.keyringId} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className={`p-1.5 rounded ${kr.hardwareBacked ? "bg-purple-500/10" : "bg-amber-500/10"}`}>
                      {kr.hardwareBacked ? <HardDrive className="h-3.5 w-3.5 text-purple-400" /> : <Database className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{kr.keyringId}</p>
                      <p className="text-[10px] text-muted-foreground">{kr.scope} · {kr.protectionClass}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{kr.secretCount} secrets</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Secret Metadata Browser */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-400" /> Secret Metadata
                </CardTitle>
                <CardDescription className="text-xs">No plaintext shown — metadata only</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {allSecrets.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No secrets stored yet.</p>
                ) : (
                  allSecrets.slice(0, 10).map(s => (
                    <div key={s.secretId} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.type} · v{s.version} · {s.ownerScope}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${secretStatusColor(((s as { status?: SecretStatus }).status) || "active")}`}>
                        {((s as { status?: SecretStatus }).status) || "active"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Policy Bindings & Access Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" /> Access Policy Bindings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06]">
                      <TableHead className="text-[10px]">Secret Type</TableHead>
                      <TableHead className="text-[10px]">Allowed Services</TableHead>
                      <TableHead className="text-[10px]">Export</TableHead>
                      <TableHead className="text-[10px]">HW Req</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map(p => (
                      <TableRow key={p.bindingId} className="border-white/[0.04]">
                        <TableCell className="text-xs font-mono">{p.secretType}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{p.allowedServices.join(", ")}</TableCell>
                        <TableCell>{p.exportAllowed ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                        <TableCell>{p.hardwareRequired ? <HardDrive className="h-3 w-3 text-purple-400" /> : <span className="text-[10px] text-muted-foreground">No</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" /> Access Events
                </CardTitle>
                <CardDescription className="text-xs">Last {accessLog.length} operations</CardDescription>
              </CardHeader>
              <CardContent>
                {accessLog.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No access events yet.</p>
                ) : (
                  <div className="space-y-1 max-h-[250px] overflow-y-auto">
                    {accessLog.slice().reverse().slice(0, 20).map((e, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${e.granted ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className="text-[10px] font-mono text-foreground flex-1 truncate">{e.action}</span>
                        <span className="text-[10px] text-muted-foreground">{e.accessor.slice(0, 16)}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Key Hierarchy ───────────────────────────── */}
        <TabsContent value="hierarchy" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" /> Key Hierarchy Tree
                </CardTitle>
                <CardDescription className="text-xs">Root Device Key → KEK → Per-Keyring Master → DEKs</CardDescription>
              </CardHeader>
              <CardContent>
                <KeyNode node={keyTree} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* TPM Status */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-400" /> TPM Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "TPM Present", value: tpmState.present ? "Yes" : "No", color: tpmState.present ? "text-emerald-400" : "text-amber-400" },
                    { label: "Posture", value: tpmState.postureFlag.replace("_", " "), color: tpmState.postureFlag === "hardware_sealed" ? "text-emerald-400" : "text-amber-400" },
                    { label: "Fallback Mode", value: tpmState.fallbackMode ? "Active" : "Inactive", color: tpmState.fallbackMode ? "text-amber-400" : "text-emerald-400" },
                    { label: "Sealed Keys", value: String(tpmState.sealedKeys.length), color: "text-foreground" },
                    { label: "Attestation", value: tpmState.attestationAvailable ? "Available" : "N/A", color: "text-muted-foreground" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={`text-xs font-medium ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Encryption Info */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Algorithm", value: "AES-256-GCM" },
                    { label: "AEAD", value: "Authenticated" },
                    { label: "IV Size", value: "96-bit (12 bytes)" },
                    { label: "Key Derivation", value: "HKDF-SHA-256" },
                    { label: "Format Version", value: "v2" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-foreground">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Diagnostics ─────────────────────────────── */}
        <TabsContent value="diagnostics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Token Stats */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" /> Token Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Issued", value: tokenStats.total },
                  { label: "Active", value: tokenStats.active, color: "text-emerald-400" },
                  { label: "Revoked", value: tokenStats.revoked, color: "text-red-400" },
                  { label: "Expired", value: tokenStats.expired, color: "text-muted-foreground" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className={`text-xs font-bold ${s.color || "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Secret Backend Health */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-400" /> Secret Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {secretStats && [
                  { label: "Total Secrets", value: secretStats.totalSecrets },
                  { label: "Active", value: secretStats.activeSecrets, color: "text-emerald-400" },
                  { label: "Revoked", value: secretStats.revokedSecrets, color: "text-red-400" },
                  { label: "Soft Deleted", value: secretStats.softDeletedSecrets, color: "text-amber-400" },
                  { label: "Destroyed", value: secretStats.destroyedSecrets, color: "text-muted-foreground" },
                  { label: "Pending Deletions", value: secretStats.pendingDeletions, color: secretStats.pendingDeletions > 0 ? "text-amber-400" : "text-foreground" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className={`text-xs font-bold ${s.color || "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Handles */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-rose-400" /> Active Handles
                </CardTitle>
                <CardDescription className="text-xs">{activeHandles.length} handles outstanding</CardDescription>
              </CardHeader>
              <CardContent>
                {activeHandles.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No active handles.</p>
                ) : (
                  <div className="space-y-2">
                    {activeHandles.slice(0, 5).map(h => (
                      <div key={h.handleId} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[10px] font-mono text-foreground truncate">{h.handleId.slice(0, 16)}…</p>
                        <p className="text-[10px] text-muted-foreground">
                          {h.authorizedService} · {h.allowedOperations.join(",")} · {h.singleUse ? "single-use" : "multi-use"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          TTL: {Math.max(0, Math.round((h.expiresAt - now) / 1000))}s
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Deletion Queue & Keyring Versions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-400" /> Deletion Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deletionQueue.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No pending deletions.</p>
                ) : (
                  <div className="space-y-2">
                    {deletionQueue.map(d => (
                      <div key={d.deletionId} className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className={`h-2 w-2 rounded-full ${d.completedAt ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-[10px] font-mono text-foreground flex-1 truncate">{d.secretId.slice(0, 12)}…</span>
                        <Badge variant="outline" className="text-[10px]">{d.deleteMode}</Badge>
                        <span className="text-[10px] text-muted-foreground">{d.result || "pending"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-400" /> Keyring KEK Versions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {secretStats && Object.entries(secretStats.keyringVersions).map(([kr, count]) => (
                  <div key={kr} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground">{kr}</span>
                    <Badge variant="outline" className="text-[10px]">v{count as number}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
