// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Constitution Compiler
// Converts natural-language user boundaries into executable
// policy modules, advisor constraints, UI friction rules,
// notification rules, approval thresholds, and memory sharing
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./event-bus";
import { ReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export type ConstitutionRuleCategory =
  | "notification"      // when/how to notify
  | "approval"          // who must approve what
  | "spending"          // monetary limits
  | "privacy"           // data sharing boundaries
  | "schedule"          // time-based constraints
  | "behavior"          // advisor behavior modifiers
  | "delegation"        // who can act on behalf
  | "risk"              // risk tolerance
  | "family"            // household-specific rules
  | "ui-friction"       // interface complexity controls
  | "memory"            // what to remember/forget
  | "escalation";       // when to escalate

export type EnforcementMode = "strict" | "advisory" | "learning";

export interface ConstitutionRule {
  id: string;
  // Source
  naturalLanguage: string;          // the original human statement
  category: ConstitutionRuleCategory;
  // Compiled output
  compiledPolicy: CompiledPolicy;
  compiledConstraints: AdvisorConstraint[];
  compiledFriction: UIFrictionRule | null;
  compiledNotification: NotificationRule | null;
  compiledApproval: ApprovalRule | null;
  compiledMemory: MemorySharingRule | null;
  // Metadata
  priority: number;                 // 1-100, higher = stronger
  enforcementMode: EnforcementMode;
  createdAt: number;
  updatedAt: number;
  active: boolean;
  entityId: string;
  createdBy: string;
  // Audit
  compilationConfidence: number;    // 0-1, how confident the compiler is
  lastTriggered?: number;
  triggerCount: number;
}

export interface CompiledPolicy {
  condition: PolicyCondition;
  effect: "allow" | "deny" | "require-approval" | "require-simulation" | "friction" | "throttle";
  parameters: Record<string, unknown>;
}

export interface PolicyCondition {
  type: "time" | "amount" | "domain" | "entity" | "advisor" | "risk" | "composite" | "context" | "frequency";
  operator: "equals" | "gt" | "lt" | "gte" | "lte" | "contains" | "not" | "between" | "in" | "and" | "or";
  value: unknown;
  children?: PolicyCondition[];     // for composite conditions
}

export interface AdvisorConstraint {
  advisorId: string | "*";         // which advisor this applies to
  constraint: "suppress" | "reduce-options" | "require-gentle" | "no-negotiate" | "limit-frequency" | "mute" | "boost";
  scope: string;                   // domain or "*" for all
  parameters: Record<string, unknown>;
}

export interface UIFrictionRule {
  trigger: PolicyCondition;
  frictionType: "confirmation-dialog" | "cool-down-timer" | "reduce-options" | "show-consequences" | "require-reason" | "simplify-ui";
  durationMs?: number;             // for cool-down
  message?: string;                // displayed to user
}

export interface NotificationRule {
  trigger: PolicyCondition;
  effect: "suppress" | "delay" | "batch" | "escalate" | "redirect";
  channels: ("in-app" | "push" | "email" | "sms")[];
  parameters: Record<string, unknown>;
}

export interface ApprovalRule {
  trigger: PolicyCondition;
  requiredApprovers: ApproverSpec[];
  escalationTimeMs: number;
  autoRejectAfterMs?: number;
}

export interface ApproverSpec {
  type: "user" | "role" | "entity-member" | "advisor";
  id: string;
  required: boolean;
}

export interface MemorySharingRule {
  trigger: PolicyCondition;
  effect: "share" | "restrict" | "forget" | "anonymize";
  scope: string[];                 // entity IDs or "*"
  dataCategories: string[];        // what types of data
}

// ── Pattern Library (NLP → Policy compilation) ──────────────────

interface CompilationPattern {
  patterns: RegExp[];
  category: ConstitutionRuleCategory;
  compile: (match: RegExpMatchArray, original: string) => Partial<ConstitutionRule>;
}

const COMPILATION_PATTERNS: CompilationPattern[] = [
  // Schedule: "Never bother me after/before X"
  {
    patterns: [
      /never\s+(?:bother|notify|alert|contact|disturb)\s+(?:me\s+)?(?:after|past)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
      /do\s+not\s+(?:bother|notify|alert|contact|disturb)\s+(?:me\s+)?(?:after|past)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    ],
    category: "schedule",
    compile: (match, original) => {
      let hour = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3]?.toLowerCase();
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;

      return {
        compiledPolicy: {
          condition: { type: "time", operator: "gte", value: { hour, minutes } },
          effect: "deny",
          parameters: { suppressNotifications: true, scope: "all" },
        },
        compiledNotification: {
          trigger: { type: "time", operator: "gte", value: { hour, minutes } },
          effect: "suppress",
          channels: ["in-app", "push"],
          parameters: { resumeAt: { hour: 8, minutes: 0 } },
        },
        compiledConstraints: [{
          advisorId: "*",
          constraint: "mute",
          scope: "*",
          parameters: { afterHour: hour, afterMinutes: minutes },
        }],
        compilationConfidence: 0.95,
      };
    },
  },
  // Approval: "My spouse/partner must approve X above Y"
  {
    patterns: [
      /my\s+(spouse|partner|wife|husband)\s+must\s+approve\s+(.+?)\s+above\s+\$?(\d[\d,.]*)/i,
      /require\s+(spouse|partner)\s+approval\s+(?:for\s+)?(.+?)\s+(?:above|over|exceeding)\s+\$?(\d[\d,.]*)/i,
    ],
    category: "approval",
    compile: (match, original) => {
      const role = match[1].toLowerCase();
      const action = match[2].trim();
      const amount = parseFloat(match[3].replace(/,/g, ""));

      return {
        compiledPolicy: {
          condition: {
            type: "composite",
            operator: "and",
            value: null,
            children: [
              { type: "domain", operator: "contains", value: action },
              { type: "amount", operator: "gt", value: amount },
            ],
          },
          effect: "require-approval",
          parameters: { approverRole: role, threshold: amount },
        },
        compiledApproval: {
          trigger: { type: "amount", operator: "gt", value: amount },
          requiredApprovers: [
            { type: "role", id: `household_${role}`, required: true },
          ],
          escalationTimeMs: 24 * 60 * 60 * 1000,
          autoRejectAfterMs: 48 * 60 * 60 * 1000,
        },
        compiledConstraints: [],
        compilationConfidence: 0.9,
      };
    },
  },
  // Behavior: "When I'm overwhelmed/stressed, reduce/simplify"
  {
    patterns: [
      /when\s+(?:i(?:'m|\s+am)\s+)?(overwhelmed|stressed|anxious|tired|busy)\s*,?\s*(reduce|simplify|minimize|limit)\s*(.+)?/i,
    ],
    category: "ui-friction",
    compile: (match, original) => {
      const mood = match[1].toLowerCase();
      const action = match[2].toLowerCase();

      return {
        compiledPolicy: {
          condition: { type: "context", operator: "equals", value: { userState: mood } },
          effect: "friction",
          parameters: { frictionType: "simplify-ui", reduceFactor: 0.5 },
        },
        compiledFriction: {
          trigger: { type: "context", operator: "equals", value: { userState: mood } },
          frictionType: "reduce-options",
          message: `Simplified view active — you indicated feeling ${mood}`,
        },
        compiledConstraints: [{
          advisorId: "*",
          constraint: "reduce-options",
          scope: "*",
          parameters: { maxOptions: 3, prioritizeEssential: true, mood },
        }],
        compilationConfidence: 0.85,
      };
    },
  },
  // Behavior: "Do not negotiate aggressively with X"
  {
    patterns: [
      /do\s+not\s+negotiate\s+aggressively\s+with\s+(.+)/i,
      /never\s+(?:be\s+)?aggressive\s+(?:when\s+)?negotiat(?:ing|e)\s+with\s+(.+)/i,
    ],
    category: "behavior",
    compile: (match, original) => {
      const target = match[1].trim().replace(/\.$/, "");

      return {
        compiledPolicy: {
          condition: { type: "entity", operator: "contains", value: target },
          effect: "allow",
          parameters: { negotiationStyle: "gentle", target },
        },
        compiledConstraints: [{
          advisorId: "money-advisor",
          constraint: "require-gentle",
          scope: "negotiation",
          parameters: { target, maxPressure: "low", tone: "collaborative" },
        }, {
          advisorId: "business-advisor",
          constraint: "require-gentle",
          scope: "negotiation",
          parameters: { target, maxPressure: "low", tone: "collaborative" },
        }],
        compilationConfidence: 0.88,
      };
    },
  },
  // Spending: "Limit spending to $X per day/week/month"
  {
    patterns: [
      /limit\s+(?:my\s+)?spending\s+to\s+\$?(\d[\d,.]*)\s+per\s+(day|week|month|year)/i,
      /(?:max|maximum)\s+(?:daily|weekly|monthly)\s+(?:spend|spending|budget)\s+(?:of\s+)?\$?(\d[\d,.]*)/i,
    ],
    category: "spending",
    compile: (match, original) => {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      const period = match[2]?.toLowerCase() ?? "month";

      return {
        compiledPolicy: {
          condition: { type: "amount", operator: "gt", value: amount },
          effect: "deny",
          parameters: { period, cap: amount, action: "spending" },
        },
        compiledConstraints: [{
          advisorId: "money-advisor",
          constraint: "limit-frequency",
          scope: "spending",
          parameters: { cap: amount, period },
        }],
        compilationConfidence: 0.92,
      };
    },
  },
  // Privacy: "Never share X with Y"
  {
    patterns: [
      /never\s+share\s+(?:my\s+)?(.+?)\s+with\s+(.+)/i,
      /do\s+not\s+share\s+(?:my\s+)?(.+?)\s+with\s+(.+)/i,
    ],
    category: "privacy",
    compile: (match, original) => {
      const dataType = match[1].trim();
      const target = match[2].trim().replace(/\.$/, "");

      return {
        compiledPolicy: {
          condition: {
            type: "composite",
            operator: "and",
            value: null,
            children: [
              { type: "domain", operator: "contains", value: dataType },
              { type: "entity", operator: "contains", value: target },
            ],
          },
          effect: "deny",
          parameters: { dataType, target, scope: "memory-sharing" },
        },
        compiledMemory: {
          trigger: { type: "entity", operator: "contains", value: target },
          effect: "restrict",
          scope: [target],
          dataCategories: [dataType],
        },
        compiledConstraints: [{
          advisorId: "*",
          constraint: "suppress",
          scope: dataType,
          parameters: { target, action: "restrict-sharing" },
        }],
        compilationConfidence: 0.87,
      };
    },
  },
  // Delegation: "Allow X to manage Y"
  {
    patterns: [
      /allow\s+(\w+)\s+to\s+(?:manage|handle|control)\s+(.+)/i,
      /delegate\s+(.+?)\s+(?:management|control)\s+to\s+(\w+)/i,
    ],
    category: "delegation",
    compile: (match, original) => {
      const delegate = match[1].trim();
      const scope = match[2].trim().replace(/\.$/, "");

      return {
        compiledPolicy: {
          condition: { type: "entity", operator: "equals", value: delegate },
          effect: "allow",
          parameters: { delegateTo: delegate, scope, maxAutonomy: "medium" },
        },
        compiledConstraints: [],
        compilationConfidence: 0.82,
      };
    },
  },
];

// ── Constitution Compiler ───────────────────────────────────────

export class ConstitutionCompiler {
  private rules: Map<string, ConstitutionRule> = new Map();
  private eventBus?: EventBus;
  private receipts?: ReceiptService;

  constructor(options?: { eventBus?: EventBus; receipts?: ReceiptService }) {
    this.eventBus = options?.eventBus;
    this.receipts = options?.receipts;
  }

  /** Wire to shared kernel services */
  wire(eventBus: EventBus, receipts: ReceiptService): void {
    this.eventBus = eventBus;
    this.receipts = receipts;
  }

  // ── Compile ───────────────────────────────────────────────────

  async compile(input: {
    naturalLanguage: string;
    entityId: string;
    createdBy: string;
    priority?: number;
    enforcementMode?: EnforcementMode;
  }): Promise<ConstitutionRule> {
    const { naturalLanguage, entityId, createdBy } = input;
    const now = Date.now();

    // Try each pattern
    let compiled: Partial<ConstitutionRule> = {};
    let category: ConstitutionRuleCategory = "behavior";
    let matched = false;

    for (const pattern of COMPILATION_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = naturalLanguage.match(regex);
        if (match) {
          compiled = pattern.compile(match, naturalLanguage);
          category = pattern.category;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    // Fallback: create a best-effort advisory rule
    if (!matched) {
      compiled = {
        compiledPolicy: {
          condition: { type: "context", operator: "contains", value: naturalLanguage.toLowerCase() },
          effect: "friction",
          parameters: { originalRule: naturalLanguage, needsReview: true },
        },
        compiledConstraints: [{
          advisorId: "*",
          constraint: "suppress",
          scope: "*",
          parameters: { rawRule: naturalLanguage },
        }],
        compilationConfidence: 0.4,
      };
      category = this.inferCategory(naturalLanguage);
    }

    const rule: ConstitutionRule = {
      id: crypto.randomUUID(),
      naturalLanguage,
      category,
      compiledPolicy: compiled.compiledPolicy ?? {
        condition: { type: "context", operator: "equals", value: true },
        effect: "allow",
        parameters: {},
      },
      compiledConstraints: compiled.compiledConstraints ?? [],
      compiledFriction: compiled.compiledFriction ?? null,
      compiledNotification: compiled.compiledNotification ?? null,
      compiledApproval: compiled.compiledApproval ?? null,
      compiledMemory: compiled.compiledMemory ?? null,
      priority: input.priority ?? 50,
      enforcementMode: input.enforcementMode ?? "strict",
      createdAt: now,
      updatedAt: now,
      active: true,
      entityId,
      createdBy,
      compilationConfidence: compiled.compilationConfidence ?? 0.5,
      triggerCount: 0,
    };

    this.rules.set(rule.id, rule);

    // Emit event + receipt
    await this.emitEvent("constitution.compiled.v1", {
      ruleId: rule.id,
      category: rule.category,
      confidence: rule.compilationConfidence,
      naturalLanguage: rule.naturalLanguage,
      effect: rule.compiledPolicy.effect,
    });

    await this.createReceipt("constitution.compiled", {
      ruleId: rule.id,
      category,
      naturalLanguage,
      confidence: rule.compilationConfidence,
    });

    return rule;
  }

  // ── Evaluate ──────────────────────────────────────────────────

  /** Evaluate all active rules against a given context and return applicable effects */
  evaluate(context: {
    domain?: string;
    amount?: number;
    entityId?: string;
    advisorId?: string;
    action?: string;
    time?: Date;
    userState?: string;
  }): ConstitutionEvaluation {
    const activeRules = Array.from(this.rules.values())
      .filter(r => r.active)
      .sort((a, b) => b.priority - a.priority);

    const matchedRules: ConstitutionRule[] = [];
    const policies: CompiledPolicy[] = [];
    const constraints: AdvisorConstraint[] = [];
    const frictionRules: UIFrictionRule[] = [];
    const notificationRules: NotificationRule[] = [];
    const approvalRules: ApprovalRule[] = [];
    const memoryRules: MemorySharingRule[] = [];

    for (const rule of activeRules) {
      if (this.matchesCondition(rule.compiledPolicy.condition, context)) {
        matchedRules.push(rule);
        policies.push(rule.compiledPolicy);
        constraints.push(...rule.compiledConstraints);
        if (rule.compiledFriction) frictionRules.push(rule.compiledFriction);
        if (rule.compiledNotification) notificationRules.push(rule.compiledNotification);
        if (rule.compiledApproval) approvalRules.push(rule.compiledApproval);
        if (rule.compiledMemory) memoryRules.push(rule.compiledMemory);

        // Update trigger count
        rule.lastTriggered = Date.now();
        rule.triggerCount++;
      }
    }

    // Determine overall effect (most restrictive wins)
    const effects = policies.map(p => p.effect);
    let overallEffect: CompiledPolicy["effect"] = "allow";
    if (effects.includes("deny")) overallEffect = "deny";
    else if (effects.includes("require-approval")) overallEffect = "require-approval";
    else if (effects.includes("require-simulation")) overallEffect = "require-simulation";
    else if (effects.includes("friction")) overallEffect = "friction";
    else if (effects.includes("throttle")) overallEffect = "throttle";

    return {
      matchedRules,
      overallEffect,
      policies,
      constraints,
      frictionRules,
      notificationRules,
      approvalRules,
      memoryRules,
      ruleCount: matchedRules.length,
    };
  }

  // ── Query ─────────────────────────────────────────────────────

  getRule(id: string): ConstitutionRule | null {
    return this.rules.get(id) ?? null;
  }

  getAllRules(): ConstitutionRule[] {
    return Array.from(this.rules.values());
  }

  getActiveRules(): ConstitutionRule[] {
    return Array.from(this.rules.values()).filter(r => r.active);
  }

  getRulesByCategory(category: ConstitutionRuleCategory): ConstitutionRule[] {
    return Array.from(this.rules.values()).filter(r => r.category === category);
  }

  getRulesByEntity(entityId: string): ConstitutionRule[] {
    return Array.from(this.rules.values()).filter(r => r.entityId === entityId);
  }

  toggleRule(id: string, active: boolean): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.active = active;
    rule.updatedAt = Date.now();
    return true;
  }

  deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }

  getStats() {
    const all = Array.from(this.rules.values());
    const byCategory: Record<string, number> = {};
    for (const r of all) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }
    return {
      total: all.length,
      active: all.filter(r => r.active).length,
      avgConfidence: all.length > 0 ? all.reduce((s, r) => s + r.compilationConfidence, 0) / all.length : 0,
      totalTriggers: all.reduce((s, r) => s + r.triggerCount, 0),
      byCategory,
    };
  }

  // ── Private ───────────────────────────────────────────────────

  private matchesCondition(condition: PolicyCondition, context: Record<string, unknown>): boolean {
    const { type, operator, value, children } = condition;

    switch (type) {
      case "time": {
        const now = (context.time as Date) ?? new Date();
        const hour = now.getHours();
        const timeVal = value as { hour: number; minutes?: number };
        const targetMinutes = timeVal.hour * 60 + (timeVal.minutes ?? 0);
        const currentMinutes = hour * 60 + now.getMinutes();
        if (operator === "gte") return currentMinutes >= targetMinutes;
        if (operator === "lte") return currentMinutes <= targetMinutes;
        if (operator === "between" && Array.isArray(value)) {
          return currentMinutes >= (value as any)[0] && currentMinutes <= (value as any)[1];
        }
        return false;
      }
      case "amount": {
        const amt = (context.amount as number) ?? 0;
        const threshold = value as number;
        if (operator === "gt") return amt > threshold;
        if (operator === "lt") return amt < threshold;
        if (operator === "gte") return amt >= threshold;
        if (operator === "lte") return amt <= threshold;
        if (operator === "equals") return amt === threshold;
        return false;
      }
      case "domain": {
        const domain = (context.domain as string) ?? "";
        if (operator === "equals") return domain === value;
        if (operator === "contains") return domain.includes(value as string);
        return false;
      }
      case "entity": {
        const entity = (context.entityId as string) ?? "";
        if (operator === "equals") return entity === value;
        if (operator === "contains") return entity.includes(value as string);
        return false;
      }
      case "advisor": {
        const advisor = (context.advisorId as string) ?? "";
        if (operator === "equals") return advisor === value;
        return false;
      }
      case "context": {
        if (operator === "equals" && typeof value === "object" && value !== null) {
          const contextVal = value as Record<string, unknown>;
          if (contextVal.userState && context.userState) {
            return context.userState === contextVal.userState;
          }
        }
        if (operator === "contains") {
          return JSON.stringify(context).toLowerCase().includes((value as string).toLowerCase());
        }
        return true; // fallback: match
      }
      case "composite": {
        if (!children || children.length === 0) return true;
        if (operator === "and") return children.every(c => this.matchesCondition(c, context));
        if (operator === "or") return children.some(c => this.matchesCondition(c, context));
        if (operator === "not") return !this.matchesCondition(children[0], context);
        return false;
      }
      default:
        return false;
    }
  }

  private inferCategory(text: string): ConstitutionRuleCategory {
    const lower = text.toLowerCase();
    if (/time|hour|morning|evening|night|weekend|schedule/.test(lower)) return "schedule";
    if (/approve|approval|confirm|sign.?off/.test(lower)) return "approval";
    if (/spend|budget|money|cost|pay|limit/.test(lower)) return "spending";
    if (/share|privacy|secret|confidential/.test(lower)) return "privacy";
    if (/notify|alert|bother|disturb|message/.test(lower)) return "notification";
    if (/family|spouse|partner|child|parent|household/.test(lower)) return "family";
    if (/risk|danger|safe|careful/.test(lower)) return "risk";
    if (/delegate|allow|permit|authorize/.test(lower)) return "delegation";
    if (/simple|reduce|overwhelm|stress|calm/.test(lower)) return "ui-friction";
    if (/remember|forget|memory|store/.test(lower)) return "memory";
    return "behavior";
  }

  private async emitEvent(topic: string, payload: Record<string, unknown>): Promise<void> {
    if (this.eventBus) {
      await this.eventBus.publish(topic, payload, { source: "constitution-compiler" });
    }
  }

  private async createReceipt(action: string, data: Record<string, unknown>): Promise<void> {
    if (this.receipts) {
      await this.receipts.createReceipt(crypto.randomUUID(), "execution-summary", { action, ...data });
    }
  }
}

// ── Evaluation Result ───────────────────────────────────────────

export interface ConstitutionEvaluation {
  matchedRules: ConstitutionRule[];
  overallEffect: CompiledPolicy["effect"];
  policies: CompiledPolicy[];
  constraints: AdvisorConstraint[];
  frictionRules: UIFrictionRule[];
  notificationRules: NotificationRule[];
  approvalRules: ApprovalRule[];
  memoryRules: MemorySharingRule[];
  ruleCount: number;
}

// ── Factory ─────────────────────────────────────────────────────

export function createConstitutionCompiler(options?: { eventBus?: EventBus; receipts?: ReceiptService }): ConstitutionCompiler {
  return new ConstitutionCompiler(options);
}
