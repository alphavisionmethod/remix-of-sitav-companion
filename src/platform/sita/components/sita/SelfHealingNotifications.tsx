// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Notification System
// Detects issues, auto-resolves, and surfaces real-time alerts
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import {
  Heart, AlertTriangle, CheckCircle, Clock, RefreshCw, Shield,
  Zap, XCircle, Activity, Eye, ArrowRight, Bell, BellOff,
  Wrench, Database, Wifi, Server, ChevronDown
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

export interface SelfHealingEvent {
  id: string;
  timestamp: number;
  issueType: "connector-down" | "agent-crash" | "latency-spike" | "memory-leak" | "rate-limit" | "auth-expired" | "data-sync-fail" | "schema-drift" | "cert-expiring";
  severity: "info" | "warning" | "critical";
  component: string;
  description: string;
  autoResolved: boolean;
  resolution?: string;
  resolutionTimeMs?: number;
  status: "detected" | "diagnosing" | "healing" | "resolved" | "escalated" | "monitoring";
  retryCount: number;
  relatedEvents: string[];
  notificationSent: boolean;
  notificationChannel?: "in-app" | "email" | "sms";
}

// ── Mock Events ──────────────────────────────────────────────────

const generateEvents = (): SelfHealingEvent[] => {
  const now = Date.now();
  return [
    {
      id: "sh-1", timestamp: now - 30000, issueType: "connector-down", severity: "critical",
      component: "Stripe Payment Gateway", description: "Stripe webhook endpoint returned 503 for 3 consecutive checks",
      autoResolved: true, resolution: "Circuit breaker activated → fallback queue enabled → retried after 45s → connection restored",
      resolutionTimeMs: 48200, status: "resolved", retryCount: 3, relatedEvents: [], notificationSent: true, notificationChannel: "in-app",
    },
    {
      id: "sh-2", timestamp: now - 120000, issueType: "latency-spike", severity: "warning",
      component: "Revenue Autopilot Engine", description: "P95 latency exceeded 2000ms (measured: 3,450ms) during cold customer scan",
      autoResolved: true, resolution: "Identified N+1 query pattern → activated query cache → batched customer lookups → latency normalized to 180ms",
      resolutionTimeMs: 12500, status: "resolved", retryCount: 0, relatedEvents: ["sh-1"], notificationSent: true, notificationChannel: "in-app",
    },
    {
      id: "sh-3", timestamp: now - 300000, issueType: "agent-crash", severity: "critical",
      component: "Collections Chase Agent", description: "Agent crashed with OOM at step 6 escalation — INV-1035 processing halted",
      autoResolved: true, resolution: "Auto-restarted with increased memory allocation → recovered state from last checkpoint → resumed processing",
      resolutionTimeMs: 8900, status: "resolved", retryCount: 1, relatedEvents: [], notificationSent: true, notificationChannel: "email",
    },
    {
      id: "sh-4", timestamp: now - 600000, issueType: "rate-limit", severity: "warning",
      component: "Email Outreach Service", description: "Resend API rate limit hit — 50 emails queued but not sent",
      autoResolved: true, resolution: "Activated exponential backoff → redistributed to secondary provider → all 50 emails delivered within 8 minutes",
      resolutionTimeMs: 480000, status: "resolved", retryCount: 2, relatedEvents: [], notificationSent: false,
    },
    {
      id: "sh-5", timestamp: now - 900000, issueType: "data-sync-fail", severity: "warning",
      component: "Customer Health Score Sync", description: "Health score computation failed for 3 customers — stale data detected",
      autoResolved: true, resolution: "Invalidated cache → re-computed from source signals → scores updated for Johnson & Co, Premier Design, Bloom Studio",
      resolutionTimeMs: 5200, status: "resolved", retryCount: 0, relatedEvents: [], notificationSent: true, notificationChannel: "in-app",
    },
    {
      id: "sh-6", timestamp: now - 5000, issueType: "auth-expired", severity: "critical",
      component: "Twilio Integration", description: "OAuth token expired — outbound calling disabled",
      autoResolved: false, status: "diagnosing", retryCount: 1, relatedEvents: [],
      notificationSent: true, notificationChannel: "sms",
    },
    {
      id: "sh-7", timestamp: now - 1800000, issueType: "schema-drift", severity: "info",
      component: "Invoice Table Schema", description: "New column 'payment_method' detected in production but not in local schema",
      autoResolved: true, resolution: "Auto-generated migration diff → applied schema sync → types regenerated",
      resolutionTimeMs: 15000, status: "resolved", retryCount: 0, relatedEvents: [], notificationSent: false,
    },
    {
      id: "sh-8", timestamp: now - 60000, issueType: "cert-expiring", severity: "warning",
      component: "API Gateway SSL", description: "SSL certificate expires in 7 days — auto-renewal queued",
      autoResolved: false, status: "monitoring", retryCount: 0, relatedEvents: [],
      notificationSent: true, notificationChannel: "email",
    },
    {
      id: "sh-9", timestamp: now - 15000, issueType: "memory-leak", severity: "warning",
      component: "NLP Companion Service", description: "Memory usage growing 2.3% per hour — potential leak in intent parser cache",
      autoResolved: false, status: "healing", retryCount: 0, relatedEvents: [],
      notificationSent: true, notificationChannel: "in-app",
    },
  ];
};

// ── Helpers ──────────────────────────────────────────────────────

const severityColors: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  warning: "bg-urgency-high/10 text-urgency-high",
  critical: "bg-destructive/10 text-destructive",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  detected: AlertTriangle, diagnosing: Eye, healing: Wrench,
  resolved: CheckCircle, escalated: XCircle, monitoring: Activity,
};

const statusLabels: Record<string, { label: string; color: string }> = {
  detected: { label: "Detected", color: "bg-urgency-high/10 text-urgency-high" },
  diagnosing: { label: "Diagnosing", color: "bg-accent/10 text-accent" },
  healing: { label: "Auto-Healing", color: "bg-primary/10 text-primary" },
  resolved: { label: "Resolved", color: "bg-trust-safe/10 text-trust-safe" },
  escalated: { label: "Escalated", color: "bg-destructive/10 text-destructive" },
  monitoring: { label: "Monitoring", color: "bg-secondary text-muted-foreground" },
};

const issueIcons: Record<string, typeof Wifi> = {
  "connector-down": Wifi, "agent-crash": Server, "latency-spike": Activity,
  "memory-leak": Database, "rate-limit": Clock, "auth-expired": Shield,
  "data-sync-fail": RefreshCw, "schema-drift": Database, "cert-expiring": Shield,
};

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

const formatMs = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60000)}min`;
};

// ── Main Component ───────────────────────────────────────────────

export const SelfHealingNotifications = () => {
  const [events, setEvents] = useState(generateEvents);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      setEvents(prev => prev.map(e => {
        if (e.status === "diagnosing" && Math.random() > 0.7) {
          return { ...e, status: "healing" as const };
        }
        if (e.status === "healing" && Math.random() > 0.6) {
          return {
            ...e, status: "resolved" as const, autoResolved: true,
            resolution: "Auto-healed: refreshed credentials and restored connection",
            resolutionTimeMs: Math.floor(Math.random() * 30000) + 5000,
          };
        }
        return e;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const filtered = filter === "all" ? events :
    filter === "active" ? events.filter(e => e.status !== "resolved") :
    events.filter(e => e.status === "resolved");

  const stats = useMemo(() => {
    const resolved = events.filter(e => e.status === "resolved" && e.autoResolved);
    const active = events.filter(e => e.status !== "resolved");
    const avgTime = resolved.length > 0
      ? resolved.reduce((s, e) => s + (e.resolutionTimeMs || 0), 0) / resolved.length
      : 0;
    return {
      totalEvents: events.length,
      autoResolved: resolved.length,
      activeIssues: active.length,
      avgResolutionTime: formatMs(avgTime),
      autoHealRate: events.length > 0 ? Math.round((resolved.length / events.length) * 100) : 0,
      notificationsSent: events.filter(e => e.notificationSent).length,
    };
  }, [events]);

  return (
    <div className="space-y-5">
      <SitaSectionHeader title="Self-Healing Notifications" subtitle="Real-time issue detection, automatic resolution, and intelligent alerting" />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Auto-Heal Rate" value={`${stats.autoHealRate}%`} sub={`${stats.autoResolved}/${stats.totalEvents} resolved`} icon={Heart} trend="up" />
        <KPITile label="Active Issues" value={String(stats.activeIssues)} sub={stats.activeIssues === 0 ? "All clear" : "Being handled"} icon={AlertTriangle} />
        <KPITile label="Avg Resolution" value={stats.avgResolutionTime} sub="Auto-heal time" icon={Clock} trend="up" />
        <KPITile label="Notifications" value={String(stats.notificationsSent)} sub="Alerts sent" icon={Bell} />
        <KPITile label="Retries" value={String(events.reduce((s, e) => s + e.retryCount, 0))} sub="Auto-retry attempts" icon={RefreshCw} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "active", "resolved"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize ${
                filter === f ? "gradient-sita text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {f} ({f === "all" ? events.length : f === "active" ? stats.activeIssues : stats.autoResolved})
            </button>
          ))}
        </div>
        <button onClick={() => setLiveMode(!liveMode)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
            liveMode ? "bg-trust-safe/10 text-trust-safe" : "bg-secondary text-muted-foreground"
          }`}>
          {liveMode ? <><Activity className="h-3 w-3" /> Live</> : <><BellOff className="h-3 w-3" /> Paused</>}
        </button>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.sort((a, b) => b.timestamp - a.timestamp).map((ev, i) => {
            const IssueIcon = issueIcons[ev.issueType] || AlertTriangle;
            const StatusIcon = statusIcons[ev.status] || Activity;
            const sLabel = statusLabels[ev.status];
            const expanded = expandedId === ev.id;

            return (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <SitaCard className={`p-4 ${ev.status !== "resolved" && ev.severity === "critical" ? "border-destructive/20" : ""}`}
                  onClick={() => setExpandedId(expanded ? null : ev.id)} hover>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${severityColors[ev.severity]}`}>
                      <IssueIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{ev.component}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${sLabel.color} flex items-center gap-1`}>
                          <StatusIcon className="h-2.5 w-2.5" /> {sLabel.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${severityColors[ev.severity]}`}>{ev.severity}</span>
                        {ev.autoResolved && (
                          <span className="rounded-full bg-trust-safe/10 px-2 py-0.5 text-[9px] font-medium text-trust-safe flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" /> Auto-healed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span>{timeAgo(ev.timestamp)}</span>
                        {ev.resolutionTimeMs && <span>Resolved in {formatMs(ev.resolutionTimeMs)}</span>}
                        {ev.retryCount > 0 && <span>{ev.retryCount} retries</span>}
                        {ev.notificationSent && <span className="flex items-center gap-0.5"><Bell className="h-2.5 w-2.5" /> {ev.notificationChannel}</span>}
                      </div>

                      {/* Expanded resolution details */}
                      <AnimatePresence>
                        {expanded && ev.resolution && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 rounded-lg bg-trust-safe/5 border border-trust-safe/10">
                            <p className="text-[10px] font-semibold text-trust-safe uppercase mb-1">Resolution Chain</p>
                            <p className="text-[11px] text-foreground leading-relaxed">{ev.resolution}</p>
                          </motion.div>
                        )}
                        {expanded && !ev.resolution && ev.status !== "resolved" && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 rounded-lg bg-urgency-high/5 border border-urgency-high/10">
                            <p className="text-[10px] font-semibold text-urgency-high uppercase mb-1">Active Response</p>
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-3 w-3 text-urgency-high animate-spin" />
                              <p className="text-[11px] text-foreground">
                                {ev.status === "diagnosing" ? "Running diagnostic checks..." :
                                 ev.status === "healing" ? "Executing auto-repair sequence..." :
                                 ev.status === "monitoring" ? "Under observation — no intervention needed yet" :
                                 "Awaiting manual intervention"}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </SitaCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SelfHealingNotifications;
