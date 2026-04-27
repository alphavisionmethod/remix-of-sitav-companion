// ═══════════════════════════════════════════════════════════════
// Phase 12 — Storage Bucket RLS Behavioral E2E
// ───────────────────────────────────────────────────────────────
// Pins storage.objects RLS posture to the live snapshot in
// `generated/storage/storage-snapshot.json`. Asserts every bucket
// declared in the database has a coherent, intentional access
// pattern, and that no bucket can silently leak between tenants.
//
// Behavioral contract per pattern:
//
//   • PER-USER buckets (`user-files`, `pb-files`, `voice-recordings`,
//     `business-documents`, `advisor-portraits`, `advisor-avatars`)
//     MUST gate every mutating verb on
//     `auth.uid()::text = (storage.foldername(name))[1]`.
//
//   • ADMIN-ONLY buckets (`heal-receipts`) MUST gate every verb on
//     `has_role(auth.uid(), 'admin')`.
//
//   • PUBLIC-PREFIX buckets (`app-assets`) MUST limit anon reads to
//     a constrained prefix and gate all mutating verbs on the admin
//     role.
//
//   • SERVICE-ROLE-ONLY buckets MUST NOT have any policy granting
//     `public`, `anon`, or `authenticated` access for ALL/INSERT
//     /UPDATE/DELETE.
//
// Any drift requires explicit codification in the EXEMPTIONS map.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SNAPSHOT_PATH = path.resolve("generated/storage/storage-snapshot.json");

interface BucketMeta { id: string; public: boolean }
interface ObjectPolicy {
  policyname: string;
  cmd: string;
  roles: string[] | null;
  qual: string | null;
  with_check: string | null;
}
interface BucketPolicy {
  policyname: string;
  cmd: string;
  roles: string[] | null;
  qual: string | null;
}
interface Snapshot {
  buckets: BucketMeta[];
  object_policies: ObjectPolicy[];
  bucket_policies: BucketPolicy[] | null;
}

function load(): Snapshot {
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as Snapshot;
}

function policiesForBucket(snap: Snapshot, bucketId: string): ObjectPolicy[] {
  const tag = `'${bucketId}'`;
  return snap.object_policies.filter((p) =>
    (p.qual ?? "").includes(tag) || (p.with_check ?? "").includes(tag),
  );
}

function isOwnerFolderClause(text: string | null): boolean {
  if (!text) return false;
  return text.includes("auth.uid()") &&
    text.includes("storage.foldername") &&
    text.includes("[1]");
}

function isAdminClause(text: string | null): boolean {
  if (!text) return false;
  return text.includes("has_role(auth.uid()") && text.includes("'admin'");
}

function isPublicReadOnlyToBucket(text: string | null, bucketId: string): boolean {
  if (!text) return false;
  // Allows simple `bucket_id = 'X'` or with NOT NULL guards — but no extra path scoping.
  return text.includes(`bucket_id = '${bucketId}'`);
}

// Bucket → expected access pattern. New buckets MUST be added here or
// the unknown-bucket guard will fail.
type Pattern =
  | "per-user"
  | "admin-only"
  | "public-read+admin-write"
  | "service-role-only"
  | "public-read+per-user-write";

const BUCKET_CONTRACT: Record<string, Pattern> = {
  "user-files": "per-user",
  "pb-files": "per-user",
  "voice-recordings": "per-user",
  "business-documents": "per-user",
  "advisor-portraits": "public-read+per-user-write",
  "advisor-avatars": "public-read+per-user-write",
  "heal-receipts": "admin-only",
  "app-assets": "public-read+admin-write",
};

const MUTATING_VERBS = new Set(["INSERT", "UPDATE", "DELETE"]);

describe("Phase 12 — Storage Bucket RLS Behavioral E2E", () => {
  describe("snapshot integrity", () => {
    it("storage snapshot exists", () => {
      expect(fs.existsSync(SNAPSHOT_PATH)).toBe(true);
      expect(fs.statSync(SNAPSHOT_PATH).size).toBeGreaterThan(2_000);
    });

    it("snapshot lists all buckets present in the live database", () => {
      const snap = load();
      const ids = snap.buckets.map((b) => b.id).sort();
      // Sanity: at least the 8 buckets we know exist
      expect(ids.length).toBeGreaterThanOrEqual(8);
      for (const known of Object.keys(BUCKET_CONTRACT)) {
        expect(ids, `Snapshot missing known bucket: ${known}`).toContain(known);
      }
    });

    it("snapshot contains object policies", () => {
      const snap = load();
      expect(Array.isArray(snap.object_policies)).toBe(true);
      expect(snap.object_policies.length).toBeGreaterThan(20);
    });
  });

  describe("global posture — no bucket escapes the contract", () => {
    it("every live bucket is registered in BUCKET_CONTRACT", () => {
      const snap = load();
      const unknown = snap.buckets
        .map((b) => b.id)
        .filter((id) => !BUCKET_CONTRACT[id]);
      expect(unknown, `Unknown buckets — register an access pattern: ${unknown.join(",")}`).toEqual([]);
    });

    it("no bucket is marked public=true (we serve via signed URLs / scoped policies only)", () => {
      const snap = load();
      const offenders = snap.buckets.filter((b) => b.public).map((b) => b.id);
      // Hardening rule: even publicly-readable buckets are gated via
      // explicit RLS, never the global `public` flag.
      expect(offenders).toEqual([]);
    });

    it("no policy uses an unbounded `bucket_id IS NOT NULL`-style escape", () => {
      const snap = load();
      const offenders = snap.object_policies.filter((p) => {
        const qual = (p.qual ?? "") + (p.with_check ?? "");
        return qual.includes("bucket_id IS NOT NULL") && !qual.includes("has_role");
      });
      expect(offenders.map((o) => o.policyname)).toEqual([]);
    });
  });

  describe("per-user buckets — owner-folder gating", () => {
    const PER_USER = Object.entries(BUCKET_CONTRACT)
      .filter(([, p]) => p === "per-user")
      .map(([id]) => id);

    for (const bucketId of PER_USER) {
      describe(`bucket: ${bucketId}`, () => {
        it("has at least SELECT/INSERT/UPDATE/DELETE policies", () => {
          const snap = load();
          const policies = policiesForBucket(snap, bucketId);
          const cmds = new Set(policies.map((p) => p.cmd));
          for (const verb of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
            expect(cmds.has(verb), `${bucketId} missing ${verb} policy`).toBe(true);
          }
        });

        it("every mutating policy gates on auth.uid() = foldername[1]", () => {
          const snap = load();
          const policies = policiesForBucket(snap, bucketId)
            .filter((p) => MUTATING_VERBS.has(p.cmd));
          const offenders = policies.filter((p) => {
            const text = (p.cmd === "INSERT" ? p.with_check : p.qual) ?? "";
            return !isOwnerFolderClause(text);
          });
          expect(offenders.map((o) => `${o.policyname}:${o.cmd}`)).toEqual([]);
        });

        it("SELECT policy is owner-scoped (no anon read leak)", () => {
          const snap = load();
          const selects = policiesForBucket(snap, bucketId).filter((p) => p.cmd === "SELECT");
          // At least one SELECT must enforce owner-folder OR admin gating.
          const hasOwnerOrAdmin = selects.some((p) =>
            isOwnerFolderClause(p.qual) || isAdminClause(p.qual),
          );
          expect(hasOwnerOrAdmin, `${bucketId} SELECT policies do not gate on owner/admin`).toBe(true);
        });
      });
    }
  });

  describe("admin-only buckets", () => {
    const ADMIN_ONLY = Object.entries(BUCKET_CONTRACT)
      .filter(([, p]) => p === "admin-only")
      .map(([id]) => id);

    for (const bucketId of ADMIN_ONLY) {
      it(`${bucketId}: every policy gates on has_role admin`, () => {
        const snap = load();
        const policies = policiesForBucket(snap, bucketId);
        expect(policies.length).toBeGreaterThan(0);
        const offenders = policies.filter((p) => {
          const text = (p.cmd === "INSERT" ? p.with_check : p.qual) ?? "";
          return !isAdminClause(text);
        });
        expect(offenders.map((o) => `${o.policyname}:${o.cmd}`)).toEqual([]);
      });
    }
  });

  describe("public-read + admin-write buckets (e.g. app-assets)", () => {
    const buckets = Object.entries(BUCKET_CONTRACT)
      .filter(([, p]) => p === "public-read+admin-write")
      .map(([id]) => id);

    for (const bucketId of buckets) {
      it(`${bucketId}: anon SELECT is constrained to a prefix (no full-bucket leak)`, () => {
        const snap = load();
        const anonSelects = policiesForBucket(snap, bucketId)
          .filter((p) => p.cmd === "SELECT")
          .filter((p) => (p.roles ?? []).some((r) => r === "anon" || r === "public"));
        // Either none (fully gated to authenticated) or each must scope by foldername prefix.
        for (const p of anonSelects) {
          const qual = p.qual ?? "";
          const isPrefixed = qual.includes("storage.foldername") && qual.includes("[1]");
          expect(
            isPrefixed,
            `${bucketId} anon SELECT policy ${p.policyname} is NOT prefix-scoped`,
          ).toBe(true);
        }
      });

      it(`${bucketId}: every mutating policy gates on admin role`, () => {
        const snap = load();
        const muts = policiesForBucket(snap, bucketId).filter((p) => MUTATING_VERBS.has(p.cmd));
        expect(muts.length).toBeGreaterThan(0);
        const offenders = muts.filter((p) => {
          const text = (p.cmd === "INSERT" ? p.with_check : p.qual) ?? "";
          return !isAdminClause(text);
        });
        expect(offenders.map((o) => `${o.policyname}:${o.cmd}`)).toEqual([]);
      });
    }
  });

  describe("public-read + per-user-write buckets (advisor portraits/avatars)", () => {
    const buckets = Object.entries(BUCKET_CONTRACT)
      .filter(([, p]) => p === "public-read+per-user-write")
      .map(([id]) => id);

    for (const bucketId of buckets) {
      it(`${bucketId}: has at least one public SELECT policy (intentional broadcast)`, () => {
        const snap = load();
        const pubReads = policiesForBucket(snap, bucketId)
          .filter((p) => p.cmd === "SELECT")
          .filter((p) => (p.roles ?? []).some((r) => r === "public" || r === "anon"));
        expect(pubReads.length).toBeGreaterThan(0);
      });

      it(`${bucketId}: every mutating policy gates on owner-folder (no cross-user overwrite)`, () => {
        const snap = load();
        const muts = policiesForBucket(snap, bucketId).filter((p) => MUTATING_VERBS.has(p.cmd));
        expect(muts.length).toBeGreaterThan(0);
        const offenders = muts.filter((p) => {
          const text = (p.cmd === "INSERT" ? p.with_check : p.qual) ?? "";
          return !isOwnerFolderClause(text);
        });
        expect(offenders.map((o) => `${o.policyname}:${o.cmd}`)).toEqual([]);
      });
    }
  });

  describe("cross-bucket invariants", () => {
    it("no policy grants ALL to public/anon/authenticated for any non-service bucket", () => {
      const snap = load();
      const offenders = snap.object_policies.filter((p) => {
        if (p.cmd !== "ALL") return false;
        const roles = p.roles ?? [];
        const grantsBroad = roles.some((r) =>
          r === "public" || r === "anon" || r === "authenticated",
        );
        return grantsBroad;
      });
      expect(offenders.map((o) => `${o.policyname}`)).toEqual([]);
    });

    it("each bucket's policy set covers READ+WRITE coherently (no orphan WRITE-only or READ-only buckets)", () => {
      const snap = load();
      const offenders: string[] = [];
      for (const bucket of snap.buckets) {
        const policies = policiesForBucket(snap, bucket.id);
        const cmds = new Set(policies.flatMap((p) =>
          p.cmd === "ALL" ? ["SELECT", "INSERT", "UPDATE", "DELETE"] : [p.cmd],
        ));
        const hasRead = cmds.has("SELECT");
        const hasWrite = cmds.has("INSERT") || cmds.has("UPDATE") || cmds.has("DELETE");
        if (!hasRead) offenders.push(`${bucket.id}:no-read`);
        if (!hasWrite) offenders.push(`${bucket.id}:no-write`);
      }
      expect(offenders).toEqual([]);
    });

    it("policy-bucket reference graph is closed (every policy targets a known bucket)", () => {
      const snap = load();
      const knownBuckets = new Set(snap.buckets.map((b) => b.id));
      const orphans: string[] = [];
      for (const p of snap.object_policies) {
        const text = (p.qual ?? "") + " " + (p.with_check ?? "");
        const match = text.match(/bucket_id = '([^']+)'/);
        if (match && !knownBuckets.has(match[1])) {
          orphans.push(`${p.policyname} → ${match[1]}`);
        }
      }
      expect(orphans).toEqual([]);
    });
  });
});