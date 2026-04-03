// ============================================================
// SITA OS — Grounding Engine
// Provenance builder, citation tracker, ambiguity detector
// ============================================================

import type { GroundingReport, GroundingSource, RequiredSourceType } from "./types";

interface GroundingInput {
  fieldName: string;
  value: unknown;
  sourceId?: string;
  sourceName?: string;
  sourceDomain?: string;
  sourceType?: RequiredSourceType;
  lastUpdated?: string;
  isVerbatim: boolean; // true = directly from source, false = derived/computed
}

export function buildGroundingReport(inputs: GroundingInput[]): GroundingReport {
  const sourceMap = new Map<string, GroundingSource>();
  const derivedFields: string[] = [];
  const verbatimFields: string[] = [];
  const ambiguities: string[] = [];
  const ungroundedClaims: string[] = [];

  for (const input of inputs) {
    if (!input.sourceId || !input.sourceName) {
      ungroundedClaims.push(input.fieldName);
      continue;
    }

    // Track source
    const existing = sourceMap.get(input.sourceId);
    if (existing) {
      if (!existing.fieldsCited.includes(input.fieldName)) {
        existing.fieldsCited.push(input.fieldName);
      }
    } else {
      sourceMap.set(input.sourceId, {
        id: input.sourceId,
        name: input.sourceName,
        domain: input.sourceDomain || "unknown",
        type: input.sourceType || "canonical-record",
        lastUpdated: input.lastUpdated || new Date().toISOString(),
        fieldsCited: [input.fieldName],
      });
    }

    // Classify field
    if (input.isVerbatim) {
      verbatimFields.push(input.fieldName);
    } else {
      derivedFields.push(input.fieldName);
    }

    // Detect ambiguity: value is null/undefined/empty
    if (input.value === null || input.value === undefined || input.value === "") {
      ambiguities.push(`${input.fieldName}: value missing or empty from ${input.sourceName}`);
    }
  }

  return {
    sources: Array.from(sourceMap.values()),
    derivedFields,
    verbatimFields,
    ambiguities,
    ungroundedClaims,
  };
}

export function createEmptyGroundingReport(): GroundingReport {
  return { sources: [], derivedFields: [], verbatimFields: [], ambiguities: [], ungroundedClaims: [] };
}

export function mergeGroundingReports(...reports: GroundingReport[]): GroundingReport {
  const merged: GroundingReport = { sources: [], derivedFields: [], verbatimFields: [], ambiguities: [], ungroundedClaims: [] };
  const sourceMap = new Map<string, GroundingSource>();

  for (const report of reports) {
    for (const source of report.sources) {
      const existing = sourceMap.get(source.id);
      if (existing) {
        for (const f of source.fieldsCited) {
          if (!existing.fieldsCited.includes(f)) existing.fieldsCited.push(f);
        }
      } else {
        sourceMap.set(source.id, { ...source, fieldsCited: [...source.fieldsCited] });
      }
    }
    merged.derivedFields.push(...report.derivedFields);
    merged.verbatimFields.push(...report.verbatimFields);
    merged.ambiguities.push(...report.ambiguities);
    merged.ungroundedClaims.push(...report.ungroundedClaims);
  }

  merged.sources = Array.from(sourceMap.values());
  return merged;
}
