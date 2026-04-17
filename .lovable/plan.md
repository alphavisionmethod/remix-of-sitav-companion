

## Re-Audit Verdict: Checklists 12 + 13 — 3 Real Wiring Gaps

CI Gate 30 passes (edge=6, ui=7) and Phase 19 service code is on disk, but truth-check against routing + sign-in flow shows MFA and Passkey are **physically unreachable** to users. That fails item 12.4 and 12.6 ("works **if claimed**"). The audit JSON is overstated.

### Gaps

| # | Gap | Evidence |
|---|---|---|
| **12.4 / 12.6** | MFA and Passkey pages have **no routes** | `MFAEnrollment.tsx` + `PasskeyManagement.tsx` exist but `grep "MFAEnrollment\|PasskeyManagement"` in `src/routes/` returns zero. No `/settings/mfa` or `/settings/passkey` route. Users cannot reach enrollment |
| **12.4** | MFA challenge **not enforced at sign-in** | `AuthContext.signIn` never calls `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`. After enrolling, users still log in with AAL1 — TOTP factor is never challenged. `MFAChallenge` component is orphaned |
| **12.4 / 12.6** | No discovery surface | Settings hub (`SettingsPage.tsx`) has no MFA/Passkey tile; nothing links the new pages |

Everything in Checklist 13 is genuinely ready (CI Gate 30 enforced, ≥6+7 callers, compensation registry in place, tests passing).

---

## Phase 19.1 — Auth UX Wiring Closure (~5 files, ~120 LOC)

### 19.1.A — Register routes
**Edit** `src/routes/os-routes.tsx`
```tsx
const MFAEnrollment = lazy(() => import("@/pages/settings/MFAEnrollment"));
const PasskeyManagement = lazy(() => import("@/pages/settings/PasskeyManagement"));
// inside <Route> tree:
<Route path="/settings/mfa" element={<MFAEnrollment />} />
<Route path="/settings/passkey" element={<PasskeyManagement />} />
```

### 19.1.B — Wire MFA challenge into sign-in
**Edit** `src/contexts/AuthContext.tsx`
- Add `requiresMFA: boolean` + `mfaFactorId: string | null` to context
- After `signInWithPassword` success, call `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`. If `nextLevel === "aal2"` and `currentLevel === "aal1"`, list factors and set `requiresMFA = true` + factorId of first TOTP
- Expose `verifyMFA(code)` that calls `supabase.auth.mfa.challengeAndVerify`

**Edit** `src/pages/Login.tsx`
- When `requiresMFA` flips true, render `<MFAChallenge factorId={mfaFactorId} onSuccess={…} onCancel={signOut} />` instead of the password form

### 19.1.C — Settings hub discovery
**Edit** `src/pages/SettingsPage.tsx` (or the canonical Security section)
- Add two tiles: "Two-factor authentication → /settings/mfa" and "Passkeys → /settings/passkey", each with status pill (`Enrolled` / `Not set up`) sourced from `MFAService.listFactors()` + `WebAuthnService.listPasskeys()`

### 19.1.D — Refresh audit artifact
- Re-emit `generated/auth-policy-reality-report.json` with these wiring evidences explicitly cited under `mfa.evidence` and `passkey_webauthn.evidence`
- Bump `auth-policy-wiring` sub-section: `routes_registered: true`, `signin_challenge_wired: true`, `settings_hub_links: true`

### 19.1.E — Optional: extend CI Gate 30 with route check
Add a one-shot assertion: every page exported under `src/pages/settings/MFAEnrollment.tsx` and `…/PasskeyManagement.tsx` is imported by at least one file under `src/routes/`. Errors otherwise. Keeps regressions out.

### Files

| File | Change |
|---|---|
| `src/routes/os-routes.tsx` | +2 lazy imports + 2 `<Route>` |
| `src/contexts/AuthContext.tsx` | AAL2 detection + verifyMFA |
| `src/pages/Login.tsx` | Render `MFAChallenge` when `requiresMFA` |
| `src/pages/SettingsPage.tsx` | 2 security tiles with live status |
| `scripts/architecture/checks/check-policy-resolver-coverage.ts` | +route reachability check |
| `generated/auth-policy-reality-report.json` | Refresh evidence |

### Acceptance

- Visiting `/settings/mfa` and `/settings/passkey` renders the pages (no 404)
- After enrolling TOTP, signing out and back in surfaces the MFAChallenge step before completing the session
- Settings page shows "Enrolled" / "Not set up" pills that reflect real backend state
- CI Gate 30 still green; new route reachability assertion green
- Checklists **12 truthfully 11/11** and **13 truthfully 11/11** — every claimed feature is reachable, enforced, and observable

