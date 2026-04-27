import { useState, useMemo } from "react";
import { useSecurityFabric } from "@/platform/security/hooks/use-security-fabric";
import { Shield, Activity, Eye, Lock, Cpu, Zap, Brain, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock, Server, Gauge, Radio, Bug, ChevronRight, ArrowUpRight, Wifi, Layers, FlaskConical, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Tab Definition ─────────────────────────────────────────────

type TabId = "posture" | "ids" | "audit" | "resources" | "zero-trust" | "ai-safety" | "updates" | "chaos" | "boundaries" | "verification" | "redundancy";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabDef[] = [
  { id: "posture", label: "Trust Posture", icon: <Shield className="w-4 h-4" />, description: "Overall security posture & trust rings" },
  { id: "boundaries", label: "Trust Boundaries", icon: <Layers className="w-4 h-4" />, description: "Zone crossings & privilege matrix" },
  { id: "ids", label: "Intrusion Detection", icon: <Eye className="w-4 h-4" />, description: "Threat signals & quarantine" },
  { id: "audit", label: "Audit Trail", icon: <Activity className="w-4 h-4" />, description: "Immutable event log" },
  { id: "resources", label: "Resource Governor", icon: <Cpu className="w-4 h-4" />, description: "Per-app resource budgets" },
  { id: "zero-trust", label: "Zero Trust", icon: <Lock className="w-4 h-4" />, description: "Request validation stats" },
  { id: "ai-safety", label: "AI Safety", icon: <Brain className="w-4 h-4" />, description: "AI trust enforcement" },
  { id: "updates", label: "Update Safety", icon: <RefreshCw className="w-4 h-4" />, description: "Rollout health & rollback" },
  { id: "chaos", label: "Chaos Testing", icon: <Bug className="w-4 h-4" />, description: "Resilience scenarios" },
  { id: "verification", label: "Formal Verification", icon: <FlaskConical className="w-4 h-4" />, description: "Property proofs & coverage" },
  { id: "redundancy", label: "Redundancy", icon: <Database className="w-4 h-4" />, description: "Replicas & failover health" },
];

// ── Posture Color Helpers ──────────────────────────────────────

function postureColor(posture: string) {
  switch (posture) {
    case "nominal": return "text-[hsl(var(--trust-safe))]";
    case "elevated": return "text-[hsl(var(--sita-gold))]";
    case "degraded": return "text-orange-400";
    case "critical": return "text-[hsl(var(--destructive))]";
    case "emergency": return "text-red-500 animate-pulse";
    default: return "text-muted-foreground";
  }
}

function postureGlow(posture: string) {
  switch (posture) {
    case "nominal": return "shadow-[0_0_40px_hsl(var(--trust-safe)/0.2)]";
    case "elevated": return "shadow-[0_0_40px_hsl(var(--sita-gold)/0.2)]";
    case "degraded": return "shadow-[0_0_40px_hsl(38_85%_58%/0.3)]";
    case "critical": return "shadow-[0_0_40px_hsl(var(--destructive)/0.3)]";
    case "emergency": return "shadow-[0_0_60px_hsl(0_80%_50%/0.4)]";
    default: return "";
  }
}

function scoreColor(score: number) {
  if (score >= 90) return "text-[hsl(var(--trust-safe))]";
  if (score >= 70) return "text-[hsl(var(--sita-gold))]";
  if (score >= 50) return "text-orange-400";
  return "text-[hsl(var(--destructive))]";
}

function scoreBarColor(score: number) {
  if (score >= 90) return "bg-[hsl(var(--trust-safe))]";
  if (score >= 70) return "bg-[hsl(var(--sita-gold))]";
  if (score >= 50) return "bg-orange-400";
  return "bg-[hsl(var(--destructive))]";
}

// ── Card Shell ─────────────────────────────────────────────────

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5",
        "transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, icon, trend, color }: { label: string; value: string | number; icon: React.ReactNode; trend?: string; color?: string }) {
  return (
    <GlassCard className="flex items-start gap-3">
      <div className={cn("p-2.5 rounded-xl bg-white/[0.05]", color)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{value}</div>
        {trend && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{trend}</div>}
      </div>
    </GlassCard>
  );
}

// ── Score Ring SVG ──────────────────────────────────────────────

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.3" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={score >= 90 ? "hsl(var(--trust-safe))" : score >= 70 ? "hsl(var(--sita-gold))" : score >= 50 ? "hsl(38 85% 58%)" : "hsl(var(--destructive))"}
          strokeWidth="6" strokeLinecap="round"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={cn("text-2xl font-bold", scoreColor(score))}>{score}</span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Tab: Trust Posture ─────────────────────────────────────────

function PostureTab() {
  const { posture, fabric } = useSecurityFabric();
  const deviceMetrics = fabric.devices.getMetrics();
  const emergency = fabric.humanGuard.getEmergencyMode();

  return (
    <div className="space-y-6">
      <GlassCard className={cn("relative overflow-hidden", postureGlow(posture.overall))}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">System Security Posture</div>
            <div className={cn("text-4xl font-bold tracking-tight capitalize", postureColor(posture.overall))}>
              {posture.overall}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {posture.activeThreats} active threats · {posture.activeQuarantines} quarantines
            </div>
          </div>
          <div className="flex gap-4">
            {Object.entries(posture.scores).map(([key, score]) => (
              <div key={key} className="relative">
                <ScoreRing score={Math.round(score)} size={80} label={key} />
              </div>
            ))}
          </div>
        </div>
        {emergency.active && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="mt-4 p-3 rounded-xl bg-[hsl(var(--destructive)/0.15)] border border-[hsl(var(--destructive)/0.3)]">
            <div className="flex items-center gap-2 text-[hsl(var(--destructive))] font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" /> Emergency Mode Active
            </div>
            <div className="text-xs text-muted-foreground mt-1">Activated by {emergency.activatedBy} — {emergency.reason}</div>
          </motion.div>
        )}
      </GlassCard>

      {posture.recommendations.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--sita-gold))]" /> Recommendations
          </h3>
          <div className="space-y-2">
            {posture.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ChevronRight className="w-3 h-3 mt-1 text-[hsl(var(--sita-gold))]" />{r}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-5 gap-3">
        {[
          { ring: 0, name: "Kernel", color: "hsl(var(--trust-safe))" },
          { ring: 1, name: "Trusted", color: "hsl(152 55% 58%)" },
          { ring: 2, name: "Verified", color: "hsl(var(--sita-gold))" },
          { ring: 3, name: "Sandboxed", color: "hsl(38 65% 50%)" },
          { ring: 4, name: "Untrusted", color: "hsl(var(--destructive))" },
        ].map(({ ring, name, color }) => (
          <GlassCard key={ring} className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ring {ring}</div>
            <div className="text-lg font-bold" style={{ color }}>{name}</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                initial={{ width: 0 }} animate={{ width: `${100 - ring * 20}%` }} transition={{ duration: 0.8, delay: ring * 0.1 }} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Devices" value={deviceMetrics.totalDevices} icon={<Server className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Active Devices" value={deviceMetrics.activeDevices} icon={<Wifi className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Attestations Passed" value={deviceMetrics.attestationsPassed} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Revoked" value={deviceMetrics.revokedDevices} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
      </div>
    </div>
  );
}

// ── Tab: Trust Boundaries ──────────────────────────────────────

function BoundariesTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.boundaries.getMetrics();
  const manifests = fabric.boundaries.getAllManifests();
  const crossingLog = fabric.boundaries.getCrossingLog(30);
  const integrations = fabric.boundaries.getAllIntegrations();

  const zoneColors: Record<string, string> = {
    "user-app": "hsl(var(--destructive))",
    "extension": "hsl(var(--destructive))",
    "system-service": "hsl(var(--sita-gold))",
    "kernel": "hsl(var(--trust-safe))",
    "cloud": "hsl(var(--primary))",
    "mobile-app": "hsl(265 55% 58%)",
    "admin-founder": "hsl(38 85% 58%)",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Crossings" value={metrics.total} icon={<Layers className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Allowed" value={metrics.allowed} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Blocked" value={metrics.blocked} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
        <StatCard label="Zones Active" value={manifests.length} icon={<Shield className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
      </div>

      {/* Zone privilege grid */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Trust Zone Manifests</h3>
        <div className="grid grid-cols-2 gap-3">
          {manifests.map((m) => (
            <div key={m.zone} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zoneColors[m.zone] ?? "hsl(var(--muted))" }} />
                <span className="text-sm font-semibold text-foreground capitalize">{m.zone.replace(/-/g, " ")}</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground capitalize">{m.trustLevel}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1">
                <span className="text-[hsl(var(--trust-safe))]">✓</span> {m.allowed.slice(0, 3).join(", ")}{m.allowed.length > 3 && ` +${m.allowed.length - 3}`}
              </div>
              <div className="text-[10px] text-muted-foreground">
                <span className="text-[hsl(var(--destructive))]">✕</span> {m.denied.slice(0, 3).join(", ")}{m.denied.length > 3 && ` +${m.denied.length - 3}`}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Integration wiring */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Integration Wiring Map</h3>
        <div className="space-y-2">
          {integrations.map((z) => (
            <div key={z.zone} className="flex items-start gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: zoneColors[z.zone] ?? "hsl(var(--muted))" }} />
              <span className="text-foreground font-medium capitalize w-28 shrink-0">{z.zone.replace(/-/g, " ")}</span>
              <div className="flex flex-wrap gap-1">
                {z.integratesWith.map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Crossing log */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Boundary Crossing Log</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {crossingLog.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No boundary crossings recorded</div>
          ) : (
            crossingLog.slice().reverse().map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("w-2 h-2 rounded-full shrink-0", e.blocked ? "bg-[hsl(var(--destructive))]" : "bg-[hsl(var(--trust-safe))]")} />
                <span className="text-foreground font-mono">{e.sourceZone}→{e.targetZone}</span>
                <span className="text-muted-foreground flex-1 truncate">{e.action}</span>
                <span className={cn("px-1.5 py-0.5 rounded",
                  e.blocked ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" : "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]"
                )}>{e.verdict}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Tab: Formal Verification ───────────────────────────────────

function VerificationTab() {
  const { fabric } = useSecurityFabric();
  const report = fabric.verification.getCoverageReport();
  const metrics = fabric.verification.getMetrics();
  const stateMachines = fabric.verification.getStateMachineVerifications();
  const runHistory = fabric.verification.getRunHistory(10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Overall Coverage" value={`${report.overallCoverage}%`} icon={<FlaskConical className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Verified Targets" value={report.verified} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Pending" value={report.pending} icon={<Clock className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Failed" value={report.failed} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
      </div>

      {/* Critical targets */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Verification Targets</h3>
        <div className="space-y-2">
          {report.targets.map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full",
                    t.status === "passed" ? "bg-[hsl(var(--trust-safe))]" :
                    t.status === "failed" ? "bg-[hsl(var(--destructive))]" :
                    "bg-[hsl(var(--sita-gold))]"
                  )} />
                  <span className="text-sm font-medium text-foreground">{t.component}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                    t.criticality === "critical" ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" :
                    t.criticality === "high" ? "bg-orange-400/15 text-orange-400" :
                    "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]"
                  )}>{t.criticality}</span>
                  <span className={cn("text-sm font-bold", scoreColor(t.coverage))}>{t.coverage}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{t.description}</div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div className={cn("h-full rounded-full", scoreBarColor(t.coverage))}
                  initial={{ width: 0 }} animate={{ width: `${t.coverage}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className="flex gap-1 mt-2">
                {t.verificationMethods.map((m) => (
                  <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* State machine verifications */}
      {stateMachines.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">State Machine Verifications</h3>
          <div className="grid grid-cols-2 gap-3">
            {stateMachines.map((sm) => (
              <div key={sm.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-sm font-medium text-foreground mb-1">{sm.name}</div>
                <div className="text-xs text-muted-foreground mb-2">{sm.states.length} states · {sm.coveragePercent}% coverage</div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {Object.entries(sm.properties).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className={val ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]"}>{val ? "✓" : "✕"}</span>
                      <span className="text-muted-foreground capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Run history */}
      {runHistory.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Verification Runs</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {runHistory.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("px-1.5 py-0.5 rounded font-mono",
                  r.status === "passed" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                  r.status === "failed" ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" :
                  "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]"
                )}>{r.status}</span>
                <span className="text-foreground flex-1">{r.propertyId}</span>
                <span className="text-muted-foreground">{r.iterations} iter · {r.durationMs}ms</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Tab: Redundancy ────────────────────────────────────────────

function RedundancyTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.redundancy.getMetrics();
  const services = fabric.redundancy.getAllServices();
  const regions = fabric.redundancy.getRegions();
  const degraded = fabric.redundancy.getDegradedCapabilities();
  const failovers = fabric.redundancy.getFailoverHistory(10);
  const queues = fabric.redundancy.getAllQueues();
  const notification = fabric.redundancy.getNotificationStatus();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Replicas" value={metrics.totalReplicas} icon={<Database className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Active" value={metrics.activeReplicas} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Failed" value={metrics.failedReplicas} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
        <StatCard label="Avg Health" value={`${metrics.avgHealth}%`} icon={<Gauge className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
      </div>

      {/* Regions */}
      <div className="grid grid-cols-2 gap-3">
        {regions.map((r) => (
          <GlassCard key={r.regionId}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{r.regionName}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                r.status === "primary" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                r.status === "secondary" ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]" :
                "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
              )}>{r.status}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Latency: <span className="text-foreground font-mono">{r.latencyMs}ms</span></div>
              <div>Replicas: <span className="text-foreground">{r.replicaCount}</span></div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Service replica health */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Service Replicas</h3>
        <div className="space-y-3">
          {services.map((svc) => {
            const replicas = fabric.redundancy.getServiceReplicas(svc.serviceId);
            return (
              <div key={svc.serviceId} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{svc.serviceName}</span>
                    {svc.criticalService && <span className="text-[10px] px-1 py-0.5 rounded bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]">Critical</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{svc.failoverMode}</span>
                </div>
                <div className="flex gap-2">
                  {replicas.map((r) => (
                    <div key={r.id} className={cn("flex-1 p-2 rounded-lg text-center text-xs",
                      r.status === "active" ? "bg-[hsl(var(--trust-safe)/0.1)] border border-[hsl(var(--trust-safe)/0.3)]" :
                      r.status === "failed" ? "bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)]" :
                      "bg-white/[0.02] border border-white/[0.06]"
                    )}>
                      <div className="font-mono text-foreground">{r.id}</div>
                      <div className={cn("font-semibold capitalize mt-0.5",
                        r.status === "active" ? "text-[hsl(var(--trust-safe))]" :
                        r.status === "failed" ? "text-[hsl(var(--destructive))]" :
                        "text-muted-foreground"
                      )}>{r.status}</div>
                      <div className="text-muted-foreground mt-0.5">{r.healthScore}% · {r.region}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Queue redundancy */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Queue Health</h3>
        <div className="grid grid-cols-2 gap-3">
          {queues.map((q) => (
            <div key={q.queueId} className="p-2 rounded-lg bg-white/[0.02] text-xs">
              <div className="font-medium text-foreground capitalize mb-1">{q.queueName}</div>
              <div className="text-muted-foreground">Primary: {q.primaryDepth} · Overflow: {q.overflowDepth} · Processed: {q.totalProcessed}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Degraded capabilities */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Capability Degradation Status</h3>
        <div className="space-y-2">
          {degraded.map((c) => (
            <div key={c.capability} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-white/[0.02]">
              <span className={cn("w-2 h-2 rounded-full",
                c.status === "available" ? "bg-[hsl(var(--trust-safe))]" :
                c.status === "degraded" ? "bg-[hsl(var(--sita-gold))]" :
                "bg-[hsl(var(--destructive))]"
              )} />
              <span className="text-foreground font-medium w-36">{c.capability}</span>
              <span className="text-muted-foreground flex-1">{c.fallbackMode}</span>
              <span className={cn("capitalize",
                c.status === "available" ? "text-[hsl(var(--trust-safe))]" :
                c.status === "degraded" ? "text-[hsl(var(--sita-gold))]" :
                "text-[hsl(var(--destructive))]"
              )}>{c.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Failover history */}
      {failovers.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Failover History</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {failovers.slice().reverse().map((f) => (
              <div key={f.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("px-1.5 py-0.5 rounded font-mono",
                  f.successful ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" : "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
                )}>{f.successful ? "OK" : "FAIL"}</span>
                <span className="text-foreground">{f.serviceId}</span>
                <span className="text-muted-foreground flex-1">{f.fromReplicaId} → {f.toReplicaId}</span>
                <span className="text-muted-foreground">{f.durationMs}ms</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Tab: Intrusion Detection ───────────────────────────────────

function IDSTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.ids.getMetrics();
  const signals = fabric.ids.getSignals(50);
  const quarantines = fabric.ids.getActiveQuarantines();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Signals" value={metrics.totalSignals} icon={<Radio className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Critical" value={metrics.signalsBySeverity.critical ?? 0} icon={<AlertTriangle className="w-4 h-4 text-[hsl(var(--destructive))]" />} color="text-[hsl(var(--destructive))]" />
        <StatCard label="Active Quarantines" value={metrics.activeQuarantines} icon={<Lock className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Rules Active" value={`${metrics.rulesEnabled}/${metrics.rulesTotal}`} icon={<Shield className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Threat Distribution</h3>
        <div className="flex items-end gap-2 h-24">
          {(["info", "low", "medium", "high", "critical"] as const).map((sev) => {
            const count = metrics.signalsBySeverity[sev] ?? 0;
            const maxCount = Math.max(1, ...Object.values(metrics.signalsBySeverity));
            const height = (count / maxCount) * 100;
            const colors: Record<string, string> = { info: "bg-blue-400/60", low: "bg-[hsl(var(--trust-safe)/0.6)]", medium: "bg-[hsl(var(--sita-gold)/0.6)]", high: "bg-orange-400/60", critical: "bg-[hsl(var(--destructive)/0.7)]" };
            return (
              <div key={sev} className="flex-1 flex flex-col items-center gap-1">
                <motion.div className={cn("w-full rounded-t-lg", colors[sev])} initial={{ height: 0 }} animate={{ height: `${Math.max(height, 4)}%` }} transition={{ duration: 0.6 }} />
                <span className="text-[10px] text-muted-foreground capitalize">{sev}</span>
                <span className="text-xs font-mono text-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {quarantines.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-[hsl(var(--sita-gold))]" /> Active Quarantines</h3>
          <div className="space-y-2">
            {quarantines.slice(0, 10).map((q) => (
              <div key={q.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/[0.02]">
                <div><span className="text-foreground font-medium">{q.action}</span><span className="text-muted-foreground ml-2">→ {q.targetId}</span></div>
                <span className="text-xs text-muted-foreground">{new Date(q.appliedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Signals</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {signals.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No signals detected — system nominal</div>
          ) : (
            signals.slice(-20).reverse().map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.severity === "critical" ? "bg-[hsl(var(--destructive))]" : s.severity === "high" ? "bg-orange-400" : "bg-[hsl(var(--sita-gold))]")} />
                <span className="text-muted-foreground font-mono w-20 shrink-0">{s.category}</span>
                <span className="text-foreground truncate flex-1">{s.description}</span>
                <span className="text-muted-foreground shrink-0">{new Date(s.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Tab: Audit Trail ───────────────────────────────────────────

function AuditTab() {
  const { fabric } = useSecurityFabric();
  const stats = fabric.audit.getStats();
  const recentEntries = fabric.audit.query({ limit: 30 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Entries" value={stats.totalEntries.toLocaleString()} icon={<Activity className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Chain Integrity" value={stats.chainIntegrity ? "Valid" : "BROKEN"} icon={<Shield className="w-4 h-4" />} color={stats.chainIntegrity ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]"} />
        <StatCard label="Domains Covered" value={Object.keys(stats.entriesByDomain).length} icon={<Server className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Security Events" value={stats.entriesByDomain.security ?? 0} icon={<Eye className="w-4 h-4 text-[hsl(var(--primary))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Events by Domain</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(stats.entriesByDomain).sort(([, a], [, b]) => b - a).slice(0, 8).map(([domain, count]) => (
            <div key={domain} className="p-2 rounded-lg bg-white/[0.02] text-center">
              <div className="text-xs text-muted-foreground capitalize">{domain}</div>
              <div className="text-lg font-bold text-foreground">{count}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Audit Log</h3>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {recentEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No audit entries yet</div>
          ) : (
            recentEntries.slice(-20).reverse().map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <span className={cn("w-2 h-2 rounded-full shrink-0",
                  e.outcome === "success" ? "bg-[hsl(var(--trust-safe))]" : e.outcome === "denied" ? "bg-[hsl(var(--destructive))]" : "bg-[hsl(var(--sita-gold))]"
                )} />
                <span className="text-muted-foreground font-mono w-16 shrink-0">{e.domain}</span>
                <span className="text-foreground truncate flex-1">{e.action}</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded shrink-0",
                  e.outcome === "success" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                  e.outcome === "denied" ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" :
                  "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]"
                )}>{e.outcome}</span>
                <span className="text-muted-foreground shrink-0">{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Tab: Resource Governor ─────────────────────────────────────

function ResourcesTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.resources.getMetrics();
  const budgets = fabric.resources.getAllBudgets();
  const enforcementLog = fabric.resources.getEnforcementLog(20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Active Budgets" value={metrics.activeBudgets} icon={<Gauge className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Enforcement Events" value={metrics.enforcementEvents} icon={<AlertTriangle className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Throttled" value={metrics.throttledProcesses} icon={<Clock className="w-4 h-4 text-orange-400" />} />
        <StatCard label="Killed" value={metrics.killedProcesses} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">System Resource Utilization</h3>
        <div className="space-y-3">
          {Object.entries(metrics.resourceUtilization).map(([resource, { total, used, percent }]) => (
            <div key={resource} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{resource.replace(/-/g, " ")}</span>
                <span className={cn("font-mono", scoreColor(100 - percent))}>{percent.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div className={cn("h-full rounded-full", scoreBarColor(100 - percent))} initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 100)}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className="text-[10px] text-muted-foreground">{used.toFixed(0)} / {total.toFixed(0)} allocated</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {enforcementLog.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Enforcement</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {enforcementLog.slice().reverse().map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("px-1.5 py-0.5 rounded font-mono",
                  e.action === "kill" ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" :
                  e.action === "throttle" ? "bg-orange-400/15 text-orange-400" :
                  "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]"
                )}>{e.action}</span>
                <span className="text-muted-foreground">{e.resource}</span>
                <span className="text-foreground flex-1">{e.reason}</span>
                <span className="text-muted-foreground">{e.utilizationPercent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Tab: Zero Trust ────────────────────────────────────────────

function ZeroTrustTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.zeroTrust.getMetrics();
  const recentDenied = fabric.zeroTrust.getRecentDecisions(20, "denied");
  const approvalRate = metrics.totalRequests > 0 ? ((metrics.allowedRequests / metrics.totalRequests) * 100).toFixed(1) : "100";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Requests" value={metrics.totalRequests.toLocaleString()} icon={<Zap className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Denied" value={metrics.deniedRequests} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
        <StatCard label="Rate Limited" value={metrics.rateLimitedRequests} icon={<Clock className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Requests by Surface</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(metrics.bySurface).sort(([, a], [, b]) => b - a).map(([surface, count]) => (
            <div key={surface} className="p-3 rounded-xl bg-white/[0.02] text-center">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground capitalize mt-1">{surface}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" /> Recently Denied</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {recentDenied.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No denied requests — all clear</div>
          ) : (
            recentDenied.map((d) => (
              <div key={d.requestId} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className="bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))] px-1.5 py-0.5 rounded font-mono">{d.result}</span>
                <span className="text-foreground flex-1 truncate">{d.denyReason}</span>
                <span className="text-muted-foreground">{d.checks.length} checks</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Tab: AI Safety ─────────────────────────────────────────────

function AISafetyTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.aiEnforcer.getMetrics();
  const receipts = fabric.aiEnforcer.getReceipts(20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="AI Requests" value={metrics.totalRequests} icon={<Brain className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Allowed" value={metrics.allowed} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Denied / Budget" value={`${metrics.denied} / ${metrics.budgetExceeded}`} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
        <StatCard label="Total Cost" value={`${(metrics.totalCostCents / 100).toFixed(2)}$`} icon={<Zap className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
      </div>

      {Object.keys(metrics.byModel).length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Usage by Model</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byModel).sort(([, a], [, b]) => b - a).map(([model, count]) => {
              const maxCount = Math.max(1, ...Object.values(metrics.byModel));
              return (
                <div key={model} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-mono">{model}</span>
                    <span className="text-muted-foreground">{count} calls</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div className="h-full rounded-full bg-[hsl(var(--primary)/0.6)]" initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }} transition={{ duration: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">AI Audit Receipts</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {receipts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No AI invocations recorded</div>
          ) : (
            receipts.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("px-1.5 py-0.5 rounded font-mono",
                  r.result === "allowed" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                  r.result === "downgraded" ? "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]" :
                  "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
                )}>{r.result}</span>
                <span className="text-muted-foreground font-mono w-16">{r.capabilityId.slice(0, 16)}</span>
                <span className="text-foreground flex-1 truncate">{r.modelUsed}</span>
                <span className="text-muted-foreground">{r.costCents}¢ · {r.tokensUsed}tok</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Tab: Update Safety ─────────────────────────────────────────

function UpdatesTab() {
  const { fabric } = useSecurityFabric();
  const metrics = fabric.updates.getMetrics();
  const slots = fabric.updates.getSlots();
  const history = fabric.updates.getSessionHistory(10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Updates" value={metrics.totalUpdates} icon={<RefreshCw className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Successful" value={metrics.successfulUpdates} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Rollbacks" value={metrics.rollbacks} icon={<RefreshCw className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Health Gate Pass" value={`${(metrics.healthGatePassRate * 100).toFixed(0)}%`} icon={<Gauge className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">A/B Slot Management</h3>
        <div className="grid grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div key={slot.slot} className={cn("p-4 rounded-xl border transition-all",
              slot.active ? "border-[hsl(var(--trust-safe)/0.4)] bg-[hsl(var(--trust-safe)/0.05)]" : "border-white/[0.06] bg-white/[0.02]"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-foreground">Slot {slot.slot}</span>
                {slot.active && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[hsl(var(--trust-safe)/0.2)] text-[hsl(var(--trust-safe))] font-semibold">Active</span>}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Version: <span className="text-foreground font-mono">{slot.version}</span></div>
                <div>Bootable: <span className={slot.bootable ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]"}>{slot.bootable ? "Yes" : "No"}</span></div>
                <div>Integrity: <span className={slot.integrity === "verified" ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--sita-gold))]"}>{slot.integrity}</span></div>
                <div>Health: <span className="text-foreground">{(slot.healthScore * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {history.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Update History</h3>
          <div className="space-y-2">
            {history.slice().reverse().map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-white/[0.03]">
                <span className={cn("px-1.5 py-0.5 rounded font-mono",
                  s.phase === "complete" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                  s.phase === "rolled-back" ? "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]" :
                  "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
                )}>{s.phase}</span>
                <span className="text-foreground flex-1">{s.packageId}</span>
                <span className="text-muted-foreground">{s.checkpoints.length} checkpoints</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Tab: Chaos Testing ─────────────────────────────────────────

function ChaosTab() {
  const { fabric } = useSecurityFabric();
  const chaosMetrics = fabric.chaos.getMetrics();
  const scenarios = fabric.chaos.getScenarios();
  const runs = fabric.chaos.getRunHistory(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Runs" value={chaosMetrics.totalRuns} icon={<Bug className="w-4 h-4 text-[hsl(var(--primary))]" />} />
        <StatCard label="Scenarios" value={chaosMetrics.totalScenarios} icon={<Activity className="w-4 h-4 text-[hsl(var(--sita-gold))]" />} />
        <StatCard label="Pass Rate" value={`${(chaosMetrics.passRate * 100).toFixed(0)}%`} icon={<CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust-safe))]" />} />
        <StatCard label="Failed Scenarios" value={chaosMetrics.failedScenarios.length} icon={<XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />} />
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Scenario Catalog</h3>
        <div className="grid grid-cols-2 gap-3">
          {scenarios.map((s) => {
            const catStats = chaosMetrics.scenariosByCategory[s.category];
            return (
              <div key={s.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                    s.severity === "critical" ? "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]" :
                    s.severity === "high" ? "bg-orange-400/15 text-orange-400" :
                    "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]"
                  )}>{s.severity}</span>
                </div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground">{s.category}</span>
                  {catStats && <span className="text-muted-foreground">{catStats.passed}/{catStats.total} passed</span>}
                  <span className={cn("ml-auto", s.enabled ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground")}>{s.enabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {runs.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Test Runs</h3>
          <div className="space-y-2">
            {runs.map((run) => (
              <div key={run.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{run.id}</span>
                  <span className="text-xs text-muted-foreground">{run.summary.durationMs}ms</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[hsl(var(--trust-safe))]">{run.summary.passed} passed</span>
                  <span className="text-[hsl(var(--destructive))]">{run.summary.failed} failed</span>
                  <span className="text-muted-foreground">{run.summary.errors} errors</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  posture: PostureTab,
  boundaries: BoundariesTab,
  ids: IDSTab,
  audit: AuditTab,
  resources: ResourcesTab,
  "zero-trust": ZeroTrustTab,
  "ai-safety": AISafetyTab,
  updates: UpdatesTab,
  chaos: ChaosTab,
  verification: VerificationTab,
  redundancy: RedundancyTab,
};

export default function SecurityCommandCenter() {
  const [activeTab, setActiveTab] = useState<TabId>("posture");
  const { posture, refreshPosture } = useSecurityFabric();
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 backdrop-blur-2xl bg-background/80 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[hsl(var(--primary)/0.15)]">
                <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Security Command Center</h1>
                <p className="text-xs text-muted-foreground">Trust boundaries · Capability security · Runtime enforcement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                posture.overall === "nominal" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
                posture.overall === "elevated" ? "bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]" :
                "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
              )}>
                <span className={cn("w-2 h-2 rounded-full",
                  posture.overall === "nominal" ? "bg-[hsl(var(--trust-safe))]" :
                  posture.overall === "elevated" ? "bg-[hsl(var(--sita-gold))]" :
                  "bg-[hsl(var(--destructive))]"
                )} />
                {posture.overall}
              </div>
              <button onClick={refreshPosture} className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
