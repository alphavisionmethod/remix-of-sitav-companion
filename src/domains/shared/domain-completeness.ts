// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Completeness Scoring Engine
// Scores each domain manifest against the 4.1 principles
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "./domain-manifest";

export interface CompletenessCheck {
  id: string;
  name: string;
  maxPoints: number;
  earnedPoints: number;
  details: string;
  passed: boolean;
}

export interface DomainCompletenessScore {
  domainId: string;
  domainName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
  checks: CompletenessCheck[];
}

export function scoreDomainCompleteness(manifest: DomainManifest): DomainCompletenessScore {
  const checks: CompletenessCheck[] = [];

  // 1. Real Ownership (15 pts)
  const ownerDeclared = !!manifest.owner && manifest.owner.length > 0;
  const hasVersion = !!manifest.version;
  const ownerPts = (ownerDeclared ? 10 : 0) + (hasVersion ? 5 : 0);
  checks.push({
    id: "ownership", name: "Real Ownership", maxPoints: 15, earnedPoints: ownerPts,
    details: `Owner: ${manifest.owner || "MISSING"}, Version: ${manifest.version || "MISSING"}`,
    passed: ownerPts >= 10,
  });

  // 2. Canonical Data Model (20 pts)
  const entityCount = manifest.entities.length;
  const persistedEntities = manifest.entities.filter((e) => e.dbTable !== null).length;
  const searchableEntities = manifest.entities.filter((e) => e.searchable).length;
  const dataPts = Math.min(20, Math.round((entityCount / 5) * 8) + Math.round((persistedEntities / Math.max(entityCount, 1)) * 8) + Math.min(4, searchableEntities));
  checks.push({
    id: "data-model", name: "Canonical Data Model", maxPoints: 20, earnedPoints: dataPts,
    details: `${entityCount} entities, ${persistedEntities} persisted, ${searchableEntities} searchable`,
    passed: dataPts >= 12,
  });

  // 3. Real Workflow Layer (20 pts)
  const workflowCount = manifest.workflows.length;
  const approvalWorkflows = manifest.workflows.filter((w) => w.requiresApproval).length;
  const receiptWorkflows = manifest.workflows.filter((w) => w.emitsReceipt).length;
  const avgSteps = workflowCount > 0 ? manifest.workflows.reduce((s, w) => s + w.steps.length, 0) / workflowCount : 0;
  const workflowPts = Math.min(20, Math.round((workflowCount / 4) * 8) + (approvalWorkflows > 0 ? 4 : 0) + (receiptWorkflows > 0 ? 4 : 0) + (avgSteps >= 3 ? 4 : 2));
  checks.push({
    id: "workflows", name: "Real Workflow Layer", maxPoints: 20, earnedPoints: workflowPts,
    details: `${workflowCount} workflows, ${approvalWorkflows} with approval, avg ${avgSteps.toFixed(1)} steps`,
    passed: workflowPts >= 12,
  });

  // 4. Shell Integration (15 pts)
  const cmds = manifest.shellIntegration.commandPalette.length;
  const searches = manifest.shellIntegration.searchProviders.length;
  const notifs = manifest.shellIntegration.notificationTriggers.length;
  const hasLauncher = !!manifest.shellIntegration.launcher.appId;
  const shellPts = Math.min(15, (hasLauncher ? 4 : 0) + Math.min(4, cmds) + Math.min(4, searches * 2) + Math.min(3, notifs));
  checks.push({
    id: "shell", name: "Shell Integration", maxPoints: 15, earnedPoints: shellPts,
    details: `Launcher: ${hasLauncher ? "✓" : "✗"}, ${cmds} commands, ${searches} search providers, ${notifs} notification triggers`,
    passed: shellPts >= 10,
  });

  // 5. Truth/Trust Visibility (15 pts)
  const hasFreshness = Object.keys(manifest.truthModel.freshnessThresholds).length > 0;
  const hasSimFlags = manifest.truthModel.simulatedSurfaces.length >= 0; // always true, but check declared
  const hasClassification = Object.keys(manifest.truthModel.dataSourceClassification).length > 0;
  const hasDeterministic = manifest.truthModel.deterministic.length > 0;
  const truthPts = (hasFreshness ? 5 : 0) + (hasClassification ? 5 : 0) + (hasDeterministic ? 3 : 0) + (manifest.truthModel.simulatedSurfaces.length > 0 ? 2 : 0);
  checks.push({
    id: "truth", name: "Truth/Trust Visibility", maxPoints: 15, earnedPoints: Math.min(15, truthPts),
    details: `Freshness rules: ${hasFreshness ? "✓" : "✗"}, Data classification: ${hasClassification ? "✓" : "✗"}, Deterministic fields: ${manifest.truthModel.deterministic.length}`,
    passed: truthPts >= 8,
  });

  // 6. Cross-Domain Events (10 pts)
  const eventCount = manifest.crossDomainEvents.length;
  const eventPts = Math.min(10, eventCount * 3);
  checks.push({
    id: "events", name: "Cross-Domain Events", maxPoints: 10, earnedPoints: eventPts,
    details: `${eventCount} cross-domain event flows declared`,
    passed: eventPts >= 6,
  });

  // 7. AI Integration (5 pts)
  const hasAdvisors = manifest.aiIntegration.advisorIds.length > 0;
  const hasCaps = manifest.aiIntegration.capabilityKeys.length > 0;
  const aiPts = (hasAdvisors ? 3 : 0) + (hasCaps ? 2 : 0);
  checks.push({
    id: "ai", name: "AI Integration", maxPoints: 5, earnedPoints: aiPts,
    details: `${manifest.aiIntegration.advisorIds.length} advisors, ${manifest.aiIntegration.capabilityKeys.length} capabilities`,
    passed: aiPts >= 3,
  });

  const totalScore = checks.reduce((s, c) => s + c.earnedPoints, 0);
  const maxScore = checks.reduce((s, c) => s + c.maxPoints, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const grade = percentage >= 90 ? "A" : percentage >= 75 ? "B" : percentage >= 60 ? "C" : percentage >= 40 ? "D" : "F";

  return { domainId: manifest.id, domainName: manifest.name, totalScore, maxScore, percentage, grade, checks };
}
