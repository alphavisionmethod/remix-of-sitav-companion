# SITA OS — ESXi Smoke + TPM Attestation Provisioning Runbook

**Owner:** release-team
**Phase:** 15.2 — Appliance Truthfulness Closure
**Status target:** `appliance-claims-truthful` readiness item → `ready`

This runbook is the only outstanding step required to flip the appliance
truthfulness item from `partial` to `ready`. All scaffolding (OVA build,
OVF template, capability matrix, runtime contract, verifier) lives in code;
only real ESXi hardware and a TPM 2.0 chip can't.

---

## 1. ESXi / vSphere Smoke Test

### 1.1 Provision

1. Stand up an **ESXi 7.0+** host (or a `nested-esxi` VM in vCenter).
2. Provision a service account with **VirtualMachine.Inventory.Create** +
   **Datastore.AllocateSpace** + **Network.Assign** permissions.
3. Identify a datastore with ≥40 GB free and a port group with DHCP.

### 1.2 Configure release env

```bash
export ESXI_HOST="esxi-01.lab.local"
export ESXI_USERNAME="releases@vsphere.local"
export ESXI_PASSWORD="••••••••"
export ESXI_DATASTORE="datastore1"
export ESXI_NETWORK="VM Network"
```

### 1.3 Build + import smoke

```bash
# Build a fresh OVA (artifact lands in dist/sita-os.ova).
./scripts/release/vmware/build-ova.sh

# Import via ovftool (requires VMware OVF Tool 4.5+).
ovftool \
  --acceptAllEulas \
  --datastore="$ESXI_DATASTORE" \
  --network="$ESXI_NETWORK" \
  --diskMode=thin \
  --powerOn \
  dist/sita-os.ova \
  "vi://${ESXI_USERNAME}:${ESXI_PASSWORD}@${ESXI_HOST}/"
```

### 1.4 Verify boot

After power-on, wait 5 min then probe the VM IP:

```bash
curl -sf http://<vm-ip>/health   # expect 200 + JSON {"status":"ok"}
curl -sf http://<vm-ip>:8080/    # expect 200 (web SPA)
```

`first-boot.sh` should have completed all 12 phases. Check:

```bash
ssh sita@<vm-ip> 'systemctl is-active sita-os.service sita-ota.timer sita-backup.timer'
ssh sita@<vm-ip> 'journalctl -u sita-first-boot --no-pager | tail -50'
```

All three units must be `active`.

---

## 2. TPM 2.0 Attestation

### 2.1 Provision

1. Confirm host hardware ships with a **TPM 2.0** chip (BIOS/UEFI setting).
2. In ESXi VM hardware: **Add → Trusted Platform Module**, set EFI firmware,
   enable Secure Boot.
3. Install attestation utilities in the appliance image:

```bash
apt-get install -y tpm2-tools tpm2-abrmd
```

### 2.2 Configure env

```bash
export TPM_DEVICE_PATH="/dev/tpmrm0"
export TPM_PCR_BANK="sha256"
```

### 2.3 Smoke

```bash
tpm2_pcrread "${TPM_PCR_BANK}:0,1,2,3,4,5,6,7"
tpm2_quote -c 0x81010001 -l "${TPM_PCR_BANK}:0,1,2,3,4,5,6,7" \
           -m quote.bin -s sig.bin -o pcrs.bin
```

A successful quote with non-zero PCR values demonstrates real attestation.
At that point the `tpm-attestation` capability can move from
`roadmapCapabilities` → `honestCapabilities` in
`src/lib/runtime/appliance/appliance-runtime-contract.ts`.

---

## 3. Verify in CI

```bash
node --loader ts-node/esm scripts/release/vmware/verify-esxi-readiness.ts
cat generated/appliance-esxi-status.json
```

When `summary.overallStatus === "ready"` the
`check-appliance-deployability` gate flips `appliance-claims-truthful`
from `partial` → `ready` automatically.

---

## 4. Rollback

- **OVA import fails:** confirm `ovftool` version ≥ 4.5; check ESXi free space;
  re-run with `--diskMode=thick` if thin provisioning denied.
- **First-boot stalls:** SSH in and `journalctl -u sita-first-boot -f`. The
  script is idempotent — `systemctl restart sita-first-boot` is safe.
- **TPM quote fails:** verify `tpm2_getcap properties-fixed | grep TPM2_PT_FAMILY`
  reports `2.0`; re-flash firmware if `1.2`.
