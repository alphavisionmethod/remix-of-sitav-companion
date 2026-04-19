# Trust Copy Alignment Model

**Generated:** 2026-04-19

## Canonical agency phrases (`microcopy.ts::aiAgency`)

| Key | Phrase | Use |
|---|---|---|
| `proposed` | "AI proposed" | Pre-approval state |
| `awaitingApproval` | "Awaiting your approval" | Queue state |
| `appliedByYou` | "Applied with your approval" | Post-approval state |
| `suggested` | "AI suggested" | Recommendation state |
| `executedByYou` | "You executed (AI assisted)" | Receipt state |

## Forbidden phrases (lockdown)

| Forbidden | Why | Canonical replacement |
|---|---|---|
| "AI autonomously …" | Implies agency without owner approval | "AI proposed; awaiting your approval" |
| "Workforce is acting" | Implies independent action | "Workforce drafted; pending review" |
| "Agent decided" | Implies decision authority | "Agent recommended" |
| "System chose" | Implies system agency | "System proposed" |

## Enforcement

- `check-agency-wording-lockdown.ts` — BLOCK on any forbidden phrase in `src/**`
- `check-trust-ladder-microcopy.ts` (pre-existing) — verifies microcopy.ts contains canonical keys

## Honest limits

- Server-rendered strings (edge functions) not yet scanned — separate WARN-tier gate
- Translations (i18n) not yet covered — single-locale enforcement only
