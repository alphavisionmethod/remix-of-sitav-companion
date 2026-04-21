// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema-Driven Test Fixture Generator
//
// Walks any Zod schema and produces deterministic valid + invalid
// payloads for every field, covering: string, number, boolean,
// bigint, date, enum, uuid, email, url, array, object, optional,
// nullable, literal, union, record, tuple, and more.
// ═══════════════════════════════════════════════════════════════

import { z } from "https://esm.sh/zod@3.23.8";

// ── Types ─────────────────────────────────────────────────────

export interface FixturePair {
  field: string;
  zodType: string;
  valid: unknown[];
  invalid: unknown[];
}

export interface SchemaFixtures {
  schemaName: string;
  validPayload: Record<string, unknown>;
  fields: FixturePair[];
  /** Full invalid payloads — one per field with that field set to each invalid value */
  invalidPayloads: Array<{ field: string; value: unknown; payload: Record<string, unknown> }>;
}

// ── Core value generators per Zod type ────────────────────────

function generateForType(schema: z.ZodTypeAny, fieldName: string): FixturePair {
  const typeName = schema._def.typeName as string;

  switch (typeName) {
    // ── Primitives ──
    case "ZodString":
      return generateString(schema as z.ZodString, fieldName);
    case "ZodNumber":
      return generateNumber(schema as z.ZodNumber, fieldName);
    case "ZodBoolean":
      return {
        field: fieldName, zodType: "ZodBoolean",
        valid: [true, false],
        invalid: ["true", "false", 0, 1, null, "yes", ""],
      };
    case "ZodBigInt":
      return generateBigInt(fieldName);
    case "ZodDate":
      return generateDate(fieldName);

    // ── Enums ──
    case "ZodEnum":
      return generateEnum(schema as z.ZodEnum<[string, ...string[]]>, fieldName);
    case "ZodNativeEnum":
      return generateNativeEnum(schema, fieldName);
    case "ZodLiteral":
      return generateLiteral(schema as z.ZodLiteral<unknown>, fieldName);

    // ── Composites ──
    case "ZodArray":
      return generateArray(schema as z.ZodArray<z.ZodTypeAny>, fieldName);
    case "ZodObject":
      return {
        field: fieldName, zodType: "ZodObject",
        valid: [generateValidPayload(schema as z.ZodObject<z.ZodRawShape>)],
        invalid: ["not-an-object", 42, true, null, [], "{}"],
      };
    case "ZodRecord":
      return {
        field: fieldName, zodType: "ZodRecord",
        valid: [{}, { key1: "value1" }],
        invalid: ["not-a-record", 42, true, null, []],
      };
    case "ZodTuple":
      return {
        field: fieldName, zodType: "ZodTuple",
        valid: [[]],
        invalid: ["not-a-tuple", 42, {}, null],
      };
    case "ZodUnion":
    case "ZodDiscriminatedUnion":
      return generateUnion(schema, fieldName, typeName);

    // ── Wrappers ──
    case "ZodOptional":
      return generateWrapped((schema as z.ZodOptional<z.ZodTypeAny>)._def.innerType, fieldName, "ZodOptional");
    case "ZodNullable":
      return generateNullable((schema as z.ZodNullable<z.ZodTypeAny>)._def.innerType, fieldName);
    case "ZodDefault":
      return generateWrapped((schema as z.ZodDefault<z.ZodTypeAny>)._def.innerType, fieldName, "ZodDefault");
    case "ZodEffects":
      return generateWrapped((schema as z.ZodEffects<z.ZodTypeAny>)._def.schema, fieldName, "ZodEffects");

    // ── Specials ──
    case "ZodAny":
    case "ZodUnknown":
      return {
        field: fieldName, zodType: typeName,
        valid: ["anything", 42, true, null, {}, []],
        invalid: [], // accepts everything
      };
    case "ZodNever":
      return {
        field: fieldName, zodType: "ZodNever",
        valid: [],
        invalid: ["anything", 42, true, null],
      };
    case "ZodVoid":
      return {
        field: fieldName, zodType: "ZodVoid",
        valid: [undefined],
        invalid: ["value", 42, true],
      };
    case "ZodNull":
      return {
        field: fieldName, zodType: "ZodNull",
        valid: [null],
        invalid: [undefined, "", 0, false, "null"],
      };
    case "ZodUndefined":
      return {
        field: fieldName, zodType: "ZodUndefined",
        valid: [undefined],
        invalid: [null, "", 0, false],
      };

    default:
      return {
        field: fieldName, zodType: typeName,
        valid: ["placeholder"],
        invalid: [],
      };
  }
}

// ── String generator (with check awareness) ──────────────────

function generateString(schema: z.ZodString, fieldName: string): FixturePair {
  const checks = schema._def.checks ?? [];
  const valid: unknown[] = [];
  const invalid: unknown[] = [42, true, null, {}, []];

  let isUuid = false, isEmail = false, isUrl = false;
  let minLen: number | undefined, maxLen: number | undefined;

  for (const c of checks) {
    if (c.kind === "uuid") isUuid = true;
    if (c.kind === "email") isEmail = true;
    if (c.kind === "url") isUrl = true;
    if (c.kind === "min") minLen = c.value;
    if (c.kind === "max") maxLen = c.value;
  }

  if (isUuid) {
    valid.push("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001", "00000000-0000-0000-0000-000000000000");
    invalid.push("not-a-uuid", "12345", "", "aaaaaaaa-bbbb-cccc-dddd", "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz");
  } else if (isEmail) {
    valid.push("test@example.com", "a@b.co");
    invalid.push("not-an-email", "@missing.com", "no-at-sign", "", "test@", "test@.");
  } else if (isUrl) {
    valid.push("https://example.com", "https://sita.app/path?q=1");
    invalid.push("not-a-url", "", "://missing-scheme", "just-text-no-scheme", 42);
  } else {
    const base = `test-${fieldName}`;
    if (minLen !== undefined && base.length < minLen) {
      valid.push(base.padEnd(minLen, "x"));
    } else {
      valid.push(base);
    }
    if (minLen !== undefined && minLen > 0) {
      invalid.push("");
    }
    if (maxLen !== undefined) {
      invalid.push("x".repeat(maxLen + 10));
    }
  }

  return { field: fieldName, zodType: "ZodString", valid, invalid };
}

// ── Number generator ─────────────────────────────────────────

function generateNumber(schema: z.ZodNumber, fieldName: string): FixturePair {
  const checks = schema._def.checks ?? [];
  const valid: unknown[] = [0, 42];
  const invalid: unknown[] = ["not-a-number", true, null, {}, [], "", NaN];

  for (const c of checks) {
    if (c.kind === "min") {
      valid.push(c.value);
      invalid.push(c.value - 1);
    }
    if (c.kind === "max") {
      valid.push(c.value);
      invalid.push(c.value + 1);
    }
    if (c.kind === "int") {
      invalid.push(3.14);
    }
  }

  return { field: fieldName, zodType: "ZodNumber", valid, invalid };
}

// ── BigInt generator ─────────────────────────────────────────

function generateBigInt(fieldName: string): FixturePair {
  return {
    field: fieldName,
    zodType: "ZodBigInt",
    valid: [
      BigInt(0),
      BigInt(42),
      BigInt(-1),
      BigInt("9007199254740991"),    // Number.MAX_SAFE_INTEGER
      BigInt("-9007199254740991"),
      BigInt("99999999999999999999"), // Beyond Number range
    ],
    invalid: [
      42,                  // plain number — not bigint
      "42",                // string
      "not-a-bigint",
      true,
      null,
      {},
      [],
      3.14,                // float
      NaN,
      Infinity,
      undefined,
      "9007199254740991",  // string form of valid bigint — still not a bigint
    ],
  };
}

// ── Date generator ───────────────────────────────────────────

function generateDate(fieldName: string): FixturePair {
  const now = new Date();
  const epoch = new Date(0);
  const future = new Date("2099-12-31T23:59:59.999Z");
  const past = new Date("1970-01-01T00:00:00.000Z");
  const leapDay = new Date("2024-02-29T12:00:00.000Z");

  return {
    field: fieldName,
    zodType: "ZodDate",
    valid: [
      now,
      epoch,
      future,
      past,
      leapDay,
      new Date("2000-06-15T08:30:00.000Z"),
    ],
    invalid: [
      "not-a-date",
      "2024-13-45",                // invalid month/day
      "2024-02-30",                // Feb 30 doesn't exist
      42,
      true,
      null,
      {},
      [],
      "",
      NaN,
      new Date("invalid"),         // Invalid Date object
      "2024-02-29T25:61:61.000Z",  // invalid time
      Infinity,
    ],
  };
}

// ── Enum generator (with case abuse + wrong-type values) ─────

function generateEnum(
  schema: z.ZodEnum<[string, ...string[]]>,
  fieldName: string,
): FixturePair {
  const values = schema._def.values as string[];

  // Valid: every defined enum value
  const valid: unknown[] = [...values];

  // Invalid: comprehensive enum misuse
  const invalid: unknown[] = [
    // Wrong type values
    42,
    true,
    false,
    null,
    undefined,
    {},
    [],
    0,
    1,
    -1,
    3.14,

    // Non-existent string values
    "INVALID_ENUM_VALUE",
    "",
    " ",
    "null",
    "undefined",
    "true",
    "false",
  ];

  // Case variants: for each real value, generate uppercase, lowercase, mixed-case, and whitespace-padded
  for (const v of values) {
    const upper = v.toUpperCase();
    const lower = v.toLowerCase();
    const titleCase = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    const mixed = v.split("").map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join("");

    // Only add if they differ from the original (i.e., the original casing IS the valid one)
    if (upper !== v) invalid.push(upper);
    if (lower !== v) invalid.push(lower);
    if (titleCase !== v) invalid.push(titleCase);
    if (mixed !== v && mixed !== upper && mixed !== lower) invalid.push(mixed);

    // Whitespace abuse
    invalid.push(` ${v}`);     // leading space
    invalid.push(`${v} `);     // trailing space
    invalid.push(` ${v} `);    // both
  }

  // Substring / partial match abuse
  if (values.length > 0) {
    const first = values[0];
    if (first.length > 1) {
      invalid.push(first.slice(0, -1));         // truncated
      invalid.push(first + "_extra");            // extended
      invalid.push(first.slice(0, 1));           // single char
    }
    // Concatenation of two enum values
    if (values.length > 1) {
      invalid.push(values[0] + values[1]);
    }
  }

  // Deduplicate invalid (some may overlap with valid), handling undefined/Symbol/BigInt safely
  const validSet = new Set(values as unknown[]);
  const seen = new Set<string>();
  const deduped: unknown[] = [];
  for (const v of invalid) {
    if (validSet.has(v)) continue;
    const key = typeof v === "symbol" ? v.toString()
      : typeof v === "bigint" ? `bigint:${v}`
      : typeof v === "undefined" ? "@@undefined"
      : JSON.stringify(v);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(v);
  }

  return { field: fieldName, zodType: "ZodEnum", valid, invalid: deduped };
}

// ── Native enum generator ────────────────────────────────────

function generateNativeEnum(schema: z.ZodTypeAny, fieldName: string): FixturePair {
  const enumObj = (schema._def as { values: Record<string, string | number> }).values;
  const values = Object.values(enumObj);
  const valid = [...values];
  const invalid: unknown[] = [
    "INVALID", "", null, undefined, true, {}, [],
    ...values.filter((v): v is string => typeof v === "string").flatMap(v => {
      const inv: unknown[] = [];
      if (v.toUpperCase() !== v) inv.push(v.toUpperCase());
      if (v.toLowerCase() !== v) inv.push(v.toLowerCase());
      inv.push(` ${v}`, `${v} `);
      return inv;
    }),
  ];

  return { field: fieldName, zodType: "ZodNativeEnum", valid, invalid };
}

// ── Literal generator ────────────────────────────────────────

function generateLiteral(schema: z.ZodLiteral<unknown>, fieldName: string): FixturePair {
  const value = schema._def.value;
  const valid = [value];
  const invalid: unknown[] = [];

  if (typeof value === "string") {
    invalid.push(value + "_wrong", value.toUpperCase(), "", 42, true, null);
    if (value.toLowerCase() !== value) invalid.push(value.toLowerCase());
  } else if (typeof value === "number") {
    invalid.push(value + 1, value - 1, String(value), true, null);
  } else if (typeof value === "boolean") {
    invalid.push(!value, String(value), 0, 1, null);
  }

  return { field: fieldName, zodType: "ZodLiteral", valid, invalid };
}

// ── Array generator ──────────────────────────────────────────

function generateArray(schema: z.ZodArray<z.ZodTypeAny>, fieldName: string): FixturePair {
  const inner = generateForType(schema._def.type, `${fieldName}[0]`);
  const validItem = inner.valid[0];
  const valid: unknown[] = [[], [validItem], [validItem, validItem]];
  const invalid: unknown[] = ["not-an-array", 42, true, null, {}];

  // If inner has invalid values, an array containing one should fail
  if (inner.invalid.length > 0) {
    invalid.push([inner.invalid[0]]);
  }

  return { field: fieldName, zodType: "ZodArray", valid, invalid };
}

// ── Union generator ──────────────────────────────────────────

function generateUnion(schema: z.ZodTypeAny, fieldName: string, typeName: string): FixturePair {
  const options: z.ZodTypeAny[] = (schema._def as { options: z.ZodTypeAny[] }).options ?? [];
  const valid: unknown[] = [];
  const invalid: unknown[] = [];

  for (const opt of options) {
    const sub = generateForType(opt, fieldName);
    valid.push(...sub.valid.slice(0, 1));
  }

  // Things unlikely to match any branch (avoid Symbol — not JSON-serializable)
  invalid.push("@@UNION_MISS@@", -999999, { __invalid: true });

  return { field: fieldName, zodType: typeName, valid, invalid };
}

// ── Wrapper helpers ──────────────────────────────────────────

function generateWrapped(inner: z.ZodTypeAny, fieldName: string, wrapperType: string): FixturePair {
  const base = generateForType(inner, fieldName);
  if (wrapperType === "ZodOptional") {
    base.valid.push(undefined);
    base.zodType = `ZodOptional<${base.zodType}>`;
  }
  if (wrapperType === "ZodDefault") {
    base.valid.push(undefined);
    base.zodType = `ZodDefault<${base.zodType}>`;
  }
  return base;
}

function generateNullable(inner: z.ZodTypeAny, fieldName: string): FixturePair {
  const base = generateForType(inner, fieldName);
  base.valid.push(null);
  // Remove null from invalid since it's now valid
  base.invalid = base.invalid.filter(v => v !== null);
  base.zodType = `ZodNullable<${base.zodType}>`;
  return base;
}

// ── Main entry points ────────────────────────────────────────

/**
 * Generate a valid payload for a ZodObject schema.
 * Uses the first valid value from each field's fixture.
 */
export function generateValidPayload(schema: z.ZodObject<z.ZodRawShape>): Record<string, unknown> {
  const shape = schema._def.shape();
  const payload: Record<string, unknown> = {};

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const typeName = (fieldSchema as z.ZodTypeAny)._def.typeName;
    // Skip optional/default fields from required payload
    if (typeName === "ZodOptional" || typeName === "ZodDefault") continue;

    const fixture = generateForType(fieldSchema as z.ZodTypeAny, key);
    if (fixture.valid.length > 0) {
      payload[key] = fixture.valid[0];
    }
  }

  return payload;
}

/**
 * Generate full schema fixtures: per-field valid/invalid values,
 * a valid baseline payload, and invalid payloads for each field.
 */
export function generateSchemaFixtures(
  schema: z.ZodObject<z.ZodRawShape>,
  schemaName: string,
): SchemaFixtures {
  const shape = schema._def.shape();
  const fields: FixturePair[] = [];
  const validPayload = generateValidPayload(schema);

  for (const [key, fieldSchema] of Object.entries(shape)) {
    fields.push(generateForType(fieldSchema as z.ZodTypeAny, key));
  }

  // Build invalid payloads: for each field, swap in each invalid value
  const invalidPayloads: SchemaFixtures["invalidPayloads"] = [];
  for (const f of fields) {
    for (const inv of f.invalid) {
      invalidPayloads.push({
        field: f.field,
        value: inv,
        payload: { ...validPayload, [f.field]: inv },
      });
    }
  }

  return { schemaName, validPayload, fields, invalidPayloads };
}

/**
 * Generate a summary report of fixture coverage for a schema.
 */
export function fixtureReport(fixtures: SchemaFixtures): string {
  const lines = [
    `Fixture Report: ${fixtures.schemaName}`,
    `  Fields: ${fixtures.fields.length}`,
    `  Valid payload fields: ${Object.keys(fixtures.validPayload).length}`,
    `  Total invalid payloads: ${fixtures.invalidPayloads.length}`,
    `  Per-field breakdown:`,
  ];

  for (const f of fixtures.fields) {
    lines.push(`    ${f.field} (${f.zodType}): ${f.valid.length} valid, ${f.invalid.length} invalid`);
  }

  return lines.join("\n");
}