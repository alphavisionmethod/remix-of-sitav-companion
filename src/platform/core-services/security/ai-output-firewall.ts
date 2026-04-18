// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Output Firewall
// Scans ALL AI responses before they reach the user
// ═══════════════════════════════════════════════════════════════

const FIREWALL_VERSION = "1.0.0";

// ── Canary Token System ────────────────────────────────────────

let _canaryToken = "";

function generateCanaryToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  _canaryToken = `⟦SITA-CANARY-${Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}⟧`;
  return _canaryToken;
}

function getCanaryToken(): string {
  if (!_canaryToken) generateCanaryToken();
  return _canaryToken;
}

// ── Pattern Detectors ──────────────────────────────────────────

const SYSTEM_PROMPT_INDICATORS = [
  /you are (?:a |an )?(?:helpful|AI|assistant|language model)/i,
  /your (?:role|purpose|instructions?) (?:is|are)/i,
  /system prompt/i,
  /\bdo not (?:reveal|share|disclose|tell)\b.*\b(?:instructions?|prompt|system)\b/i,
  /\bignore (?:previous|above|all) (?:instructions?|prompts?)\b/i,
  /\bas an? AI (?:language )?model\b/i,
  /\bI (?:was|am) (?:programmed|instructed|designed) to\b/i,
];

const PII_PATTERNS = [
  { name: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, mask: "***-**-****" },
  {
    name: "credit_card",
    pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    mask: "****-****-****-****",
  },
  {
    name: "phone_us",
    pattern: /\b(?:\+1[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    mask: "(***) ***-****",
  },
];

const ARCHITECTURE_LEAK_PATTERNS = [
  /supabase\/functions\/[a-z-]+/i,
  /\bedge[-_]?function[s]?\b.*\b(?:index\.ts|handler)\b/i,
  /\bsupabase_service_role_key\b/i,
  /\bSUPABASE_(?:URL|ANON_KEY|SERVICE_ROLE_KEY)\b/,
  /fctupowhcljejygjfpty/i, // project ref
  /\bsrc\/lib\/(?:core-services|services)\//i,
  /\b(?:sk_live_|sk_test_|pk_live_|pk_test_)\w{10,}/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
];

// ── Core Scan Functions ────────────────────────────────────────

export interface FirewallScanResult {
  passed: boolean;
  sanitizedOutput: string;
  violations: FirewallViolation[];
  score: number; // 0-100, 100 = perfectly safe
}

export interface FirewallViolation {
  type:
    | "system_prompt_leak"
    | "pii_detected"
    | "architecture_leak"
    | "canary_detected"
    | "prompt_echo"
    | "suspicious_content";
  detail: string;
  severity: "critical" | "high" | "medium" | "low";
  redacted: boolean;
}

function detectSystemPromptLeak(output: string): FirewallViolation[] {
  const violations: FirewallViolation[] = [];
  for (const pattern of SYSTEM_PROMPT_INDICATORS) {
    if (pattern.test(output)) {
      violations.push({
        type: "system_prompt_leak",
        detail: `Pattern matched: ${pattern.source.substring(0, 50)}`,
        severity: "critical",
        redacted: false,
      });
    }
  }
  return violations;
}

function detectAndRedactPII(
  output: string
): { text: string; violations: FirewallViolation[] } {
  let sanitized = output;
  const violations: FirewallViolation[] = [];

  for (const { name, pattern, mask } of PII_PATTERNS) {
    const matches = sanitized.match(pattern);
    if (matches) {
      for (const match of matches) {
        violations.push({
          type: "pii_detected",
          detail: `${name}: ${match.substring(0, 4)}...`,
          severity: "high",
          redacted: true,
        });
      }
      sanitized = sanitized.replace(pattern, mask);
    }
  }

  return { text: sanitized, violations };
}

function detectArchitectureLeak(output: string): FirewallViolation[] {
  const violations: FirewallViolation[] = [];
  for (const pattern of ARCHITECTURE_LEAK_PATTERNS) {
    if (pattern.test(output)) {
      violations.push({
        type: "architecture_leak",
        detail: `Internal architecture reference detected`,
        severity: "critical",
        redacted: false,
      });
    }
  }
  return violations;
}

function detectCanaryToken(output: string): FirewallViolation[] {
  if (!_canaryToken) return [];
  if (output.includes(_canaryToken)) {
    // Regenerate canary — it's been compromised
    generateCanaryToken();
    return [
      {
        type: "canary_detected",
        detail: "Canary token found in output — prompt injection detected",
        severity: "critical",
        redacted: false,
      },
    ];
  }
  return [];
}

function detectPromptEcho(
  output: string,
  systemPrompt?: string
): FirewallViolation[] {
  if (!systemPrompt || systemPrompt.length < 50) return [];

  // Check n-gram overlap
  const promptWords = systemPrompt.toLowerCase().split(/\s+/);
  const outputWords = output.toLowerCase().split(/\s+/);

  if (promptWords.length < 10) return [];

  // Sliding window of 5 words
  const windowSize = 5;
  let matchCount = 0;
  const promptNgrams = new Set<string>();

  for (let i = 0; i <= promptWords.length - windowSize; i++) {
    promptNgrams.add(promptWords.slice(i, i + windowSize).join(" "));
  }

  for (let i = 0; i <= outputWords.length - windowSize; i++) {
    const ngram = outputWords.slice(i, i + windowSize).join(" ");
    if (promptNgrams.has(ngram)) matchCount++;
  }

  const totalOutputNgrams = Math.max(1, outputWords.length - windowSize + 1);
  const overlapRatio = matchCount / totalOutputNgrams;

  if (overlapRatio > 0.4) {
    return [
      {
        type: "prompt_echo",
        detail: `${(overlapRatio * 100).toFixed(0)}% overlap with system prompt`,
        severity: "critical",
        redacted: false,
      },
    ];
  }

  return [];
}

// ── Main Scan Entry Point ──────────────────────────────────────

export function scanAIOutput(
  output: string,
  options: {
    systemPrompt?: string;
    allowPII?: boolean;
    context?: string;
  } = {}
): FirewallScanResult {
  const violations: FirewallViolation[] = [];
  let sanitized = output;
  let score = 100;

  // 1. Canary token detection
  const canaryViolations = detectCanaryToken(output);
  violations.push(...canaryViolations);
  if (canaryViolations.length > 0) score -= 50;

  // 2. System prompt leak detection
  const promptLeaks = detectSystemPromptLeak(output);
  violations.push(...promptLeaks);
  score -= promptLeaks.length * 15;

  // 3. Architecture leak detection
  const archLeaks = detectArchitectureLeak(output);
  violations.push(...archLeaks);
  score -= archLeaks.length * 20;

  // 4. PII detection & redaction
  if (!options.allowPII) {
    const piiResult = detectAndRedactPII(sanitized);
    sanitized = piiResult.text;
    violations.push(...piiResult.violations);
    score -= piiResult.violations.length * 10;
  }

  // 5. Prompt echo detection
  const echoViolations = detectPromptEcho(output, options.systemPrompt);
  violations.push(...echoViolations);
  if (echoViolations.length > 0) score -= 40;

  score = Math.max(0, score);

  const hasCritical = violations.some((v) => v.severity === "critical");

  return {
    passed: !hasCritical && score >= 40,
    sanitizedOutput: sanitized,
    violations,
    score,
  };
}

// ── Firewall Metadata ──────────────────────────────────────────

export function getFirewallStatus() {
  return {
    version: FIREWALL_VERSION,
    canaryActive: !!_canaryToken,
    patternsLoaded: {
      systemPrompt: SYSTEM_PROMPT_INDICATORS.length,
      pii: PII_PATTERNS.length,
      architecture: ARCHITECTURE_LEAK_PATTERNS.length,
    },
  };
}

export { generateCanaryToken, getCanaryToken };
