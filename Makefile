# ═══════════════════════════════════════════════════════════════
# SITA OS — Docker Stack Management
# ═══════════════════════════════════════════════════════════════

COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yml
PROJECT = sita
VERSION ?= 1.0.0

.PHONY: help build up down restart logs status clean reset studio db-shell iso ova \
        electron-linux electron-mac electron-win electron-all rotate-secrets preflight

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

# ── Build ────────────────────────────────────────────────────

build: ## Build all Docker images
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) build

build-no-cache: ## Build all images without cache
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) build --no-cache

# ── Start / Stop ────────────────────────────────────────────

up: ## Start the full stack (detached)
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d

up-build: ## Build and start the full stack
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d --build

down: ## Stop the full stack
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) down

restart: ## Restart the full stack
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) restart

# ── Individual Services ─────────────────────────────────────

up-core: ## Start core services only (db, kong, auth, rest)
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d \
		sita-supabase-db sita-supabase-rest sita-supabase-auth \
		sita-supabase-kong sita-supabase-meta

up-app: ## Start app services (gateway, brain, web)
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d \
		sita-api-gateway sita-brain-core sita-web

up-studio: ## Start Supabase Studio UI
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) --profile studio up -d sita-supabase-studio

up-traefik: ## Start Traefik reverse proxy (TLS)
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d sita-traefik

# ── Observability ────────────────────────────────────────────

logs: ## Tail logs from all services
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f --tail=100

logs-api: ## Tail API gateway logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-api-gateway

logs-brain: ## Tail brain-core logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-brain-core

logs-db: ## Tail database logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-supabase-db

logs-traefik: ## Tail Traefik logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-traefik

status: ## Show status of all services
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) ps

health: ## Check health of all services
	@echo "── Service Health ──"
	@for svc in api-gateway:3000 brain-core:3001 supabase-kong:8000 supabase-rest:3100 supabase-auth:9999 supabase-meta:8080 web:8080; do \
		name=$$(echo $$svc | cut -d: -f1); \
		port=$$(echo $$svc | cut -d: -f2); \
		status=$$(curl -sf http://localhost:$$port/health 2>/dev/null | head -c 100 || echo "unreachable"); \
		printf "  %-25s %s\n" "$$name" "$$status"; \
	done

# ── Database ─────────────────────────────────────────────────

db-shell: ## Open psql shell to the database
	docker exec -it sita-supabase-db psql -U postgres

db-migrate: ## Run pending migrations
	docker exec -i sita-supabase-db psql -U postgres < supabase/migrations/*.sql

# ── Cleanup ──────────────────────────────────────────────────

clean: ## Stop stack and remove containers
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) down --remove-orphans

reset: ## Full reset: stop, remove volumes, rebuild
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) down -v --remove-orphans
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) build --no-cache
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d
	@echo "✅ Full stack reset complete"

nuke: ## Nuclear option: remove everything including images
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) down -v --rmi all --remove-orphans
	@echo "🔥 Everything removed"

# ── Testing ──────────────────────────────────────────────────

test: ## Run frontend tests
	npx vitest run

test-integration: ## Run integration tests (requires running stack)
	API_GATEWAY_URL=http://localhost:3000 \
	BRAIN_CORE_URL=http://localhost:3001 \
	npx vitest run tests/integration/

test-health: ## Quick health check of all endpoints
	@echo "── Quick Health Check ──"
	@curl -sf http://localhost:3000/health && echo " ✅ API Gateway" || echo " ❌ API Gateway"
	@curl -sf http://localhost:3001/health && echo " ✅ Brain Core" || echo " ❌ Brain Core"
	@curl -sf http://localhost:8000/ && echo " ✅ Kong" || echo " ❌ Kong"
	@curl -sf http://localhost:8080/ && echo " ✅ Web" || echo " ❌ Web"
	@curl -sf http://localhost:9999/health && echo " ✅ Auth" || echo " ❌ Auth"

preflight: ## Run all deployment readiness checks
	@echo "═══ SITA OS Preflight Checks ═══"
	@echo "── 1. Service manifest completeness ──"
	@bash scripts/validators/check-deploy-service-completeness.sh || true
	@echo ""
	@echo "── 2. Docker Compose references ──"
	@bash scripts/validators/check-docker-compose-references.sh || true
	@echo ""
	@echo "── 3. TypeScript compilation ──"
	@cd deploy/api-gateway && npm run typecheck 2>/dev/null && echo "  ✅ api-gateway typecheck" || echo "  ❌ api-gateway typecheck"
	@cd deploy/brain-core && npm run typecheck 2>/dev/null && echo "  ✅ brain-core typecheck" || echo "  ❌ brain-core typecheck"
	@echo ""
	@echo "═══ Preflight Complete ═══"

# ── Security ─────────────────────────────────────────────────

rotate-secrets: ## Rotate JWT_SECRET and POSTGRES_PASSWORD
	bash scripts/security/rotate-secrets.sh

rotate-jwt: ## Rotate only JWT_SECRET
	ROTATE_POSTGRES=false bash scripts/security/rotate-secrets.sh

rotate-postgres: ## Rotate only POSTGRES_PASSWORD
	ROTATE_JWT=false bash scripts/security/rotate-secrets.sh

generate-certs: ## Generate self-signed TLS certificates
	bash deploy/traefik/generate-self-signed.sh

# ── Setup ────────────────────────────────────────────────────

setup: ## First-time setup: copy env, build, start
	@test -f .env || (cp .env.example .env && echo "📝 Created .env from .env.example — edit it with your secrets")
	@if grep -q '^POSTGRES_PASSWORD=$$' .env 2>/dev/null; then \
		echo "❌ POSTGRES_PASSWORD is empty in .env — set it before starting!"; \
		exit 1; \
	fi
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) build
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d
	@echo ""
	@echo "═══════════════════════════════════════════"
	@echo "  SITA OS Stack Ready"
	@echo "  Web:     http://localhost:8080"
	@echo "  API:     http://localhost:3000"
	@echo "  Kong:    http://localhost:8000"
	@echo "═══════════════════════════════════════════"

# ── Release: ISO / OVA ──────────────────────────────────────

iso: ## Build bootable SITA OS ISO image
	@echo "Building SITA OS ISO..."
	bash scripts/release/build-iso.sh --version $(VERSION)

iso-full: ## Build ISO with embedded Docker images
	bash scripts/release/build-iso.sh --version $(VERSION) --include-images

ova: ## Build VMware OVA appliance
	@echo "Building SITA OS OVA..."
	bash scripts/release/build-ova.sh --version $(VERSION)

ova-from-iso: ## Build OVA from ISO (full pipeline)
	bash scripts/release/build-ova.sh --version $(VERSION) --from-iso dist/sita-os-$(VERSION).iso

ova-pilot: ## Build pilot-sized OVA (2 vCPU, 4GB RAM, 40GB disk)
	CPU_COUNT=2 RAM_MB=4096 DISK_SIZE_GB=40 bash scripts/release/build-ova.sh --version $(VERSION)

# ── Release: Electron Desktop ────────────────────────────────

electron-linux: ## Build Electron app for Linux (x64)
	bash scripts/release/build-electron.sh --platform linux --arch x64 --version $(VERSION)

electron-mac: ## Build Electron app for macOS (x64)
	bash scripts/release/build-electron.sh --platform darwin --arch x64 --version $(VERSION)

electron-mac-arm: ## Build Electron app for macOS (arm64)
	bash scripts/release/build-electron.sh --platform darwin --arch arm64 --version $(VERSION)

electron-win: ## Build Electron app for Windows (x64)
	bash scripts/release/build-electron.sh --platform win32 --arch x64 --version $(VERSION)

electron-all: ## Build Electron app for all platforms
	@$(MAKE) electron-linux VERSION=$(VERSION)
	@$(MAKE) electron-mac VERSION=$(VERSION)
	@$(MAKE) electron-win VERSION=$(VERSION)
	@echo "✅ All Electron builds complete"
