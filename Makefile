# ═══════════════════════════════════════════════════════════════
# SITA OS — Docker Stack Management
# ═══════════════════════════════════════════════════════════════

COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yml
PROJECT = sita

.PHONY: help build up down restart logs status clean reset studio db-shell iso ova

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

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
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d sita-supabase-studio

# ── Observability ────────────────────────────────────────────

logs: ## Tail logs from all services
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f --tail=100

logs-api: ## Tail API gateway logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-api-gateway

logs-brain: ## Tail brain-core logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-brain-core

logs-db: ## Tail database logs
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) logs -f sita-supabase-db

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

# ── Setup ────────────────────────────────────────────────────

setup: ## First-time setup: copy env, build, start
	@test -f .env || (cp .env.example .env && echo "📝 Created .env from .env.example — edit it with your secrets")
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) build
	$(COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT) up -d
	@echo ""
	@echo "═══════════════════════════════════════════"
	@echo "  SITA OS Stack Ready"
	@echo "  Web:     http://localhost:8080"
	@echo "  API:     http://localhost:3000"
	@echo "  Studio:  http://localhost:3100"
	@echo "  Kong:    http://localhost:8000"
	@echo "═══════════════════════════════════════════"
