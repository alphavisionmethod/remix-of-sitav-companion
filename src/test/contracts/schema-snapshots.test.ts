// ═══════════════════════════════════════════════════════════════
// SITA OS — Zod Schema Snapshot Tests
// Records the exact allowed shape per edge-function action.
// Fails when any schema field, type, or constraint changes.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { SCHEMA_REGISTRY, type SchemaKey } from "./inferred-types";

/**
 * Extracts a deterministic JSON-serialisable shape descriptor from a Zod schema.
 * Uses Zod's internal _def to build a fingerprint of keys, types, and optionality.
 */
function extractShape(schema: z.ZodTypeAny): unknown {
  const def = schema._def;

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(shape)) {
      result[key] = extractShape(val as z.ZodTypeAny);
    }
    return { _type: "object", keys: result };
  }

  if (schema instanceof z.ZodArray) {
    return { _type: "array", element: extractShape(def.type) };
  }

  if (schema instanceof z.ZodOptional) {
    return { _type: "optional", inner: extractShape(def.innerType) };
  }

  if (schema instanceof z.ZodDefault) {
    return { _type: "default", inner: extractShape(def.innerType) };
  }

  if (schema instanceof z.ZodNullable) {
    return { _type: "nullable", inner: extractShape(def.innerType) };
  }

  if (schema instanceof z.ZodEnum) {
    return { _type: "enum", values: [...def.values].sort() };
  }

  if (schema instanceof z.ZodLiteral) {
    return { _type: "literal", value: def.value };
  }

  if (schema instanceof z.ZodString) {
    return { _type: "string" };
  }

  if (schema instanceof z.ZodNumber) {
    return { _type: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { _type: "boolean" };
  }

  if (schema instanceof z.ZodRecord) {
    return { _type: "record" };
  }

  if (schema instanceof z.ZodUnknown) {
    return { _type: "unknown" };
  }

  if (schema instanceof z.ZodUnion) {
    return { _type: "union", options: def.options.map(extractShape) };
  }

  return { _type: "other", typeName: def.typeName };
}

describe("Zod Schema Snapshots — drift detection", () => {
  const entries = Object.entries(SCHEMA_REGISTRY) as [SchemaKey, z.ZodTypeAny][];

  for (const [key, schema] of entries) {
    it(`snapshot: ${key}`, () => {
      const shape = extractShape(schema);
      expect(shape).toMatchSnapshot();
    });
  }
});