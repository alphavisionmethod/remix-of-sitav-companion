import { runContractSuite } from "../_shared/contract-test-template.ts";
runContractSuite({
  fn: "release-artifact-signer",
  validBody: { artifact_id: "contract-test-artifact", dry_run: true },
});
