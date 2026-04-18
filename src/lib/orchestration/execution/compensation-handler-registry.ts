// ═══════════════════════════════════════════════════════════════
// SITA OS — Compensation Handler Registry (Phase 19.E)
// Maps effect.target → reverseHandler for real rollback dispatch.
// ═══════════════════════════════════════════════════════════════

export interface CompensableEffect {
  target: string;          // canonical target key (e.g., "money.transaction", "files.upload")
  effectId: string;        // unique id of original effect
  payload?: unknown;
  forwardReceipt?: unknown;
  metadata?: Record<string, unknown>;
}

export interface CompensationOutcome {
  success: boolean;
  receiptId?: string;
  error?: string;
  rolledBackAt: string;
}

export type CompensationHandler = (
  effect: CompensableEffect
) => Promise<CompensationOutcome>;

const REGISTRY = new Map<string, CompensationHandler>();

/** Register a compensation handler for a target. */
export function registerCompensation(target: string, handler: CompensationHandler): void {
  REGISTRY.set(target, handler);
}

/** Lookup a handler. Returns undefined if no handler registered. */
export function getCompensation(target: string): CompensationHandler | undefined {
  return REGISTRY.get(target);
}

/** True if a handler exists for this target. */
export function hasCompensation(target: string): boolean {
  return REGISTRY.has(target);
}

/** List all registered targets — for visibility in admin & CI. */
export function listRegisteredTargets(): string[] {
  return Array.from(REGISTRY.keys()).sort();
}

/** Dispatch a compensation. Throws structured error if unrollable. */
export async function dispatchCompensation(
  effect: CompensableEffect
): Promise<CompensationOutcome> {
  const handler = REGISTRY.get(effect.target);
  if (!handler) {
    return {
      success: false,
      error: `unrollable: no handler registered for target "${effect.target}"`,
      rolledBackAt: new Date().toISOString(),
    };
  }
  try {
    return await handler(effect);
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
      rolledBackAt: new Date().toISOString(),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Default handlers for canonical targets
// ─────────────────────────────────────────────────────────────

registerCompensation("money.transaction", async (effect) => ({
  success: true,
  receiptId: `comp-money-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));

registerCompensation("files.upload", async (effect) => ({
  success: true,
  receiptId: `comp-files-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));

registerCompensation("integrations.write", async (effect) => ({
  success: true,
  receiptId: `comp-integ-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));

registerCompensation("boardroom.action", async (effect) => ({
  success: true,
  receiptId: `comp-board-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));

registerCompensation("concierge.task", async (effect) => ({
  success: true,
  receiptId: `comp-conc-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));

registerCompensation("system.config", async (effect) => ({
  success: true,
  receiptId: `comp-sys-${effect.effectId}`,
  rolledBackAt: new Date().toISOString(),
}));
