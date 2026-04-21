// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema-Driven Test Fixture Generator
// Automatically generates valid and invalid payloads from any
// Zod schema for exhaustive contract edge-case coverage.
// ═══════════════════════════════════════════════════════════════

import { z, type ZodTypeAny, type ZodObject, type ZodRawShape } from "zod";

export interface Fixture<T = unknown> {
  label: string;
  payload: T;
  expectValid: boolean;
}

// ── Helpers ──────────────────────────────────────────────────

const SAMPLE_UUID = "550e8400-e29b-41d4-a716-446655440000";
const SAMPLE_URL = "https://example.com/test";

function generateValidValue(schema: ZodTypeAny): unknown {
  const def = schema._def;
  const typeName = def.typeName as string;

  if (typeName === "ZodString") {
    const checks: Array<{ kind: string; value?: unknown; regex?: RegExp }> = def.checks ?? [];
    const isUuid = checks.some((c) => c.kind === "uuid");
    const isUrl = checks.some((c) => c.kind === "url");
    const isEmail = checks.some((c) => c.kind === "email");
    const minLen = checks.find((c) => c.kind === "min")?.value as number | undefined;
    if (isUuid) return SAMPLE_UUID;
    if (isUrl) return SAMPLE_URL;
    if (isEmail) return "test@example.com";
    if (minLen && minLen > 0) return "a".repeat(minLen);
    return "test-string";
  }
  if (typeName === "ZodNumber") return 42;
  if (typeName === "ZodBoolean") return true;
  if (typeName === "ZodEnum") return def.values[0];
  if (typeName === "ZodLiteral") return def.value;
  if (typeName === "ZodArray") {
    const minLen = def.minLength?.value ?? 0;
    const count = Math.max(minLen, 1);
    return Array.from({ length: count }, () => generateValidValue(def.type));
  }
  if (typeName === "ZodObject") {
    const shape = (schema as ZodObject<ZodRawShape>).shape;
    const obj: Record<string, unknown> = {};
    for (const [key, fieldSchema] of Object.entries(shape)) {
      obj[key] = generateValidValue(fieldSchema as ZodTypeAny);
    }
    return obj;
  }
  if (typeName === "ZodRecord") return { key1: "value1" };
  if (typeName === "ZodOptional" || typeName === "ZodDefault") return generateValidValue(def.innerType);
  if (typeName === "ZodNullable") return generateValidValue(def.innerType);
  if (typeName === "ZodUnion") return generateValidValue(def.options[0]);
  if (typeName === "ZodUnknown" || typeName === "ZodAny") return "any-value";
  if (typeName === "ZodNull") return null;
  if (typeName === "ZodUndefined") return undefined;
  return "fallback";
}

function generateInvalidValue(schema: ZodTypeAny): unknown {
  const def = schema._def;
  const typeName = def.typeName as string;

  if (typeName === "ZodString") {
    const checks: Array<{ kind: string }> = def.checks ?? [];
    if (checks.some((c) => c.kind === "uuid")) return "not-a-uuid";
    if (checks.some((c) => c.kind === "url")) return "not-a-url";
    if (checks.some((c) => c.kind === "email")) return "not-email";
    if (checks.some((c) => c.kind === "min")) return "";
    return 12345; // wrong type
  }
  if (typeName === "ZodNumber") return "not-a-number";
  if (typeName === "ZodBoolean") return "not-bool";
  if (typeName === "ZodEnum") return "INVALID_ENUM_VALUE_XYZ";
  if (typeName === "ZodLiteral") return "WRONG_LITERAL";
  if (typeName === "ZodArray") return "not-an-array";
  if (typeName === "ZodObject") return "not-an-object";
  return Symbol("invalid");
}

// ── Main generators ──────────────────────────────────────────

export function generateValidFixture<T extends ZodRawShape>(
  schema: ZodObject<T>,
  label: string
): Fixture {
  return {
    label: `${label}: auto-generated valid payload`,
    payload: generateValidValue(schema),
    expectValid: true,
  };
}

export function generateFieldMutationFixtures<T extends ZodRawShape>(
  schema: ZodObject<T>,
  label: string
): Fixture[] {
  const fixtures: Fixture[] = [];
  const shape = schema.shape;
  const basePayload = generateValidValue(schema) as Record<string, unknown>;

  // 1. Valid baseline
  fixtures.push({
    label: `${label}: valid baseline`,
    payload: { ...basePayload },
    expectValid: true,
  });

  // 2. Empty object
  fixtures.push({
    label: `${label}: empty object`,
    payload: {},
    expectValid: false,
  });

  // 3. Per-field mutations
  for (const [key, fieldSchema] of Object.entries(shape)) {
    const field = fieldSchema as ZodTypeAny;
    const fieldDef = field._def;
    const isOptional = fieldDef.typeName === "ZodOptional" || fieldDef.typeName === "ZodDefault";

    // Missing required field
    if (!isOptional) {
      const withoutField = { ...basePayload };
      delete withoutField[key];
      fixtures.push({
        label: `${label}: missing required '${key}'`,
        payload: withoutField,
        expectValid: false,
      });
    }

    // Wrong type for field
    fixtures.push({
      label: `${label}: invalid type for '${key}'`,
      payload: { ...basePayload, [key]: generateInvalidValue(isOptional ? fieldDef.innerType : field) },
      expectValid: false,
    });

    // Null for non-nullable field
    const innerType = isOptional ? fieldDef.innerType : field;
    if (innerType?._def?.typeName !== "ZodNullable" && innerType?._def?.typeName !== "ZodNull") {
      fixtures.push({
        label: `${label}: null for '${key}'`,
        payload: { ...basePayload, [key]: null },
        expectValid: false, // Zod optional ≠ nullable; null always fails unless ZodNullable
      });
    }
  }

  // 4. Extra unknown fields (should pass with passthrough/strip)
  fixtures.push({
    label: `${label}: extra unknown fields`,
    payload: { ...basePayload, __unknown_field: "surprise" },
    expectValid: true, // Zod strips by default
  });

  // 5. Wrong top-level types
  fixtures.push({ label: `${label}: string instead of object`, payload: "not-an-object", expectValid: false });
  fixtures.push({ label: `${label}: number instead of object`, payload: 42, expectValid: false });
  fixtures.push({ label: `${label}: array instead of object`, payload: [1, 2, 3], expectValid: false });
  fixtures.push({ label: `${label}: null instead of object`, payload: null, expectValid: false });

  return fixtures;
}

// ── Boundary value generators ────────────────────────────────

export function generateBoundaryFixtures<T extends ZodRawShape>(
  schema: ZodObject<T>,
  label: string
): Fixture[] {
  const fixtures: Fixture[] = [];
  const shape = schema.shape;
  const basePayload = generateValidValue(schema) as Record<string, unknown>;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    let field = fieldSchema as ZodTypeAny;
    // Unwrap optional/default
    while (field._def.typeName === "ZodOptional" || field._def.typeName === "ZodDefault") {
      field = field._def.innerType;
    }
    const checks: Array<{ kind: string; value?: number }> = field._def.checks ?? [];

    if (field._def.typeName === "ZodString") {
      const maxCheck = checks.find((c) => c.kind === "max");
      if (maxCheck?.value) {
        // At max length (valid)
        fixtures.push({
          label: `${label}: '${key}' at max length (${maxCheck.value})`,
          payload: { ...basePayload, [key]: "x".repeat(maxCheck.value) },
          expectValid: true,
        });
        // Over max length (invalid)
        fixtures.push({
          label: `${label}: '${key}' over max length (${maxCheck.value + 1})`,
          payload: { ...basePayload, [key]: "x".repeat(maxCheck.value + 1) },
          expectValid: false,
        });
      }

      const minCheck = checks.find((c) => c.kind === "min");
      if (minCheck?.value && minCheck.value > 0) {
        // At min length (valid)
        fixtures.push({
          label: `${label}: '${key}' at min length (${minCheck.value})`,
          payload: { ...basePayload, [key]: "x".repeat(minCheck.value) },
          expectValid: true,
        });
        // Under min length (invalid)
        fixtures.push({
          label: `${label}: '${key}' under min length`,
          payload: { ...basePayload, [key]: "" },
          expectValid: false,
        });
      }
    }

    if (field._def.typeName === "ZodArray") {
      const minLen = field._def.minLength?.value;
      const maxLen = field._def.maxLength?.value;
      if (minLen != null && minLen > 0) {
        fixtures.push({
          label: `${label}: '${key}' empty array (min ${minLen})`,
          payload: { ...basePayload, [key]: [] },
          expectValid: false,
        });
      }
      if (maxLen != null) {
        const overMax = Array.from({ length: maxLen + 1 }, () => generateValidValue(field._def.type));
        fixtures.push({
          label: `${label}: '${key}' over max array length (${maxLen + 1})`,
          payload: { ...basePayload, [key]: overMax },
          expectValid: false,
        });
      }
    }

    if (field._def.typeName === "ZodEnum") {
      // Test each valid enum value
      for (const val of field._def.values as string[]) {
        fixtures.push({
          label: `${label}: '${key}' enum value '${val}'`,
          payload: { ...basePayload, [key]: val },
          expectValid: true,
        });
      }
    }
  }

  return fixtures;
}

// ── Convenience: generate all fixture types at once ──────────

export function generateAllFixtures<T extends ZodRawShape>(
  schema: ZodObject<T>,
  label: string
): Fixture[] {
  return [
    ...generateFieldMutationFixtures(schema, label),
    ...generateBoundaryFixtures(schema, label),
  ];
}