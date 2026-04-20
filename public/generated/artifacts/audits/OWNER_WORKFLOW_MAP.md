# Owner Workflow Map

> **Status:** Phase 1 (truth artifact established). Phases 2-5 wire workflow-first navigation.
> **Source of truth:** `src/lib/architecture/owner-workflow-map.ts`

The admin backend is organized around five canonical owner workflows. Every admin route in the registry may tag itself with one or more of these workflows so the shell can offer workflow-first navigation in addition to domain-first.

## 1. Daily Command (`daily`)

**Goal:** Open admin and know in under 30 seconds what is broken, what needs approval, and whether release is blocked.

**Entry:** `/admin/overview`

**Steps:**
1. Scan executive summary → `/admin/overview`
2. Triage critical alerts → `/admin/alerts` (escalation: `/admin/health`)
3. Process pending approvals → `/admin/approvals`
4. Check incidents → `/admin/health/incidents` (escalation: `/admin/support`)
5. Confirm release is unblocked → `/admin/releases/launch-readiness`

**Metrics:** open critical alerts, approvals pending > 1h, active incidents, release blockers, AI runtime red flags.

---

## 2. Weekly Strategic Review (`weekly`)

**Goal:** Is the system improving or drifting?

**Entry:** `/admin/overview/generated-truth`

**Steps:**
1. Review generated truth manifests
2. Inspect AI quality and recommendation usefulness
3. Check integration health trends
4. Compare launch claims vs evidence
5. Review cost-to-value

**Metrics:** advisor recommendation acceptance rate, provider outage minutes, launch honesty score delta, cost per receipt, performance budget violations.

---

## 3. Owner Support (`support`)

**Goal:** Help a specific environment / user and fix a problem fast.

**Entry:** `/admin/environments`

**Steps:**
1. Look up environment / user
2. Inspect device & session state
3. Inspect integration state
4. Inspect workflow status
5. Open support case / replay
6. Run recovery action

**Metrics:** open support cases, stuck workflows, environments needing repair, active diagnostic bundles.

---

## 4. Release Readiness (`release`)

**Goal:** Can we ship safely?

**Entry:** `/admin/releases`

**Steps:**
1. Review release overview
2. Inspect launch blockers
3. Confirm parity status
4. Confirm truth conformance
5. Verify deployment rings
6. Confirm rollback ready

**Metrics:** blocked release count, ring promotion eligibility, rollback readiness score, appliance build health, mobile release readiness.

---

## 5. Trust & Safety (`trust-safety`)

**Goal:** Is the system operating within policy and trust?

**Entry:** `/admin/trust-security`

**Steps:**
1. Review approval volume & anomalies
2. Inspect policy drift
3. Inspect proof gaps
4. Inspect connector permissions
5. Inspect sensitive action integrity
6. Open audit trail

**Metrics:** approvals over auto threshold, policy drift events, proof gap count, trust state anomalies, outbound communication violations.

---

## Enforcement

- `scripts/architecture/checks/check-owner-workflow-map.ts` — verifies every workflow entry resolves to a known domain hub.
- `tests/e2e/owner-workflows.spec.ts` (Phase 7) — verifies each workflow's steps actually navigate.
