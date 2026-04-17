

## Re-Audit: Appliance Checklist (12/12) — Real Gaps Found

The `appliance-deployability-report.json` currently claims `ok: true, warningCount: 0, ready: 11/12`. **This is partially false against disk truth.** Three real gaps:

### Disk vs. report mismatch

| Truth | Report says | Disk says |
|---|---|---|
| `sita-ota-agent.sh` | `executable: true` ✅ | mode `0644` ❌ — `sita-ota.service` ExecStart will fail |
| `sita-metrics-agent.sh` | not checked | mode `0644` ❌ — diagnostics agent (item 9) won't run |
| `sita-metrics.service` / `sita-metrics.timer` | not checked, not in gate | **do not exist** ❌ — first-boot enables them but units are missing |

The first-boot script tries to `systemctl enable --now sita-metrics.timer` but the unit file is absent. Item 9 (Support diagnostics) is therefore **not actually wired**.

### Phase 15.3 — Appliance Truth Closure (5 files)

**15.3.1 — Fix executable bits** (2 files)
- `chmod +x scripts/release/iso/sita-ota-agent.sh`
- `chmod +x scripts/release/iso/sita-metrics-agent.sh`

**15.3.2 — Create missing systemd units** (2 files)
- `scripts/release/iso/sita-metrics.service` — oneshot, ExecStart=`/opt/sita/sita-metrics-agent.sh`, journal logging, hardened (`ProtectSystem=strict`, `ReadWritePaths=/opt/sita /var/log`)
- `scripts/release/iso/sita-metrics.timer` — `OnBootSec=2min`, `OnUnitActiveSec=5min`, `RandomizedDelaySec=1min`, `Persistent=true`

**15.3.3 — Tighten the CI gate** (1 file)
- `scripts/architecture/checks/check-appliance-deployability.ts`:
  - Add `sita-metrics-agent.sh` to `runtimeScripts` list
  - Add `sita-metrics.service` + `sita-metrics.timer` to `systemdUnits` list (now 7 total)
  - Promote "script not executable" from `warning` to `error` (deployment-blocking — systemd ExecStart fails silently otherwise)

**15.3.4 — Regenerate report**
- `generated/appliance-deployability-report.json` updated to reflect true 7/7 systemd, 4/4 runtime scripts executable, all green.

### Acceptance

- All four runtime scripts (`first-boot`, `ota-agent`, `backup`, `metrics-agent`) mode `0755`.
- 7 systemd units present (was 5): adds `sita-metrics.{service,timer}`.
- First-boot's `systemctl enable --now sita-metrics.timer` actually succeeds.
- Item 9 "Support diagnostics" backed by working unit, not just a script.
- CI gate fails (error, not warning) if any runtime script loses its executable bit in future.
- Report shows `ok: true, errorCount: 0, warningCount: 0, ready: 12/12` — **truthful this time**.

### Files

| File | Change |
|---|---|
| `scripts/release/iso/sita-ota-agent.sh` | `chmod +x` |
| `scripts/release/iso/sita-metrics-agent.sh` | `chmod +x` |
| `scripts/release/iso/sita-metrics.service` | Create |
| `scripts/release/iso/sita-metrics.timer` | Create |
| `scripts/architecture/checks/check-appliance-deployability.ts` | Add metrics unit/script + promote exec warnings to errors |
| `generated/appliance-deployability-report.json` | Regenerate truthfully |

After this, the Appliance Checklist is **truthfully 12/12 ready** with the only outstanding work being external hardware (real ESXi smoke + TPM attestation), which the `verify-esxi-readiness.ts` verifier already auto-flips when env vars are present.

