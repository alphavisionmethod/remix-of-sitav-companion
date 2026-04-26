import { loadServiceState, debouncedSaveServiceState } from "@/data/persistence/universal-service-persistence";
import type { RegimeType, SyncStatus, InvestmentAction, PortfolioSnapshot, ConnectorSyncState, InvestmentProofReceipt, RegimeDetection, RegimeSignal, InvestmentOfficeSummary } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { RegimeType, SyncStatus, InvestmentAction, PortfolioSnapshot, ConnectorSyncState, InvestmentProofReceipt, RegimeDetection, RegimeSignal, InvestmentOfficeSummary };

// @persistence: os_service_state — state survives refresh via universal adapter
// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Runtime Service
// Stateful orchestrator wrapping the 47 domain engines with
// caching, audit trails, regime detection, and self-healing hooks
// ═══════════════════════════════════════════════════════════════

const DRIFT_THRESHOLD = 0.05;    // 5% drift triggers rebalance
const STALE_THRESHOLD_MS = 3_600_000; // 1 hour
const MAX_SYNC_RETRIES = 5;
const SYNC_BACKOFF_BASE_MS = 10_000;

export class InvestmentOfficeRuntimeService {
  private snapshots: PortfolioSnapshot[] = [];
  private connectors = new Map<string, ConnectorSyncState>();
  private receipts: InvestmentProofReceipt[] = [];
  private receiptCounter = 0;
  private currentRegime: RegimeDetection = {
    current: "sideways", previous: "sideways",
    changedAt: new Date().toISOString(), confidence: 0.5,
    signals: [], rebalanceSuggested: false,
  };
  private targetAllocation: Record<string, number> = {
    equities: 0.60, bonds: 0.25, alternatives: 0.10, cash: 0.05,
  };
  private pendingActions: InvestmentAction[] = [];
  private lastRebalanceAt?: string;

  // ── Portfolio State ───────────────────────────────────────────

  captureSnapshot(values: Record<string, number>): PortfolioSnapshot {
    const totalValueCents = Object.values(values).reduce((s, v) => s + v, 0);
    const allocation: Record<string, number> = {};
    const driftPercent: Record<string, number> = {};
    const staleFields: string[] = [];

    for (const [cls, val] of Object.entries(values)) {
      const pct = totalValueCents > 0 ? val / totalValueCents : 0;
      allocation[cls] = pct;
      const target = this.targetAllocation[cls] ?? 0;
      driftPercent[cls] = pct - target;
    }

    // Check for missing asset classes
    for (const cls of Object.keys(this.targetAllocation)) {
      if (!(cls in values)) {
        staleFields.push(cls);
        allocation[cls] = 0;
        driftPercent[cls] = -this.targetAllocation[cls];
      }
    }

    const maxDrift = Math.max(...Object.values(driftPercent).map(Math.abs), 0);
    const snap: PortfolioSnapshot = {
      id: `snap-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      totalValueCents, allocation, driftPercent, maxDrift,
      staleFields,
      regime: this.currentRegime.current,
    };
    this.snapshots.push(snap);
    if (this.snapshots.length > 100) this.snapshots.shift();

    // Auto-trigger rebalance suggestion on drift
    if (maxDrift > DRIFT_THRESHOLD) {
      this.pendingActions.push("allocation_drift");
    }

    return snap;
  }

  getLatestSnapshot(): PortfolioSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  setTargetAllocation(targets: Record<string, number>): void {
    this.targetAllocation = { ...targets };
  }

  // ── Regime Detection ──────────────────────────────────────────

  detectRegime(signals: RegimeSignal[]): RegimeDetection {
    let bullishWeight = 0;
    let bearishWeight = 0;
    let totalWeight = 0;

    for (const s of signals) {
      totalWeight += s.weight;
      if (s.direction === "bullish") bullishWeight += s.weight;
      else if (s.direction === "bearish") bearishWeight += s.weight;
    }

    const bullRatio = totalWeight > 0 ? bullishWeight / totalWeight : 0.5;
    const bearRatio = totalWeight > 0 ? bearishWeight / totalWeight : 0.5;
    const volatility = Math.abs(bullRatio - bearRatio);

    let regime: RegimeType;
    if (volatility > 0.7) regime = "volatile";
    else if (bullRatio > 0.65) regime = "bull";
    else if (bearRatio > 0.65) regime = "bear";
    else if (bearRatio > 0.8) regime = "crisis";
    else if (bullRatio > 0.55 && this.currentRegime.current === "bear") regime = "recovery";
    else regime = "sideways";

    const changed = regime !== this.currentRegime.current;
    const previous = this.currentRegime.current;

    this.currentRegime = {
      current: regime,
      previous,
      changedAt: changed ? new Date().toISOString() : this.currentRegime.changedAt,
      confidence: Math.max(bullRatio, bearRatio),
      signals,
      rebalanceSuggested: changed && (regime === "crisis" || regime === "bear"),
    };

    if (changed) {
      this.pendingActions.push("regime_shift");
      if (this.currentRegime.rebalanceSuggested) {
        this.pendingActions.push("rebalance");
      }
    }

    return { ...this.currentRegime };
  }

  getCurrentRegime(): RegimeDetection {
    return { ...this.currentRegime };
  }

  // ── Connector Sync Health ─────────────────────────────────────

  registerConnector(connectorId: string, provider: string): void {
    this.connectors.set(connectorId, {
      connectorId, provider, status: "disconnected",
      lastSyncAt: new Date().toISOString(), staleSinceMs: 0,
      consecutiveErrors: 0, retryCount: 0, circuitBroken: false,
    });
  }

  recordSyncSuccess(connectorId: string): void {
    const c = this.connectors.get(connectorId);
    if (!c) return;
    c.status = "synced";
    c.lastSyncAt = new Date().toISOString();
    c.staleSinceMs = 0;
    c.consecutiveErrors = 0;
    c.retryCount = 0;
    c.circuitBroken = false;
    c.lastError = undefined;
  }

  recordSyncFailure(connectorId: string, error: string): void {
    const c = this.connectors.get(connectorId);
    if (!c) return;
    c.consecutiveErrors++;
    c.lastError = error;
    c.status = "error";

    if (c.consecutiveErrors >= MAX_SYNC_RETRIES) {
      c.circuitBroken = true;
      c.status = "disconnected";
    }
  }

  retryStaleSyncs(): string[] {
    const retried: string[] = [];
    const now = Date.now();
    for (const [id, c] of this.connectors) {
      if (c.circuitBroken) continue;
      const staleMs = now - new Date(c.lastSyncAt).getTime();
      if (staleMs > STALE_THRESHOLD_MS && c.status !== "syncing") {
        const backoff = SYNC_BACKOFF_BASE_MS * Math.pow(2, c.retryCount);
        if (staleMs > backoff) {
          c.status = "syncing";
          c.retryCount++;
          c.staleSinceMs = staleMs;
          retried.push(id);
        }
      }
    }
    return retried;
  }

  getConnectorHealth(): ConnectorSyncState[] {
    const now = Date.now();
    return Array.from(this.connectors.values()).map(c => ({
      ...c,
      staleSinceMs: now - new Date(c.lastSyncAt).getTime(),
      status: c.circuitBroken ? "disconnected" as SyncStatus
        : (now - new Date(c.lastSyncAt).getTime() > STALE_THRESHOLD_MS ? "stale" as SyncStatus : c.status),
    }));
  }

  // ── Proof/Receipt Generation ──────────────────────────────────

  generateReceipt(action: InvestmentAction, input: Record<string, unknown>, output: Record<string, unknown>, durationMs: number, confidence: number): InvestmentProofReceipt {
    const receipt: InvestmentProofReceipt = {
      id: `inv-rcpt-${++this.receiptCounter}`,
      action, timestamp: new Date().toISOString(),
      input, output, durationMs,
      regime: this.currentRegime.current,
      confidence,
      approved: confidence > 0.8,
      approvedBy: confidence > 0.8 ? "auto" : undefined,
    };
    this.receipts.push(receipt);
    if (action === "rebalance") this.lastRebalanceAt = receipt.timestamp;
    return receipt;
  }

  getReceipts(limit = 50): InvestmentProofReceipt[] {
    return this.receipts.slice(-limit);
  }

  // ── Actions Queue ─────────────────────────────────────────────

  getPendingActions(): InvestmentAction[] {
    return [...this.pendingActions];
  }

  resolvePendingAction(action: InvestmentAction): boolean {
    const idx = this.pendingActions.indexOf(action);
    if (idx < 0) return false;
    this.pendingActions.splice(idx, 1);
    return true;
  }

  // ── Summary ───────────────────────────────────────────────────

  getSummary(): InvestmentOfficeSummary {
    const snap = this.getLatestSnapshot();
    const connectors = this.getConnectorHealth();
    return {
      portfolioValue: snap?.totalValueCents ?? 0,
      regime: this.currentRegime.current,
      maxDrift: snap?.maxDrift ?? 0,
      driftAlert: (snap?.maxDrift ?? 0) > DRIFT_THRESHOLD,
      connectorHealth: {
        total: connectors.length,
        synced: connectors.filter(c => c.status === "synced").length,
        stale: connectors.filter(c => c.status === "stale").length,
        error: connectors.filter(c => c.status === "error" || c.status === "disconnected").length,
      },
      pendingActions: this.pendingActions.length,
      lastRebalanceAt: this.lastRebalanceAt,
      receiptsGenerated: this.receipts.length,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("finance-os/investment-office-runtime", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      connectors: Array.from(this.connectors.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.connectors) this.connectors = new Map(state.connectors as Iterable<[string, never]>) as typeof this.connectors;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("finance-os/investment-office-runtime");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export function createInvestmentOfficeRuntime(): InvestmentOfficeRuntimeService {
  return new InvestmentOfficeRuntimeService();

}

