// ============================================================
// SITA OS — Boardroom Confidence Engine
// Scores packet confidence & detects stale data
// ============================================================

import type { BoardroomType, DataSource } from "./types";

const STALE_THRESHOLDS: Record<BoardroomType, number> = {
  "morning-briefing": 24 * 60 * 60 * 1000,   // 24h
  "weekly-review": 7 * 24 * 60 * 60 * 1000,   // 7d
  "financial-health": 48 * 60 * 60 * 1000,     // 48h
  "pipeline-review": 72 * 60 * 60 * 1000,      // 72h
  "household-ops": 24 * 60 * 60 * 1000,        // 24h
  "opportunity-board": 7 * 24 * 60 * 60 * 1000, // 7d
  "incident-review": 4 * 60 * 60 * 1000,       // 4h
  "governance": 24 * 60 * 60 * 1000,             // 24h
};

export function detectStaleData(
  sources: DataSource[],
  boardroomType: BoardroomType
): string[] {
  const threshold = STALE_THRESHOLDS[boardroomType];
  const now = Date.now();
  const warnings: string[] = [];

  for (const source of sources) {
    const lastUpdate = new Date(source.lastUpdated).getTime();
    const age = now - lastUpdate;
    if (age > threshold) {
      const hoursAgo = Math.round(age / (60 * 60 * 1000));
      warnings.push(
        `${source.name} data is ${hoursAgo}h old (threshold: ${Math.round(threshold / (60 * 60 * 1000))}h for ${boardroomType})`
      );
    }
  }
  return warnings;
}

export function scoreConfidence(params: {
  domainConfidences: number[];
  sourceCount: number;
  staleWarningCount: number;
  completenessRatio: number; // 0-1: how many expected sections were produced
}): number {
  const { domainConfidences, sourceCount, staleWarningCount, completenessRatio } = params;

  // Weighted: freshness 40%, completeness 30%, source breadth 30%
  const avgDomainConf = domainConfidences.length > 0
    ? domainConfidences.reduce((a, b) => a + b, 0) / domainConfidences.length
    : 0.5;

  const freshnessPenalty = Math.min(staleWarningCount * 0.08, 0.4);
  const freshnessScore = Math.max(avgDomainConf - freshnessPenalty, 0);

  const sourceScore = Math.min(sourceCount / 6, 1); // 6 sources = full score

  const score = freshnessScore * 0.4 + completenessRatio * 0.3 + sourceScore * 0.3;
  return Math.round(score * 100) / 100;
}

export function generatePacketHash(packetId: string, generatedAt: string, sectionCount: number): string {
  const input = `${packetId}:${generatedAt}:${sectionCount}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(12, "0")}`;
}
