// ═══════════════════════════════════════════════════════════════
// SITA OS — Security & Accounts Settings Panel
// Identity management, auth methods, sessions, device trust
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Key, Fingerprint, Smartphone, Lock, LogOut, Clock,
  Eye, EyeOff, CheckCircle, AlertTriangle, Plus, Trash2, RefreshCw,
  Monitor, Globe, ChevronRight, User, Settings, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthDaemon } from "@/lib/os-security/authd";
import { getSessionDaemon } from "@/lib/os-security/sessiond";
import { getAuditDaemon } from "@/lib/os-security/auditd";
import type { OSAuthMethod, OSSession } from "@/lib/os-security/types";

// ── Section Nav ──────────────────────────────────────────────

type Section = "overview" | "auth-methods" | "sessions" | "devices" | "audit";

const SECTIONS: { id: Section; label: string; icon: typeof Shield }[] = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "auth-methods", label: "Authentication", icon: Key },
  { id: "sessions", label: "Active Sessions", icon: Monitor },
  { id: "devices", label: "Trusted Devices", icon: Smartphone },
  { id: "audit", label: "Security Log", icon: Clock },
];

// ── Auth Method Card ─────────────────────────────────────────

function AuthMethodCard({
  method, enrolled, lastUsed, onEnroll, onRemove,
}: {
  method: OSAuthMethod;
  enrolled: boolean;
  lastUsed?: string;
  onEnroll: () => void;
  onRemove: () => void;
}) {
  const config: Record<OSAuthMethod, { icon: typeof Key; label: string; description: string }> = {
    password: { icon: Lock, label: "Password", description: "Primary authentication credential" },
    pin: { icon: Key, label: "PIN", description: "Quick numeric unlock code" },
    biometric: { icon: Fingerprint, label: "Biometric", description: "Fingerprint or face recognition" },
    "security-key": { icon: Shield, label: "Security Key", description: "Hardware security key (FIDO2)" },
  };

  const c = config[method];
  const Icon = c.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        enrolled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{c.label}</span>
          {enrolled && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
        {lastUsed && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">Last used: {lastUsed}</p>
        )}
      </div>
      {enrolled ? (
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onEnroll} className="gap-1.5 border-white/10 hover:bg-white/[0.06]">
          <Plus className="h-3.5 w-3.5" />
          Setup
        </Button>
      )}
    </div>
  );
}

// ── Session Card ─────────────────────────────────────────────

function SessionCard({
  session, isCurrent, onRevoke,
}: {
  session: OSSession;
  isCurrent: boolean;
  onRevoke: () => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-colors",
      isCurrent
        ? "border-sita-purple/20 bg-sita-purple/5"
        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
    )}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
        <Monitor className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {session.displayId || "Unknown Device"}
          </span>
          {isCurrent && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sita-purple/20 text-sita-purple">
              Current
            </span>
          )}
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-medium",
            session.state === "active" ? "bg-emerald-500/10 text-emerald-400" :
            session.state === "locked" ? "bg-amber-500/10 text-amber-400" :
            "bg-white/[0.05] text-muted-foreground"
          )}>
            {session.state}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Role: {session.role} · Since {new Date(session.createdAt).toLocaleString()}
        </p>
      </div>
      {!isCurrent && (
        <Button variant="ghost" size="sm" onClick={onRevoke} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1">
          <LogOut className="h-3.5 w-3.5" />
          Revoke
        </Button>
      )}
    </div>
  );
}

// ── Audit Event Row ──────────────────────────────────────────

function AuditRow({ event }: { event: { action: string; decision: string; severity: string; timestamp: number } }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 border-b border-white/[0.04] last:border-0">
      <div className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md",
        event.decision === "allowed" ? "bg-emerald-500/10 text-emerald-400" :
        event.decision === "denied" ? "bg-red-500/10 text-red-400" :
        "bg-amber-500/10 text-amber-400"
      )}>
        {event.decision === "allowed" ? <CheckCircle className="h-3 w-3" /> :
         event.decision === "denied" ? <AlertTriangle className="h-3 w-3" /> :
         <Clock className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <code className="text-xs font-mono text-foreground/80 truncate block">{event.action}</code>
      </div>
      <span className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded",
        event.severity === "critical" ? "bg-red-500/10 text-red-400" :
        event.severity === "high" ? "bg-orange-500/10 text-orange-400" :
        event.severity === "warning" ? "bg-amber-500/10 text-amber-400" :
        "bg-white/[0.05] text-muted-foreground"
      )}>
        {event.severity}
      </span>
      <span className="text-[10px] text-muted-foreground/60 tabular-nums w-16 text-right">
        {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────

export function SecurityAccountsPanel() {
  const [section, setSection] = useState<Section>("overview");
  const [enrolledMethods, setEnrolledMethods] = useState<OSAuthMethod[]>(["password"]);
  const [sessions, setSessions] = useState<OSSession[]>([]);
  const [auditEvents, setAuditEvents] = useState<Array<{ action: string; decision: string; severity: string; timestamp: number }>>([]);
  const [securityScore, setSecurityScore] = useState(72);

  // Load data
  useEffect(() => {
    try {
      const authd = getAuthDaemon();
      const sessiond = getSessionDaemon();
      const auditd = getAuditDaemon();

      const allSessions = sessiond.getAllSessions();
      setSessions(allSessions);

      const events = auditd.getEvents({ limit: 50 });
      setAuditEvents(events.map(e => ({
        action: e.action,
        decision: e.decision,
        severity: e.severity,
        timestamp: e.timestamp,
      })));

      // Calculate score
      let score = 50;
      if (enrolledMethods.includes("password")) score += 15;
      if (enrolledMethods.includes("pin")) score += 10;
      if (enrolledMethods.includes("biometric")) score += 15;
      if (enrolledMethods.includes("security-key")) score += 10;
      setSecurityScore(Math.min(100, score));
    } catch (e) {
      // Daemons may not be booted yet
    }
  }, [section, enrolledMethods]);

  const handleEnroll = useCallback((method: OSAuthMethod) => {
    setEnrolledMethods(prev => [...prev, method]);
  }, []);

  const handleRemove = useCallback((method: OSAuthMethod) => {
    if (method === "password") return; // Can't remove password
    setEnrolledMethods(prev => prev.filter(m => m !== method));
  }, []);

  return (
    <div className="flex h-full min-h-[500px] text-foreground">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-white/[0.06] bg-white/[0.01] p-3 space-y-0.5">
        <div className="flex items-center gap-2 px-3 py-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sita-purple/15">
            <User className="h-5 w-5 text-sita-purple" />
          </div>
          <div>
            <p className="text-sm font-medium">SITA User</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>

        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                section === s.id
                  ? "bg-sita-purple/15 text-sita-purple font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {section === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Security Overview</h2>
              <p className="text-sm text-muted-foreground">Manage your identity, authentication, and device trust</p>
            </div>

            {/* Security Score */}
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">Security Score</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on your authentication setup</p>
                </div>
                <div className={cn(
                  "text-3xl font-bold tabular-nums",
                  securityScore >= 80 ? "text-emerald-400" :
                  securityScore >= 60 ? "text-amber-400" : "text-red-400"
                )}>
                  {securityScore}
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    securityScore >= 80 ? "bg-emerald-500" :
                    securityScore >= 60 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Auth Methods", value: enrolledMethods.length, icon: Key, color: "text-sita-purple" },
                { label: "Active Sessions", value: sessions.length || 1, icon: Monitor, color: "text-blue-400" },
                { label: "Audit Events", value: auditEvents.length, icon: Clock, color: "text-amber-400" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Icon className={cn("h-5 w-5 mb-2", stat.color)} />
                    <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recommendations</h3>
              {!enrolledMethods.includes("biometric") && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <Fingerprint className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-muted-foreground flex-1">Enable biometric authentication for faster, more secure access</span>
                  <Button variant="ghost" size="sm" onClick={() => { handleEnroll("biometric"); }} className="text-xs">
                    Enable
                  </Button>
                </div>
              )}
              {!enrolledMethods.includes("security-key") && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground flex-1">Add a security key for the strongest protection</span>
                  <Button variant="ghost" size="sm" onClick={() => { handleEnroll("security-key"); }} className="text-xs">
                    Setup
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {section === "auth-methods" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Authentication Methods</h2>
              <p className="text-sm text-muted-foreground">Manage how you verify your identity</p>
            </div>
            {(["password", "pin", "biometric", "security-key"] as OSAuthMethod[]).map((m) => (
              <AuthMethodCard
                key={m}
                method={m}
                enrolled={enrolledMethods.includes(m)}
                lastUsed={m === "password" ? "Just now" : undefined}
                onEnroll={() => handleEnroll(m)}
                onRemove={() => handleRemove(m)}
              />
            ))}
          </div>
        )}

        {section === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Active Sessions</h2>
                <p className="text-sm text-muted-foreground">Manage your signed-in sessions</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-red-400 hover:bg-red-500/10">
                <LogOut className="h-3.5 w-3.5" />
                Revoke All Others
              </Button>
            </div>
            {(sessions.length > 0 ? sessions : [{
              sessionId: "current",
              userId: "demo",
              role: "admin" as const,
              state: "active" as const,
              createdAt: Date.now() - 3600000,
              lastActivityAt: Date.now(),
              locked: false,
              capabilities: [],
              enrolledMethods: ["password" as const],
              displayId: "This browser",
              seatId: "seat-0",
              authFreshUntil: Date.now() + 300000,
            }]).map((s) => (
              <SessionCard
                key={s.sessionId}
                session={s}
                isCurrent={s.sessionId === "current" || sessions.indexOf(s) === 0}
                onRevoke={() => {
                  setSessions(prev => prev.filter(p => p.sessionId !== s.sessionId));
                }}
              />
            ))}
          </div>
        )}

        {section === "devices" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Trusted Devices</h2>
              <p className="text-sm text-muted-foreground">Devices that can access your account</p>
            </div>
            {[
              { name: "This Browser", type: "browser", trusted: true, lastSeen: "Now" },
              { name: "SITA Desktop App", type: "desktop", trusted: true, lastSeen: "2 hours ago" },
            ].map((device, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                  {device.type === "browser" ? <Globe className="h-5 w-5 text-muted-foreground" /> : <Monitor className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{device.name}</span>
                    {device.trusted && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Trusted</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Last seen: {device.lastSeen}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {section === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Security Log</h2>
                <p className="text-sm text-muted-foreground">Recent security-relevant events</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 border-white/10">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {auditEvents.length > 0 ? (
                auditEvents.map((e, i) => <AuditRow key={i} event={e} />)
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No security events recorded yet</p>
                  <p className="text-xs mt-1">Events will appear as you use the system</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}