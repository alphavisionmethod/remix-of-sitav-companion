// ═══════════════════════════════════════════════════════════════
// SITA OS — Diagnostic Bundle System
// Privacy-safe export-quality diagnostic bundles
// ═══════════════════════════════════════════════════════════════

import { healthGraph } from './health-graph';
import { crashd } from './crashd';
import { settingsd } from './settingsd';

export interface DiagnosticSection {
  name: string;
  data: Record<string, unknown>;
  redacted: boolean;
  collectedAt: number;
}

export interface DiagnosticBundle {
  id: string;
  version: string;
  generatedAt: number;
  sections: DiagnosticSection[];
  privacyLevel: 'full' | 'redacted' | 'minimal';
  sizeEstimateBytes: number;
  exportFormat: 'json' | 'archive';
}

const REDACT_PATTERNS = [
  /password/i, /secret/i, /token/i, /key/i, /credential/i,
  /ssn/i, /credit.?card/i, /api.?key/i, /auth/i,
];

function redactValue(key: string, value: unknown): unknown {
  if (typeof value === 'string' && REDACT_PATTERNS.some(p => p.test(key))) {
    return '[REDACTED]';
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = redactValue(k, v);
    }
    return result;
  }
  return value;
}

let _bid = 0;

class DiagnosticBundleGenerator {
  /** Generate a full diagnostic bundle */
  generate(privacyLevel: 'full' | 'redacted' | 'minimal' = 'redacted'): DiagnosticBundle {
    const sections: DiagnosticSection[] = [];
    const now = Date.now();

    // System info
    sections.push({
      name: 'system_info', collectedAt: now, redacted: false,
      data: {
        platform: 'SITA OS', version: '2026.04.1-stable',
        buildDate: '2026-04-15', arch: 'x86_64',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        devicePixelRatio: typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1,
        memory: typeof navigator !== 'undefined' ? (navigator as any).deviceMemory ?? 'unknown' : 'unknown',
      },
    });

    // Service health
    sections.push({
      name: 'service_health', collectedAt: now, redacted: false,
      data: {
        systemHealth: healthGraph.systemHealth(),
        services: healthGraph.allNodes().map(n => ({
          id: n.serviceId, state: n.state, restartCount: n.restartCount,
          lastHeartbeat: n.lastHeartbeat, degradedReason: n.degradedReason,
        })),
        bootOrder: healthGraph.bootOrder(),
      },
    });

    // Crash history
    const crashes = crashd.getCrashes(20);
    sections.push({
      name: 'crash_history', collectedAt: now, redacted: privacyLevel !== 'full',
      data: {
        recentCrashes: crashes.map(c => ({
          id: c.id, service: c.processName, reason: c.signal,
          timestamp: c.timestamp, severity: c.severity,
          stackTrace: privacyLevel === 'full' ? c.stackTrace : '[REDACTED]',
        })),
        totalCrashes: crashes.length,
      },
    });

    // Settings snapshot
    if (privacyLevel !== 'minimal') {
      const allSettings = settingsd.getAllEntries();
      sections.push({
        name: 'settings_snapshot', collectedAt: now, redacted: privacyLevel === 'redacted',
        data: {
          entries: allSettings.map(s => ({
            key: s.key, namespace: s.namespace,
            value: privacyLevel === 'redacted' ? redactValue(s.key, s.value) : s.value,
            source: s.source,
          })),
        },
      });
    }

    // Network diagnostics
    sections.push({
      name: 'network_diagnostics', collectedAt: now, redacted: false,
      data: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        connectionType: (navigator as any)?.connection?.effectiveType ?? 'unknown',
        downlink: (navigator as any)?.connection?.downlink ?? 'unknown',
      },
    });

    // Performance metrics
    if (typeof performance !== 'undefined') {
      sections.push({
        name: 'performance_metrics', collectedAt: now, redacted: false,
        data: {
          uptimeMs: performance.now(),
          memoryUsage: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          } : 'unavailable',
        },
      });
    }

    const bundle: DiagnosticBundle = {
      id: `diag_${++_bid}_${now}`, version: '1.0.0', generatedAt: now,
      sections, privacyLevel,
      sizeEstimateBytes: JSON.stringify(sections).length,
      exportFormat: 'json',
    };

    return bundle;
  }

  /** Export bundle as downloadable JSON string */
  exportJSON(bundle: DiagnosticBundle): string {
    return JSON.stringify(bundle, null, 2);
  }
}

export const diagnosticBundleGenerator = new DiagnosticBundleGenerator();
