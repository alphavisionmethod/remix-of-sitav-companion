#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Metrics Agent
# Reports system metrics to the SITA cloud every 5 minutes.
# Installed as a systemd timer during first-boot.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

CONFIG_FILE="/opt/sita/ota-config.json"
LOG_FILE="/var/log/sita-metrics.log"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" >> "$LOG_FILE"; }

if [ ! -f "$CONFIG_FILE" ]; then
  log "No OTA config found. Skipping metrics report."
  exit 0
fi

SUPABASE_URL=$(jq -r '.supabase_url // empty' "$CONFIG_FILE")
ANON_KEY=$(jq -r '.anon_key // empty' "$CONFIG_FILE")
DEVICE_ID=$(jq -r '.device_id // empty' "$CONFIG_FILE")
USER_ID=$(jq -r '.user_id // "system"' "$CONFIG_FILE")

if [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ] || [ -z "$DEVICE_ID" ]; then
  log "Missing config values. Skipping."
  exit 0
fi

# Collect metrics
CPU_PERCENT=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' 2>/dev/null || echo "0")
RAM_PERCENT=$(free | awk '/Mem:/{printf "%.1f", $3/$2*100}' 2>/dev/null || echo "0")
DISK_PERCENT=$(df / | awk 'NR==2{print $5}' | tr -d '%' 2>/dev/null || echo "0")
UPTIME_SECONDS=$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo "0")
HOSTNAME=$(hostname 2>/dev/null || echo "unknown")

# Docker container health
DOCKER_CONTAINERS=$(docker ps --format '{"name":"{{.Names}}","status":"{{.Status}}","image":"{{.Image}}"}' 2>/dev/null | jq -s '.' 2>/dev/null || echo "[]")

# TLS cert expiry
TLS_EXPIRY_DAYS=0
if [ -f /opt/sita/certs/sita.crt ]; then
  EXPIRY=$(openssl x509 -enddate -noout -in /opt/sita/certs/sita.crt 2>/dev/null | cut -d= -f2)
  if [ -n "$EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    TLS_EXPIRY_DAYS=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  fi
fi

# Backup age
BACKUP_AGE_HOURS=999
LAST_BACKUP=$(ls -t /opt/sita/backups/*.tar.gz 2>/dev/null | head -1)
if [ -n "$LAST_BACKUP" ]; then
  BACKUP_EPOCH=$(stat -c %Y "$LAST_BACKUP" 2>/dev/null || echo "0")
  NOW_EPOCH=$(date +%s)
  BACKUP_AGE_HOURS=$(( (NOW_EPOCH - BACKUP_EPOCH) / 3600 ))
fi

# Send to cloud
PAYLOAD=$(cat <<EOF
{
  "device_id": "${DEVICE_ID}",
  "user_id": "${USER_ID}",
  "hostname": "${HOSTNAME}",
  "cpu_percent": ${CPU_PERCENT},
  "ram_percent": ${RAM_PERCENT},
  "disk_percent": ${DISK_PERCENT},
  "uptime_seconds": ${UPTIME_SECONDS},
  "docker_containers": ${DOCKER_CONTAINERS},
  "tls_expiry_days": ${TLS_EXPIRY_DAYS},
  "backup_age_hours": ${BACKUP_AGE_HOURS}
}
EOF
)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${SUPABASE_URL}/functions/v1/os-status" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "${PAYLOAD}" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  log "Metrics reported successfully (CPU: ${CPU_PERCENT}%, RAM: ${RAM_PERCENT}%, Disk: ${DISK_PERCENT}%)"
else
  log "Metrics report failed (HTTP ${HTTP_CODE})"
fi
