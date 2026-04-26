// ═══════════════════════════════════════════════════════════════
// SITA OS — useLeadRecoveryCandidates
//
// Canonical hook for the Lead Recovery workspace.
//
// Production-truth rule:
//   • Unauthenticated → empty list (page renders sign-in CTA).
//   • Demo mode       → fixture rows from RECOVERY_CANDIDATES (clearly
//                       labelled by PageTruthBanner).
//   • Live mode       → empty list today (no real `recovery_candidates`
//                       table yet) — page renders honest empty state
//                       directing the user to connect a CRM / run lead
//                       intake. As soon as a real source exists this
//                       hook is the single place to wire it.
//
// This file is intentionally small and additive; it does NOT create a
// parallel page-state system — pages still consume EmptyStateCard and
// PageTruthBanner directly.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { RECOVERY_CANDIDATES } from "@/data/fixtures/mock-data/recovery-candidates";
import type { RecoveryCandidate } from "@/domains/business";

export interface UseLeadRecoveryCandidatesResult {
  candidates: RecoveryCandidate[];
  /** True when the candidate list comes from demo fixtures. */
  isDemo: boolean;
  /** True when no user session is available (live mode only). */
  isUnauthenticated: boolean;
  /** True while the underlying source is loading (always false today). */
  isLoading: boolean;
  /** True when an error happened reading the source (always false today). */
  isError: boolean;
  error: Error | null;
}

export function useLeadRecoveryCandidates(): UseLeadRecoveryCandidatesResult {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();

  const candidates = useMemo<RecoveryCandidate[]>(() => {
    if (isDemo) return [...RECOVERY_CANDIDATES];
    // Live mode: no real recovery_candidates table exists yet. Returning an
    // empty list lets the page render an honest empty state instead of
    // masquerading as live with fixture rows.
    return [];
  }, [isDemo]);

  return {
    candidates,
    isDemo,
    isUnauthenticated: !user?.id,
    isLoading: false,
    isError: false,
    error: null,
  };
}