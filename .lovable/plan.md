

## Plan — SITA_MASTER_AUDIT.md v6.0 (Truth-Only Full Advanced Audit)

### Verified live snapshot (just gathered)

| Plane | Metric | Value |
|---|---|---|
| Frontend | Pages | **1,044** |
| Frontend | Components | **922** |
| Frontend | Hooks | **168** |
| Frontend | Total TS files | **4,689** |
| Backend | Edge Functions | **126** |
| Database | Tables (public) | **301** |
| Database | RLS Policies | **643** |
| Database | Tables w/ ≥1 policy | **300/301** (1 gap: `connector_oauth_tokens`) |
| Database | Migrations | **188** |
| Governance | CI Check Scripts | **108** |
| Governance | Generated Artifacts | **119** |
| Governance | Total scripts | **297** |
| Phase 32 | It's Real Gate | **verdict: real · 13/13 clauses · deployable: true** |
| Supabase Linter | Findings | **2** (1 INFO RLS-no-policy, 1 WARN public bucket listing) |

### Document structure (truth-only, outstanding gaps only)

**SITA_MASTER_AUDIT.md v6.0** — at `generated/SITA_MASTER_AUDIT.md`

1. **Header & Snapshot** — Live counts table above + Phase 32 verdict
2. **Audit Methodology** — How v6.0 differs (truth-only, no resolved log, evidence paths only)
3. **Section A — Frontend Plane Audit** (Pages/Components/Hooks/Contexts, route-registry, page-tier coverage, 1,044-page render gate status, demo-mode honesty)
4. **Section B — Backend Plane Audit** (126 edge functions, 6-class topology compliance, BFF vs Domain split, JWT verification gaps)
5. **Section C — Database Plane Audit** (301 tables, 643 policies, 1 RLS-enabled-no-policy table, tenancy column coverage, persistence-domain coverage)
6. **Section D — Security Fabric Audit** (7-layer hardening status, 2 Supabase linter findings, public storage bucket warning, secrets exposure scan)
7. **Section E — Orchestration & AI Runtime** (4-Layer Canonical Spine, OrchestrationFacade, Sovereign AI Gateway compliance)
8. **Section F — Governance & Manifests** (120 manifests, 108 CI gates, 13 It's-Real-Gate clauses, manifest-theater coverage)
9. **Section G — Mobile/Desktop/Appliance Runtimes** (Tier 1–4 readiness, IPA/AAB pipelines, Electron signing)
10. **Section H — Outstanding Risk Register** (P0/P1/P2 gaps only — see below)
11. **Section I — Deployment Readiness Matrix** (per-surface go/no-go with evidence paths)
12. **Section J — Evidence Index** (every claim → generated/*.json path)

### Outstanding risks to surface (verified, not historical)

**P0 (blocks GA)**
- `connector_oauth_tokens` table has RLS enabled but **0 policies** → all access denied OR data leak depending on grant; must define policies
- Public storage bucket allows anonymous listing (Supabase WARN) → audit `user-files` vs public asset buckets
- External error monitoring (Sentry) not wired
- `KS-PAYMENTS-AUTH` dedicated kill switch absent
- Hosted CI artifacts unproven (only local execution evidence exists)

**P1 (blocks scale)**
- 41 Investment Office pages share generic `business-api` (no dedicated domain APIs)
- Namespace duplication: `src/lib/engine/` vs `src/lib/engines/`
- Electron build/signing pipeline incomplete (desktop-signing-status flagged)
- 15 admin pages exceed FounderControlShell module budget

**P2 (quality)**
- E2E test coverage gaps (OPN-P2-04) — only files-upload-roundtrip exists for the 5 flagship loops
- Some `as any` cleanup pending (ISS-091)
- Generated artifact freshness — several reports last regenerated >24h ago

### What this document explicitly does NOT contain

Per documentation-governance memory (truth-only model):
- No resolved-issue log
- No historical fix descriptions
- No "what we did" narrative
- Only: live metrics, current gaps, evidence paths, risk register

### Files

| Action | Path |
|---|---|
| **Create/overwrite** | `generated/SITA_MASTER_AUDIT.md` (v6.0, ~600 lines) |

### Acceptance

- Document opens with live verified metrics matching the table above
- Every section cites the underlying `generated/*.json` evidence file
- Risk register lists only currently-open items with priority, owner-domain, and remediation path
- No resolved issue is described as a "fix" — only forward-looking gaps
- Phase 32 verdict (`real / 13-of-13 / deployable`) cited verbatim from `generated/its-real-gate-report.json`
- Supabase linter findings (2) are surfaced in Section D with exact remediation
- The `connector_oauth_tokens` RLS-no-policy gap appears as a P0 in Section H

