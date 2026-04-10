// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Kernel Context
// Instantiates, cross-wires, and exposes all 15 orchestration
// services as a unified operating system kernel.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ── Service Factories ────────────────────────────────────────────
import { createPersonalOperatingGraph, type PersonalOperatingGraphService } from "@/lib/services/personal-graph/personal-operating-graph";
import { createIntentOrchestrator, type IntentOrchestratorService, type IntentRequest } from "@/lib/services/intent-orchestrator/intent-orchestrator";
import { createAttentionOS, type AttentionOSService } from "@/lib/services/attention-os/attention-os";
import { createContinuityEngine, type ContinuityEngineService } from "@/lib/services/continuity-engine/continuity-engine";
import { createTrustWeightedActions, type TrustWeightedActionService } from "@/lib/services/trust-actions/trust-weighted-actions";
import { createChiefOfStaff, type ChiefOfStaffService } from "@/lib/services/chief-of-staff/chief-of-staff";
import { createTimingIntelligence, type TimingIntelligenceService, type TimingContext } from "@/lib/services/timing-intelligence/timing-intelligence";
import { createRelationshipGraph, type RelationshipGraph } from "@/lib/services/relationship-intelligence/index";
import { createDigestEngine, type DigestEngineService, type DigestSectionType, type DigestSection } from "@/lib/services/digest-engine/digest-engine";
import { createSitaModes, type SitaModesService } from "@/lib/services/sita-modes/index";
import { createAdaptiveInterface, type AdaptiveInterfaceService } from "@/lib/services/adaptive-interface/adaptive-interface";
import { createOpportunityEngine, type OpportunityEngineService } from "@/lib/services/opportunity-engine/index";
import { createMemoryGovernance, type MemoryGovernanceEngine } from "@/lib/services/memory-governance/memory-governance-engine";
import { createBoundaryEngine, type BoundaryEngineService } from "@/lib/services/boundary-engine/boundary-engine";
import { createExperienceSignature, type ExperienceSignatureService } from "@/lib/services/experience-signature/experience-signature";

// ── Kernel Shape ─────────────────────────────────────────────────

export interface SitaOSKernel {
  // Wave 1 — Orchestration
  personalGraph: PersonalOperatingGraphService;
  intentOrchestrator: IntentOrchestratorService;
  attentionOS: AttentionOSService;
  continuityEngine: ContinuityEngineService;
  trustActions: TrustWeightedActionService;

  // Wave 2 — Human Support
  chiefOfStaff: ChiefOfStaffService;
  timingIntelligence: TimingIntelligenceService;
  relationships: RelationshipGraph;
  digestEngine: DigestEngineService;
  sitaModes: SitaModesService;

  // Wave 3 — Polish & Moat
  adaptiveInterface: AdaptiveInterfaceService;
  opportunityEngine: OpportunityEngineService;
  memoryGovernance: MemoryGovernanceEngine;
  boundaryEngine: BoundaryEngineService;
  experienceSignature: ExperienceSignatureService;

  // Meta
  hydrated: boolean;
}

const SitaOSContext = createContext<SitaOSKernel | null>(null);

export const useSitaOS = (): SitaOSKernel => {
  const ctx = useContext(SitaOSContext);
  if (!ctx) throw new Error("useSitaOS must be used within SitaOSProvider");
  return ctx;
};

// ── Singleton Kernel ─────────────────────────────────────────────
let _kernel: SitaOSKernel | null = null;

function getOrCreateKernel(): SitaOSKernel {
  if (_kernel) return _kernel;

  const personalGraph = createPersonalOperatingGraph();
  const intentOrchestrator = createIntentOrchestrator();
  const attentionOS = createAttentionOS();
  const continuityEngine = createContinuityEngine();
  const trustActions = createTrustWeightedActions();
  const chiefOfStaff = createChiefOfStaff();
  const timingIntelligence = createTimingIntelligence();
  const relationships = createRelationshipGraph();
  const digestEngine = createDigestEngine();
  const sitaModes = createSitaModes();
  const adaptiveInterface = createAdaptiveInterface();
  const opportunityEngine = createOpportunityEngine();
  const memoryGovernance = createMemoryGovernance();
  const boundaryEngine = createBoundaryEngine();
  const experienceSignature = createExperienceSignature();

  // ═══════════════════════════════════════════════════════════
  // CROSS-WIRING: Connect all 15 services into one coherent OS
  // ═══════════════════════════════════════════════════════════

  // ── Wire IntentOrchestrator Middlewares ─────────────────────

  // 1. Timing gate: defer non-urgent intents when timing is bad
  intentOrchestrator.use(async (intent: IntentRequest) => {
    if (intent.classification === "query" || intent.classification === "navigation") return null;
    const urgency = intent.classification === "financial" ? 9 : intent.classification === "approval" ? 7 : 5;
    const mode = sitaModes.getMode();
    const cogLoad = attentionOS.getCognitiveLoad();
    const ctx: TimingContext = {
      userState: "active", currentMode: mode, cognitiveLoad: cogLoad.score,
      timeOfDay: new Date().getHours(), dayOfWeek: new Date().getDay(),
      activeSurface: intent.surface, lastInteraction: new Date().toISOString(),
      focusSessionActive: mode === "focus", quietHoursActive: mode === "stealth" || mode === "recovery",
    };
    const timing = timingIntelligence.shouldActNow(intent.raw, urgency, ctx);
    if (timing.decision === "defer" || timing.decision === "suppress") {
      return { block: true, reason: `Timing: ${timing.reason}` };
    }
    return null;
  });

  // 2. Boundary check: prevent cross-domain leaks
  intentOrchestrator.use(async (intent: IntentRequest) => {
    if (!intent.domain || intent.domain === "platform" || intent.domain === "cross-domain") return null;
    const crossCheck = boundaryEngine.canCrossDomainSynthesize([intent.domain]);
    if (!crossCheck.allowed) {
      return { block: true, reason: `Boundary violation: ${crossCheck.blockedPairs.join(", ")}` };
    }
    return null;
  });

  // 3. Attention OS integration: feed processed intents into attention stack
  intentOrchestrator.use(async (intent: IntentRequest) => {
    const urgency = intent.classification === "financial" ? 9 : intent.classification === "approval" ? 8 : intent.classification === "scheduling" ? 6 : 4;
    const importance = intent.classification === "financial" ? 9 : intent.classification === "approval" ? 8 : 5;
    attentionOS.addItem({
      title: intent.raw.slice(0, 80),
      description: `${intent.classification} from ${intent.source}`,
      domain: intent.domain === "cross-domain" ? "platform" : (intent.domain ?? "platform"),
      urgency, importance, source: intent.source,
      priority: urgency >= 9 ? "critical" : urgency >= 7 ? "high" : urgency >= 4 ? "medium" : "low",
      metadata: { intentId: intent.id },
    });
    return null; // never block
  });

  // ── Wire DigestEngine Data Providers ───────────────────────

  const buildDigestProvider = (sectionType: DigestSectionType, fetcher: (userId: string) => DigestSection | null) => {
    digestEngine.registerProvider(sectionType, async (userId: string) => fetcher(userId));
  };

  buildDigestProvider("priority_stack", () => {
    const stack = attentionOS.getAttentionStack();
    return {
      type: "priority_stack", title: "Priorities", priority: 95,
      domain: "cross-domain", summary: `${stack.critical.length} critical, ${stack.active.length} active items`,
      items: [...stack.critical, ...stack.active].slice(0, 5).map(i => ({
        id: i.id, title: i.title, description: i.description,
        urgency: i.urgency, actionable: true, domain: i.domain, metadata: i.metadata,
      })),
      metrics: [
        { label: "Cognitive Load", value: `${stack.cognitiveLoad.score}%`, trend: stack.cognitiveLoad.score > 50 ? "up" as const : "stable" as const },
        { label: "Active Items", value: `${stack.cognitiveLoad.activeItems}`, trend: "stable" as const },
      ],
    };
  });

  buildDigestProvider("pending_approvals", () => ({
    type: "pending_approvals", title: "Pending Approvals", priority: 85,
    domain: "platform", summary: "Check your approval queue",
    items: [], // will be populated by real approval data when available
  }));

  buildDigestProvider("opportunities", () => {
    const newOpps = opportunityEngine.getNew();
    return {
      type: "opportunities", title: "Opportunities", priority: 70,
      domain: "cross-domain", summary: `${newOpps.length} opportunities detected`,
      items: newOpps.slice(0, 5).map(o => ({
        id: o.id, title: `${o.type}: ${o.actionRequired}`,
        description: `Confidence: ${Math.round(o.confidence * 100)}%, Value: ${o.value}`,
        urgency: Math.round(o.confidence * 10), actionable: true,
        domain: o.domain, metadata: o.metadata,
      })),
    };
  });

  buildDigestProvider("relationship_updates", () => {
    const neglected = relationships.detectNeglectedRelationships(30);
    const overdue = relationships.getOverdueFollowUps();
    return {
      type: "relationship_updates", title: "Relationships", priority: 60,
      domain: "concierge",
      summary: `${neglected.length} neglected contacts, ${overdue.length} overdue follow-ups`,
      items: [
        ...overdue.slice(0, 3).map(o => ({
          id: o.followUp.id, title: `Overdue: ${o.contact.name}`,
          description: o.followUp.description, urgency: 7, actionable: true,
          domain: "concierge" as const, metadata: { contactId: o.contact.id },
        })),
        ...neglected.slice(0, 2).map(n => ({
          id: n.id, title: `Reconnect with ${n.name}`,
          description: `Last contact: ${n.lastInteraction}`, urgency: 4, actionable: true,
          domain: "concierge" as const, metadata: {},
        })),
      ],
    };
  });

  buildDigestProvider("health_readiness", () => ({
    type: "health_readiness", title: "Readiness", priority: 50,
    domain: "cross-domain",
    summary: `Mode: ${sitaModes.getModeConfig().displayName}`,
    items: [],
    metrics: [
      { label: "Mode", value: sitaModes.getModeConfig().displayName, trend: "stable" as const },
      { label: "Cognitive Load", value: `${attentionOS.getCognitiveLoad().score}%`, trend: "stable" as const },
    ],
  }));

  buildDigestProvider("mode_context", () => {
    const config = sitaModes.getModeConfig();
    return {
      type: "mode_context", title: "Current Mode", priority: 40,
      domain: "platform",
      summary: `${config.displayName} — notifications: ${config.notifications}, AI: ${config.aiLevel}`,
      items: [],
    };
  });

  buildDigestProvider("schedule_overview", () => ({
    type: "schedule_overview", title: "Schedule", priority: 80,
    domain: "concierge", summary: "Calendar integration pending",
    items: [],
  }));

  // ── Wire ChiefOfStaff proactive triggers ───────────────────

  // ChiefOfStaff can be triggered with real signals from AttentionOS & RelationshipIntelligence
  // This wiring is called by the hydration step below and by periodic checks

  _kernel = {
    personalGraph, intentOrchestrator, attentionOS, continuityEngine, trustActions,
    chiefOfStaff, timingIntelligence, relationships, digestEngine, sitaModes,
    adaptiveInterface, opportunityEngine, memoryGovernance, boundaryEngine, experienceSignature,
    hydrated: false,
  };

  return _kernel;
}

// ── Provider ─────────────────────────────────────────────────────

export const SitaOSProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const hydratedRef = useRef(false);
  const [kernel, setKernel] = useState<SitaOSKernel>(getOrCreateKernel);

  useEffect(() => {
    if (authLoading || !user || hydratedRef.current) return;
    hydratedRef.current = true;

    const k = getOrCreateKernel();

    // Hydrate all services from durable storage in parallel
    Promise.allSettled([
      k.personalGraph.loadPersistedState(),
      k.intentOrchestrator.loadPersistedState(),
      k.attentionOS.loadPersistedState(),
      k.continuityEngine.loadPersistedState(),
      k.trustActions.loadPersistedState(),
      k.chiefOfStaff.loadPersistedState(),
      k.timingIntelligence.loadPersistedState(),
      k.relationships.loadPersistedState(),
      k.digestEngine.loadPersistedState(),
      k.sitaModes.loadPersistedState(),
      k.adaptiveInterface.loadPersistedState(),
      k.opportunityEngine.loadPersistedState(),
      k.memoryGovernance.loadPersistedState(),
      k.boundaryEngine.loadPersistedState(),
    ]).then(() => {
      // Register the current web surface
      k.continuityEngine.registerSurface({
        surfaceId: "web-desktop",
        deviceId: navigator.userAgent.slice(0, 32),
        type: "desktop",
        lastSeen: new Date().toISOString(),
        active: true,
        capabilities: ["keyboard", "touch", "biometric"],
      });
      k.attentionOS.setActiveSurface("desktop");

      // Run initial proactive checks with real signals
      const cogLoad = k.attentionOS.getCognitiveLoad();
      const neglected = k.relationships.detectNeglectedRelationships(30);
      k.chiefOfStaff.runProactiveCheck({
        morning_start: new Date().getHours() >= 6 && new Date().getHours() <= 9,
        cognitiveLoad: cogLoad.score,
        neglectedContacts: neglected.length,
      });

      // Run opportunity detection
      k.opportunityEngine.runPatternDetection();

      // Apply memory decay
      k.memoryGovernance.applyDecay();

      setKernel({ ...k, hydrated: true });
      console.log("[SitaOS] Kernel hydrated — 15 services cross-wired and active");
    }).catch((err) => {
      console.warn("[SitaOS] Partial hydration error:", err);
      setKernel({ ...k, hydrated: true });
    });
  }, [user, authLoading]);

  return (
    <SitaOSContext.Provider value={kernel}>
      {children}
    </SitaOSContext.Provider>
  );
};
