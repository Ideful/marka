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

## Запуск на сервере (Docker)

`.env` **не нужен** — IP нигде в репозитории не хранится. Фото отдаются по пути `/marka/...` через прокси.

```bash
git clone <url> marka && cd marka
make docker-up
```

| Сервис | URL |
|--------|-----|
| Сайт | `http://<ваш-ip>:3000` |
| API | `http://<ваш-ip>:3001` |
| Админка | `http://<ваш-ip>` (порт 80) |

### Обновление после `git pull`

```bash
cd marka
git pull
docker compose up -d --build
```

Пересобираются только изменённые образы. Логи: `make docker-logs` · Остановка: `make docker-down`

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

## Миграции БД

Схема и сиды управляются **backend** при каждом старте API (`internal/db`).

| Сценарий | Что происходит |
|----------|----------------|
| Обычный старт | `CREATE TABLE IF NOT EXISTS`, сиды с `ON CONFLICT DO NOTHING` — данные не затираются |
| Старые таблицы `service_types` / `sub_services` | Автоматический полный сброс и пересоздание на новых именах |
| `DB_RESET=true` | Принудительный полный сброс при старте API |
| `make db-reset` | Сброс без запуска HTTP-сервера (`cmd/resetdb`) |

Полный сброс **удаляет все таблицы приложения** (каталог, специалисты, настройки сайта) и заново заполняет хардкод-сидами. Пользовательские правки в прайсе и карточках специалистов будут потеряны.

Подробнее: [`backend/README.md`](backend/README.md).

## Переменные окружения

Шаблон для локальной разработки: [`.env.example`](.env.example). На сервере с Docker большинство значений заданы в `docker-compose.yml`, отдельный `.env` не обязателен.

### Backend (API)

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `DATABASE_URL` | `postgres://marka:marka@localhost:5432/marka?sslmode=disable` | Postgres |
| `PORT` | `3001` | Порт HTTP API |
| `DB_RESET` | — | `1` / `true` / `yes` — полный сброс БД при старте |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origins админки через запятую |
| `MINIO_ENDPOINT` | `localhost:9000` | MinIO (S3) |
| `MINIO_ACCESS_KEY` | `minioadmin` | Ключ MinIO |
| `MINIO_SECRET_KEY` | `minioadmin_password` | Секрет MinIO |
| `MINIO_BUCKET` | `marka` | Бакет для фото |
| `MINIO_USE_SSL` | `false` | HTTPS к MinIO |
| `MINIO_PUBLIC_URL` | `/{MINIO_BUCKET}` | Публичный базовый URL файлов (в Docker — `/marka`) |

`make dev-backend` и `make db-reset` подхватывают `DATABASE_URL` из Makefile (можно переопределить в shell).

### Frontend (Next.js)

| Переменная | Назначение |
|------------|------------|
| `API_URL` | URL backend на сервере (SSR) |
| `NEXT_PUBLIC_API_URL` | URL backend в браузере (если не через прокси) |
| `MINIO_INTERNAL_URL` | MinIO для прокси `/marka/*` |
| `NEXT_PUBLIC_SITE_URL` | Канонический URL сайта |
| `NEXT_PUBLIC_BOOKING_URL` | Ссылка на онлайн-запись |

### Admin (Vite)

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `PORT` | `5173` | Порт dev-сервера |
| `VITE_API_PROXY_TARGET` | `http://localhost:3001` | Куда проксировать `/api` |

### Docker Compose (корень)

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `FRONTEND_PORT` | `3000` | Порт сайта на хосте |
| `ADMIN_PORT` | `80` | Порт админки на хосте |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost` | CORS для API в Docker |

## Документация API

OpenAPI: `backend/swagger.yml`
