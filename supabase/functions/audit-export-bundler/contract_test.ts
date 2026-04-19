import { runContractSuite } from "../_shared/contract-test-template.ts";
runContractSuite({
  fn: "audit-export-bundler",
  validBody: { scope: "contract-test", from: "2026-04-01T00:00:00Z", to: "2026-04-19T00:00:00Z", dry_run: true },
});
