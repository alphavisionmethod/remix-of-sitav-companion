// ═══════════════════════════════════════════════════════════════
// SITA OS — Redundancy & Failover Engine
// Service replicas, health-based failover, queue redundancy,
// notification fallback, degraded mode, regional awareness
// Covers: Master Prompt Section 21
// ═══════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────

export type ReplicaStatus = "active" | "standby" | "draining" | "failed" | "recovering";
export type FailoverMode = "automatic" | "manual" | "semi-auto";
export type RegionStatus = "primary" | "secondary" | "degraded" | "offline";
export type NotificationChannel = "push" | "sms" | "email" | "in-app" | "webhook";

export interface ServiceReplica {
  id: string;
  serviceId: string;
  serviceName: string;
  status: ReplicaStatus;
  region: string;
  healthScore: number; // 0–100
  lastHealthCheck: string;
  uptimeMs: number;
  requestsServed: number;
  errorRate: number;
  promoted: boolean;
  promotedAt: string | null;
}

export interface ServiceDefinition {
  serviceId: string;
  serviceName: string;
  minReplicas: number;
  maxReplicas: number;
  failoverMode: FailoverMode;
  healthThreshold: number; // below this = unhealthy
  criticalService: boolean;
}

export interface QueueRedundancy {
  queueId: string;
  queueName: string;
  primaryDepth: number;
  overflowDepth: number;
  overflowActive: boolean;
  lastOverflowAt: string | null;
  totalProcessed: number;
  deadLettered: number;
}

export interface NotificationFallback {
  channels: NotificationChannel[];
  currentChannel: NotificationChannel;
  failedChannels: NotificationChannel[];
  fallbackAttempts: number;
  lastDelivery: string | null;
  deliveryRate: number;
}

export interface DegradedCapability {
  capability: string;
  status: "available" | "degraded" | "unavailable";
  fallbackMode: string;
  impactDescription: string;
}

export interface RegionInfo {
  regionId: string;
  regionName: string;
  status: RegionStatus;
  latencyMs: number;
  replicaCount: number;
  lastFailoverAt: string | null;
}

export interface FailoverEvent {
  id: string;
  timestamp: string;
  serviceId: string;
  fromReplicaId: string;
  toReplicaId: string;
  reason: string;
  automatic: boolean;
  durationMs: number;
  successful: boolean;
}

// ── Engine ────────────────────────────────────────────────────

export class RedundancyFailoverEngine {
  private services = new Map<string, ServiceDefinition>();
  private replicas = new Map<string, ServiceReplica>();
  private queues = new Map<string, QueueRedundancy>();
  private notifications: NotificationFallback;
  private degradedCaps: DegradedCapability[] = [];
  private regions = new Map<string, RegionInfo>();
  private failoverHistory: FailoverEvent[] = [];
  private listeners: Array<(event: FailoverEvent) => void> = [];
  private readonly maxHistory = 200;

  constructor() {
    this.notifications = { channels: ["push", "sms", "email", "in-app", "webhook"], currentChannel: "push", failedChannels: [], fallbackAttempts: 0, lastDelivery: null, deliveryRate: 99.5 };
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defaultServices: ServiceDefinition[] = [
      { serviceId: "auth", serviceName: "Authentication", minReplicas: 2, maxReplicas: 4, failoverMode: "automatic", healthThreshold: 60, criticalService: true },
      { serviceId: "approval", serviceName: "Approval Service", minReplicas: 2, maxReplicas: 3, failoverMode: "automatic", healthThreshold: 70, criticalService: true },
      { serviceId: "audit", serviceName: "Audit Service", minReplicas: 2, maxReplicas: 3, failoverMode: "automatic", healthThreshold: 50, criticalService: true },
      { serviceId: "ai-gateway", serviceName: "AI Gateway", minReplicas: 2, maxReplicas: 5, failoverMode: "semi-auto", healthThreshold: 65, criticalService: true },
      { serviceId: "event-bus", serviceName: "Event Bus", minReplicas: 2, maxReplicas: 4, failoverMode: "automatic", healthThreshold: 60, criticalService: true },
      { serviceId: "storage", serviceName: "Storage Service", minReplicas: 2, maxReplicas: 3, failoverMode: "automatic", healthThreshold: 50, criticalService: false },
      { serviceId: "notification", serviceName: "Notification Service", minReplicas: 1, maxReplicas: 3, failoverMode: "automatic", healthThreshold: 50, criticalService: false },
      { serviceId: "sync", serviceName: "Sync Engine", minReplicas: 2, maxReplicas: 4, failoverMode: "automatic", healthThreshold: 55, criticalService: true },
    ];

    for (const svc of defaultServices) {
      this.services.set(svc.serviceId, svc);
      // Create default replicas
      for (let i = 0; i < svc.minReplicas; i++) {
        const replicaId = `${svc.serviceId}-r${i}`;
        this.replicas.set(replicaId, {
          id: replicaId, serviceId: svc.serviceId, serviceName: svc.serviceName,
          status: i === 0 ? "active" : "standby", region: i === 0 ? "us-east-1" : "eu-west-1",
          healthScore: 95 + Math.round(Math.random() * 5), lastHealthCheck: new Date().toISOString(),
          uptimeMs: 86400000 + Math.round(Math.random() * 86400000), requestsServed: Math.round(Math.random() * 100000),
          errorRate: Math.random() * 0.5, promoted: i === 0, promotedAt: i === 0 ? new Date().toISOString() : null,
        });
      }
    }

    // Default queues
    for (const q of ["command-queue", "event-queue", "approval-queue", "audit-queue"]) {
      this.queues.set(q, { queueId: q, queueName: q.replace(/-/g, " "), primaryDepth: 0, overflowDepth: 0, overflowActive: false, lastOverflowAt: null, totalProcessed: Math.round(Math.random() * 50000), deadLettered: Math.round(Math.random() * 5) });
    }

    // Default regions
    this.regions.set("us-east-1", { regionId: "us-east-1", regionName: "US East", status: "primary", latencyMs: 12, replicaCount: 8, lastFailoverAt: null });
    this.regions.set("eu-west-1", { regionId: "eu-west-1", regionName: "EU West", status: "secondary", latencyMs: 45, replicaCount: 8, lastFailoverAt: null });

    // Default degraded capabilities
    this.degradedCaps = [
      { capability: "AI Inference", status: "available", fallbackMode: "model-downgrade", impactDescription: "Falls back to lighter model if primary unavailable" },
      { capability: "Real-time Sync", status: "available", fallbackMode: "eventual-consistency", impactDescription: "Degrades to eventual consistency if websocket fails" },
      { capability: "Push Notifications", status: "available", fallbackMode: "email-fallback", impactDescription: "Falls back to email if push service is down" },
      { capability: "Approval Workflow", status: "available", fallbackMode: "queued-approval", impactDescription: "Queues approvals locally if service is down" },
    ];
  }

  // ── Health Check & Failover ───────────────────────────────

  reportHealth(replicaId: string, healthScore: number): FailoverEvent | null {
    const replica = this.replicas.get(replicaId);
    if (!replica) return null;

    replica.healthScore = healthScore;
    replica.lastHealthCheck = new Date().toISOString();

    const svc = this.services.get(replica.serviceId);
    if (!svc) return null;

    // Check if active replica is unhealthy
    if (replica.status === "active" && healthScore < svc.healthThreshold && svc.failoverMode !== "manual") {
      return this.performFailover(replica.serviceId, replicaId, `Health score ${healthScore} below threshold ${svc.healthThreshold}`);
    }

    return null;
  }

  private performFailover(serviceId: string, failedReplicaId: string, reason: string): FailoverEvent | null {
    const start = performance.now();
    const serviceReplicas = Array.from(this.replicas.values()).filter((r) => r.serviceId === serviceId);
    const standby = serviceReplicas.find((r) => r.status === "standby" && r.healthScore >= 50);

    if (!standby) return null;

    const failed = this.replicas.get(failedReplicaId)!;
    failed.status = "failed";
    failed.promoted = false;
    standby.status = "active";
    standby.promoted = true;
    standby.promotedAt = new Date().toISOString();

    const event: FailoverEvent = {
      id: `fo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      serviceId, fromReplicaId: failedReplicaId, toReplicaId: standby.id,
      reason, automatic: true, durationMs: Math.round(performance.now() - start), successful: true,
    };

    this.failoverHistory.push(event);
    if (this.failoverHistory.length > this.maxHistory) this.failoverHistory = this.failoverHistory.slice(-this.maxHistory);
    for (const l of this.listeners) { try { l(event); } catch { /* swallow */ } }
    return event;
  }

  // ── Notification Fallback ─────────────────────────────────

  reportNotificationFailure(channel: NotificationChannel): NotificationChannel | null {
    if (!this.notifications.failedChannels.includes(channel)) {
      this.notifications.failedChannels.push(channel);
    }
    const next = this.notifications.channels.find((c) => !this.notifications.failedChannels.includes(c));
    if (next) {
      this.notifications.currentChannel = next;
      this.notifications.fallbackAttempts++;
      return next;
    }
    return null; // All channels failed
  }

  getNotificationStatus(): NotificationFallback { return { ...this.notifications }; }

  // ── Degraded Mode ─────────────────────────────────────────

  setCapabilityStatus(capability: string, status: DegradedCapability["status"]): void {
    const cap = this.degradedCaps.find((c) => c.capability === capability);
    if (cap) cap.status = status;
  }

  getDegradedCapabilities(): DegradedCapability[] { return [...this.degradedCaps]; }

  // ── Region Info ───────────────────────────────────────────

  getRegions(): RegionInfo[] { return Array.from(this.regions.values()); }

  // ── Query ─────────────────────────────────────────────────

  getServiceReplicas(serviceId: string): ServiceReplica[] {
    return Array.from(this.replicas.values()).filter((r) => r.serviceId === serviceId);
  }

  getAllReplicas(): ServiceReplica[] { return Array.from(this.replicas.values()); }
  getAllServices(): ServiceDefinition[] { return Array.from(this.services.values()); }
  getAllQueues(): QueueRedundancy[] { return Array.from(this.queues.values()); }
  getFailoverHistory(limit = 20): FailoverEvent[] { return this.failoverHistory.slice(-limit); }

  onFailover(listener: (event: FailoverEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const replicas = Array.from(this.replicas.values());
    const activeReplicas = replicas.filter((r) => r.status === "active").length;
    const failedReplicas = replicas.filter((r) => r.status === "failed").length;
    const avgHealth = replicas.length > 0 ? Math.round(replicas.reduce((a, r) => a + r.healthScore, 0) / replicas.length) : 100;
    const totalFailovers = this.failoverHistory.length;
    const successfulFailovers = this.failoverHistory.filter((f) => f.successful).length;
    const degradedCount = this.degradedCaps.filter((c) => c.status !== "available").length;

    return { totalReplicas: replicas.length, activeReplicas, failedReplicas, avgHealth, totalFailovers, successfulFailovers, degradedCount, regionCount: this.regions.size };
  }
}

// ── Factory ───────────────────────────────────────────────────

export function createRedundancyFailoverEngine(): RedundancyFailoverEngine {
  return new RedundancyFailoverEngine();
}
