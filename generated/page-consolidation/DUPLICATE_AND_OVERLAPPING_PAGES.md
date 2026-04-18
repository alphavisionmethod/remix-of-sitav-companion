# Duplicate & Overlapping Pages
> Generated: 2026-04-18T11:46:12.783Z
> Source: `scripts/architecture/audits/page-consolidation-audit.ts`
> Status: **read-only audit** (Phase 0). Zero code/route changes.

**18 duplication groups detected.**

These are the surfaces that Phase 2 (redirects) and Phase 5 (view migration) must resolve.

## 1. ApprovalsHome _(approvals)_

- **Reason:** Curated merge target.
- **Canonical:** `ApprovalsHome`
- **Duplicates / aliases:** `AIApprovalDesk`, `HQApprovalQueue`

## 2. AIG07LaunchTruth _(ai-runtime)_

- **Reason:** Curated merge target.
- **Canonical:** `AIG07LaunchTruth`
- **Duplicates / aliases:** `AIG06LaunchTruth`

## 3. OverviewHome _(overview)_

- **Reason:** Curated merge target.
- **Canonical:** `OverviewHome`
- **Duplicates / aliases:** `AdminDashboard`, `AdminOperationsHub`, `MissionControlHome`

## 4. HealthHome _(health)_

- **Reason:** Curated merge target.
- **Canonical:** `HealthHome`
- **Duplicates / aliases:** `SystemHealthDashboard`, `MCSystemHealth`

## 5. AIRuntimeHome _(ai-runtime)_

- **Reason:** Curated merge target.
- **Canonical:** `AIRuntimeHome`
- **Duplicates / aliases:** `MCAIControl`

## 6. AIT05CostEfficiency _(ai-runtime)_

- **Reason:** Curated merge target.
- **Canonical:** `AIT05CostEfficiency`
- **Duplicates / aliases:** `MCCostsAIBudgets`

## 7. ReleasesHome _(releases)_

- **Reason:** Curated merge target.
- **Canonical:** `ReleasesHome`
- **Duplicates / aliases:** `MCReleasesUpdates`

## 8. TrustSecurityHome _(trust-security)_

- **Reason:** Curated merge target.
- **Canonical:** `TrustSecurityHome`
- **Duplicates / aliases:** `MCTrustSecurity`

## 9. UserManagement _(environments)_

- **Reason:** Curated merge target.
- **Canonical:** `UserManagement`
- **Duplicates / aliases:** `MCUsersCenter`

## 10. /admin/approvals

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/approvals`
- **Duplicates / aliases:** `AIApprovalDesk`, `HQApprovalQueue`

## 11. /admin/ai-runtime/launch-truth

- **Reason:** 3 admin pages converge on the same target route.
- **Canonical:** `/admin/ai-runtime/launch-truth`
- **Duplicates / aliases:** `AIG06LaunchTruth`, `AIG07LaunchTruth`, `AIT08LaunchTruthPage`

## 12. /admin/overview

- **Reason:** 3 admin pages converge on the same target route.
- **Canonical:** `/admin/overview`
- **Duplicates / aliases:** `AdminDashboard`, `AdminOperationsHub`, `MissionControlHome`

## 13. /admin/releases/deployability

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/releases/deployability`
- **Duplicates / aliases:** `DSK01DeployabilityCenter`, `WEB01DeployabilityCenter`

## 14. /admin/verification/launch-honesty

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/verification/launch-honesty`
- **Duplicates / aliases:** `LaunchHonestyBoard`, `LaunchHonestyBoard`

## 15. /admin/verification/ock-replacement-program

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/verification/ock-replacement-program`
- **Duplicates / aliases:** `MockReplacementProgram`, `MockReplacementProgram`

## 16. /admin/verification/eality-classification-matrix

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/verification/eality-classification-matrix`
- **Duplicates / aliases:** `RealityClassificationMatrix`, `RealityClassificationMatrix`

## 17. /admin/health

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/health`
- **Duplicates / aliases:** `SystemHealthDashboard`, `MCSystemHealth`

## 18. /admin/environments/users

- **Reason:** 2 admin pages converge on the same target route.
- **Canonical:** `/admin/environments/users`
- **Duplicates / aliases:** `UserManagement`, `MCUsersCenter`

