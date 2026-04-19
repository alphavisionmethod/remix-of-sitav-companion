# Per-User AI Budget Load Test Runs

This directory holds receipt artifacts from real load-test runs of `scripts/load-test/budget-load-test.sh`.

Each run drops a JSON file with this shape:

```json
{
  "runId": "...",
  "startedAt": "...",
  "completedAt": "...",
  "perUserCalls": 200,
  "denialsObserved": 142,
  "downgradesObserved": 31,
  "allowsObserved": 27,
  "ceilingHonored": true,
  "receiptCount": 200
}
```

The `check-ai-budget-hard-stop.ts` gate counts these files. With zero runs the gate emits a WARN
("hard-stop logic wired; awaiting first real load-test execution") rather than fake-green.
