SHELL := /bin/zsh

DATABASE_URL ?= postgres://marka:marka@localhost:5432/marka?sslmode=disable

# V2: `docker compose`; старые установки: `docker-compose`
DOCKER_COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

MINIO_ENDPOINT ?= localhost:9000
MINIO_ACCESS_KEY ?= minioadmin
MINIO_SECRET_KEY ?= minioadmin_password
MINIO_BUCKET ?= marka
MINIO_USE_SSL ?= false
MINIO_PUBLIC_URL ?= http://localhost:9000/marka

.PHONY: help install install-frontend install-admin dev-frontend dev-admin dev-backend start-backend db-reset \
	docker-up docker-down docker-logs docker-ps \
	docker-frontend-build docker-frontend-up docker-frontend-down docker-frontend-logs \
	docker-infra-up docker-infra-down

help:
	@echo "Projects: frontend/ | admin-front/ | backend/"
	@echo ""
	@echo "Available targets:"
	@echo "  make docker-up        - build & run full stack in Docker (recommended on server)"
	@echo "  make docker-down      - stop all containers"
	@echo "  make docker-logs      - follow logs"
	@echo "  make docker-ps        - container status"
	@echo "  make install          - install deps for frontend and admin-front (local dev)"
	@echo "  make dev-frontend     - run frontend (default port 3000)"
	@echo "  make dev-admin        - run admin-front (default port 5173)"
	@echo "  make dev-backend      - run backend (needs Postgres, port 3001)"
	@echo "  make db-reset         - drop all app tables and reseed (DATABASE_URL)"
	@echo "  make docker-infra-up  - Postgres + MinIO only (local dev)"
	@echo ""
	@echo "Custom port examples:"
	@echo "  make dev-frontend PORT=4000"
	@echo "  make dev-admin PORT=4100"
	@echo "  make dev-backend PORT=8080"

install: install-frontend install-admin

install-frontend:
	cd frontend && npm install

install-admin:
	cd admin-front && npm install

dev-frontend:
ifeq ($(PORT),)
	cd frontend && npm run dev
else
	cd frontend && PORT=$(PORT) npm run dev
endif

dev-admin:
ifeq ($(PORT),)
	cd admin-front && npm run dev
else
	cd admin-front && PORT=$(PORT) npm run dev
endif

dev-backend:
ifeq ($(PORT),)
	cd backend && \
		DATABASE_URL="$(DATABASE_URL)" \
		MINIO_ENDPOINT="$(MINIO_ENDPOINT)" \
		MINIO_ACCESS_KEY="$(MINIO_ACCESS_KEY)" \
		MINIO_SECRET_KEY="$(MINIO_SECRET_KEY)" \
		MINIO_BUCKET="$(MINIO_BUCKET)" \
		MINIO_USE_SSL="$(MINIO_USE_SSL)" \
		MINIO_PUBLIC_URL="$(MINIO_PUBLIC_URL)" \
		go run ./cmd/server
else
	cd backend && PORT=$(PORT) \
		DATABASE_URL="$(DATABASE_URL)" \
		MINIO_ENDPOINT="$(MINIO_ENDPOINT)" \
		MINIO_ACCESS_KEY="$(MINIO_ACCESS_KEY)" \
		MINIO_SECRET_KEY="$(MINIO_SECRET_KEY)" \
		MINIO_BUCKET="$(MINIO_BUCKET)" \
		MINIO_USE_SSL="$(MINIO_USE_SSL)" \
		MINIO_PUBLIC_URL="$(MINIO_PUBLIC_URL)" \
		go run ./cmd/server
endif

start-backend: dev-backend

db-reset:
	cd backend && DATABASE_URL="$(DATABASE_URL)" go run ./cmd/resetdb

docker-up:
	$(DOCKER_COMPOSE) up -d --build

docker-down:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f

docker-ps:
	$(DOCKER_COMPOSE) ps

docker-frontend-build:
	$(DOCKER_COMPOSE) build frontend

docker-frontend-up:
	$(DOCKER_COMPOSE) up -d frontend

docker-frontend-down:
	$(DOCKER_COMPOSE) down

docker-frontend-logs:
	$(DOCKER_COMPOSE) logs -f frontend

docker-infra-up:
	$(DOCKER_COMPOSE) up -d postgres minio

docker-infra-down:
	$(DOCKER_COMPOSE) stop postgres minio
