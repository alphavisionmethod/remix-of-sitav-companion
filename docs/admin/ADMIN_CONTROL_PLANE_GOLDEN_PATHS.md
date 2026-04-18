# SITA Admin Control Plane — Golden Paths

> **Source of truth:** `src/lib/admin/admin-workflow-registry.ts`
> **Shell:** `src/components/admin/shells/AdminControlPlaneShell.tsx`

The Admin Control Plane is organized around **8 canonical operator workflows**.
This is the IA layer above the existing 12 admin domains. Every operator
journey starts from one of these workflows.

---

## 1. Incident Triage

**When:** Something is on fire.
**Enter at:** `/admin/observability/incidents`
**Supporting:** `/admin/alerts`, `/admin/health`, `/admin/approvals`, `/admin/environments`
**Permission:** `audit.view`

**Path:**
1. Open Alerts → identify highest-severity active alert.
2. Pivot to Health → check service heartbeats, error rates.
3. If user-impacting → escalate via Approvals (incident response).
4. Capture support bundle: `sita-ops support-bundle`.
5. Coordinate fix in Environments.

---

## 2. Release Readiness

**When:** Deciding whether to ship.
**Enter at:** `/admin/release`
**Supporting:** `/admin/releases`, `/admin/verification`, `/admin/approvals`
**Permission:** `release.view`

**Path:**
1. Open Release Center → check `os-release-readiness-report.json` verdict.
2. Drill into any RED/YELLOW gate.
3. Cross-check Verification (truth/manifest drift).
4. Approve or hold via Approvals.
5. If hold → file an issue and notify owners.

---

## 3. Support Diagnostics

**When:** A customer is blocked.
**Enter at:** `/admin/support`
**Supporting:** `/admin/support/cases`, `/admin/health`, `/admin/environments`
**Permission:** `support.view`

**Path:**
1. Open Support → find active case.
2. Pull customer's support bundle.
3. Cross-reference Health for their device.
4. Apply repair via `sita-ops repair-*` or escalate.
5. Update case with receipt.

---

## 4. Truth & Verification

**When:** Confirming claims match reality before launch.
**Enter at:** `/admin/verification`
**Supporting:** `/admin/releases`, `/admin/config`
**Permission:** `verification.view`

**Path:**
1. Open Verification dashboards → check manifest drift.
2. Resolve any RED gate (run validators, update manifests).
3. Confirm release gate is clean before approving in Release Readiness.

---

## 5. Security & Kill-Switch

**When:** Privileged intervention needed (revoke, freeze, disable).
**Enter at:** `/admin/security`
**Supporting:** `/admin/trust-security`, `/admin/approvals`, `/admin/observability/audit`
**Permission:** `security.view`

**Path:**
1. Open Security → identify the kill-switch class needed.
2. Run dry-run (mandatory for `requires_dry_run` actions).
3. Submit confirmation with justification.
4. Verify via Audit log.

---

## 6. AI Governance

**When:** Managing AI cost, safety, fallbacks.
**Enter at:** `/admin/ai-runtime`
**Supporting:** `/admin/approvals`, `/admin/verification`
**Permission:** `ai.governance.view`

**Path:**
1. Open AI Runtime → check budget posture, fallback events, receipts.
2. Adjust capability routing if a model is degraded.
3. Approve high-confidence AI recommendations queued in Approvals.
4. Verify outcomes via receipt/proof chain.

---

## 7. Platform / Cloud Control

**When:** Backend service / connector / environment change.
**Enter at:** `/admin/integrations`
**Supporting:** `/admin/environments`, `/admin/config`
**Permission:** `platform.view`

**Path:**
1. Open Integrations → identify connector or service.
2. Make config change via Config (RLS-protected).
3. Verify rollout in Environments.
4. Capture audit event automatically.

---

## 8. User / Org Intervention

**When:** Operator-led action on a specific account/org.
**Enter at:** `/admin/users`
**Supporting:** `/admin/approvals`, `/admin/observability/audit`
**Permission:** `users.intervene`

**Path:**
1. Open Users → locate target account/org.
2. Confirm justification (mandatory).
3. Submit intervention via Approvals.
4. Verify audit trail records actor + reason.

---

## Notes

- These 8 workflows replace the previous "page museum" navigation **without deleting any pages**. The 12 admin domains remain reachable; they're just organized under the workflow that owns them.
- `getAdminWorkflowForRoute(pathname)` returns the active workflow for breadcrumbs and primary-nav highlighting.
- New admin features must declare which workflow they belong to in their PR.
