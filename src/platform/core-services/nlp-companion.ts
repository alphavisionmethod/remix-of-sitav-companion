// ═══════════════════════════════════════════════════════════════
// SITA OS — NLP Companion Engine
// Natural language processing for companion bar: intent detection,
// entity extraction, smart routing, contextual responses,
// sentiment analysis, and predictive suggestions
// ═══════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────────

export type Intent =
  | "navigate"
  | "search"
  | "create"
  | "update"
  | "delete"
  | "schedule"
  | "query"
  | "report"
  | "help"
  | "agent-control"
  | "system-status"
  | "analyze"
  | "compare"
  | "forecast"
  | "search"
  | "unknown";

export type EntityType =
  | "module"
  | "person"
  | "date"
  | "amount"
  | "agent"
  | "status"
  | "metric"
  | "action"
  | "duration";

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: [number, number]; // start, end
}

export type Sentiment = "positive" | "neutral" | "negative" | "urgent";

export interface NLPResult {
  intent: Intent;
  confidence: number;
  entities: ExtractedEntity[];
  sentiment: Sentiment;
  suggestedAction: NLPAction | null;
  alternativeIntents: { intent: Intent; confidence: number }[];
  context: string;
  responseText: string;
}

export interface NLPAction {
  type: "navigate" | "execute" | "display" | "confirm" | "suggest";
  route?: string;
  command?: string;
  payload?: Record<string, unknown>;
  label: string;
  description: string;
}

export interface ConversationTurn {
  role: "user" | "sita";
  text: string;
  timestamp: number;
  nlpResult?: NLPResult;
}

export interface PredictiveSuggestion {
  text: string;
  confidence: number;
  basedOn: string; // what triggered this suggestion
}

// ── Intent Patterns ─────────────────────────────────────────────

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[]; weight: number }[] = [
  {
    intent: "navigate",
    patterns: [
      /\b(go to|open|show|navigate|take me to|switch to|view)\b/i,
      /\b(dashboard|money|business|calendar|settings|clients|pipeline|invoices|tasks|mission control|owner)\b/i,
    ],
    weight: 0.9,
  },
  {
    intent: "create",
    patterns: [
      /\b(create|add|new|make|generate|build|set up|draft)\b/i,
      /\b(invoice|lead|task|event|budget|contact|proposal|workflow)\b/i,
    ],
    weight: 0.85,
  },
  {
    intent: "schedule",
    patterns: [
      /\b(schedule|book|reserve|set|plan|calendar|remind|appointment)\b/i,
      /\b(meeting|call|follow[- ]?up|check[- ]?in|review|standup)\b/i,
    ],
    weight: 0.88,
  },
  {
    intent: "query",
    patterns: [
      /\b(how (many|much)|what('s| is| are)|show me|list|find|search|look up|get)\b/i,
      /\b(total|count|number|amount|balance|status|details)\b/i,
    ],
    weight: 0.82,
  },
  {
    intent: "report",
    patterns: [
      /\b(report|summary|overview|breakdown|analysis|insights|metrics|stats)\b/i,
      /\b(weekly|monthly|quarterly|annual|revenue|expenses|pipeline)\b/i,
    ],
    weight: 0.84,
  },
  {
    intent: "agent-control",
    patterns: [
      /\b(agent|bot|worker|fleet|pause|resume|promote|demote|start|stop)\b/i,
      /\b(patrol|orchestrator|learning|sync|health)\b/i,
    ],
    weight: 0.86,
  },
  {
    intent: "system-status",
    patterns: [
      /\b(status|health|uptime|errors|bugs|issues|performance|trust)\b/i,
      /\b(how('s| is) (the )?system|everything (ok|good|working))\b/i,
    ],
    weight: 0.83,
  },
  {
    intent: "analyze",
    patterns: [
      /\b(analyze|investigate|diagnose|explain|why|root cause|debug)\b/i,
      /\b(trend|pattern|anomaly|spike|drop|change|correlation)\b/i,
    ],
    weight: 0.81,
  },
  {
    intent: "forecast",
    patterns: [
      /\b(forecast|predict|project|estimate|expect|anticipate|future)\b/i,
      /\b(next (week|month|quarter|year)|by end of|runway|growth)\b/i,
    ],
    weight: 0.80,
  },
  {
    intent: "compare",
    patterns: [
      /\b(compare|versus|vs|differ|between|against|benchmark)\b/i,
      /\b(last (week|month|quarter|year)|year[- ]over[- ]year|mom|yoy)\b/i,
    ],
    weight: 0.79,
  },
  {
    intent: "help",
    patterns: [
      /\b(help|how do i|what can|guide|tutorial|explain|support)\b/i,
      /\b(documentation|docs|tip|hint|shortcut)\b/i,
    ],
    weight: 0.75,
  },
  {
    intent: "delete",
    patterns: [
      /\b(delete|remove|cancel|archive|discard|clear|clean)\b/i,
    ],
    weight: 0.7,
  },
  {
    intent: "update",
    patterns: [
      /\b(update|edit|change|modify|adjust|set|fix|rename|move)\b/i,
    ],
    weight: 0.72,
  },
];

// ── Entity Extraction Patterns ──────────────────────────────────

const MODULE_KEYWORDS: Record<string, string> = {
  dashboard: "dashboard", home: "dashboard", pulse: "dashboard",
  money: "finance", finance: "finance", invoices: "finance", budget: "finance",
  business: "business", clients: "business", pipeline: "business", leads: "business",
  calendar: "concierge", schedule: "concierge", events: "concierge",
  tasks: "productivity", todos: "productivity",
  settings: "system", config: "system",
  agents: "system", "mission control": "system", fleet: "system",
  owner: "system",
};

const ROUTE_MAP: Record<string, string> = {
  dashboard: "/", home: "/", pulse: "/",
  money: "/money", finance: "/money", invoices: "/money",
  business: "/business", clients: "/business", pipeline: "/business",
  calendar: "/calendar", schedule: "/calendar",
  tasks: "/tasks",
  settings: "/settings",
  agents: "/agents", "mission control": "/mission-control", fleet: "/mission-control",
  owner: "/owner",
};

const DATE_PATTERNS: { pattern: RegExp; resolve: () => string }[] = [
  { pattern: /\btoday\b/i, resolve: () => new Date().toISOString().split("T")[0] },
  { pattern: /\btomorrow\b/i, resolve: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; } },
  { pattern: /\byesterday\b/i, resolve: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; } },
  { pattern: /\bnext week\b/i, resolve: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; } },
  { pattern: /\bnext month\b/i, resolve: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; } },
];

const AMOUNT_PATTERN = /\$?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:k|m|b)?/gi;
const AGENT_PATTERN = /\bagent[- ]?(\w+[-\w]*)\b/gi;
const STATUS_KEYWORDS = ["active", "paused", "error", "idle", "running", "stopped", "healthy", "degraded", "critical"];
const METRIC_KEYWORDS = ["revenue", "cost", "profit", "margin", "conversion", "retention", "churn", "growth", "runway", "burn rate"];

// ── Sentiment Analysis ──────────────────────────────────────────

const SENTIMENT_PATTERNS: { sentiment: Sentiment; patterns: RegExp[] }[] = [
  {
    sentiment: "urgent",
    patterns: [
      /\b(urgent|asap|immediately|critical|emergency|now|right now|hurry)\b/i,
      /!{2,}/,
      /\b(broken|down|crash|fail|error|bug)\b/i,
    ],
  },
  {
    sentiment: "negative",
    patterns: [
      /\b(wrong|bad|terrible|awful|slow|annoying|frustrated|confused|stuck)\b/i,
      /\b(not working|doesn't work|can't|won't|problem|issue)\b/i,
    ],
  },
  {
    sentiment: "positive",
    patterns: [
      /\b(great|awesome|perfect|excellent|good|nice|love|amazing|thanks|cool)\b/i,
      /\b(well done|looks good|working well)\b/i,
    ],
  },
];

// ── NLP Companion Engine ────────────────────────────────────────

export class NLPCompanion {
  private conversationHistory: ConversationTurn[] = [];
  private maxHistory = 20;
  private queryFrequency: Record<string, number> = {};

  // ── Process Natural Language Input ────────────────────────────

  process(input: string, currentModule?: string): NLPResult {
    const normalizedInput = input.trim().toLowerCase();

    // Track frequency for predictions
    const words = normalizedInput.split(/\s+/);
    for (const word of words) {
      this.queryFrequency[word] = (this.queryFrequency[word] || 0) + 1;
    }

    const intent = this.detectIntent(normalizedInput);
    const entities = this.extractEntities(input);
    const sentiment = this.analyzeSentiment(input);
    const suggestedAction = this.buildAction(intent.primary, entities, currentModule);
    const responseText = this.generateResponse(intent.primary, entities, sentiment, currentModule);

    const result: NLPResult = {
      intent: intent.primary,
      confidence: intent.confidence,
      entities,
      sentiment,
      suggestedAction,
      alternativeIntents: intent.alternatives,
      context: currentModule || "dashboard",
      responseText,
    };

    // Store conversation turn
    this.conversationHistory.push({
      role: "user",
      text: input,
      timestamp: Date.now(),
      nlpResult: result,
    });

    this.conversationHistory.push({
      role: "sita",
      text: responseText,
      timestamp: Date.now(),
    });

    if (this.conversationHistory.length > this.maxHistory * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
    }

    return result;
  }

  // ── Intent Detection ──────────────────────────────────────────

  private detectIntent(input: string): {
    primary: Intent;
    confidence: number;
    alternatives: { intent: Intent; confidence: number }[];
  } {
    const scores: { intent: Intent; score: number }[] = [];

    for (const { intent, patterns, weight } of INTENT_PATTERNS) {
      let matchCount = 0;
      for (const pattern of patterns) {
        if (pattern.test(input)) matchCount++;
      }
      if (matchCount > 0) {
        const confidence = Math.min(0.99, (matchCount / patterns.length) * weight);
        scores.push({ intent, score: confidence });
      }
    }

    // Boost based on conversation context
    const recentIntents = this.conversationHistory
      .filter((t) => t.role === "user" && t.nlpResult)
      .slice(-3)
      .map((t) => t.nlpResult!.intent);

    for (const score of scores) {
      if (recentIntents.includes(score.intent)) {
        score.score *= 1.1; // 10% boost for contextual continuity
      }
    }

    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      return { primary: "unknown", confidence: 0.1, alternatives: [] };
    }

    return {
      primary: scores[0].intent,
      confidence: Math.min(0.99, scores[0].score),
      alternatives: scores.slice(1, 4).map((s) => ({ intent: s.intent, confidence: Math.min(0.99, s.score) })),
    };
  }

  // ── Entity Extraction ─────────────────────────────────────────

  private extractEntities(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lower = input.toLowerCase();

    // Module entities
    for (const [keyword, module] of Object.entries(MODULE_KEYWORDS)) {
      const idx = lower.indexOf(keyword);
      if (idx !== -1) {
        entities.push({
          type: "module",
          value: module,
          confidence: 0.95,
          position: [idx, idx + keyword.length],
        });
      }
    }

    // Date entities
    for (const { pattern, resolve } of DATE_PATTERNS) {
      const match = pattern.exec(input);
      if (match) {
        entities.push({
          type: "date",
          value: resolve(),
          confidence: 0.9,
          position: [match.index, match.index + match[0].length],
        });
      }
    }

    // Amount entities
    let amountMatch;
    const amountRegex = new RegExp(AMOUNT_PATTERN.source, "gi");
    while ((amountMatch = amountRegex.exec(input)) !== null) {
      entities.push({
        type: "amount",
        value: amountMatch[0],
        confidence: 0.88,
        position: [amountMatch.index, amountMatch.index + amountMatch[0].length],
      });
    }

    // Agent entities
    let agentMatch;
    const agentRegex = new RegExp(AGENT_PATTERN.source, "gi");
    while ((agentMatch = agentRegex.exec(input)) !== null) {
      entities.push({
        type: "agent",
        value: agentMatch[1],
        confidence: 0.85,
        position: [agentMatch.index, agentMatch.index + agentMatch[0].length],
      });
    }

    // Status entities
    for (const status of STATUS_KEYWORDS) {
      const idx = lower.indexOf(status);
      if (idx !== -1) {
        entities.push({
          type: "status",
          value: status,
          confidence: 0.8,
          position: [idx, idx + status.length],
        });
      }
    }

    // Metric entities
    for (const metric of METRIC_KEYWORDS) {
      const idx = lower.indexOf(metric);
      if (idx !== -1) {
        entities.push({
          type: "metric",
          value: metric,
          confidence: 0.82,
          position: [idx, idx + metric.length],
        });
      }
    }

    return entities;
  }

  // ── Sentiment Analysis ────────────────────────────────────────

  private analyzeSentiment(input: string): Sentiment {
    for (const { sentiment, patterns } of SENTIMENT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(input)) return sentiment;
      }
    }
    return "neutral";
  }

  // ── Action Builder ────────────────────────────────────────────

  private buildAction(intent: Intent, entities: ExtractedEntity[], currentModule?: string): NLPAction | null {
    const moduleEntity = entities.find((e) => e.type === "module");

    switch (intent) {
      case "navigate": {
        if (moduleEntity) {
          const targetKey = Object.keys(MODULE_KEYWORDS).find(
            (k) => MODULE_KEYWORDS[k] === moduleEntity.value
          );
          const route = targetKey ? ROUTE_MAP[targetKey] : undefined;
          return {
            type: "navigate",
            route: route || "/",
            label: `Go to ${moduleEntity.value}`,
            description: `Navigate to the ${moduleEntity.value} module`,
          };
        }
        return null;
      }

      case "create":
        return {
          type: "execute",
          command: "quick-add",
          payload: { module: moduleEntity?.value || currentModule || "dashboard" },
          label: "Create new item",
          description: "Open the quick-add wizard",
        };

      case "schedule":
        return {
          type: "execute",
          command: "quick-book",
          label: "Open booking",
          description: "Open the inline booking flow",
        };

      case "query":
      case "report":
        return {
          type: "display",
          command: "search",
          payload: { module: moduleEntity?.value || currentModule },
          label: "Show results",
          description: "Display relevant data and metrics",
        };

      case "agent-control": {
        const agentEntity = entities.find((e) => e.type === "agent");
        const statusEntity = entities.find((e) => e.type === "status");
        return {
          type: "execute",
          command: "agent-action",
          payload: {
            agentId: agentEntity?.value,
            action: statusEntity?.value || "status",
          },
          label: agentEntity ? `Manage agent ${agentEntity.value}` : "Fleet overview",
          description: "Control agent lifecycle",
        };
      }

      case "system-status":
        return {
          type: "navigate",
          route: "/mission-control",
          label: "System status",
          description: "View full system health dashboard",
        };

      case "forecast":
        return {
          type: "display",
          command: "forecast",
          payload: { metric: entities.find((e) => e.type === "metric")?.value },
          label: "Show forecast",
          description: "Display predictive analysis",
        };

      case "help":
        return {
          type: "display",
          command: "help",
          label: "Show help",
          description: "Display contextual guidance",
        };

      default:
        return null;
    }
  }

  // ── Response Generation ───────────────────────────────────────

  private generateResponse(intent: Intent, entities: ExtractedEntity[], sentiment: Sentiment, currentModule?: string): string {
    const urgentPrefix = sentiment === "urgent" ? "On it right away! " : "";
    const moduleEntity = entities.find((e) => e.type === "module");

    const responses: Record<Intent, () => string> = {
      navigate: () => {
        const target = moduleEntity?.value || "dashboard";
        return `${urgentPrefix}Opening ${target} for you.`;
      },
      create: () => `${urgentPrefix}Let me help you create that. Opening the quick-add wizard.`,
      update: () => `${urgentPrefix}I'll help you update that. What would you like to change?`,
      delete: () => "Are you sure you want to delete that? This action may not be reversible.",
      schedule: () => `${urgentPrefix}Opening the booking flow. Let's get that scheduled.`,
      query: () => {
        const metric = entities.find((e) => e.type === "metric");
        return metric
          ? `Looking up ${metric.value} data for you...`
          : `Searching across ${currentModule || "all modules"}...`;
      },
      report: () => {
        const metric = entities.find((e) => e.type === "metric");
        return `Generating ${metric?.value || "summary"} report...`;
      },
      help: () => `Here's what I can help with in ${currentModule || "SITA OS"}: navigate pages, create items, schedule events, query data, manage agents, and more. Just ask naturally!`,
      "agent-control": () => {
        const agent = entities.find((e) => e.type === "agent");
        return agent
          ? `Managing agent ${agent.value}. What action should I take?`
          : "Here's the fleet overview. Which agent do you want to control?";
      },
      "system-status": () => "Let me check system health for you...",
      analyze: () => "Running analysis now. I'll highlight key patterns and anomalies.",
      compare: () => "Setting up comparison view. Which metrics matter most to you?",
      forecast: () => {
        const metric = entities.find((e) => e.type === "metric");
        return `Generating forecast ${metric ? `for ${metric.value}` : ""}. Based on recent trends and patterns.`;
      },
      search: () => {
        return `Searching across ${currentModule || "all modules"}...`;
      },
      unknown: () => {
        if (sentiment === "negative" || sentiment === "urgent") {
          return "I can tell something's not right. Can you tell me more specifically what you need help with?";
        }
        return "I'm not quite sure what you need. Try: 'Go to money', 'Create invoice', 'Show revenue report', or 'Check system status'.";
      },
    };

    return responses[intent]();
  }

  // ── Predictive Suggestions ────────────────────────────────────

  getPredictiveSuggestions(currentModule?: string): PredictiveSuggestion[] {
    const suggestions: PredictiveSuggestion[] = [];

    // Based on recent conversation
    const recentIntents = this.conversationHistory
      .filter((t) => t.role === "user" && t.nlpResult)
      .slice(-5)
      .map((t) => t.nlpResult!);

    if (recentIntents.some((r) => r.intent === "query")) {
      suggestions.push({
        text: "Show me a summary report",
        confidence: 0.7,
        basedOn: "Recent data queries",
      });
    }

    if (recentIntents.some((r) => r.intent === "navigate")) {
      suggestions.push({
        text: "What's the status here?",
        confidence: 0.65,
        basedOn: "Recent navigation",
      });
    }

    // Module-contextual suggestions
    const moduleSuggestions: Record<string, PredictiveSuggestion[]> = {
      finance: [
        { text: "Show cash runway forecast", confidence: 0.8, basedOn: "Finance context" },
        { text: "Create new invoice", confidence: 0.75, basedOn: "Finance context" },
        { text: "Compare revenue this month vs last", confidence: 0.7, basedOn: "Finance context" },
      ],
      business: [
        { text: "Show pipeline conversion rate", confidence: 0.8, basedOn: "Business context" },
        { text: "List overdue follow-ups", confidence: 0.75, basedOn: "Business context" },
        { text: "Schedule a client call", confidence: 0.7, basedOn: "Business context" },
      ],
      dashboard: [
        { text: "What needs my attention today?", confidence: 0.85, basedOn: "Dashboard context" },
        { text: "Show system status", confidence: 0.7, basedOn: "Dashboard context" },
        { text: "Open daily briefing", confidence: 0.75, basedOn: "Dashboard context" },
      ],
      system: [
        { text: "Check fleet health", confidence: 0.85, basedOn: "System context" },
        { text: "Show error patrol report", confidence: 0.8, basedOn: "System context" },
        { text: "Which agents need attention?", confidence: 0.75, basedOn: "System context" },
      ],
      concierge: [
        { text: "What's on my calendar today?", confidence: 0.85, basedOn: "Calendar context" },
        { text: "Schedule a meeting tomorrow", confidence: 0.8, basedOn: "Calendar context" },
        { text: "Check for conflicts", confidence: 0.7, basedOn: "Calendar context" },
      ],
      productivity: [
        { text: "Show overdue tasks", confidence: 0.85, basedOn: "Tasks context" },
        { text: "Create a new task", confidence: 0.8, basedOn: "Tasks context" },
      ],
    };

    const contextual = moduleSuggestions[currentModule || "dashboard"] || moduleSuggestions.dashboard;
    suggestions.push(...contextual);

    // Frequency-based suggestions
    const topWords = Object.entries(this.queryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    if (topWords.length > 0) {
      suggestions.push({
        text: `Show ${topWords[0]} details`,
        confidence: 0.5,
        basedOn: "Frequently searched",
      });
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  // ── Contextual Memory ─────────────────────────────────────────

  getConversationSummary(): string {
    if (this.conversationHistory.length === 0) return "No conversation history yet.";

    const userTurns = this.conversationHistory.filter((t) => t.role === "user");
    const intents = userTurns
      .filter((t) => t.nlpResult)
      .map((t) => t.nlpResult!.intent);

    const intentCounts: Record<string, number> = {};
    for (const intent of intents) {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    }

    const topIntent = Object.entries(intentCounts).sort(([, a], [, b]) => b - a)[0];

    return `${userTurns.length} queries processed. Most common intent: ${topIntent?.[0] || "unknown"} (${topIntent?.[1] || 0}x).`;
  }

  getHistory(): ConversationTurn[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.queryFrequency = {};
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createNLPCompanion(): NLPCompanion {
  return new NLPCompanion();
}
