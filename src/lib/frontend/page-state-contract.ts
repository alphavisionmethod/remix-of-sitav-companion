// ═══════════════════════════════════════════════════════════════
// SITA OS — Page State Contract
// Standard loading/error/empty/retry contract for all pages.
// ═══════════════════════════════════════════════════════════════

export type PagePhase = "loading" | "loaded" | "empty" | "error" | "retrying" | "offline";

export interface PageStateContract {
  /** Current phase of the page. */
  phase: PagePhase;
  /** Error message if phase is "error". */
  errorMessage?: string;
  /** Whether retry is available. */
  canRetry: boolean;
  /** Number of retry attempts so far. */
  retryCount: number;
  /** Maximum retries before giving up. */
  maxRetries: number;
  /** Timestamp of last successful load. */
  lastLoadedAt?: number;
}

export const DEFAULT_PAGE_STATE: PageStateContract = {
  phase: "loading",
  canRetry: true,
  retryCount: 0,
  maxRetries: 3,
};

export function transitionPageState(
  current: PageStateContract,
  event: "loaded" | "empty" | "error" | "retry" | "offline",
  errorMessage?: string,
): PageStateContract {
  switch (event) {
    case "loaded":
      return { ...current, phase: "loaded", lastLoadedAt: Date.now(), retryCount: 0 };
    case "empty":
      return { ...current, phase: "empty", lastLoadedAt: Date.now() };
    case "error":
      return {
        ...current,
        phase: "error",
        errorMessage,
        canRetry: current.retryCount < current.maxRetries,
      };
    case "retry":
      if (current.retryCount >= current.maxRetries) return current;
      return { ...current, phase: "retrying", retryCount: current.retryCount + 1 };
    case "offline":
      return { ...current, phase: "offline", canRetry: false };
    default:
      return current;
  }
}