import { runContractSuite } from "../_shared/contract-test-template.ts";
runContractSuite({
  fn: "internal-agent-execute-action",
  validBody: { action_type: "noop", dry_run: true, justification: "contract-test" },
});
