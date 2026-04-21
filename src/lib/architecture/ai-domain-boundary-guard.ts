// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Domain Boundary Guard (Runtime)
//
// Validates that route registrations and service imports respect
// the Advisor / Boardroom / Brain domain boundaries at runtime.
// Used by the app bootstrap to catch misclassified registrations.
// ═══════════════════════════════════════════════════════════════

import { AI_DOMAIN_MODEL, type AIDomainConcept } from "./ai-domain-model";

export type AIDomain = "advisor" | "boardroom" | "brain";

export interface DomainRegistration {
  id: string;
  domain: AIDomain;
  type: "route" | "service" | "component";
  path: string;
}

export interface BoundaryViolation {
  registration: DomainRegistration;
  violation: string;
  severity: "error" | "warning";
}

// ── Canonical route prefixes per domain ────────────────────────

const ROUTE_PREFIX_MAP: Record<AIDomain, RegExp[]> = {
  advisor: [/^\/advisor/, /^\/advisors/],
  boardroom: [/^\/boardroom/],
  brain: [], // Brain has no user-facing routes
};

// ── Canonical service name patterns per domain ─────────────────

const SERVICE_NAME_MAP: Record<AIDomain, RegExp[]> = {
  advisor: [/advisor/i, /recommendation/i],
  boardroom: [/boardroom/i, /board-session/i, /consensus/i, /debate/i],
  brain: [/model-router/i, /inference/i, /budget/i, /prompt/i, /fallback/i, /brain/i, /ledger/i],
};

// ── Forbidden cross-domain route patterns ──────────────────────
// A route registered under domain X must not match routes of domain Y

function getExpectedRoutePrefixes(domain: AIDomain): RegExp[] {
  return ROUTE_PREFIX_MAP[domain];
}

// ── Guard class ────────────────────────────────────────────────

export class AIDomainBoundaryGuard {
  private registrations: DomainRegistration[] = [];
  private violations: BoundaryViolation[] = [];
  private sealed = false;

  /**
   * Register a route, service, or component with its declared AI domain.
   * Must be called before seal().
   */
  register(reg: DomainRegistration): void {
    if (this.sealed) {
      console.error(`[AIDomainBoundaryGuard] Cannot register after seal(): ${reg.id}`);
      return;
    }
    this.registrations.push(reg);
  }

  /**
   * Seal the guard and run all boundary validations.
   * Returns violations found. Call during app bootstrap.
   */
  seal(): BoundaryViolation[] {
    this.sealed = true;
    this.violations = [];

    for (const reg of this.registrations) {
      this.validateRegistration(reg);
    }

    if (this.violations.length > 0) {
      console.warn(
        `[AIDomainBoundaryGuard] ${this.violations.length} boundary violation(s) detected:`,
        this.violations.map(v => `${v.registration.id}: ${v.violation}`)
      );
    }

    return this.violations;
  }

  getViolations(): readonly BoundaryViolation[] {
    return this.violations;
  }

  isClean(): boolean {
    return this.sealed && this.violations.length === 0;
  }

  // ── Validation rules ─────────────────────────────────────────

  private validateRegistration(reg: DomainRegistration): void {
    const domainModel = AI_DOMAIN_MODEL[reg.domain];

    if (reg.type === "route") {
      this.validateRoute(reg, domainModel);
    }

    if (reg.type === "service") {
      this.validateService(reg, domainModel);
    }

    // Cross-domain name collision check
    this.validateNoCrossDomainNaming(reg);
  }

  private validateRoute(reg: DomainRegistration, model: AIDomainConcept): void {
    // Rule: Brain has no user-facing routes
    if (reg.domain === "brain") {
      this.violations.push({
        registration: reg,
        violation: `Brain domain must not have user-facing routes. "${reg.path}" violates brain boundary.`,
        severity: "error",
      });
      return;
    }

    // Rule: Route prefix must match declared domain
    const expectedPrefixes = getExpectedRoutePrefixes(reg.domain);
    if (expectedPrefixes.length > 0) {
      const matchesOwn = expectedPrefixes.some(p => p.test(reg.path));
      if (!matchesOwn) {
        // Check if it matches another domain's prefix
        const otherDomains: AIDomain[] = (["advisor", "boardroom", "brain"] as const).filter(d => d !== reg.domain);
        for (const other of otherDomains) {
          const otherPrefixes = getExpectedRoutePrefixes(other);
          if (otherPrefixes.some(p => p.test(reg.path))) {
            this.violations.push({
              registration: reg,
              violation: `Route "${reg.path}" is registered under "${reg.domain}" but matches "${other}" prefix pattern. Likely misclassified.`,
              severity: "error",
            });
          }
        }
      }
    }
  }

  private validateService(reg: DomainRegistration, _model: AIDomainConcept): void {
    // Rule: Service name should align with declared domain
    const otherDomains: AIDomain[] = (["advisor", "boardroom", "brain"] as const).filter(d => d !== reg.domain);
    for (const other of otherDomains) {
      const otherPatterns = SERVICE_NAME_MAP[other];
      if (otherPatterns.some(p => p.test(reg.id))) {
        // Check it doesn't also match own domain (e.g., "advisor-boardroom-bridge" is ambiguous)
        const ownPatterns = SERVICE_NAME_MAP[reg.domain];
        const matchesOwn = ownPatterns.some(p => p.test(reg.id));
        if (!matchesOwn) {
          this.violations.push({
            registration: reg,
            violation: `Service "${reg.id}" is registered under "${reg.domain}" but its name matches "${other}" domain patterns.`,
            severity: "warning",
          });
        }
      }
    }
  }

  private validateNoCrossDomainNaming(reg: DomainRegistration): void {
    // Rule: Path should not contain another domain's canonical directory
    const crossChecks: Record<AIDomain, string[]> = {
      advisor: ["boardroom", "brain-core"],
      boardroom: ["advisors", "brain-core"],
      brain: ["advisors", "boardroom"],
    };

    const forbidden = crossChecks[reg.domain];
    for (const token of forbidden) {
      if (reg.path.includes(`/${token}/`) || reg.path.includes(`/${token}`)) {
        this.violations.push({
          registration: reg,
          violation: `Path "${reg.path}" contains "${token}" which belongs to a different AI domain than "${reg.domain}".`,
          severity: "warning",
        });
      }
    }
  }
}

// ── Singleton for app-wide use ─────────────────────────────────

let _instance: AIDomainBoundaryGuard | null = null;

export function getAIDomainBoundaryGuard(): AIDomainBoundaryGuard {
  if (!_instance) {
    _instance = new AIDomainBoundaryGuard();
  }
  return _instance;
}

/**
 * Convenience: register and validate a batch of registrations.
 * Typically called once during app bootstrap.
 */
export function validateAIDomainBoundaries(
  registrations: DomainRegistration[]
): BoundaryViolation[] {
  const guard = new AIDomainBoundaryGuard();
  for (const reg of registrations) {
    guard.register(reg);
  }
  return guard.seal();
}