# Marka

Монорепозиторий салона **МАРКА АРЕНА**: три отдельных приложения в своих папках.

## Структура

```
marka/
├── frontend/      # Публичный сайт (Next.js, :3000)
├── admin-front/   # Админка специалистов (Vite + React, :5173)
├── backend/       # API (Go, :3001)
├── docker-compose.yml
├── Makefile
└── .env.example
```

| Папка | Стек | Назначение |
|-------|------|------------|
| `frontend/` | Next.js 15 | Сайт: услуги, специалисты, контакты |
| `admin-front/` | Vite, React | CRUD специалистов, загрузка фото |
| `backend/` | Go, Postgres, MinIO | REST API, БД, файлы |

Инфраструктура (Postgres, MinIO, опционально frontend в Docker) — в корневом `docker-compose.yml`.

## Запуск на сервере (Docker, одна команда)

```bash
git clone <url> marka && cd marka
cp .env.example .env
# в .env укажите IP сервера для CORS и фото MinIO (см. комментарии)
make docker-up
```

| Сервис | URL |
|--------|-----|
| Сайт | http://&lt;IP&gt;:3000 |
| API | http://&lt;IP&gt;:3001 |
| Админка | http://&lt;IP&gt; (порт 80) |
| MinIO | http://&lt;IP&gt;:9001 |

Логи: `make docker-logs` · Остановка: `make docker-down`

### Ошибка `429 Too Many Requests` (лимит Docker Hub)

На сервере без авторизации в Docker Hub лимит скачивания быстро исчерпывается. Варианты:

**1. Зеркало (рекомендуется для РФ)**

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.1ms.run"]
}
EOF
sudo systemctl restart docker
```

Потом снова: `make docker-up`

**2. Войти в Docker Hub** (бесплатный аккаунт даёт больший лимит)

```bash
docker login
make docker-up
```

**3. Ручная загрузка через зеркало** (если п.1 не помог)

```bash
docker pull docker.1ms.run/library/golang:1.23-alpine && docker tag docker.1ms.run/library/golang:1.23-alpine golang:1.23-alpine
docker pull docker.1ms.run/library/node:22-alpine && docker tag docker.1ms.run/library/node:22-alpine node:22-alpine
docker pull docker.1ms.run/library/nginx:1.27-alpine && docker tag docker.1ms.run/library/nginx:1.27-alpine nginx:1.27-alpine
docker pull docker.1ms.run/library/alpine:3.20 && docker tag docker.1ms.run/library/alpine:3.20 alpine:3.20
make docker-up
```

## Локальная разработка

```bash
cp .env.example .env   # при необходимости
make install
make docker-infra-up   # postgres + minio
make dev-backend
make dev-admin         # http://localhost:5173
make dev-frontend      # http://localhost:3000
```

Или из корня: `npm run dev:frontend`, `npm run dev:admin` (backend — только через `make dev-backend`).

## Документация API

OpenAPI: `backend/swagger.yml`
