# Admin Operator Usability Matrix

Every domain × every criterion. The validator (`check-admin-operator-coherence.ts`) fails if any criterion is left unclassified or if a domain has no actionable surface or no registry binding.

## Criteria

1. `registryBacked` — backed by `admin-route-registry` entry
2. `actionable` — at least one operator action (not just informational)
3. `coherent` — domain scope clear, no overlap with siblings
4. `stressUsable` — usable under incident pressure
5. `lowCognitiveLoad` — primary path within 1–2 clicks
6. `remediationDirect` — issues link directly to fix path
7. `duplicationFree` — no duplicate boards
8. `primaryActionsClear` — top action(s) visually distinct
9. `diagnosticsLinked` — drill-down to logs/evidence

## Matrix

| Domain | reg | act | coh | str | cog | rem | dup | act* | diag | Verdict |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| overview        | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| alerts          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| approvals       | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| environments    | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| ai-runtime      | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| integrations    | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| trust-security  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| health          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| releases        | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| verification    | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| config          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |
| support         | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | operator-ready |

12/12 operator-ready. Status JSON is the binding contract for the validator.
