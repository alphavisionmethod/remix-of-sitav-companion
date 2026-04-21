// ═══════════════════════════════════════════════════════════════
// SITA OS — Auto-Generated Schema Fixture Edge Case Tests
// Uses the schema fixture generator to automatically produce
// valid/invalid payloads from Zod schemas and verify parsing.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  ChatAdvisorRequestSchema,
  PersonalBrainRequestSchema,
  BoardroomSessionRequestSchema,
  AlertIngestRequestSchema,
  AdminResetUserSetupSchema,
  AdminRevokeSessionSchema,
  OsCommandRequestSchema,
  ConnectorOAuthInitiateSchema,
  ConnectorOAuthDisconnectSchema,
  ConnectorBatchRequestSchema,
  CloudSyncPushSchema,
  KillSwitchToggleRequestSchema,
  AdminUsersActionSchema,
  BrainCoreRequestSchema,
  ProductionLaunchAttestorSchema,
} from "./edge-function-schemas";
import { generateAllFixtures, type Fixture } from "./schema-fixture-generator";

// ── Schema registry for exhaustive testing ───────────────────

const SCHEMAS = [
  { name: "ChatAdvisorRequest", schema: ChatAdvisorRequestSchema },
  { name: "PersonalBrainRequest", schema: PersonalBrainRequestSchema },
  { name: "BoardroomSessionRequest", schema: BoardroomSessionRequestSchema },
  { name: "AlertIngestRequest", schema: AlertIngestRequestSchema },
  { name: "AdminResetUserSetup", schema: AdminResetUserSetupSchema },
  { name: "AdminRevokeSession", schema: AdminRevokeSessionSchema },
  { name: "OsCommandRequest", schema: OsCommandRequestSchema },
  { name: "ConnectorOAuthInitiate", schema: ConnectorOAuthInitiateSchema },
  { name: "ConnectorOAuthDisconnect", schema: ConnectorOAuthDisconnectSchema },
  { name: "ConnectorBatchRequest", schema: ConnectorBatchRequestSchema },
  { name: "CloudSyncPush", schema: CloudSyncPushSchema },
  { name: "KillSwitchToggle", schema: KillSwitchToggleRequestSchema },
  { name: "AdminUsersAction", schema: AdminUsersActionSchema },
  { name: "BrainCoreRequest", schema: BrainCoreRequestSchema },
  { name: "ProductionLaunchAttestor", schema: ProductionLaunchAttestorSchema },
] as const;

// ── Run auto-generated fixtures against each schema ──────────

describe("Auto-Generated Schema Fixture Edge Cases", () => {
  for (const { name, schema } of SCHEMAS) {
    describe(name, () => {
      const fixtures: Fixture[] = generateAllFixtures(schema as any, name);

      for (const fixture of fixtures) {
        it(fixture.label, () => {
          const result = schema.safeParse(fixture.payload);
          if (fixture.expectValid) {
            if (!result.success) {
              // Zod strips unknown fields and may coerce — check if stripping caused it
              // For "extra unknown fields" fixtures, Zod strips by default so should pass
              expect(result.success).toBe(true);
            }
          } else {
            expect(result.success).toBe(false);
          }
        });
      }

      // ── Verify fixture coverage ────────────────────────────
      it(`generates meaningful fixture count (>= 8)`, () => {
        expect(fixtures.length).toBeGreaterThanOrEqual(8);
      });

      it(`has both valid and invalid fixtures`, () => {
        const validCount = fixtures.filter((f) => f.expectValid).length;
        const invalidCount = fixtures.filter((f) => !f.expectValid).length;
        expect(validCount).toBeGreaterThan(0);
        expect(invalidCount).toBeGreaterThan(0);
      });
    });
  }
});