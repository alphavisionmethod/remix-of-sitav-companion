// ═══════════════════════════════════════════════════════════════
// SITA OS — Retry Engine (Execution Layer)
// Retry logic with backoff and circuit breaker
// ═══════════════════════════════════════════════════════════════

import { RetryExhaustedError } from "../shared/orchestration-errors";

export interface RetryConfig {
  maxRetries: number;
  initialBackoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  circuitBreakerThreshold: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialBackoffMs: 500,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
  circuitBreakerThreshold: 5,
};

// Simple circuit breaker state
const circuitState: Record<string, { failures: number; openUntil: number }> = {};

export async function withRetry<T>(
  operationId: string,
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  // Check circuit breaker
  const state = circuitState[operationId];
  if (state && state.failures >= config.circuitBreakerThreshold && Date.now() < state.openUntil) {
    throw new RetryExhaustedError(
      `Circuit breaker open for ${operationId}`,
      state.failures
    );
  }

  let lastError: Error | undefined;
  let backoff = config.initialBackoffMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      // Reset circuit breaker on success
      if (circuitState[operationId]) {
        circuitState[operationId].failures = 0;
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Update circuit breaker
      if (!circuitState[operationId]) {
        circuitState[operationId] = { failures: 0, openUntil: 0 };
      }
      circuitState[operationId].failures++;
      circuitState[operationId].openUntil = Date.now() + config.maxBackoffMs;

      if (attempt < config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff = Math.min(backoff * config.backoffMultiplier, config.maxBackoffMs);
      }
    }
  }

  throw new RetryExhaustedError(
    lastError?.message ?? `Operation ${operationId} failed after ${config.maxRetries} retries`,
    config.maxRetries
  );
}
