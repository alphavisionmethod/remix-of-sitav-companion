

# Fix Architecture Reports — Flagship Loop Key Mismatch

## Problem

The generated architecture report documents (`FINAL_ARQ_REPORT_SITA_OS_v5.md` and `ARCHITECTURE_STATUS_SITA_OS_v5.md`) contain incorrect flagship loop keys using underscores instead of hyphens, and using prompt-spec names instead of actual code names:

| In Report (WRONG) | In Code (CORRECT) |
|---|---|
| `auth_dashboard_pulse` | `sign-in-dashboard-pulse` |
| `files_ai_assist` | `files-ai-assist` |
| `boardroom_summary_decision` | `boardroom-summary-decision` |
| `connected_services_sync_insight` | `connected-services-sync` |
| `admin_truth_recommendation_approval` | `admin-truth-recommendation-approval` |

Display names also differ from code (`title` field). The reports need to reflect the **actual codebase values** exactly.

## Fix

### 1. Regenerate `FINAL_ARQ_REPORT_SITA_OS_v5.md`
Update Section 8 (Flagship Loop Registry) table to use the correct loop keys and titles from `flagship-loop-service.ts`:

| Loop Key | Display Name | Launch Importance | Status |
|---|---|---|---|
| `sign-in-dashboard-pulse` | Sign In → Dashboard → Pulse | launch_critical | active |
| `files-ai-assist` | Files → AI Assistance → Results | launch_critical | needs_proof |
| `boardroom-summary-decision` | Boardroom → Synthesis → Decision | launch_critical | needs_polish |
| `connected-services-sync` | Connected Services → Connect → Health | important_to_launch | active |
| `admin-truth-recommendation-approval` | Admin Truth → Recommendation → Approval → Execute | operator_critical | active |

### 2. Update `ARCHITECTURE_STATUS_SITA_OS_v5.md`
Add a Flagship Loops section (currently missing from this doc) with the correct data.

### 3. Regenerate `SITA_OS_ARCHITECTURE_AUDIT_v2.xlsx`
Update any sheets referencing flagship loop keys to use the correct hyphenated keys.

### Files Modified
| File | Action |
|---|---|
| `/mnt/documents/FINAL_ARQ_REPORT_SITA_OS_v5.md` | Fix Section 8 loop keys + titles |
| `/mnt/documents/ARCHITECTURE_STATUS_SITA_OS_v5.md` | Add flagship section with correct data |
| `/mnt/documents/SITA_OS_ARCHITECTURE_AUDIT_v2.xlsx` | Regenerate with correct loop keys |

