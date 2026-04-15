// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Sync Engine
// Smart preloading, workspace pre-restore, VPN suggestions
// ═══════════════════════════════════════════════════════════════

/** Prediction types */
export type PredictionType =
  | "preload-document"
  | "pin-file"
  | "pre-restore-workspace"
  | "suggest-vpn"
  | "suggest-sync-setting"
  | "device-bootstrap";

/** A sync prediction/recommendation */
export interface SyncPrediction {
  id: string;
  type: PredictionType;
  title: string;
  description: string;
  confidence: number; // 0–1
  /** What to do */
  action: PredictionAction;
  /** Why this was predicted */
  reasoning: string;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "dismissed" | "expired" | "auto-applied";
  /** Whether this can be auto-applied without user confirmation */
  autoApplicable: boolean;
  /** Privacy level — what data was used */
  privacyLevel: "device-local" | "cross-device" | "cloud-assisted";
}

export interface PredictionAction {
  type: "preload" | "pin" | "restore" | "navigate" | "configure" | "inform";
  targetObjectIds?: string[];
  targetNamespace?: string;
  configPayload?: Record<string, unknown>;
  message?: string;
}

/** User activity pattern used for prediction */
export interface ActivityPattern {
  appId: string;
  frequency: number; // times per day
  timeOfDay: number[]; // hours when typically used
  coLaunchedWith: string[]; // apps often used together
  recentDocuments: string[]; // recently accessed objects
  lastUsedDevice: string;
}

/** Predictive sync configuration */
export interface PredictiveSyncConfig {
  enabled: boolean;
  autoApplyLowRisk: boolean;
  maxPredictions: number;
  preloadAggressiveness: "conservative" | "moderate" | "aggressive";
  privacyMode: "strict" | "balanced" | "full";
}

class PredictiveSyncEngine {
  private config: PredictiveSyncConfig = {
    enabled: true,
    autoApplyLowRisk: true,
    maxPredictions: 10,
    preloadAggressiveness: "moderate",
    privacyMode: "balanced",
  };

  private predictions: SyncPrediction[] = [];
  private activityPatterns = new Map<string, ActivityPattern>();
  private listeners: Array<(prediction: SyncPrediction) => void> = [];
  private analyzeInterval: ReturnType<typeof setInterval> | null = null;

  /** Start the predictive engine */
  start(): void {
    if (!this.config.enabled) return;
    // Analyze patterns periodically
    this.analyzeInterval = setInterval(() => this.analyzeAndPredict(), 60000);
    // Initial analysis
    this.analyzeAndPredict();
    console.log("[PredictiveSyncEngine] Started");
  }

  /** Stop the engine */
  stop(): void {
    if (this.analyzeInterval) clearInterval(this.analyzeInterval);
    this.analyzeInterval = null;
  }

  /** Record an activity for pattern learning */
  recordActivity(appId: string, documentId?: string): void {
    const hour = new Date().getHours();
    const existing = this.activityPatterns.get(appId);

    if (existing) {
      existing.frequency++;
      if (!existing.timeOfDay.includes(hour)) existing.timeOfDay.push(hour);
      if (documentId && !existing.recentDocuments.includes(documentId)) {
        existing.recentDocuments.unshift(documentId);
        existing.recentDocuments = existing.recentDocuments.slice(0, 20);
      }
    } else {
      this.activityPatterns.set(appId, {
        appId,
        frequency: 1,
        timeOfDay: [hour],
        coLaunchedWith: [],
        recentDocuments: documentId ? [documentId] : [],
        lastUsedDevice: "current-device",
      });
    }
  }

  /** Record co-launch pattern */
  recordCoLaunch(appA: string, appB: string): void {
    const patternA = this.activityPatterns.get(appA);
    if (patternA && !patternA.coLaunchedWith.includes(appB)) {
      patternA.coLaunchedWith.push(appB);
    }
    const patternB = this.activityPatterns.get(appB);
    if (patternB && !patternB.coLaunchedWith.includes(appA)) {
      patternB.coLaunchedWith.push(appA);
    }
  }

  /** Get current predictions */
  getPredictions(): SyncPrediction[] {
    return this.predictions.filter(p => p.status === "pending");
  }

  /** Get all predictions including history */
  getAllPredictions(): SyncPrediction[] {
    return [...this.predictions];
  }

  /** Accept a prediction */
  acceptPrediction(predictionId: string): boolean {
    const p = this.predictions.find(pr => pr.id === predictionId);
    if (!p || p.status !== "pending") return false;
    p.status = "accepted";
    return true;
  }

  /** Dismiss a prediction */
  dismissPrediction(predictionId: string): boolean {
    const p = this.predictions.find(pr => pr.id === predictionId);
    if (!p || p.status !== "pending") return false;
    p.status = "dismissed";
    return true;
  }

  /** Get activity patterns */
  getActivityPatterns(): ActivityPattern[] {
    return Array.from(this.activityPatterns.values());
  }

  /** Update config */
  setConfig(config: Partial<PredictiveSyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Get config */
  getConfig(): PredictiveSyncConfig {
    return { ...this.config };
  }

  /** Subscribe to new predictions */
  onPrediction(handler: (prediction: SyncPrediction) => void): () => void {
    this.listeners.push(handler);
    return () => { this.listeners = this.listeners.filter(h => h !== handler); };
  }

  // ─── Analysis Engine ────────────────────────

  private analyzeAndPredict(): void {
    // Clean expired
    this.predictions = this.predictions.filter(p => {
      if (p.status === "pending" && new Date(p.expiresAt).getTime() < Date.now()) {
        p.status = "expired";
      }
      return true;
    });

    // Don't exceed max predictions
    if (this.getPredictions().length >= this.config.maxPredictions) return;

    const hour = new Date().getHours();

    // 1. Preload documents likely needed soon
    for (const [appId, pattern] of this.activityPatterns) {
      if (pattern.timeOfDay.includes(hour) && pattern.recentDocuments.length > 0) {
        this.addPrediction({
          type: "preload-document",
          title: `Preload ${appId} documents`,
          description: `You usually use ${appId} around this time. Preloading recent documents.`,
          confidence: Math.min(0.9, pattern.frequency / 100),
          action: { type: "preload", targetObjectIds: pattern.recentDocuments.slice(0, 5) },
          reasoning: `Based on ${pattern.frequency} uses, typically at ${pattern.timeOfDay.join(", ")}h`,
          autoApplicable: true,
          privacyLevel: "device-local",
        });
      }
    }

    // 2. Suggest VPN on public networks
    if (!navigator.onLine) return;
    const conn = (navigator as any).connection;
    if (conn?.effectiveType === "4g" || conn?.effectiveType === "3g") {
      // Could detect public wifi — simplified here
    }

    // 3. Pre-restore workspace prediction
    const frequentApps = Array.from(this.activityPatterns.values())
      .filter(p => p.timeOfDay.includes(hour))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    if (frequentApps.length >= 2) {
      this.addPrediction({
        type: "pre-restore-workspace",
        title: "Restore your workspace?",
        description: `Open ${frequentApps.map(a => a.appId).join(", ")} — your usual apps at this time.`,
        confidence: 0.7,
        action: {
          type: "restore",
          configPayload: { apps: frequentApps.map(a => a.appId) },
        },
        reasoning: `These apps are frequently used together around ${hour}:00`,
        autoApplicable: false,
        privacyLevel: "device-local",
      });
    }
  }

  private addPrediction(params: Omit<SyncPrediction, "id" | "createdAt" | "expiresAt" | "status">): void {
    // Deduplicate
    const existing = this.predictions.find(
      p => p.type === params.type && p.title === params.title && p.status === "pending"
    );
    if (existing) return;

    const prediction: SyncPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      status: "pending",
    };

    // Auto-apply if low risk and configured
    if (this.config.autoApplyLowRisk && params.autoApplicable && params.confidence > 0.8) {
      prediction.status = "auto-applied";
    }

    this.predictions.push(prediction);
    for (const handler of this.listeners) handler(prediction);
  }
}

/** Singleton predictive sync engine */
export const predictiveSync = new PredictiveSyncEngine();
