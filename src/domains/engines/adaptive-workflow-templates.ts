// ═══════════════════════════════════════════════════════════════
// Adaptive Workflow Templates Engine
// Suggests workflow templates based on business profile
// ═══════════════════════════════════════════════════════════════

import type { BusinessProfileResult, WorkflowSuggestion } from "@/domains/engines/business-profile-engine";

export function getWorkflowSuggestions(profile: BusinessProfileResult, limit = 6): WorkflowSuggestion[] {
  return profile.workflows
    .filter(w => w.affinityScore > 0.2)
    .slice(0, limit);
}

export function getWorkflowCategories(profile: BusinessProfileResult): { category: string; count: number; topWorkflow: string }[] {
  const byArchetype = new Map<string, WorkflowSuggestion[]>();
  for (const wf of profile.workflows) {
    const arr = byArchetype.get(wf.archetype) || [];
    arr.push(wf);
    byArchetype.set(wf.archetype, arr);
  }

  return Array.from(byArchetype.entries()).map(([arch, wfs]) => ({
    category: arch,
    count: wfs.length,
    topWorkflow: wfs[0]?.name || "",
  }));
}
