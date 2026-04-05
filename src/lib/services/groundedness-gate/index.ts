// SITA OS — Groundedness Gate (merge: trust-state-service)
export interface GroundednessCheck { claim: string; grounded: boolean; sources: string[]; confidence: number; checkedAt: string; }
export class GroundednessGateService {
  private checks: GroundednessCheck[] = [];
  check(claim: string, sources: string[], confidence: number): GroundednessCheck { const c: GroundednessCheck = { claim, grounded: confidence >= 0.7 && sources.length > 0, sources, confidence, checkedAt: new Date().toISOString() }; this.checks.push(c); return c; }
  getRecent(limit: number = 50): GroundednessCheck[] { return this.checks.slice(-limit); }
  getGroundingRate(): number { if (this.checks.length === 0) return 1; return this.checks.filter(c => c.grounded).length / this.checks.length; }
  getUngroundedClaims(): GroundednessCheck[] { return this.checks.filter(c => !c.grounded); }
}
export const createGroundednessGate = () => new GroundednessGateService();
