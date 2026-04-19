# Hardware Attestation Evidence Model

## Evidence record schema

Every real-hardware run produces:

| Field | Source | Notes |
|---|---|---|
| `run_id` | generated `hcr-<ts>-<rand>` | Unique per run |
| `device_class` | operator input | Required |
| `firmware` | operator input | OEM/firmware version string |
| `runner_id` | `$USER` or `--runner-id` | Person/CI executing |
| `run_at` | `now()` | UTC |
| `secure_boot_pass` | `mokutil --sb-state` | Real probe |
| `tpm_pass` | `verify-tpm-seal.sh` | Real script |
| `dm_verity_pass` | `verify-verity-metadata.sh` | Real script |
| `ab_rollback_pass` | `rollback-to-previous.sh --dry-run` | Real script |
| `recovery_pass` | `recovery-status.sh` | Real script |
| `attestation_quote_b64` | base64(probe summary + ts) | Tamper-evident |
| `log_refs` | JSONB pointer to `/tmp/*.log` | Diagnostic |

## Storage locations

- **Durable file**: `generated/hardware-and-operator-closure/runs/<run_id>.json`
- **Queryable DB**: `public.hardware_certification_runs` (admin RLS, realtime ALTER PUBLICATION)
- **Aggregated**: `hardware-proof-status.json` + `hardware-certification-status.json`

## Freshness policy

- Window: 30 days per device class
- After window expires: matrix row marked `stale`, certification status drops to `pending`
- `check-attestation-evidence-freshness.ts` enforces the window
