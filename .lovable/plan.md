

## Reality check

User wants the legacy `src/lib/policies/` claim resolved **in the real project**, not in docs. Per memory `architecture/structural-verified-state`: *"src/lib/policies/ (only src/lib/policy/ exists)"* — already verified absent.

I need to confirm three things before proposing work:
1. `src/lib/policies/` does not exist on disk
2. `src/lib/policy/` does exist (canonical)
3. There is a CI gate that asserts the absence (so it can never be re-introduced)

If a gate already asserts this, the "real project" is 100% done and the only deliverable is verification output. If the gate does not exist, we add one — that's the actual deployment-readiness work.
