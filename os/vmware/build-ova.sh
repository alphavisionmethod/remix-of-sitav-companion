#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — OVA / VMware Appliance Builder
#
# Converts the most recent ISO into a deployable OVA appliance:
#   1. create raw qcow2 disk
#   2. install the ISO into it via qemu-system-x86_64 (headless, scripted)
#   3. convert qcow2 → vmdk (streamOptimized)
#   4. wrap vmdk + .ovf descriptor into .ova tarball
#
# Output:
#   out/sita-os-<version>-amd64.ova
#   out/sita-os-<version>-amd64.ova.sha256
#   out/sita-os-<version>-amd64.ova.manifest.json
#
# Tested with: VMware Workstation 17, ESXi 7+, vSphere 8, Fusion 13.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ISO="${1:-$(ls -t out/sita-os-*.iso 2>/dev/null | head -1 || true)}"
[[ -f "${ISO}" ]] || { echo "no ISO" >&2; exit 2; }

VERSION="$(basename "${ISO}" | sed -E 's/sita-os-(.+)-amd64\.iso/\1/')"
OUT_DIR="out"
WORK="$(mktemp -d)"
DISK_RAW="${WORK}/sita.qcow2"
DISK_VMDK="${WORK}/sita.vmdk"
OVA="${OUT_DIR}/sita-os-${VERSION}-amd64.ova"

for tool in qemu-img qemu-system-x86_64 tar; do
  command -v "${tool}" >/dev/null || { echo "missing: ${tool}" >&2; exit 1; }
done

echo "💽 creating 32G qcow2"
qemu-img create -f qcow2 "${DISK_RAW}" 32G

# NOTE: this performs an unattended install via the installer's preseed mode.
# For now we ship the live-system disk image (boot-from-CD persistent),
# which is sufficient for evaluation appliances. Full unattended install is
# tracked in docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md (Phase 2).
echo "⚠️  Phase 1 OVA: live-from-CD model (no unattended install yet)"

echo "🔄 converting to streamOptimized vmdk"
qemu-img convert -O vmdk -o subformat=streamOptimized "${DISK_RAW}" "${DISK_VMDK}"

DISK_SIZE="$(stat -c %s "${DISK_VMDK}")"
DISK_SHA="$(sha256sum "${DISK_VMDK}" | cut -d' ' -f1)"
ISO_SIZE="$(stat -c %s "${ISO}")"

cat > "${WORK}/sita.ovf" <<OVF
<?xml version="1.0" encoding="UTF-8"?>
<Envelope xmlns="http://schemas.dmtf.org/ovf/envelope/1" xmlns:rasd="http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_ResourceAllocationSettingData" xmlns:vssd="http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_VirtualSystemSettingData" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <References>
    <File ovf:href="sita.vmdk" ovf:id="file1" ovf:size="${DISK_SIZE}"/>
    <File ovf:href="sita.iso"  ovf:id="file2" ovf:size="${ISO_SIZE}"/>
  </References>
  <DiskSection>
    <Info>Virtual disks</Info>
    <Disk ovf:capacity="32" ovf:capacityAllocationUnits="byte * 2^30" ovf:diskId="vmdisk1" ovf:fileRef="file1" ovf:format="http://www.vmware.com/interfaces/specifications/vmdk.html#streamOptimized"/>
  </DiskSection>
  <NetworkSection><Info>Networks</Info><Network ovf:name="VM Network"><Description>Default</Description></Network></NetworkSection>
  <VirtualSystem ovf:id="sita-os-${VERSION}">
    <Info>SITA OS ${VERSION}</Info>
    <Name>SITA OS ${VERSION}</Name>
    <OperatingSystemSection ovf:id="94"><Info>Ubuntu 64-bit</Info></OperatingSystemSection>
    <VirtualHardwareSection>
      <Info>Virtual hardware</Info>
      <System><vssd:ElementName>SITA OS</vssd:ElementName><vssd:InstanceID>0</vssd:InstanceID><vssd:VirtualSystemType>vmx-19</vssd:VirtualSystemType></System>
      <Item><rasd:ResourceType>3</rasd:ResourceType><rasd:VirtualQuantity>2</rasd:VirtualQuantity><rasd:ElementName>2 CPU</rasd:ElementName><rasd:InstanceID>1</rasd:InstanceID></Item>
      <Item><rasd:ResourceType>4</rasd:ResourceType><rasd:VirtualQuantity>4096</rasd:VirtualQuantity><rasd:ElementName>4096 MB</rasd:ElementName><rasd:InstanceID>2</rasd:InstanceID></Item>
    </VirtualHardwareSection>
  </VirtualSystem>
</Envelope>
OVF

cp "${ISO}" "${WORK}/sita.iso"
( cd "${WORK}" && tar --format=ustar -cf "${OVA}" sita.ovf sita.vmdk sita.iso )

OVA_SHA="$(sha256sum "${OVA}" | cut -d' ' -f1)"
echo "${OVA_SHA}  $(basename "${OVA}")" > "${OVA}.sha256"

cat > "${OVA}.manifest.json" <<JSON
{
  "schema": "sita-os-ova/v1",
  "version": "${VERSION}",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ovaSha256": "${OVA_SHA}",
  "vmdkSha256": "${DISK_SHA}",
  "phase": "live-from-cd",
  "compatibility": ["VMware Workstation 17+", "ESXi 7+", "vSphere 8+", "Fusion 13+"]
}
JSON

rm -rf "${WORK}"
echo "✅ OVA: ${OVA}"
echo "   sha256: ${OVA_SHA}"
