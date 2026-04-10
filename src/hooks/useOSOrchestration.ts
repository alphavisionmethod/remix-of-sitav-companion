// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Orchestration Convenience Hook
// Thin wrapper exposing the most-used OS kernel APIs
// ═══════════════════════════════════════════════════════════════

import { useSitaOS } from "@/contexts/SitaOSContext";
import type { IntentSource, IntentResolution } from "@/lib/services/intent-orchestrator/intent-orchestrator";
import type { AttentionStack } from "@/lib/services/attention-os/attention-os";
import type { MeetingContext } from "@/lib/services/personal-graph/personal-operating-graph";
import type { Digest, DigestType } from "@/lib/services/digest-engine/digest-engine";
import type { SitaMode } from "@/lib/services/sita-modes/index";
import type { MeetingPrepPacket } from "@/lib/services/relationship-intelligence/index";
import type { StaffIntervention } from "@/lib/services/chief-of-staff/chief-of-staff";
import type { ActionEvaluation, DeviceContext, UserTrustContext } from "@/lib/services/trust-actions/trust-weighted-actions";

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
}

export function useOSOrchestration(): OSOrchestrationAPI {
  const kernel = useSitaOS();
  const userId = "current-user"; // Placeholder — replaced by auth context in real usage

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
  };
}
