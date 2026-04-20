// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Kernel Context
// Instantiates, cross-wires, and exposes all 15 orchestration
// services as a unified operating system kernel.
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { resolveRouteLayer, resolveRouteDomain, type Layer } from "@/platform/architecture/layer-manifest";
import { isMobileSurface, getDeviceFingerprint } from "@/runtimes/runtime-platform";

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
import { createDeviceMesh, type DeviceMeshService } from "@/lib/services/device-mesh/index";
import { createContextGraph, type ContextGraphService } from "@/lib/services/context-graph/index";
import { createUniversalStateSync, type UniversalStateSyncService } from "@/lib/services/universal-state-sync/index";
import { createExplainability, type ExplainabilityService } from "@/lib/services/explainability/index";
import { createActionSafety, type ActionSafetyService } from "@/lib/services/action-safety/index";
import { createWorkspaceIntelligence, type WorkspaceIntelligenceService } from "@/lib/services/workspace-intelligence/index";

// ── CAI Persistence Bridge ──────────────────────────────────────
import {
  persistIntentResolution, persistOperatingMode, persistPrioritySnapshot,
  persistAttentionDecision, persistOpportunitySignal, persistDigestCompilation,
} from "@/data/persistence/cai-persistence-bridge";

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

  // Wave 4 — Intelligent Differentiation
  deviceMesh: DeviceMeshService;
  contextGraph: ContextGraphService;
  universalStateSync: UniversalStateSyncService;
  explainability: ExplainabilityService;
  actionSafety: ActionSafetyService;
  workspaceIntelligence: WorkspaceIntelligenceService;

  // Meta
  hydrated: boolean;

  // Layer awareness
  currentLayer: Layer;
  currentDomain?: string;
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
  const deviceMesh = createDeviceMesh();
  const contextGraph = createContextGraph();
  const universalStateSync = createUniversalStateSync();
  const explainability = createExplainability();
  const actionSafety = createActionSafety();
  const workspaceIntelligence = createWorkspaceIntelligence();

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

  // 3. Attention OS integration: feed processed intents into attention stack + persist to CAI table
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

    // Persist intent resolution to dedicated CAI table (fire-and-forget)
    persistIntentResolution({
      source_surface: intent.surface,
      raw_input: intent.raw.slice(0, 500),
      resolved_intent: intent.classification ?? "unknown",
      confidence: 0.85,
      target_capability: intent.domain ?? "platform",
      status: "resolved",
    }).catch(() => {});

    // Persist attention decision
    persistAttentionDecision({
      event_ref: intent.id,
      urgency_class: urgency >= 9 ? "critical" : urgency >= 7 ? "high" : "normal",
      routing_decision: "stack",
      selected_surface: intent.surface,
      deferred: false,
      reason: `${intent.classification} from ${intent.source}`,
      fatigue_score: attentionOS.getCognitiveLoad().score,
    }).catch(() => {});

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
    deviceMesh, contextGraph, universalStateSync, explainability, actionSafety, workspaceIntelligence,
    hydrated: false,
    currentLayer: "app" as Layer,
    currentDomain: undefined,
  };

  return _kernel;
}

// ── Layer-aware child that safely uses useLocation ──────────────

function LayerSyncEffect({ onLayerChange }: { onLayerChange: (layer: Layer, domain?: string) => void }) {
  const location = useLocation();
  const layer = resolveRouteLayer(location.pathname);
  const domain = resolveRouteDomain(location.pathname);

  useEffect(() => {
    onLayerChange(layer, domain);
  }, [layer, domain, onLayerChange]);

  return null;
}

// ── Provider ─────────────────────────────────────────────────────

export const SitaOSProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const hydratedRef = useRef(false);
  const [kernel, setKernel] = useState<SitaOSKernel>(getOrCreateKernel);

  const handleLayerChange = React.useCallback((layer: Layer, domain?: string) => {
    setKernel(prev => {
      if (prev.currentLayer === layer && prev.currentDomain === domain) return prev;
      return { ...prev, currentLayer: layer, currentDomain: domain };
    });
  }, []);

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
      k.deviceMesh.loadPersistedState(),
      k.contextGraph.loadPersistedState(),
      k.universalStateSync.loadPersistedState(),
      k.explainability.loadPersistedState(),
      k.actionSafety.loadPersistedState(),
      k.workspaceIntelligence.loadPersistedState(),
    ]).then(() => {
      // Register the current web surface — registry-routed mobile detection
      const isMobile = isMobileSurface();
      k.continuityEngine.registerSurface({
        surfaceId: isMobile ? "web-mobile" : "web-desktop",
        deviceId: getDeviceFingerprint(),
        type: isMobile ? "mobile" : "desktop",
        lastSeen: new Date().toISOString(),
        active: true,
        capabilities: ["keyboard", ...(isMobile ? ["touch"] : ["mouse", "biometric"])],
      });
      k.attentionOS.setActiveSurface(isMobile ? "mobile" : "desktop");

      // Seed context graph with initial signals
      k.contextGraph.batchUpdateSignals([
        { source: "device", key: "userId", value: user.id },
        { source: "device", key: "deviceId", value: getDeviceFingerprint() },
        { source: "device", key: "type", value: isMobile ? "mobile" : "desktop" },
        { source: "mode", key: "current", value: k.sitaModes.getMode() },
        { source: "cognitive_load", key: "score", value: k.attentionOS.getCognitiveLoad().score },
        { source: "network", key: "online", value: navigator.onLine },
        { source: "time", key: "hour", value: new Date().getHours() },
      ]);

      // Start device heartbeat + persist device to connected_devices table
      import("@/lib/services/device-presence-service").then(({ startHeartbeat, registerCurrentDevice }) => {
        startHeartbeat(60_000);
        if (user) registerCurrentDevice(user.id);
      });

      // Run initial proactive checks with real signals
      const cogLoad = k.attentionOS.getCognitiveLoad();
      const neglected = k.relationships.detectNeglectedRelationships(30);
      k.chiefOfStaff.runProactiveCheck({
        morning_start: new Date().getHours() >= 6 && new Date().getHours() <= 9,
        cognitiveLoad: cogLoad.score,
        neglectedContacts: neglected.length,
      });

      // Run opportunity detection + persist new signals to CAI table
      k.opportunityEngine.runPatternDetection();
      const newOpps = k.opportunityEngine.getNew();
      for (const opp of newOpps.slice(0, 5)) {
        persistOpportunitySignal({
          domain: opp.domain, signal_type: opp.type, title: opp.actionRequired,
          summary: `Confidence: ${Math.round(opp.confidence * 100)}%`,
          importance_tier: opp.confidence > 0.8 ? "high" : opp.confidence > 0.5 ? "medium" : "low",
          confidence: opp.confidence, status: "new",
        }).catch(() => {});
      }

      // Persist current operating mode to CAI table
      persistOperatingMode({
        mode_key: k.sitaModes.getMode(),
        active: true,
        metadata: { source: "hydration" },
      }).catch(() => {});

      // Persist priority snapshot
      const stack = k.attentionOS.getAttentionStack();
      persistPrioritySnapshot({
        mode: k.sitaModes.getMode(),
        stack_date: new Date().toISOString(),
        top_items_json: [...stack.critical, ...stack.active].slice(0, 10).map(i => ({ id: i.id, title: i.title })),
        urgency_summary: `${stack.critical.length} critical, ${stack.active.length} active`,
        attention_posture: cogLoad.score > 70 ? "overloaded" : cogLoad.score > 40 ? "active" : "calm",
      });

      // Apply memory decay
      k.memoryGovernance.applyDecay();

      setKernel({ ...k, hydrated: true });
      console.log("[SitaOS] Kernel hydrated — 21 services cross-wired, CAI tables active");
    }).catch((err) => {
      console.warn("[SitaOS] Partial hydration error:", err);
      setKernel({ ...k, hydrated: true });
    });
  }, [user, authLoading]);

  return (
    <SitaOSContext.Provider value={kernel}>
      <LayerSyncEffect onLayerChange={handleLayerChange} />
      {children}
    </SitaOSContext.Provider>
  );
};
