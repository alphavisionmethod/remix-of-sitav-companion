#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — First Boot Script
# Runs once after fresh install to load Docker images and
# start the full SITA OS stack with proper JWT generation,
# TLS, firewall, backup, and logrotate.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
DEPLOY_DIR="${SITA_DIR}/deploy"
IMAGES_DIR="${SITA_DIR}/images"
LOG_FILE="/var/log/sita-first-boot.log"
LOCK_FILE="/var/run/sita-first-boot.lock"
HEALTH_TIMEOUT=120
DEFAULT_PASSWORD_MARKER="change-me-to-a-secure-password"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

# ── Guard: run only once ──────────────────────────────────────
if [ -f "$LOCK_FILE" ]; then
  log "⚠ First-boot already running or completed. Exiting."
  exit 0
fi
touch "$LOCK_FILE"

log "═══════════════════════════════════════════════════════"
log "  SITA OS — First Boot Provisioning"
log "═══════════════════════════════════════════════════════"

# ── Step 1: Wait for Docker daemon ────────────────────────────
log "[1/12] Waiting for Docker daemon..."
for i in $(seq 1 60); do
  if docker info &>/dev/null; then
    log "  Docker is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    log "  ❌ Docker failed to start within 60s"
    exit 1
  fi
  sleep 2
done

# ── Step 2: Load pre-built Docker images ──────────────────────
log "[2/12] Loading pre-built Docker images..."
if [ -d "$IMAGES_DIR" ]; then
  for img in "$IMAGES_DIR"/*.tar.gz; do
    if [ -f "$img" ]; then
      log "  Loading $(basename "$img")..."
      docker load < "$img"
    fi
  done
  log "  ✅ All images loaded."
else
  log "  ⚠ No pre-built images found at $IMAGES_DIR — will pull from registry."
fi

# ── Step 3: Generate secrets — ENFORCE no defaults ────────────
log "[3/12] Generating secrets..."
ENV_FILE="${DEPLOY_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "${DEPLOY_DIR}/.env.example" ]; then
    cp "${DEPLOY_DIR}/.env.example" "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
fi

generate_secret() {
  openssl rand -base64 32 | tr -d '=/+' | head -c 48
}

# ── Generate POSTGRES_PASSWORD ────────────────────────────────
CURRENT_PG_PASS=$(grep -oP '^POSTGRES_PASSWORD=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_PG_PASS" ] || [ "$CURRENT_PG_PASS" = "$DEFAULT_PASSWORD_MARKER" ] || [ "$CURRENT_PG_PASS" = "sita-secure-pwd-change-me" ]; then
  NEW_PG_PASS="$(generate_secret)"
  if grep -q '^POSTGRES_PASSWORD=' "$ENV_FILE"; then
    sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${NEW_PG_PASS}|" "$ENV_FILE"
  else
    echo "POSTGRES_PASSWORD=${NEW_PG_PASS}" >> "$ENV_FILE"
  fi
  log "  ✅ POSTGRES_PASSWORD auto-generated"
fi

# ── Generate JWT_SECRET (256-bit minimum for HS256) ───────────
CURRENT_JWT=$(grep -oP '^JWT_SECRET=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_JWT" ] || echo "$CURRENT_JWT" | grep -qi "change-me"; then
  NEW_JWT="$(openssl rand -base64 48 | tr -d '=/+' | head -c 64)"
  if grep -q '^JWT_SECRET=' "$ENV_FILE"; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_JWT}|" "$ENV_FILE"
  else
    echo "JWT_SECRET=${NEW_JWT}" >> "$ENV_FILE"
  fi
  log "  ✅ JWT_SECRET auto-generated"
fi

# ── Generate proper signed JWTs for ANON_KEY and SERVICE_ROLE_KEY ──
# Supabase requires real signed JWTs, not random strings.
# These JWTs are signed with the JWT_SECRET using HS256.
JWT_SECRET=$(grep -oP '^JWT_SECRET=\K.*' "$ENV_FILE")

generate_supabase_jwt() {
  local role="$1"
  local iat=$(date +%s)
  local exp=$((iat + 157680000))  # 5 years

  local header=$(echo -n '{"alg":"HS256","typ":"JWT"}' | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  local payload=$(echo -n "{\"iss\":\"supabase\",\"ref\":\"sita-self-hosted\",\"role\":\"${role}\",\"iat\":${iat},\"exp\":${exp}}" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  local signature=$(echo -n "${header}.${payload}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

  echo "${header}.${payload}.${signature}"
}

# Generate SUPABASE_ANON_KEY if placeholder or missing
CURRENT_ANON=$(grep -oP '^SUPABASE_ANON_KEY=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_ANON" ] || echo "$CURRENT_ANON" | grep -qi "placeholder\|change-me"; then
  NEW_ANON=$(generate_supabase_jwt "anon")
  if grep -q '^SUPABASE_ANON_KEY=' "$ENV_FILE"; then
    sed -i "s|^SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=${NEW_ANON}|" "$ENV_FILE"
  else
    echo "SUPABASE_ANON_KEY=${NEW_ANON}" >> "$ENV_FILE"
  fi
  # Also set the frontend publishable key to the same anon key
  if grep -q '^VITE_SUPABASE_PUBLISHABLE_KEY=' "$ENV_FILE"; then
    sed -i "s|^VITE_SUPABASE_PUBLISHABLE_KEY=.*|VITE_SUPABASE_PUBLISHABLE_KEY=${NEW_ANON}|" "$ENV_FILE"
  else
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=${NEW_ANON}" >> "$ENV_FILE"
  fi
  log "  ✅ SUPABASE_ANON_KEY generated (signed JWT)"
fi

CURRENT_SERVICE=$(grep -oP '^SUPABASE_SERVICE_KEY=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_SERVICE" ] || echo "$CURRENT_SERVICE" | grep -qi "placeholder\|change-me"; then
  NEW_SERVICE=$(generate_supabase_jwt "service_role")
  if grep -q '^SUPABASE_SERVICE_KEY=' "$ENV_FILE"; then
    sed -i "s|^SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=${NEW_SERVICE}|" "$ENV_FILE"
  else
    echo "SUPABASE_SERVICE_KEY=${NEW_SERVICE}" >> "$ENV_FILE"
  fi
  log "  ✅ SUPABASE_SERVICE_KEY generated (signed JWT)"
fi

# Ensure NATS_URL is set
grep -q '^NATS_URL=' "$ENV_FILE" && true || echo "NATS_URL=nats://sita-nats:4222" >> "$ENV_FILE"

chmod 600 "$ENV_FILE"
log "  ✅ All secrets configured."

# ── Step 4: Fix authenticator role password ───────────────────
log "[4/12] Patching authenticator role password in DB init..."
ROLES_SQL="${DEPLOY_DIR}/db-init/00-roles.sql"
if [ -f "$ROLES_SQL" ]; then
  PG_PASS=$(grep -oP '^POSTGRES_PASSWORD=\K.*' "$ENV_FILE")
  sed -i "s|PASSWORD 'CHANGE_ME_IN_ENV'|PASSWORD '${PG_PASS}'|g" "$ROLES_SQL"
  log "  ✅ authenticator role password patched"
fi

# ── Step 5: Validate no default passwords remain ─────────────
log "[5/12] Validating secrets..."
FINAL_PG_PASS=$(grep -oP '^POSTGRES_PASSWORD=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$FINAL_PG_PASS" ] || [ "$FINAL_PG_PASS" = "$DEFAULT_PASSWORD_MARKER" ]; then
  log "  ❌ CRITICAL: POSTGRES_PASSWORD is still a default value!"
  log "  → Edit ${ENV_FILE} and set a secure password before starting."
  rm -f "$LOCK_FILE"
  exit 1
fi
log "  ✅ No default passwords detected."

# ── Step 6: Generate TLS certificates ────────────────────────
log "[6/12] Generating TLS certificates..."
CERTS_DIR="${SITA_DIR}/certs"
mkdir -p "$CERTS_DIR"
if [ ! -f "${CERTS_DIR}/sita.crt" ]; then
  HOSTNAME_FQDN=$(hostname -f 2>/dev/null || hostname)
  IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

  openssl req -x509 -nodes -days 3650 \
    -newkey rsa:4096 \
    -keyout "${CERTS_DIR}/sita.key" \
    -out "${CERTS_DIR}/sita.crt" \
    -subj "/C=US/ST=Local/L=Local/O=SITA OS/CN=${HOSTNAME_FQDN}" \
    -addext "subjectAltName=DNS:${HOSTNAME_FQDN},DNS:localhost,IP:${IP_ADDR},IP:127.0.0.1" \
    2>/dev/null

  chmod 600 "${CERTS_DIR}/sita.key"
  chmod 644 "${CERTS_DIR}/sita.crt"
  log "  ✅ Self-signed TLS certificate generated for ${HOSTNAME_FQDN}"
else
  log "  ✅ TLS certificate already exists"
fi

# ── Step 7: Configure firewall (UFW + fail2ban) ──────────────
log "[7/12] Configuring firewall..."
if command -v ufw &>/dev/null; then
  ufw --force reset >/dev/null 2>&1
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp comment 'SSH'
  ufw allow 80/tcp comment 'HTTP'
  ufw allow 443/tcp comment 'HTTPS'
  ufw allow 8080/tcp comment 'SITA Web UI'
  ufw --force enable
  log "  ✅ UFW firewall configured (22, 80, 443, 8080)"
else
  log "  ⚠ UFW not installed — skipping firewall setup"
fi

if command -v fail2ban-server &>/dev/null; then
  cat > /etc/fail2ban/jail.d/sita.conf << 'JAIL'
[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600
findtime = 600
JAIL
  systemctl enable fail2ban 2>/dev/null || true
  systemctl restart fail2ban 2>/dev/null || true
  log "  ✅ fail2ban configured for SSH"
else
  log "  ⚠ fail2ban not installed — skipping intrusion detection"
fi

# ── Step 8: Install logrotate config ─────────────────────────
log "[8/12] Installing logrotate configuration..."
if [ -f "${SITA_DIR}/logrotate-sita.conf" ]; then
  cp "${SITA_DIR}/logrotate-sita.conf" /etc/logrotate.d/sita
  log "  ✅ Logrotate installed at /etc/logrotate.d/sita"
else
  log "  ⚠ No logrotate config found — skipping"
fi

# ── Step 9: Create Docker networks ───────────────────────────
log "[9/12] Creating Docker networks..."
docker network create sita-frontend 2>/dev/null || true
docker network create sita-backend 2>/dev/null || true
docker network create sita-data 2>/dev/null || true
log "  ✅ Networks sita-frontend, sita-backend, sita-data ready."

# ── Step 10: Start the stack ──────────────────────────────────
log "[10/12] Starting SITA OS stack..."
cd "$DEPLOY_DIR"
docker compose up -d
log "  ✅ Stack started."

# ── Step 11: Wait for health checks ──────────────────────────
log "[11/12] Waiting for services to become healthy..."
SERVICES=("8080:Web" "3000:API-Gateway" "3001:Brain-Core" "8000:Kong")
ALL_HEALTHY=true

for svc in "${SERVICES[@]}"; do
  port="${svc%%:*}"
  name="${svc##*:}"
  HEALTHY=false
  for i in $(seq 1 $((HEALTH_TIMEOUT / 2))); do
    if curl -sf "http://localhost:${port}/health" &>/dev/null || \
       curl -sf "http://localhost:${port}/" &>/dev/null; then
      log "  ✅ ${name} (port ${port}) — healthy"
      HEALTHY=true
      break
    fi
    sleep 2
  done
  if [ "$HEALTHY" = false ]; then
    log "  ⚠ ${name} (port ${port}) — not responding after ${HEALTH_TIMEOUT}s"
    ALL_HEALTHY=false
  fi
done

# ── Step 12: Install backup cron + finalize ──────────────────
log "[12/12] Installing backup cron and finalizing..."
if [ -f "${DEPLOY_DIR}/backup.sh" ]; then
  chmod +x "${DEPLOY_DIR}/backup.sh"
  # Daily backup at 2:00 AM, retain 7 days
  (crontab -l 2>/dev/null | grep -v "sita.*backup" || true; \
   echo "0 2 * * * ${DEPLOY_DIR}/backup.sh >> /var/log/sita-backup.log 2>&1") | crontab -
  log "  ✅ Daily backup cron installed (2:00 AM)"
else
  log "  ⚠ No backup.sh found — skipping backup cron"
fi

# Write completion marker
cat > "${SITA_DIR}/first-boot-complete.json" << EOF
{
  "completed_at": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "hostname": "$(hostname)",
  "ip_addresses": $(ip -j -4 addr show | jq '[.[].addr_info[].local]' 2>/dev/null || echo '["unknown"]'),
  "all_healthy": $ALL_HEALTHY,
  "docker_version": "$(docker --version 2>/dev/null || echo 'unknown')",
  "kernel": "$(uname -r)",
  "tls_enabled": $([ -f "${CERTS_DIR}/sita.crt" ] && echo "true" || echo "false"),
  "firewall_enabled": $(command -v ufw &>/dev/null && ufw status | grep -q "active" && echo "true" || echo "false"),
  "backup_cron": $(crontab -l 2>/dev/null | grep -q "sita.*backup" && echo "true" || echo "false"),
  "network_segmentation": true
}
EOF

if [ "$ALL_HEALTHY" = true ]; then
  log ""
  log "═══════════════════════════════════════════════════════"
  log "  ✅ SITA OS is fully operational!"
  log ""
  log "  Web UI:    http://$(hostname -I | awk '{print $1}'):8080"
  log "  API:       http://$(hostname -I | awk '{print $1}'):3000"
  log "  TLS:       https://$(hostname -I | awk '{print $1}')"
  log ""
  log "  Security:  UFW firewall active, fail2ban enabled"
  log "  Backups:   Daily at 2:00 AM"
  log "  Certs:     ${CERTS_DIR}/sita.crt"
  log "═══════════════════════════════════════════════════════"
else
  log ""
  log "  ⚠ SITA OS started with warnings. Check logs:"
  log "    journalctl -u sita-os -f"
  log "    docker compose -f ${DEPLOY_DIR}/docker-compose.yml logs"
fi

rm -f "$LOCK_FILE"
exit 0
