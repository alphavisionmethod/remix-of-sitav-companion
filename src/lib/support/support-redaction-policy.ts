// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Redaction Policy
// Deterministic redaction rules for support bundles and exports.
// Single canonical policy; all bundle/export paths must apply.
// ═══════════════════════════════════════════════════════════════

import type { RedactionCategory, RedactionRecord } from "./support-bundle-contract";

interface RedactionRule {
  readonly category: RedactionCategory;
  readonly patterns: readonly RegExp[];
  readonly keyPatterns: readonly RegExp[];
  readonly replacement: string;
}

const REDACTION_RULES: readonly RedactionRule[] = [
  {
    category: "token",
    patterns: [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, /sk_live_[A-Za-z0-9]{10,}/g, /sk_test_[A-Za-z0-9]{10,}/g],
    keyPatterns: [/token/i, /bearer/i, /authorization/i, /api[_-]?key/i],
    replacement: "[REDACTED-TOKEN]",
  },
  {
    category: "secret",
    patterns: [/SITA-[A-Z0-9]{4}-[A-Z0-9]{4}/g],
    keyPatterns: [/secret/i, /password/i, /passphrase/i, /private[_-]?key/i],
    replacement: "[REDACTED-SECRET]",
  },
  {
    category: "email",
    patterns: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g],
    keyPatterns: [/email/i, /e[_-]?mail/i],
    replacement: "[REDACTED-EMAIL]",
  },
  {
    category: "phone",
    patterns: [/\+?[1-9]\d{6,14}/g],
    keyPatterns: [/phone/i, /mobile/i, /sms/i, /tel/i],
    replacement: "[REDACTED-PHONE]",
  },
  {
    category: "payment",
    patterns: [/\b\d{13,19}\b/g, /pm_[A-Za-z0-9]{10,}/g, /pi_[A-Za-z0-9]{10,}/g],
    keyPatterns: [/card/i, /payment/i, /stripe/i, /billing/i, /invoice/i],
    replacement: "[REDACTED-PAYMENT]",
  },
  {
    category: "credential",
    patterns: [],
    keyPatterns: [/credential/i, /client[_-]?secret/i, /refresh[_-]?token/i, /access[_-]?token/i],
    replacement: "[REDACTED-CREDENTIAL]",
  },
  {
    category: "prompt",
    patterns: [],
    keyPatterns: [/system[_-]?prompt/i, /user[_-]?prompt/i, /completion/i],
    replacement: "[REDACTED-PROMPT]",
  },
  {
    category: "memory",
    patterns: [],
    keyPatterns: [/memory[_-]?content/i, /advisor[_-]?memory/i],
    replacement: "[REDACTED-MEMORY]",
  },
  {
    category: "device-id",
    patterns: [],
    keyPatterns: [/device[_-]?id/i, /hardware[_-]?id/i, /machine[_-]?id/i],
    replacement: "[REDACTED-DEVICE-ID]",
  },
  {
    category: "user-content",
    patterns: [],
    keyPatterns: [/user[_-]?content/i, /note[_-]?body/i, /message[_-]?body/i],
    replacement: "[REDACTED-USER-CONTENT]",
  },
];

export interface RedactionResult {
  readonly data: Record<string, unknown>;
  readonly redactions: readonly RedactionRecord[];
}

function matchesKeyPattern(key: string, rule: RedactionRule): boolean {
  return rule.keyPatterns.some((p) => p.test(key));
}

function redactValue(value: string, rule: RedactionRule): { redacted: boolean; result: string } {
  let changed = false;
  let result = value;
  for (const pattern of rule.patterns) {
    const fresh = new RegExp(pattern.source, pattern.flags);
    if (fresh.test(result)) {
      result = result.replace(new RegExp(pattern.source, pattern.flags), rule.replacement);
      changed = true;
    }
  }
  return { redacted: changed, result };
}

/**
 * Apply canonical redaction policy to a flat or nested record.
 * Returns a deep copy with sensitive values replaced and an audit trail.
 */
export function applyRedactionPolicy(
  input: Record<string, unknown>,
  path = "",
): RedactionResult {
  const redactions: RedactionRecord[] = [];
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    const fieldPath = path ? `${path}.${key}` : key;

    // Check key-based redaction first
    let keyRedacted = false;
    for (const rule of REDACTION_RULES) {
      if (matchesKeyPattern(key, rule) && typeof value === "string") {
        data[key] = rule.replacement;
        redactions.push({ fieldPath, category: rule.category, originalLength: value.length });
        keyRedacted = true;
        break;
      }
    }
    if (keyRedacted) continue;

    // Recurse into nested objects
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const nested = applyRedactionPolicy(value as Record<string, unknown>, fieldPath);
      data[key] = nested.data;
      redactions.push(...nested.redactions);
      continue;
    }

    // Apply value-pattern redaction on strings
    if (typeof value === "string") {
      let currentValue = value;
      let wasRedacted = false;
      for (const rule of REDACTION_RULES) {
        const { redacted, result } = redactValue(currentValue, rule);
        if (redacted) {
          currentValue = result;
          wasRedacted = true;
          redactions.push({ fieldPath, category: rule.category, originalLength: value.length });
        }
      }
      data[key] = wasRedacted ? currentValue : value;
    } else {
      data[key] = value;
    }
  }

  return { data, redactions };
}

/** Categories covered by the canonical policy. */
export const COVERED_CATEGORIES: readonly RedactionCategory[] = REDACTION_RULES.map((r) => r.category);

/** Verify a record has been redacted (no sensitive patterns remain). */
export function verifyRedaction(input: Record<string, unknown>): { clean: boolean; violations: string[] } {
  const violations: string[] = [];
  const json = JSON.stringify(input);
  for (const rule of REDACTION_RULES) {
    for (const pattern of rule.patterns) {
      const fresh = new RegExp(pattern.source, pattern.flags);
      if (fresh.test(json)) {
        violations.push(`Unredacted ${rule.category} pattern found`);
      }
    }
  }
  return { clean: violations.length === 0, violations };
}