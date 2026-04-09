// ═══════════════════════════════════════════════════════════════
// SITA OS — Reflection Copy Engine
// Generates personalized text reflecting user choices throughout setup.
// Makes the system feel thoughtful and attentive.
// ═══════════════════════════════════════════════════════════════

export interface ReflectionInput {
  displayName?: string;
  deviceOwnership?: string;
  trustLevel?: string;
  trustCalibrationLevel?: number;
  aiStyle?: string;
  presenceStyle?: string;
  interruptionStyle?: string;
  explanationStyle?: string;
  primaryUseMode?: string;
  painPoints?: string[];
  protectionPriorities?: string[];
  enabledDomains?: string[];
  advisorActivation?: { id: string; enabled: boolean; priority: string }[];
  connectedSystems?: number;
  deferredConnections?: string[];
  permissionChoices?: Record<string, boolean>;
  rituals?: string[];
  householdNodes?: { name: string; role: string }[];
  memoryConsent?: string;
  operatingContext?: string;
  relationshipFocus?: string;
}

export interface ReflectionLine {
  text: string;
  category: "trust" | "personalization" | "intelligence" | "activation" | "privacy" | "context";
}

/**
 * Generate contextual reflection lines based on user's setup choices.
 * Used in ArrivalPrepStep, LearningPanel, AdvisorActivation, FirstWinSetup.
 */
export function generateReflections(input: ReflectionInput): ReflectionLine[] {
  const lines: ReflectionLine[] = [];

  // Trust & autonomy reflections
  if (input.trustCalibrationLevel) {
    const trustMessages: Record<number, string> = {
      1: "You chose observe-only — SITA will watch and learn without acting.",
      2: "You chose suggestion mode — SITA will recommend, you decide.",
      3: "You chose simulation mode — SITA will preview outcomes before acting.",
      4: "You chose approval mode — nothing happens without your say.",
      5: "You chose auto-routine — repetitive tasks are handled for you.",
    };
    const msg = trustMessages[input.trustCalibrationLevel];
    if (msg) lines.push({ text: msg, category: "trust" });
  } else if (input.trustLevel) {
    const msgs: Record<string, string> = {
      open: "You chose open trust — SITA acts freely with full proof trails.",
      balanced: "You chose balanced trust — important actions need your approval.",
      guarded: "You chose guarded trust — SITA proposes, you decide everything.",
    };
    if (msgs[input.trustLevel]) lines.push({ text: msgs[input.trustLevel], category: "trust" });
  }

  // Presence style
  if (input.presenceStyle) {
    const presenceMessages: Record<string, string> = {
      ambient: "You prefer ambient presence — SITA stays in the background until needed.",
      present: "You prefer active presence — SITA stays visible and ready.",
      minimal: "You prefer minimal presence — SITA appears only when called.",
    };
    if (presenceMessages[input.presenceStyle]) {
      lines.push({ text: presenceMessages[input.presenceStyle], category: "personalization" });
    }
  }

  // Interruption style
  if (input.interruptionStyle) {
    const msgs: Record<string, string> = {
      quiet: "You chose quiet guidance — we'll keep things calm.",
      balanced: "You prefer balanced notifications — important things surface, routine stays quiet.",
      proactive: "You prefer proactive alerts — SITA will surface insights as they emerge.",
    };
    if (msgs[input.interruptionStyle]) {
      lines.push({ text: msgs[input.interruptionStyle], category: "personalization" });
    }
  }

  // Pain points
  if (input.painPoints?.length) {
    const painMap: Record<string, string> = {
      "follow-through": "follow-through slips most",
      "scheduling": "scheduling conflicts",
      "money-tracking": "tracking money",
      "communication": "communication gaps",
      "organization": "staying organized",
      "delegation": "delegating effectively",
    };
    const mapped = input.painPoints.slice(0, 2).map(p => painMap[p] || p).join(" and ");
    if (mapped) {
      lines.push({ text: `You said ${mapped} — SITA is preparing support for that.`, category: "intelligence" });
    }
  }

  // Device ownership context
  if (input.deviceOwnership === "family") {
    lines.push({ text: "Because this is a shared device, private and shared spaces are being separated.", category: "context" });
  } else if (input.deviceOwnership === "work") {
    lines.push({ text: "This is a managed device — organization policies will be respected.", category: "context" });
  }

  // Primary use mode
  if (input.primaryUseMode) {
    const modeMessages: Record<string, string> = {
      personal: "SITA is optimizing for personal life management and daily follow-through.",
      family: "SITA is shaping around family coordination and household harmony.",
      business: "SITA is prioritizing business intelligence and revenue operations.",
      money: "SITA is focusing on financial clarity and cash-flow awareness.",
      full: "SITA is configuring full-spectrum support across all domains.",
    };
    if (modeMessages[input.primaryUseMode]) {
      lines.push({ text: modeMessages[input.primaryUseMode], category: "activation" });
    }
  }

  // Operating context (Req #2)
  if (input.operatingContext) {
    const ctxMsgs: Record<string, string> = {
      rebuilding: "You're rebuilding structure — SITA will prioritize stabilization and gentle routines.",
      scaling: "You're scaling something — SITA will focus on leverage, delegation, and keeping pace.",
      "managing-complexity": "You're managing complexity — SITA will emphasize visibility, triage, and coordination.",
      "regaining-control": "You're regaining control — SITA will keep things calm and recovery-focused.",
    };
    if (ctxMsgs[input.operatingContext]) {
      lines.push({ text: ctxMsgs[input.operatingContext], category: "context" });
    }
  }

  // Relationship sensitivity (Req #5)
  if (input.relationshipFocus) {
    const relMsgs: Record<string, string> = {
      people: "SITA will help you stay connected with important people and track relationship health.",
      tasks: "SITA will focus on task completion and operational efficiency over relationship tracking.",
    };
    if (relMsgs[input.relationshipFocus]) {
      lines.push({ text: relMsgs[input.relationshipFocus], category: "personalization" });
    }
  }
  const enabledAdvisors = input.advisorActivation?.filter(a => a.enabled) || [];
  if (enabledAdvisors.length > 0) {
    const quietOnes = enabledAdvisors.filter(a => a.priority === "quiet");
    if (quietOnes.length > 0 && quietOnes.length === enabledAdvisors.length) {
      lines.push({ text: "All advisors are set to quiet mode — they'll speak only when it matters.", category: "intelligence" });
    } else if (enabledAdvisors.length >= 4) {
      lines.push({ text: `${enabledAdvisors.length} advisors are standing by across your environment.`, category: "intelligence" });
    }
  }

  // Privacy
  if (input.permissionChoices) {
    const enabledCount = Object.values(input.permissionChoices).filter(Boolean).length;
    const totalCount = Object.keys(input.permissionChoices).length;
    if (enabledCount === 0) {
      lines.push({ text: "All permissions are off — SITA will work with minimal data access.", category: "privacy" });
    } else if (enabledCount === totalCount) {
      lines.push({ text: "Full data access enabled — SITA can provide the most comprehensive support.", category: "privacy" });
    } else if (enabledCount <= 2) {
      lines.push({ text: "Limited permissions enabled — SITA will work within your boundaries.", category: "privacy" });
    }
  }

  // Memory consent
  if (input.memoryConsent) {
    const memMsgs: Record<string, string> = {
      full: "Full memory is enabled — SITA will learn and remember your patterns over time.",
      balanced: "Balanced memory — SITA remembers preferences but forgets sensitive details.",
      minimal: "Minimal memory — SITA starts fresh each session with no persistent learning.",
    };
    if (memMsgs[input.memoryConsent]) {
      lines.push({ text: memMsgs[input.memoryConsent], category: "privacy" });
    }
  }

  // Household
  if (input.householdNodes && input.householdNodes.length > 0) {
    lines.push({ text: `${input.householdNodes.length} household member${input.householdNodes.length !== 1 ? "s" : ""} registered — coordination support is active.`, category: "context" });
  }

  // Connections
  if (input.connectedSystems && input.connectedSystems > 0) {
    lines.push({ text: `${input.connectedSystems} system${input.connectedSystems !== 1 ? "s" : ""} connected — real data is flowing in.`, category: "activation" });
  }
  if (input.deferredConnections && input.deferredConnections.length > 0) {
    lines.push({ text: `${input.deferredConnections.length} connection${input.deferredConnections.length !== 1 ? "s" : ""} deferred — available in Settings anytime.`, category: "activation" });
  }

  return lines;
}

/**
 * Get a single "why recommended" explanation for a recommendation.
 */
export function getRecommendationReason(
  recommendationType: "advisor" | "connection" | "firstWin" | "useMode",
  itemId: string,
  input: ReflectionInput,
): string | null {
  const mode = input.primaryUseMode || "";
  const pains = input.painPoints || [];

  if (recommendationType === "advisor") {
    if (itemId === "business" && mode === "business") return "Recommended based on your business-first focus.";
    if (itemId === "money" && (mode === "money" || mode === "full")) return "Recommended for your financial clarity goals.";
    if (itemId === "life" && pains.includes("follow-through")) return "Recommended because follow-through matters most to you.";
    if (itemId === "family" && (mode === "family" || input.householdNodes?.length)) return "Recommended for household coordination.";
    if (itemId === "concierge" && pains.includes("scheduling")) return "Recommended to help with scheduling challenges.";
    if (itemId === "growth" && mode === "full") return "Recommended for cross-domain strategic insights.";
  }

  if (recommendationType === "useMode") {
    if (itemId === "business" && pains.includes("follow-through")) return "Recommended based on your focus on follow-through, scheduling, and work coordination.";
    if (itemId === "money" && pains.includes("money-tracking")) return "Recommended because financial tracking was a priority.";
    if (itemId === "family" && input.householdNodes?.length) return "Recommended based on your household members.";
  }

  if (recommendationType === "firstWin") {
    if (itemId === "recover-leads" && mode === "business") return "Recommended because business follow-through is your priority.";
    if (itemId === "bill-calendar" && mode === "money") return "Recommended for immediate financial visibility.";
    if (itemId === "daily-pulse" && pains.includes("follow-through")) return "Recommended to help with daily follow-through.";
  }

  return null;
}
