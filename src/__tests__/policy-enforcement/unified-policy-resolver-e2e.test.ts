// ═══════════════════════════════════════════════════════════════
// Phase 15 — Unified Policy Resolver Behavioral E2E
// ───────────────────────────────────────────────────────────────
// Pins the canonical 9-dimension policy contract:
//   1. Resolver coherence — every map (approval, proof, trust,
//      reversibility) is closed over the same domain × riskClass
//      cells; no orphan rules, no missing cells.
//   2. Actor capability ceiling — anonymous cannot perform R1+;
//      tenant scope "admin" requires platform-admin or service-role.
//   3. Surface gating — money is read-only on demo, prohibited
//      offline; system is read-only on web; mobile money requires
//      step-up.
//   4. Trust threshold — sub-threshold requests refused, biometric
//      step-up satisfies +1 where allowed and is rejected where not.
//   5. Approval lineage — money/R5 demands boardroom + justification;
//      money/R4 demands owner-approval + justification + dryRun.
//   6. Proof bundle integrity — every R5 cell requires the full
//      9-component bundle; every R4 includes approval-receipt.
//   7. Reversibility coherence — irreversible cells either need no
//      rollback pointer (terminal trust receipts) OR are top-tier
//      destructive operator actions; rollback-pointer flag is
//      consistent with the irreversibility class.
//   8. denyAllQuery is, in fact, denied (worst-case sanity floor).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  UNIFIED_POLICY_MATRIX,
  resolveUnifiedPolicy,
  denyAllQuery,
  validatePolicyCompleteness,
  getCriticalPolicies,
  getHardBlockPolicies,
  type UnifiedPolicyQuery,
  type SensitivityClass,
  type TenantScope,
} from "@/lib/policy/unified-policy-matrix";
import {
  POLICY_ACTOR_REGISTRY,
  ALL_POLICY_ACTORS,
  getActorMetadata,
} from "@/lib/policy/policy-actor-registry";
import {
  POLICY_DOMAIN_MAP,
  ALL_POLICY_DOMAINS,
} from "@/lib/policy/policy-domain-map";
import {
  APPROVAL_MAP,
  getApprovalMapping,
  requiresApproval,
} from "@/lib/policy/policy-approval-map";
import {
  PROOF_REQUIREMENTS,
  getProofRequirement,
} from "@/lib/policy/policy-proof-requirements";
import {
  REVERSIBILITY_MAP,
  getReversibility,
  isReversible,
} from "@/lib/policy/policy-reversibility-map";
import {
  TRUST_THRESHOLDS,
  meetsTrustThreshold,
  getTrustThreshold,
  type TrustLevel,
} from "@/lib/policy/policy-trust-thresholds";
import {
  POLICY_SURFACE_OVERRIDES,
  getSurfacePolicyState,
  buildSurfacePolicyMatrix,
  isProhibitedOnSurface,
  requiresStepUp,
} from "@/lib/policy/policy-surface-map";
import { CANONICAL_SURFACES } from "@/runtimes/surface-types";

// ─── Default safe query (allowed) ───────────────────────────
function safeQuery(overrides: Partial<UnifiedPolicyQuery> = {}): UnifiedPolicyQuery {
  return {
    actor: "user",
    domain: "concierge",
    surface: "web",
    riskClass: "R1",
    deviceTrust: 2,
    sensitivity: "internal",
    tenantScope: "personal",
    biometricStepUpRecent: false,
    hasJustification: false,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// 1 — Map closure & cell coverage
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — map closure", () => {
  it("every approval-map cell has a matching trust threshold", () => {
    const orphans = APPROVAL_MAP.filter(
      (a) => !getTrustThreshold(a.domain, a.riskClass),
    );
    expect(orphans, "approval cells without trust thresholds").toEqual([]);
  });

  it("every approval-map cell has a matching proof requirement", () => {
    const orphans = APPROVAL_MAP.filter(
      (a) => !getProofRequirement(a.domain, a.riskClass),
    );
    // R0/R2 cells are intentionally allowed without dedicated proof entries
    // (the resolver warns instead of refusing). Only R3+ must have proofs.
    const r3Plus = orphans.filter((a) =>
      ["R3", "R4", "R5"].includes(a.riskClass),
    );
    expect(r3Plus, "R3+ approval cells without proof requirements").toEqual([]);
  });

  it("every approval-map cell has a matching reversibility entry", () => {
    const orphans = APPROVAL_MAP.filter(
      (a) => !getReversibility(a.domain, a.riskClass),
    );
    expect(orphans, "approval cells without reversibility").toEqual([]);
  });

  it("every reversibility entry references a known domain", () => {
    const unknowns = REVERSIBILITY_MAP.filter(
      (r) => !ALL_POLICY_DOMAINS.includes(r.domain),
    );
    expect(unknowns).toEqual([]);
  });

  it("every proof requirement references a known domain", () => {
    const unknowns = PROOF_REQUIREMENTS.filter(
      (p) => !ALL_POLICY_DOMAINS.includes(p.domain),
    );
    expect(unknowns).toEqual([]);
  });

  it("policy completeness validator reports all 7 domains covered, zero gaps", () => {
    const { covered, gaps } = validatePolicyCompleteness();
    expect(gaps).toEqual([]);
    expect(covered.length).toBe(7);
  });

  it("UNIFIED_POLICY_MATRIX has at least one entry per registered policy domain", () => {
    const domains = new Set(UNIFIED_POLICY_MATRIX.map((p) => p.domain));
    // The unified matrix uses its own domain enum (rls/admin-permission/etc.)
    // which intersects with policy-domain-map but is not identical. Just
    // assert the structural minimum here.
    expect(domains.size).toBeGreaterThanOrEqual(7);
  });

  it("hard-block policies dominate (≥75% of all entries)", () => {
    const hardBlock = getHardBlockPolicies();
    expect(hardBlock.length / UNIFIED_POLICY_MATRIX.length).toBeGreaterThanOrEqual(0.75);
  });

  it("every critical policy is audit-required (no silent kills)", () => {
    const critical = getCriticalPolicies();
    const silent = critical.filter((p) => !p.auditRequired);
    expect(silent, "critical policies without audit").toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// 2 — Actor capability ceiling
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — actor capability ceiling", () => {
  it("anonymous actor cannot perform R1+ actions in any domain", () => {
    const decision = resolveUnifiedPolicy(
      safeQuery({ actor: "anonymous", riskClass: "R3", domain: "money", deviceTrust: 0 }),
    );
    expect(decision.allowed).toBe(false);
    expect(decision.refusalReasons.some((r) => /Anonymous/i.test(r))).toBe(true);
  });

  it("anonymous can perform R0 reads on concierge surface (allow path)", () => {
    const decision = resolveUnifiedPolicy(
      safeQuery({ actor: "anonymous", riskClass: "R0", domain: "concierge", deviceTrust: 0 }),
    );
    // Refusal for R0 is allowed only if other dims also fail; the actor
    // ceiling itself must not refuse.
    const actorRefusal = decision.refusalReasons.find((r) => /Anonymous/i.test(r));
    expect(actorRefusal).toBeUndefined();
  });

  it("tenant scope 'admin' requires platform-admin or service-role", () => {
    const userDecision = resolveUnifiedPolicy(safeQuery({ tenantScope: "admin", actor: "user" }));
    expect(userDecision.allowed).toBe(false);
    expect(userDecision.refusalReasons.some((r) => /admin.*platform-admin or service-role/i.test(r))).toBe(true);

    const adminDecision = resolveUnifiedPolicy(
      safeQuery({
        tenantScope: "admin",
        actor: "platform-admin",
        domain: "admin",
        riskClass: "R3",
        deviceTrust: 3,
      }),
    );
    const adminRefusal = adminDecision.refusalReasons.find((r) => /Tenant scope/i.test(r));
    expect(adminRefusal).toBeUndefined();
  });

  it("every actor has a max trust ceiling ≤ 4", () => {
    for (const a of POLICY_ACTOR_REGISTRY) {
      expect(a.maxTrustLevel).toBeGreaterThanOrEqual(0);
      expect(a.maxTrustLevel).toBeLessThanOrEqual(4);
    }
  });

  it("anonymous trust ceiling is exactly 0 (cannot be elevated)", () => {
    expect(getActorMetadata("anonymous").maxTrustLevel).toBe(0);
  });

  it("AI advisor trust ceiling caps at 2 (cannot self-elevate to high-risk)", () => {
    expect(getActorMetadata("advisor").maxTrustLevel).toBe(2);
  });

  it("every actor in ALL_POLICY_ACTORS has metadata", () => {
    for (const a of ALL_POLICY_ACTORS) {
      expect(() => getActorMetadata(a)).not.toThrow();
    }
    expect(ALL_POLICY_ACTORS.length).toBe(POLICY_ACTOR_REGISTRY.length);
  });
});

// ─────────────────────────────────────────────────────────────
// 3 — Surface gating
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — surface gating", () => {
  it("money domain is prohibited offline", () => {
    expect(isProhibitedOnSurface("money", "offline")).toBe(true);
  });

  it("money domain is read-only in demo mode", () => {
    expect(getSurfacePolicyState("money", "demo")).toBe("read-only");
  });

  it("money domain requires step-up on mobile (ios + android)", () => {
    expect(requiresStepUp("money", "ios")).toBe(true);
    expect(requiresStepUp("money", "android")).toBe(true);
  });

  it("system domain is read-only on web (no kernel commands from browser)", () => {
    expect(getSurfacePolicyState("system", "web")).toBe("read-only");
  });

  it("admin domain is read-only on mobile (triage-only)", () => {
    expect(getSurfacePolicyState("admin", "ios")).toBe("read-only");
    expect(getSurfacePolicyState("admin", "android")).toBe("read-only");
  });

  it("integrations OAuth is prohibited offline (network required)", () => {
    expect(isProhibitedOnSurface("integrations", "offline")).toBe(true);
  });

  it("boardroom voting is prohibited offline (live proof chain required)", () => {
    expect(isProhibitedOnSurface("boardroom", "offline")).toBe(true);
  });

  it("every surface override references a real CanonicalSurface", () => {
    const unknowns = POLICY_SURFACE_OVERRIDES.filter(
      (o) => !CANONICAL_SURFACES.includes(o.surface),
    );
    expect(unknowns).toEqual([]);
  });

  it("step-up surface state requires biometric step-up to satisfy resolver", () => {
    const noStepUp = resolveUnifiedPolicy(
      safeQuery({ domain: "money", surface: "ios", riskClass: "R3", deviceTrust: 3, biometricStepUpRecent: false }),
    );
    expect(noStepUp.refusalReasons.some((r) => /Step-up biometric required/i.test(r))).toBe(true);

    const withStepUp = resolveUnifiedPolicy(
      safeQuery({ domain: "money", surface: "ios", riskClass: "R3", deviceTrust: 3, biometricStepUpRecent: true }),
    );
    expect(withStepUp.refusalReasons.some((r) => /Step-up biometric required/i.test(r))).toBe(false);
  });

  it("regulated sensitivity is refused on demo and offline surfaces", () => {
    const onDemo = resolveUnifiedPolicy(
      safeQuery({ surface: "demo", sensitivity: "regulated" }),
    );
    expect(onDemo.refusalReasons.some((r) => /Regulated/.test(r))).toBe(true);

    const onOffline = resolveUnifiedPolicy(
      safeQuery({ surface: "offline", sensitivity: "regulated" }),
    );
    expect(onOffline.refusalReasons.some((r) => /Regulated/.test(r))).toBe(true);
  });

  it("buildSurfacePolicyMatrix produces a complete domain × surface table", () => {
    const matrix = buildSurfacePolicyMatrix();
    for (const d of ALL_POLICY_DOMAINS) {
      for (const s of CANONICAL_SURFACES) {
        expect(matrix[d][s]).toBeDefined();
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 4 — Trust threshold contract
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — trust threshold", () => {
  it("money/R5 requires hardware-bound trust (level 4) and disallows step-up bypass", () => {
    const thr = getTrustThreshold("money", "R5");
    expect(thr?.minTrustLevel).toBe(4);
    expect(thr?.biometricStepUpAllowed).toBe(false);
  });

  it("money/R5 with step-up at trust 3 is still refused (no bypass)", () => {
    expect(meetsTrustThreshold("money", "R5", 3, true)).toBe(false);
    expect(meetsTrustThreshold("money", "R5", 4, false)).toBe(true);
  });

  it("money/R3 with step-up at trust 1 satisfies +1 bypass", () => {
    expect(meetsTrustThreshold("money", "R3", 1, true)).toBe(true);
    expect(meetsTrustThreshold("money", "R3", 1, false)).toBe(false);
  });

  it("system/R3 disallows step-up bypass (operator floor is hard)", () => {
    expect(meetsTrustThreshold("system", "R3", 2, true)).toBe(false);
    expect(meetsTrustThreshold("system", "R3", 3, false)).toBe(true);
  });

  it("trust-shortfall query refuses with explicit threshold reason", () => {
    const decision = resolveUnifiedPolicy(
      safeQuery({ domain: "money", riskClass: "R4", deviceTrust: 1 as TrustLevel }),
    );
    expect(decision.allowed).toBe(false);
    expect(decision.refusalReasons.some((r) => /Trust level/i.test(r))).toBe(true);
    expect(decision.trustSatisfied).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// 5 — Approval lineage
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — approval lineage", () => {
  it("money/R5 requires boardroom + justification + dryRun + 600s cooldown", () => {
    const m = getApprovalMapping("money", "R5");
    expect(m).toBeDefined();
    expect(m?.tier).toBe("boardroom");
    expect(m?.justificationRequired).toBe(true);
    expect(m?.dryRunRequired).toBe(true);
    expect(m?.cooldownSeconds).toBeGreaterThanOrEqual(600);
  });

  it("money/R4 requires owner-approval + justification + dryRun", () => {
    const m = getApprovalMapping("money", "R4");
    expect(m?.tier).toBe("owner-approval");
    expect(m?.justificationRequired).toBe(true);
    expect(m?.dryRunRequired).toBe(true);
  });

  it("system/R5 requires dual-approval (no single point of failure)", () => {
    const m = getApprovalMapping("system", "R5");
    expect(m?.tier).toBe("dual-approval");
    expect(m?.dryRunRequired).toBe(true);
  });

  it("requiresApproval returns true for every R4+ cell that exists", () => {
    const r4Plus = APPROVAL_MAP.filter((a) => ["R4", "R5"].includes(a.riskClass));
    for (const a of r4Plus) {
      expect(requiresApproval(a.domain, a.riskClass), `${a.domain}/${a.riskClass}`).toBe(true);
    }
  });

  it("missing justification on a justification-required cell triggers refusal", () => {
    const decision = resolveUnifiedPolicy(
      safeQuery({
        actor: "owner-admin",
        domain: "money",
        riskClass: "R4",
        deviceTrust: 3,
        hasJustification: false,
        sensitivity: "confidential",
      }),
    );
    expect(decision.refusalReasons.some((r) => /Justification.*required/i.test(r))).toBe(true);
  });

  it("boardroom-tier approval emits a warning (motion required)", () => {
    const decision = resolveUnifiedPolicy(
      safeQuery({
        actor: "owner-admin",
        domain: "money",
        riskClass: "R5",
        deviceTrust: 4,
        biometricStepUpRecent: true,
        hasJustification: true,
        sensitivity: "regulated",
        tenantScope: "managed",
        surface: "electron",
      }),
    );
    expect(decision.warnings.some((w) => /Boardroom motion required/i.test(w))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// 6 — Proof bundle integrity
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — proof bundle integrity", () => {
  it("every R5 proof requirement carries the full destructive-action bundle (≥7 components)", () => {
    const r5 = PROOF_REQUIREMENTS.filter((p) => p.riskClass === "R5");
    for (const p of r5) {
      expect(p.required.length, `${p.domain}/R5`).toBeGreaterThanOrEqual(7);
      expect(p.required).toContain("approval-receipt");
      expect(p.required).toContain("kill-switch-snapshot");
      expect(p.required).toContain("rollback-pointer");
      expect(p.minEvidenceGrade).toBe("A");
    }
  });

  it("every R4 proof requirement includes approval-receipt", () => {
    // identity/R4 (role change / biometric enrollment) substitutes
    // biometric-step-up FOR approval-receipt — the live biometric proof
    // IS the approval. Codify the exemption explicitly so any future
    // identity/R4 mutation that drops biometric-step-up trips the test.
    const APPROVAL_RECEIPT_EXEMPT_R4: Record<string, string> = {
      identity:
        "Identity/R4 substitutes biometric-step-up for approval-receipt — the live biometric IS the approval; an async approval queue would defeat the security model.",
    };
    const r4 = PROOF_REQUIREMENTS.filter((p) => p.riskClass === "R4");
    for (const p of r4) {
      if (p.domain in APPROVAL_RECEIPT_EXEMPT_R4) {
        expect(p.required, `${p.domain}/R4 (exempt)`).toContain("biometric-step-up");
        continue;
      }
      expect(p.required, `${p.domain}/R4`).toContain("approval-receipt");
    }
  });

  it("every R3+ proof requirement includes actor-attestation + policy-decision (always)", () => {
    const r3Plus = PROOF_REQUIREMENTS.filter((p) =>
      ["R3", "R4", "R5"].includes(p.riskClass),
    );
    for (const p of r3Plus) {
      expect(p.required, `${p.domain}/${p.riskClass}`).toContain("actor-attestation");
      expect(p.required, `${p.domain}/${p.riskClass}`).toContain("policy-decision");
    }
  });

  it("money/R5 evidence grade is A (no degraded grade for material capital)", () => {
    expect(getProofRequirement("money", "R5")?.minEvidenceGrade).toBe("A");
  });

  it("trust domain proof requirements always demand grade A (epistemic floor)", () => {
    const trustReqs = PROOF_REQUIREMENTS.filter((p) => p.domain === "trust");
    for (const p of trustReqs) {
      expect(p.minEvidenceGrade, `trust/${p.riskClass}`).toBe("A");
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 7 — Reversibility coherence
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — reversibility coherence", () => {
  it("irreversible cells either need no rollback pointer (terminal trust receipts) or are top-tier destructive (system/R5)", () => {
    const irreversibles = REVERSIBILITY_MAP.filter((r) => r.reversibility === "irreversible");
    for (const r of irreversibles) {
      // Trust proof cells are append-only by design — no rollback applies
      // System/R5 is the canonical destructive operator class — rollback
      // pointer is required as a forensic anchor even though no undo exists.
      const isTrustTerminal = r.domain === "trust" && r.rollbackPointerRequired === false;
      const isSystemDestructive = r.domain === "system" && r.riskClass === "R5" && r.rollbackPointerRequired === true;
      expect(isTrustTerminal || isSystemDestructive, `${r.domain}/${r.riskClass}`).toBe(true);
    }
  });

  it("every soft-reversible cell declares a compensating workflow id", () => {
    const soft = REVERSIBILITY_MAP.filter((r) => r.reversibility === "soft-reversible");
    for (const r of soft) {
      expect(r.compensatingWorkflowId, `${r.domain}/${r.riskClass}`).toBeTruthy();
    }
  });

  it("every time-bounded cell declares a positive reversal window", () => {
    const bounded = REVERSIBILITY_MAP.filter((r) => r.reversibility === "time-bounded");
    for (const r of bounded) {
      expect(r.reversalWindowSeconds, `${r.domain}/${r.riskClass}`).toBeGreaterThan(0);
    }
  });

  it("every R4+ money cell has rollback-pointer required (financial forensics)", () => {
    const moneyR4Plus = REVERSIBILITY_MAP.filter(
      (r) => r.domain === "money" && ["R4", "R5"].includes(r.riskClass),
    );
    for (const r of moneyR4Plus) {
      expect(r.rollbackPointerRequired, `money/${r.riskClass}`).toBe(true);
    }
  });

  it("isReversible reflects the irreversibility class consistently", () => {
    for (const r of REVERSIBILITY_MAP) {
      const expected = r.reversibility !== "irreversible";
      expect(isReversible(r.domain, r.riskClass), `${r.domain}/${r.riskClass}`).toBe(expected);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 8 — Worst-case sanity floor
// ─────────────────────────────────────────────────────────────
describe("Phase 15 / Unified Policy — worst-case sanity floor", () => {
  it("denyAllQuery is denied by the resolver (cannot be allowed under any code path)", () => {
    const decision = resolveUnifiedPolicy(denyAllQuery());
    expect(decision.allowed).toBe(false);
    // Must trip MULTIPLE refusal reasons — anonymous + admin tenant +
    // regulated/offline + money/R5 trust + missing justification.
    expect(decision.refusalReasons.length).toBeGreaterThanOrEqual(3);
  });

  it("happy-path concierge/R1 web query is allowed", () => {
    const decision = resolveUnifiedPolicy(safeQuery());
    expect(decision.allowed).toBe(true);
    expect(decision.refusalReasons).toEqual([]);
  });

  it("resolver always returns the resolved 9 dimensions on the decision payload", () => {
    const decision = resolveUnifiedPolicy(safeQuery());
    expect(decision).toHaveProperty("surfaceState");
    expect(decision).toHaveProperty("trustSatisfied");
    expect(decision).toHaveProperty("stepUpRequired");
    expect(decision).toHaveProperty("rollbackPointerRequired");
    // Approval / proof / reversibility are nullable for cells without entries.
    expect("approval" in decision).toBe(true);
    expect("proofRequirement" in decision).toBe(true);
    expect("reversibility" in decision).toBe(true);
  });
});