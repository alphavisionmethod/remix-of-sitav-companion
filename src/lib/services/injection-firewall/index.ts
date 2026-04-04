// ═══════════════════════════════════════════════════════════════
// SITA OS — Injection Firewall Service
// Prompt injection and input sanitization guard
// ═══════════════════════════════════════════════════════════════

export type ThreatType = "prompt-injection" | "sql-injection" | "xss" | "path-traversal" | "command-injection" | "data-exfiltration" | "jailbreak";

export type ThreatSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface ScanResult {
  id: string;
  input: string;
  clean: boolean;
  sanitizedInput: string;
  threats: DetectedThreat[];
  scanDuration: number;
  scannedAt: string;
}

export interface DetectedThreat {
  type: ThreatType;
  severity: ThreatSeverity;
  pattern: string;
  matchedText: string;
  position: { start: number; end: number };
  description: string;
}

export interface FirewallStats {
  totalScans: number;
  threatsDetected: number;
  threatsByType: Record<ThreatType, number>;
  blockRate: number;
  avgScanTime: number;
}

const INJECTION_PATTERNS: { type: ThreatType; severity: ThreatSeverity; pattern: RegExp; description: string }[] = [
  { type: "prompt-injection", severity: "critical", pattern: /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i, description: "Prompt override attempt" },
  { type: "prompt-injection", severity: "high", pattern: /you\s+are\s+now\s+/i, description: "Role reassignment attempt" },
  { type: "prompt-injection", severity: "high", pattern: /system\s*:\s*you/i, description: "System prompt injection" },
  { type: "prompt-injection", severity: "high", pattern: /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/i, description: "Chat template injection" },
  { type: "prompt-injection", severity: "medium", pattern: /pretend\s+(you|to\s+be)/i, description: "Persona override attempt" },
  { type: "jailbreak", severity: "critical", pattern: /DAN|do\s+anything\s+now/i, description: "Jailbreak pattern detected" },
  { type: "sql-injection", severity: "critical", pattern: /('\s*(OR|AND)\s+')|(--)|(;\s*DROP\s+TABLE)/i, description: "SQL injection pattern" },
  { type: "xss", severity: "high", pattern: /<script[^>]*>|javascript\s*:|on\w+\s*=/i, description: "XSS payload detected" },
  { type: "path-traversal", severity: "high", pattern: /\.\.\//g, description: "Path traversal attempt" },
  { type: "command-injection", severity: "critical", pattern: /;\s*(rm|cat|curl|wget|bash|sh|eval)\s/i, description: "Command injection attempt" },
  { type: "data-exfiltration", severity: "high", pattern: /(dump|export|extract)\s+(all|every|database|credentials|secrets|passwords)/i, description: "Data exfiltration attempt" },
];

export class InjectionFirewallService {
  private scanHistory: ScanResult[] = [];
  private totalScans = 0;
  private totalThreats = 0;
  private threatCounts: Record<ThreatType, number> = {
    "prompt-injection": 0,
    "sql-injection": 0,
    "xss": 0,
    "path-traversal": 0,
    "command-injection": 0,
    "data-exfiltration": 0,
    "jailbreak": 0,
  };
  private totalScanTime = 0;

  scan(input: string): ScanResult {
    const start = performance.now();
    const threats: DetectedThreat[] = [];

    for (const rule of INJECTION_PATTERNS) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(input)) !== null) {
        threats.push({
          type: rule.type,
          severity: rule.severity,
          pattern: rule.pattern.source,
          matchedText: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          description: rule.description,
        });
        if (!rule.pattern.global) break;
      }
    }

    const sanitizedInput = this.sanitize(input, threats);
    const duration = performance.now() - start;

    this.totalScans++;
    this.totalScanTime += duration;
    threats.forEach(t => {
      this.totalThreats++;
      this.threatCounts[t.type] = (this.threatCounts[t.type] ?? 0) + 1;
    });

    const result: ScanResult = {
      id: crypto.randomUUID(),
      input: input.substring(0, 500),
      clean: threats.length === 0,
      sanitizedInput,
      threats,
      scanDuration: duration,
      scannedAt: new Date().toISOString(),
    };

    this.scanHistory.push(result);
    if (this.scanHistory.length > 2000) this.scanHistory = this.scanHistory.slice(-2000);

    return result;
  }

  scanBatch(inputs: string[]): ScanResult[] {
    return inputs.map(input => this.scan(input));
  }

  isClean(input: string): boolean {
    return this.scan(input).clean;
  }

  getStats(): FirewallStats {
    return {
      totalScans: this.totalScans,
      threatsDetected: this.totalThreats,
      threatsByType: { ...this.threatCounts },
      blockRate: this.totalScans > 0 ? this.totalThreats / this.totalScans : 0,
      avgScanTime: this.totalScans > 0 ? this.totalScanTime / this.totalScans : 0,
    };
  }

  getRecentThreats(limit: number = 50): ScanResult[] {
    return this.scanHistory.filter(r => !r.clean).slice(-limit).reverse();
  }

  private sanitize(input: string, threats: DetectedThreat[]): string {
    if (threats.length === 0) return input;

    let sanitized = input;
    // Remove threat patterns in reverse order to preserve positions
    const sorted = [...threats].sort((a, b) => b.position.start - a.position.start);
    for (const threat of sorted) {
      sanitized = sanitized.substring(0, threat.position.start) + "[FILTERED]" + sanitized.substring(threat.position.end);
    }
    return sanitized;
  }
}

export function createInjectionFirewall(): InjectionFirewallService {
  return new InjectionFirewallService();
}
