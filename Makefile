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

.PHONY: help install install-frontend install-admin dev-frontend dev-admin dev-backend start-backend \
	docker-frontend-build docker-frontend-up docker-frontend-down docker-frontend-logs \
	docker-infra-up docker-infra-down

help:
	@echo "Projects: frontend/ | admin-front/ | backend/"
	@echo ""
	@echo "Available targets:"
	@echo "  make install          - install deps for frontend and admin-front"
	@echo "  make dev-frontend     - run frontend (default port 3000)"
	@echo "  make dev-admin        - run admin-front (default port 5173)"
	@echo "  make dev-backend      - run backend (needs Postgres, port 3001)"
	@echo "  make start-backend    - run backend (same as dev-backend)"
	@echo "  make docker-infra-up  - Postgres + MinIO in Docker"
	@echo "  make docker-infra-down - stop Postgres + MinIO"
	@echo "  make docker-frontend-build - build frontend Docker image"
	@echo "  make docker-frontend-up    - run frontend in Docker (port 3000)"
	@echo "  make docker-frontend-down  - stop frontend container"
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
		go run .
else
	cd backend && PORT=$(PORT) \
		DATABASE_URL="$(DATABASE_URL)" \
		MINIO_ENDPOINT="$(MINIO_ENDPOINT)" \
		MINIO_ACCESS_KEY="$(MINIO_ACCESS_KEY)" \
		MINIO_SECRET_KEY="$(MINIO_SECRET_KEY)" \
		MINIO_BUCKET="$(MINIO_BUCKET)" \
		MINIO_USE_SSL="$(MINIO_USE_SSL)" \
		MINIO_PUBLIC_URL="$(MINIO_PUBLIC_URL)" \
		go run .
endif

start-backend: dev-backend

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
