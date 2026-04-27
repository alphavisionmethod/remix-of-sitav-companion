// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Orchestration Convenience Hook
// Thin wrapper exposing the most-used OS kernel APIs
// ═══════════════════════════════════════════════════════════════

import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { useAuth } from "@/contexts/AuthContext";
import type { IntentSource, IntentResolution } from "@/lib/services/intent-orchestrator/intent-orchestrator";
import type { AttentionStack } from "@/lib/services/attention-os/attention-os";
import type { MeetingContext } from "@/lib/services/personal-graph/personal-operating-graph";
import type { Digest, DigestType } from "@/lib/services/digest-engine/digest-engine";
import type { SitaMode } from "@/lib/services/sita-modes/index";
import type { MeetingPrepPacket } from "@/lib/services/relationship-intelligence/index";
import type { StaffIntervention } from "@/lib/services/chief-of-staff/chief-of-staff";
import type { ActionEvaluation, DeviceContext, UserTrustContext } from "@/lib/services/trust-actions/trust-weighted-actions";
import type { MeshTopology, MeshPeer, DeviceRole } from "@/lib/services/device-mesh/index";
import type { UnifiedContext, SignalSource } from "@/lib/services/context-graph/index";
import type { Explanation } from "@/lib/services/explainability/index";
import type { SafetyClass, PreExecutionValidation } from "@/lib/services/action-safety/index";
import type { WorkspaceId, WorkspaceSuggestion, WorkspacePolicy } from "@/lib/services/workspace-intelligence/index";

export interface OSOrchestrationAPI {
  hydrated: boolean;

  // Intent processing
  processIntent: (raw: string, source: IntentSource, surface?: string) => Promise<IntentResolution>;

  // Attention
  getAttentionStack: () => AttentionStack;
  getCognitiveLoad: () => number;

  // Meeting prep
  getMeetingPrep: (contactId: string) => MeetingPrepPacket | null;
  getGraphMeetingContext: (contactId: string) => MeetingContext | null;

  // Digests
  generateDigest: (type: DigestType, userName?: string) => Promise<Digest>;
  dailyPulse: (userName?: string) => Promise<Digest>;

  // Modes
  getCurrentMode: () => SitaMode;
  setMode: (mode: SitaMode) => void;

  // Chief of Staff
  getActiveInterventions: () => StaffIntervention[];
  acknowledgeIntervention: (id: string) => void;

  // Trust Actions
  evaluateAction: (actionId: string, device: DeviceContext, user: UserTrustContext) => ActionEvaluation;

  // Graph
  resolveCrossDomain: (nodeId: string) => { touchedDomains: string[]; narrative: string };

  // Device Mesh
  getMeshTopology: () => MeshTopology;
  getOnlinePeers: () => MeshPeer[];
  setDeviceRole: (deviceId: string, role: DeviceRole) => void;

  // Context Graph
  getCurrentContext: () => UnifiedContext;
  updateContextSignal: (source: SignalSource, key: string, value: unknown) => void;

  // Explainability
  explainDecision: (decisionId: string) => Explanation;
  explainTrustScore: (entityId: string, score: number) => Explanation;
  getRecentExplanations: (limit?: number) => Explanation[];

  // Action Safety
  validateAction: (actionKey: string, trust: number) => PreExecutionValidation;
  getActionSafetyStats: () => { passive: number; assisted: number; active_reversible: number; high_risk: number; total: number };

  // Workspace Intelligence
  suggestWorkspace: () => WorkspaceSuggestion;
  getWorkspacePolicy: (wsId: WorkspaceId) => WorkspacePolicy;
  applyWorkspace: (wsId: WorkspaceId) => { applied: boolean; policiesActivated: string[]; automationsTriggered: string[] };
}

export function useOSOrchestration(): OSOrchestrationAPI {
  const kernel = useSitaOS();
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";

  return {
    hydrated: kernel.hydrated,

    processIntent: (raw, source, surface = "desktop") =>
      kernel.intentOrchestrator.processIntent(raw, source, surface, userId),

    getAttentionStack: () => kernel.attentionOS.getAttentionStack(),
    getCognitiveLoad: () => kernel.attentionOS.getCognitiveLoad().score,

    getMeetingPrep: (contactId) => kernel.relationships.getMeetingPrep(contactId),
    getGraphMeetingContext: (contactId) => kernel.personalGraph.getMeetingContext(contactId),

    generateDigest: (type, userName) => kernel.digestEngine.generateDigest(type, userId, userName),
    dailyPulse: (userName) => kernel.digestEngine.dailyPulse(userId, userName),

    getCurrentMode: () => kernel.sitaModes.getMode(),
    setMode: (mode) => kernel.sitaModes.setMode(mode),

    getActiveInterventions: () => kernel.chiefOfStaff.getActiveInterventions(),
    acknowledgeIntervention: (id) => kernel.chiefOfStaff.acknowledgeIntervention(id),

    evaluateAction: (actionId, device, user) => kernel.trustActions.evaluateAction(actionId, device, user),

    resolveCrossDomain: (nodeId) => {
      const result = kernel.personalGraph.resolveCrossDomain(nodeId);
      return { touchedDomains: result.touchedDomains, narrative: result.narrative };
    },

    // Device Mesh
    getMeshTopology: () => kernel.deviceMesh.getMeshTopology(),
    getOnlinePeers: () => kernel.deviceMesh.getOnlinePeers(),
    setDeviceRole: (deviceId, role) => kernel.deviceMesh.setDeviceRole(deviceId, role),

    // Context Graph
    getCurrentContext: () => kernel.contextGraph.getCurrentContext(),
    updateContextSignal: (source, key, value) => kernel.contextGraph.updateSignal(source, key, value),

    // Explainability
    explainDecision: (decisionId) => kernel.explainability.explainDecision(decisionId),
    explainTrustScore: (entityId, score) => kernel.explainability.explainTrustScore(entityId, score),
    getRecentExplanations: (limit) => kernel.explainability.getRecentExplanations(limit),

    // Action Safety
    validateAction: (actionKey, trust) => kernel.actionSafety.validatePreExecution(actionKey, trust),
    getActionSafetyStats: () => kernel.actionSafety.getStats(),

    // Workspace Intelligence
    suggestWorkspace: () => {
      const ctx = kernel.contextGraph.getCurrentContext();
      return kernel.workspaceIntelligence.suggestWorkspace({
        timeOfDay: ctx.timeOfDay,
        dayOfWeek: ctx.dayOfWeek,
        activeApps: ctx.activeApps,
        mode: ctx.activeMode,
        cognitiveLoad: ctx.cognitiveLoad,
      });
    },
    getWorkspacePolicy: (wsId) => kernel.workspaceIntelligence.getWorkspacePolicy(wsId),
    applyWorkspace: (wsId) => kernel.workspaceIntelligence.applyWorkspaceContext(wsId),
  };
}
