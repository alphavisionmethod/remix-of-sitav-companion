#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Hardware Preflight (Phase 6)
#
# Runs from the live ISO before installation. Emits a JSON compatibility
# report consumed by the Electron installer and persisted to the proof
# chain as evidence the device met minimum requirements at install time.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT="${1:-/run/sita-preflight.json}"

mem_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
mem_gb=$(( mem_kb / 1024 / 1024 ))
disk_gb=$(lsblk -bdn -o SIZE | sort -n | tail -1 | awk '{printf "%d", $1/1024/1024/1024}')
cpu_cores=$(nproc)
cpu_model=$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | sed 's/^ //')

uefi=false; [ -d /sys/firmware/efi ] && uefi=true
secureboot=unknown
if command -v mokutil >/dev/null 2>&1; then
  if mokutil --sb-state 2>/dev/null | grep -qi 'enabled'; then secureboot=enabled
  else secureboot=disabled; fi
fi

tpm=absent
if [ -e /dev/tpm0 ] || [ -e /dev/tpmrm0 ]; then
  tpm=$(cat /sys/class/tpm/tpm0/tpm_version_major 2>/dev/null || echo "2")
fi

gpu=$(lspci -mm 2>/dev/null | awk -F\" '/VGA|3D|Display/ {print $4 " " $6; exit}')

# Virt detection
virt="bare-metal"
if command -v systemd-detect-virt >/dev/null 2>&1; then
  v=$(systemd-detect-virt 2>/dev/null || echo none)
  [ "${v}" != "none" ] && virt="${v}"
fi

# Minimum requirements
min_mem=4
min_disk=16
meets=true
reasons=()
[ "${mem_gb}"   -lt "${min_mem}"  ] && { meets=false; reasons+=("\"ram_below_minimum_${mem_gb}GB\""); }
[ "${disk_gb}"  -lt "${min_disk}" ] && { meets=false; reasons+=("\"disk_below_minimum_${disk_gb}GB\""); }
[ "${uefi}"     = "false"         ] && { meets=false; reasons+=("\"bios_not_uefi\""); }

reasons_json=$(IFS=,; echo "${reasons[*]:-}")

cat > "${OUT}" <<EOF
{
  "schema_version": 1,
  "checked_at": "$(date -Iseconds)",
  "cpu":     { "cores": ${cpu_cores}, "model": "${cpu_model}" },
  "memory":  { "total_gb": ${mem_gb}, "minimum_gb": ${min_mem} },
  "disk":    { "largest_gb": ${disk_gb}, "minimum_gb": ${min_disk} },
  "firmware":{ "uefi": ${uefi}, "secure_boot": "${secureboot}" },
  "tpm":     { "present": $([ "${tpm}" != "absent" ] && echo true || echo false), "version": "${tpm}" },
  "gpu":     "${gpu}",
  "virtualization": "${virt}",
  "meets_minimum": ${meets},
  "blocking_reasons": [${reasons_json}]
}
EOF

cat "${OUT}"
