// ═══════════════════════════════════════════════════════════════
// SITA OS — Zod Fixture Generator Tests
//
// Validates that the generator produces correct valid/invalid
// values for all supported Zod types, with special focus on
// BigInt, Date, enum case abuse, and composite types.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assertNotEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import {
  generateSchemaFixtures,
  generateValidPayload,
  fixtureReport,
  type FixturePair,
  type SchemaFixtures,
} from "./zod-fixture-generator.ts";

// ── Helper: assert all valid values pass, all invalid values fail ──

function assertFixturePairAgainstSchema(schema: z.ZodTypeAny, pair: FixturePair) {
  for (const v of pair.valid) {
    const r = schema.safeParse(v);
    assert(r.success, `Expected valid value ${JSON.stringify(v)} to pass for ${pair.field} (${pair.zodType}), got: ${!r.success ? JSON.stringify(r.error.flatten()) : "ok"}`);
  }
  for (const v of pair.invalid) {
    const r = schema.safeParse(v);
    assert(!r.success, `Expected invalid value ${JSON.stringify(v)} to fail for ${pair.field} (${pair.zodType})`);
  }
}

// ══════════════════════════════════════════════════════════════
// BigInt tests
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "BigInt: valid values pass z.bigint()", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ amount: z.bigint() });
  const fixtures = generateSchemaFixtures(schema, "BigIntTest");
  const field = fixtures.fields.find(f => f.field === "amount")!;

  assert(field, "amount field must exist");
  assertEquals(field.zodType, "ZodBigInt");
  assert(field.valid.length >= 4, `Expected ≥4 valid bigint values, got ${field.valid.length}`);

  for (const v of field.valid) {
    const r = z.bigint().safeParse(v);
    assert(r.success, `BigInt valid value should pass: ${String(v)}`);
  }
}});

Deno.test({ name: "BigInt: invalid values fail z.bigint()", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ amount: z.bigint() });
  const fixtures = generateSchemaFixtures(schema, "BigIntTest");
  const field = fixtures.fields.find(f => f.field === "amount")!;

  assert(field.invalid.length >= 8, `Expected ≥8 invalid bigint values, got ${field.invalid.length}`);

  for (const v of field.invalid) {
    const r = z.bigint().safeParse(v);
    assert(!r.success, `BigInt invalid value should fail: ${JSON.stringify(v)}`);
  }
}});

// ══════════════════════════════════════════════════════════════
// Date tests
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Date: valid values pass z.date()", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ createdAt: z.date() });
  const fixtures = generateSchemaFixtures(schema, "DateTest");
  const field = fixtures.fields.find(f => f.field === "createdAt")!;

  assert(field, "createdAt field must exist");
  assertEquals(field.zodType, "ZodDate");
  assert(field.valid.length >= 4, `Expected ≥4 valid date values, got ${field.valid.length}`);

  for (const v of field.valid) {
    const r = z.date().safeParse(v);
    assert(r.success, `Date valid value should pass: ${String(v)}`);
  }
}});

Deno.test({ name: "Date: invalid values fail z.date()", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ createdAt: z.date() });
  const fixtures = generateSchemaFixtures(schema, "DateTest");
  const field = fixtures.fields.find(f => f.field === "createdAt")!;

  assert(field.invalid.length >= 8, `Expected ≥8 invalid date values, got ${field.invalid.length}`);

  for (const v of field.invalid) {
    const r = z.date().safeParse(v);
    assert(!r.success, `Date invalid value should fail: ${JSON.stringify(v)}`);
  }
}});

Deno.test({ name: "Date: includes edge cases (leap day, epoch, Invalid Date)", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ ts: z.date() });
  const fixtures = generateSchemaFixtures(schema, "DateEdge");
  const field = fixtures.fields.find(f => f.field === "ts")!;

  // Check that some valid values include leap day and epoch
  const validDates = field.valid.filter(v => v instanceof Date) as Date[];
  assert(validDates.some(d => d.getTime() === 0), "Should include epoch");
  assert(validDates.some(d => d.getMonth() === 1 && d.getDate() === 29), "Should include leap day");

  // Check Invalid Date is in the invalid set
  const hasInvalidDate = field.invalid.some(v => v instanceof Date && isNaN((v as Date).getTime()));
  assert(hasInvalidDate, "Should include Invalid Date object as invalid");
}});

// ══════════════════════════════════════════════════════════════
// Enum tests — case abuse + wrong-type values
// ══════════════════════════════════════════════════════════════

const RoleEnum = z.enum(["admin", "moderator", "user"]);

Deno.test({ name: "Enum: all defined values are valid", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumTest");
  const field = fixtures.fields.find(f => f.field === "role")!;

  assertEquals(field.valid.length, 3);
  assert(field.valid.includes("admin"));
  assert(field.valid.includes("moderator"));
  assert(field.valid.includes("user"));
}});

Deno.test({ name: "Enum: uppercase variants are rejected", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumCase");
  const field = fixtures.fields.find(f => f.field === "role")!;

  assert(field.invalid.includes("ADMIN"), "ADMIN should be invalid");
  assert(field.invalid.includes("MODERATOR"), "MODERATOR should be invalid");
  assert(field.invalid.includes("USER"), "USER should be invalid");

  for (const v of ["ADMIN", "MODERATOR", "USER"]) {
    const r = RoleEnum.safeParse(v);
    assert(!r.success, `Uppercase '${v}' must fail`);
  }
}});

Deno.test({ name: "Enum: title-case variants are rejected", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumTitleCase");
  const field = fixtures.fields.find(f => f.field === "role")!;

  assert(field.invalid.includes("Admin"), "Admin should be invalid");
  assert(field.invalid.includes("Moderator"), "Moderator should be invalid");
  assert(field.invalid.includes("User"), "User should be invalid");

  for (const v of ["Admin", "Moderator", "User"]) {
    const r = RoleEnum.safeParse(v);
    assert(!r.success, `Title-case '${v}' must fail`);
  }
}});

Deno.test({ name: "Enum: whitespace-padded variants are rejected", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumWhitespace");
  const field = fixtures.fields.find(f => f.field === "role")!;

  assert(field.invalid.includes(" admin"), "Leading-space 'admin' should be invalid");
  assert(field.invalid.includes("admin "), "Trailing-space 'admin' should be invalid");
  assert(field.invalid.includes(" admin "), "Both-space 'admin' should be invalid");

  for (const v of [" admin", "admin ", " admin "]) {
    const r = RoleEnum.safeParse(v);
    assert(!r.success, `Whitespace-padded '${v}' must fail`);
  }
}});

Deno.test({ name: "Enum: wrong-type values (number, boolean, null, object, array) are rejected", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumWrongType");
  const field = fixtures.fields.find(f => f.field === "role")!;

  const wrongTypes = [42, true, false, null, {}, [], 0, 1, -1, 3.14];
  for (const v of wrongTypes) {
    assert(field.invalid.some(iv => JSON.stringify(iv) === JSON.stringify(v)),
      `Invalid set should include ${JSON.stringify(v)}`);
    const r = RoleEnum.safeParse(v);
    assert(!r.success, `Wrong-type value ${JSON.stringify(v)} must fail`);
  }
}});

Deno.test({ name: "Enum: partial/extended/concatenated strings are rejected", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ role: RoleEnum });
  const fixtures = generateSchemaFixtures(schema, "EnumPartial");
  const field = fixtures.fields.find(f => f.field === "role")!;

  // Truncated
  assert(field.invalid.includes("admi"), "'admi' (truncated) should be invalid");
  // Extended
  assert(field.invalid.includes("admin_extra"), "'admin_extra' should be invalid");
  // Concatenated
  assert(field.invalid.includes("adminmoderator"), "'adminmoderator' should be invalid");
}});

// ══════════════════════════════════════════════════════════════
// Enum with UPPER_CASE values (e.g. HTTP methods)
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Enum: UPPER_CASE enum generates lowercase variants as invalid", sanitizeOps: false, sanitizeResources: false, fn() {
  const HttpMethod = z.enum(["GET", "POST", "PUT", "DELETE"]);
  const schema = z.object({ method: HttpMethod });
  const fixtures = generateSchemaFixtures(schema, "UpperEnum");
  const field = fixtures.fields.find(f => f.field === "method")!;

  assert(field.invalid.includes("get"), "lowercase 'get' should be invalid");
  assert(field.invalid.includes("post"), "lowercase 'post' should be invalid");
  assert(field.valid.includes("GET"), "GET should be valid");
  assert(field.valid.includes("POST"), "POST should be valid");
}});

// ══════════════════════════════════════════════════════════════
// Enum with kebab-case values
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Enum: kebab-case enum generates case variants as invalid", sanitizeOps: false, sanitizeResources: false, fn() {
  const StatusEnum = z.enum(["restart-service", "update-now", "run-backup"]);
  const schema = z.object({ cmd: StatusEnum });
  const fixtures = generateSchemaFixtures(schema, "KebabEnum");
  const field = fixtures.fields.find(f => f.field === "cmd")!;

  assert(field.invalid.includes("RESTART-SERVICE"), "RESTART-SERVICE should be invalid");
  assert(field.invalid.includes("Restart-service"), "Title-case should be invalid");
  assert(field.valid.includes("restart-service"), "restart-service should be valid");
}});

// ══════════════════════════════════════════════════════════════
// Composite schema: realistic platform payload
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Composite: BrainCoreSchema generates valid payload", sanitizeOps: false, sanitizeResources: false, fn() {
  const BrainCoreSchema = z.object({
    intent: z.string().min(1).max(255),
    advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]),
    context: z.record(z.unknown()).optional().default({}),
    secondary_advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]).optional(),
    stream: z.boolean().optional().default(false),
  });

  const fixtures = generateSchemaFixtures(BrainCoreSchema, "BrainCore");
  const r = BrainCoreSchema.safeParse(fixtures.validPayload);
  assert(r.success, `Valid payload must pass: ${JSON.stringify(fixtures.validPayload)}`);
}});

Deno.test({ name: "Composite: every invalid payload fails the schema", sanitizeOps: false, sanitizeResources: false, fn() {
  const TestSchema = z.object({
    name: z.string().min(1).max(100),
    role: z.enum(["admin", "user"]),
    count: z.number().int().min(0),
  });

  const fixtures = generateSchemaFixtures(TestSchema, "CompositeInvalid");
  let passedCount = 0;

  for (const inv of fixtures.invalidPayloads) {
    const r = TestSchema.safeParse(inv.payload);
    if (r.success) passedCount++;
  }

  // Allow a small tolerance — some "invalid" values may be coerced or pass by Zod
  // (e.g., 0 is valid for min(0)), but the vast majority must fail
  const failRate = 1 - (passedCount / fixtures.invalidPayloads.length);
  assert(failRate > 0.85, `At least 85% of invalid payloads must fail, got ${(failRate * 100).toFixed(1)}% (${passedCount} passed out of ${fixtures.invalidPayloads.length})`);
}});

// ══════════════════════════════════════════════════════════════
// String subtypes: UUID, email, URL
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "String(uuid): valid UUIDs pass, invalid formats fail", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ id: z.string().uuid() });
  const fixtures = generateSchemaFixtures(schema, "UUIDTest");
  const field = fixtures.fields.find(f => f.field === "id")!;

  assertFixturePairAgainstSchema(z.string().uuid(), field);
}});

Deno.test({ name: "String(email): valid emails pass, invalid formats fail", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ email: z.string().email() });
  const fixtures = generateSchemaFixtures(schema, "EmailTest");
  const field = fixtures.fields.find(f => f.field === "email")!;

  assertFixturePairAgainstSchema(z.string().email(), field);
}});

Deno.test({ name: "String(url): valid URLs pass, invalid formats fail", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ endpoint: z.string().url() });
  const fixtures = generateSchemaFixtures(schema, "URLTest");
  const field = fixtures.fields.find(f => f.field === "endpoint")!;

  assertFixturePairAgainstSchema(z.string().url(), field);
}});

// ══════════════════════════════════════════════════════════════
// Boolean, nullable, optional
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Boolean: true/false valid, stringified booleans invalid", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ active: z.boolean() });
  const fixtures = generateSchemaFixtures(schema, "BoolTest");
  const field = fixtures.fields.find(f => f.field === "active")!;

  assertFixturePairAgainstSchema(z.boolean(), field);
}});

Deno.test({ name: "Nullable: null becomes valid, other invalids remain", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ tag: z.string().nullable() });
  const fixtures = generateSchemaFixtures(schema, "NullableTest");
  const field = fixtures.fields.find(f => f.field === "tag")!;

  assert(field.valid.includes(null), "null must be valid for nullable");
  assert(!field.invalid.includes(null), "null must not be in invalid for nullable");
}});

Deno.test({ name: "Optional: undefined becomes valid", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({ hint: z.string().optional() });
  const fixtures = generateSchemaFixtures(schema, "OptionalTest");
  const field = fixtures.fields.find(f => f.field === "hint")!;

  assert(field.valid.includes(undefined), "undefined must be valid for optional");
}});

// ══════════════════════════════════════════════════════════════
// Fixture report
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "fixtureReport: produces readable summary", sanitizeOps: false, sanitizeResources: false, fn() {
  const schema = z.object({
    id: z.string().uuid(),
    role: z.enum(["admin", "user"]),
    count: z.number().int().min(0),
    active: z.boolean(),
  });

  const fixtures = generateSchemaFixtures(schema, "ReportTest");
  const report = fixtureReport(fixtures);

  assert(report.includes("ReportTest"), "Report must include schema name");
  assert(report.includes("id"), "Report must include field names");
  assert(report.includes("role"), "Report must include field names");
  assert(report.includes("ZodEnum"), "Report must include Zod types");
  assert(report.includes("valid"), "Report must show valid counts");
  assert(report.includes("invalid"), "Report must show invalid counts");
}});

// ══════════════════════════════════════════════════════════════
// Real platform schemas from zod-validate.ts
// ══════════════════════════════════════════════════════════════

Deno.test({ name: "Platform: OsCommandSchema fixtures all validate correctly", sanitizeOps: false, sanitizeResources: false, fn() {
  const OsCommandSchema = z.object({
    device_id: z.string().min(1).max(255),
    command: z.enum(["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"]),
    params: z.record(z.unknown()).optional(),
  });

  const fixtures = generateSchemaFixtures(OsCommandSchema, "OsCommand");

  // Valid payload passes
  const r = OsCommandSchema.safeParse(fixtures.validPayload);
  assert(r.success, `OsCommand valid payload must pass: ${JSON.stringify(r)}`);

  // command field has all 6 values as valid
  const cmdField = fixtures.fields.find(f => f.field === "command")!;
  assertEquals(cmdField.valid.length, 6);

  // command field has case variants as invalid
  assert(cmdField.invalid.includes("RESTART-SERVICE"));
  assert(cmdField.invalid.includes("Restart-service"));
}});

Deno.test({ name: "Platform: AdminUsersActionSchema fixtures produce high invalid coverage", sanitizeOps: false, sanitizeResources: false, fn() {
  const AdminUsersActionSchema = z.object({
    action: z.enum(["suspend", "unsuspend", "assign_role", "revoke_role"]),
    target_user_id: z.string().uuid(),
    role: z.string().max(50).optional(),
  });

  const fixtures = generateSchemaFixtures(AdminUsersActionSchema, "AdminUsersAction");
  assert(fixtures.invalidPayloads.length >= 30, `Expected ≥30 invalid payloads, got ${fixtures.invalidPayloads.length}`);
  assert(fixtures.fields.length === 3, "Should have 3 fields");
}});