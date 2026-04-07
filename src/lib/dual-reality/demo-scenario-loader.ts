// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Scenario Loader
// Loads scenario packs with entities, relationships, artifacts
// from the demo_scenarios family of tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface LoadedScenario {
  id: string;
  scenarioKey: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  narrativeSummary: string;
  domainCoverage: string[];
  version: number;
  entities: ScenarioEntity[];
  relationships: ScenarioRelationship[];
  artifacts: ScenarioArtifact[];
  launchProfile?: ScenarioLaunchProfile;
}

export interface ScenarioEntity {
  id: string;
  entityType: string;
  entityKey: string;
  label: string;
  description?: string;
  metadata: Record<string, unknown>;
}

export interface ScenarioRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string;
  metadata: Record<string, unknown>;
}

export interface ScenarioArtifact {
  id: string;
  artifactType: string;
  label: string;
  content: Record<string, unknown>;
  deterministic: boolean;
}

export interface ScenarioLaunchProfile {
  launchPath?: string;
  defaultLandingRoute?: string;
  routeSet: string[];
  enabledDomains: string[];
  hiddenDomains: string[];
  startupContext: Record<string, unknown>;
}

// ── Loader ──────────────────────────────────────────────────────

let _cachedScenarios = new Map<string, LoadedScenario>();

export async function loadScenario(scenarioKey: string): Promise<LoadedScenario | null> {
  // Check cache first
  if (_cachedScenarios.has(scenarioKey)) {
    return _cachedScenarios.get(scenarioKey)!;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Load scenario
  const { data: scenario } = await (supabase as any)
    .from("demo_scenarios")
    .select("*")
    .eq("user_id", user.id)
    .eq("scenario_key", scenarioKey)
    .eq("active", true)
    .maybeSingle();

  if (!scenario) return null;

  // Load entities, relationships, artifacts, launch profile in parallel
  const [entitiesRes, relsRes, artifactsRes, launchRes] = await Promise.all([
    supabase.from("demo_scenario_entities").select("*").eq("scenario_id", scenario.id),
    supabase.from("demo_scenario_relationships").select("*").eq("scenario_id", scenario.id),
    supabase.from("demo_scenario_artifacts").select("*").eq("scenario_id", scenario.id),
    supabase.from("scenario_launch_profiles").select("*").eq("scenario_id", scenario.id).maybeSingle(),
  ]);

  const loaded: LoadedScenario = {
    id: scenario.id,
    scenarioKey: scenario.scenario_key,
    name: scenario.name,
    description: scenario.description ?? "",
    category: scenario.category,
    targetAudience: scenario.target_audience ?? "",
    narrativeSummary: scenario.narrative_summary ?? "",
    domainCoverage: scenario.domain_coverage ?? [],
    version: scenario.version,
    entities: (entitiesRes.data ?? []).map((e: any) => ({
      id: e.id,
      entityType: e.entity_type,
      entityKey: e.entity_key,
      label: e.label,
      description: e.description,
      metadata: e.metadata ?? {},
    })),
    relationships: (relsRes.data ?? []).map((r: any) => ({
      id: r.id,
      fromEntityId: r.from_entity_id,
      toEntityId: r.to_entity_id,
      relationshipType: r.relationship_type,
      metadata: r.metadata ?? {},
    })),
    artifacts: (artifactsRes.data ?? []).map((a: any) => ({
      id: a.id,
      artifactType: a.artifact_type,
      label: a.label,
      content: a.content ?? {},
      deterministic: a.deterministic,
    })),
    launchProfile: launchRes.data ? {
      launchPath: launchRes.data.launch_path,
      defaultLandingRoute: launchRes.data.default_landing_route,
      routeSet: launchRes.data.route_set ?? [],
      enabledDomains: launchRes.data.enabled_domains ?? [],
      hiddenDomains: launchRes.data.hidden_domains ?? [],
      startupContext: launchRes.data.startup_context ?? {},
    } : undefined,
  };

  _cachedScenarios.set(scenarioKey, loaded);
  return loaded;
}

export async function listScenarios(): Promise<Array<{
  id: string;
  scenarioKey: string;
  name: string;
  category: string;
  status: string;
  active: boolean;
  domainCoverage: string[];
}>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await (supabase as any)
    .from("demo_scenarios")
    .select("id, scenario_key, name, category, status, active, domain_coverage")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((s: any) => ({
    id: s.id,
    scenarioKey: s.scenario_key,
    name: s.name,
    category: s.category,
    status: s.status,
    active: s.active,
    domainCoverage: s.domain_coverage ?? [],
  }));
}

export function clearScenarioCache(): void {
  _cachedScenarios.clear();
}

export function getEntitiesByType(scenario: LoadedScenario, type: string): ScenarioEntity[] {
  return scenario.entities.filter(e => e.entityType === type);
}

export function getArtifactsByType(scenario: LoadedScenario, type: string): ScenarioArtifact[] {
  return scenario.artifacts.filter(a => a.artifactType === type);
}
