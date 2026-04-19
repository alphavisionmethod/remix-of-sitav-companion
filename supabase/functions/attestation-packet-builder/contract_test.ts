import { runContractSuite } from "../_shared/contract-test-template.ts";
runContractSuite({
  fn: "attestation-packet-builder",
  validBody: { scope: "contract-test", dry_run: true },
});
