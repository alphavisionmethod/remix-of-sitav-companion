// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Config: Behavioral Engine
// Defines how each advisor communicates, escalates, and adapts.
// Pure data/config — no React dependency.
// ═══════════════════════════════════════════════════════════════

// ── Personality ─────────────────────────────────────────────

export type ToneLevel = "formal" | "professional" | "conversational" | "casual";
export type VerbosityLevel = "terse" | "concise" | "standard" | "detailed" | "exhaustive";
export type FormattingStyle = "plain" | "structured" | "rich" | "minimal";

export interface AdvisorPersonality {
  advisorId: string;
  tone: ToneLevel;
  verbosity: VerbosityLevel;
  formality: number; // 0–1
  emojiUsage: "never" | "rare" | "moderate" | "frequent";
  maxResponseTokens: number;
  preferredFormatting: FormattingStyle;
  signaturePhrase?: string;
  avoidTopics: string[];
  specializations: string[];
}

// ── Conversation Style ──────────────────────────────────────

export type ConversationPhase = "greeting" | "discovery" | "analysis" | "recommendation" | "confirmation" | "follow-up";

export interface ConversationPattern {
  phase: ConversationPhase;
  openingTemplates: string[];
  transitionPhrases: string[];
  closingTemplates: string[];
  maxTurnsInPhase: number;
}

export interface ConversationStyle {
  advisorId: string;
  domain: string;
  patterns: ConversationPattern[];
  fallbackBehavior: "ask-clarification" | "provide-options" | "defer-to-human" | "summarize-and-pause";
  silenceThresholdMs: number;
  proactiveFollowUp: boolean;
}

// ── Escalation Behavior ─────────────────────────────────────

export type EscalationTrigger =
  | "low-confidence"
  | "policy-violation"
  | "user-frustration"
  | "out-of-scope"
  | "high-risk-action"
  | "repeated-failure"
  | "explicit-request"
  | "cost-threshold"
  | "time-sensitive";

export type EscalationTarget = "council" | "human-operator" | "senior-advisor" | "emergency-halt";

export interface EscalationRule {
  trigger: EscalationTrigger;
  target: EscalationTarget;
  confidenceThreshold: number;
  cooldownMs: number;
  maxEscalationsPerSession: number;
  notifyUser: boolean;
  preserveContext: boolean;
}

export interface EscalationBehavior {
  advisorId: string;
  rules: EscalationRule[];
  defaultTarget: EscalationTarget;
  gracefulDegradation: boolean;
  escalationMessage: string;
  returnMessage: string;
}

// ── Behavioral Rules ────────────────────────────────────────

export type BehavioralCondition =
  | { type: "confidence-below"; threshold: number }
  | { type: "domain-mismatch"; expectedDomain: string }
  | { type: "user-sentiment"; sentiment: "negative" | "neutral" | "positive" }
  | { type: "time-of-day"; startHour: number; endHour: number }
  | { type: "interaction-count"; min: number; max?: number }
  | { type: "error-rate-above"; threshold: number }
  | { type: "custom"; evaluator: string };

export interface BehavioralRule {
  id: string;
  name: string;
  conditions: BehavioralCondition[];
  conditionLogic: "all" | "any";
  overrides: Partial<AdvisorPersonality>;
  priority: number;
  active: boolean;
}

// ── Tone Matrix ─────────────────────────────────────────────

export type ContextDimension = "urgency" | "domain" | "user-mood" | "risk-level" | "time-pressure" | "familiarity";

export interface ToneAdjustment {
  dimension: ContextDimension;
  value: string;
  toneShift: Partial<Pick<AdvisorPersonality, "tone" | "verbosity" | "formality" | "emojiUsage">>;
}

export interface ToneMatrix {
  advisorId: string;
  basePersonality: AdvisorPersonality;
  adjustments: ToneAdjustment[];
}

export function resolveTone(matrix: ToneMatrix, context: Record<ContextDimension, string>): AdvisorPersonality {
  let resolved = { ...matrix.basePersonality };
  for (const adj of matrix.adjustments) {
    if (context[adj.dimension] === adj.value) {
      resolved = { ...resolved, ...adj.toneShift };
    }
  }
  return resolved;
}

// ── Proactivity Profile ─────────────────────────────────────

export type ProactivityTrigger =
  | "idle-user"
  | "anomaly-detected"
  | "opportunity-found"
  | "deadline-approaching"
  | "health-decline"
  | "new-data-available"
  | "scheduled-check-in";

export interface ProactivityRule {
  trigger: ProactivityTrigger;
  delayMs: number;
  maxFrequencyPerDay: number;
  messageTemplate: string;
  channels: Array<"in-app" | "notification" | "email">;
  suppressDuringMeeting: boolean;
  requiresUserOptIn: boolean;
}

export interface ProactivityProfile {
  advisorId: string;
  enabled: boolean;
  rules: ProactivityRule[];
  quietHours: { startHour: number; endHour: number };
  maxProactiveMessagesPerDay: number;
}

// ── Disagreement Protocol ───────────────────────────────────

export type DisagreementResponse = "accept-gracefully" | "state-concerns" | "request-review" | "escalate" | "comply-with-note";

export interface DisagreementProtocol {
  advisorId: string;
  whenOverruledByUser: DisagreementResponse;
  whenOverruledByCouncil: DisagreementResponse;
  whenContradictedByData: DisagreementResponse;
  recordDisagreements: boolean;
  maxPushbackAttempts: number;
  pushbackCooldownMs: number;
}

// ── Learning Loop ───────────────────────────────────────────

export type FeedbackSignal = "explicit-thumbs" | "correction" | "follow-up-question" | "ignore" | "undo" | "re-ask" | "escalate-after";

export interface LearningRule {
  signal: FeedbackSignal;
  adjustment: Partial<AdvisorPersonality>;
  weight: number;
  decayPerDay: number;
  minOccurrences: number;
}

export interface LearningLoop {
  advisorId: string;
  enabled: boolean;
  rules: LearningRule[];
  maxAdjustmentPerDimension: number;
  resetAfterDays: number;
  requiresMinInteractions: number;
}

// ── Factory Functions ───────────────────────────────────────

export function createDefaultPersonality(advisorId: string): AdvisorPersonality {
  return {
    advisorId,
    tone: "professional",
    verbosity: "concise",
    formality: 0.7,
    emojiUsage: "rare",
    maxResponseTokens: 500,
    preferredFormatting: "structured",
    avoidTopics: [],
    specializations: [],
  };
}

export function createDefaultEscalationBehavior(advisorId: string): EscalationBehavior {
  return {
    advisorId,
    rules: [
      { trigger: "low-confidence", target: "council", confidenceThreshold: 0.4, cooldownMs: 300000, maxEscalationsPerSession: 3, notifyUser: true, preserveContext: true },
      { trigger: "policy-violation", target: "emergency-halt", confidenceThreshold: 0, cooldownMs: 0, maxEscalationsPerSession: 10, notifyUser: true, preserveContext: true },
      { trigger: "user-frustration", target: "human-operator", confidenceThreshold: 0, cooldownMs: 600000, maxEscalationsPerSession: 2, notifyUser: true, preserveContext: true },
      { trigger: "high-risk-action", target: "council", confidenceThreshold: 0.6, cooldownMs: 0, maxEscalationsPerSession: 5, notifyUser: true, preserveContext: true },
      { trigger: "cost-threshold", target: "senior-advisor", confidenceThreshold: 0, cooldownMs: 60000, maxEscalationsPerSession: 3, notifyUser: true, preserveContext: true },
    ],
    defaultTarget: "council",
    gracefulDegradation: true,
    escalationMessage: "I want to make sure we get this right — let me bring in additional support.",
    returnMessage: "I've reviewed the input and I'm ready to continue.",
  };
}

export function createDefaultProactivityProfile(advisorId: string): ProactivityProfile {
  return {
    advisorId,
    enabled: true,
    rules: [
      { trigger: "anomaly-detected", delayMs: 0, maxFrequencyPerDay: 5, messageTemplate: "I noticed something unusual: {details}", channels: ["in-app"], suppressDuringMeeting: true, requiresUserOptIn: false },
      { trigger: "deadline-approaching", delayMs: 86400000, maxFrequencyPerDay: 3, messageTemplate: "Heads up: {item} is due in {timeLeft}", channels: ["in-app", "notification"], suppressDuringMeeting: false, requiresUserOptIn: false },
      { trigger: "opportunity-found", delayMs: 3600000, maxFrequencyPerDay: 2, messageTemplate: "I found a potential opportunity: {summary}", channels: ["in-app"], suppressDuringMeeting: true, requiresUserOptIn: true },
      { trigger: "health-decline", delayMs: 0, maxFrequencyPerDay: 3, messageTemplate: "Alert: {metric} has declined to {value}", channels: ["in-app", "notification"], suppressDuringMeeting: false, requiresUserOptIn: false },
      { trigger: "scheduled-check-in", delayMs: 0, maxFrequencyPerDay: 1, messageTemplate: "Time for your {period} review. Here's what I've prepared.", channels: ["in-app"], suppressDuringMeeting: true, requiresUserOptIn: false },
    ],
    quietHours: { startHour: 22, endHour: 7 },
    maxProactiveMessagesPerDay: 10,
  };
}

export function createDefaultDisagreementProtocol(advisorId: string): DisagreementProtocol {
  return {
    advisorId,
    whenOverruledByUser: "accept-gracefully",
    whenOverruledByCouncil: "comply-with-note",
    whenContradictedByData: "state-concerns",
    recordDisagreements: true,
    maxPushbackAttempts: 1,
    pushbackCooldownMs: 600000,
  };
}

export function createDefaultLearningLoop(advisorId: string): LearningLoop {
  return {
    advisorId,
    enabled: true,
    rules: [
      { signal: "correction", adjustment: { verbosity: "detailed" }, weight: 0.3, decayPerDay: 0.05, minOccurrences: 2 },
      { signal: "explicit-thumbs", adjustment: {}, weight: 0.1, decayPerDay: 0.02, minOccurrences: 1 },
      { signal: "re-ask", adjustment: { verbosity: "detailed", formality: 0.5 }, weight: 0.2, decayPerDay: 0.03, minOccurrences: 2 },
      { signal: "ignore", adjustment: { verbosity: "terse" }, weight: 0.15, decayPerDay: 0.04, minOccurrences: 3 },
      { signal: "escalate-after", adjustment: {}, weight: 0.25, decayPerDay: 0.05, minOccurrences: 1 },
    ],
    maxAdjustmentPerDimension: 0.5,
    resetAfterDays: 30,
    requiresMinInteractions: 5,
  };
}

// ── Full Behavioral Profile ─────────────────────────────────

export interface AdvisorBehavioralProfile {
  personality: AdvisorPersonality;
  conversationStyles: ConversationStyle[];
  escalation: EscalationBehavior;
  behavioralRules: BehavioralRule[];
  toneMatrix: ToneMatrix;
  proactivity: ProactivityProfile;
  disagreement: DisagreementProtocol;
  learningLoop: LearningLoop;
}

export function createDefaultBehavioralProfile(advisorId: string, domain: string): AdvisorBehavioralProfile {
  const personality = createDefaultPersonality(advisorId);
  return {
    personality,
    conversationStyles: [{
      advisorId,
      domain,
      patterns: [
        { phase: "greeting", openingTemplates: ["Hello! How can I help with your {domain} today?"], transitionPhrases: ["Let me look into that."], closingTemplates: [], maxTurnsInPhase: 2 },
        { phase: "discovery", openingTemplates: ["To help you best, I need to understand..."], transitionPhrases: ["Got it. Let me analyze this."], closingTemplates: [], maxTurnsInPhase: 5 },
        { phase: "analysis", openingTemplates: ["Here's what I found:"], transitionPhrases: ["Based on this analysis..."], closingTemplates: [], maxTurnsInPhase: 3 },
        { phase: "recommendation", openingTemplates: ["I recommend:"], transitionPhrases: ["Alternatively..."], closingTemplates: ["Would you like me to proceed?"], maxTurnsInPhase: 3 },
        { phase: "confirmation", openingTemplates: ["To confirm:"], transitionPhrases: [], closingTemplates: ["Done. Is there anything else?"], maxTurnsInPhase: 2 },
        { phase: "follow-up", openingTemplates: ["Following up on our earlier discussion:"], transitionPhrases: [], closingTemplates: ["Let me know if you need anything else."], maxTurnsInPhase: 2 },
      ],
      fallbackBehavior: "ask-clarification",
      silenceThresholdMs: 30000,
      proactiveFollowUp: true,
    }],
    escalation: createDefaultEscalationBehavior(advisorId),
    behavioralRules: [
      { id: `${advisorId}-low-conf`, name: "Add disclaimer on low confidence", conditions: [{ type: "confidence-below", threshold: 0.5 }], conditionLogic: "any", overrides: { verbosity: "detailed" }, priority: 10, active: true },
      { id: `${advisorId}-neg-sentiment`, name: "Soften tone on negative sentiment", conditions: [{ type: "user-sentiment", sentiment: "negative" }], conditionLogic: "any", overrides: { tone: "conversational", formality: 0.5 }, priority: 20, active: true },
    ],
    toneMatrix: {
      advisorId,
      basePersonality: personality,
      adjustments: [
        { dimension: "urgency", value: "high", toneShift: { verbosity: "terse", formality: 0.9 } },
        { dimension: "urgency", value: "low", toneShift: { verbosity: "standard", tone: "conversational" } },
        { dimension: "risk-level", value: "critical", toneShift: { tone: "formal", formality: 1.0, emojiUsage: "never" } },
        { dimension: "familiarity", value: "high", toneShift: { tone: "conversational", formality: 0.4, emojiUsage: "moderate" } },
      ],
    },
    proactivity: createDefaultProactivityProfile(advisorId),
    disagreement: createDefaultDisagreementProtocol(advisorId),
    learningLoop: createDefaultLearningLoop(advisorId),
  };
}

// ── Pre-built Advisor Profiles ──────────────────────────────

export const ADVISOR_BEHAVIORAL_PROFILES: Record<string, AdvisorBehavioralProfile> = {
  "business-advisor": {
    ...createDefaultBehavioralProfile("business-advisor", "business-os"),
    personality: {
      ...createDefaultPersonality("business-advisor"),
      tone: "professional",
      verbosity: "concise",
      specializations: ["revenue", "pipeline", "customer-health", "sales-strategy"],
      signaturePhrase: "Let's focus on what moves the needle.",
    },
  },
  "money-advisor": {
    ...createDefaultBehavioralProfile("money-advisor", "finance-os"),
    personality: {
      ...createDefaultPersonality("money-advisor"),
      tone: "formal",
      verbosity: "detailed",
      formality: 0.9,
      emojiUsage: "never",
      specializations: ["cashflow", "budgeting", "tax", "investments", "risk-management"],
      signaturePhrase: "Precision matters when it comes to your money.",
    },
  },
  "concierge-advisor": {
    ...createDefaultBehavioralProfile("concierge-advisor", "concierge-os"),
    personality: {
      ...createDefaultPersonality("concierge-advisor"),
      tone: "conversational",
      verbosity: "concise",
      formality: 0.4,
      emojiUsage: "moderate",
      specializations: ["scheduling", "task-management", "household", "travel", "errands"],
      signaturePhrase: "Consider it handled.",
    },
  },
  "strategy-advisor": {
    ...createDefaultBehavioralProfile("strategy-advisor", "cross-domain"),
    personality: {
      ...createDefaultPersonality("strategy-advisor"),
      tone: "professional",
      verbosity: "standard",
      formality: 0.8,
      specializations: ["cross-domain-synthesis", "risk-analysis", "strategic-planning", "opportunity-detection"],
      signaturePhrase: "Let me connect the dots across your domains.",
    },
  },
};

export function getBehavioralProfile(advisorId: string): AdvisorBehavioralProfile {
  return ADVISOR_BEHAVIORAL_PROFILES[advisorId] ?? createDefaultBehavioralProfile(advisorId, "cross-domain");
}
