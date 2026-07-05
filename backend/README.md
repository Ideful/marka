# backend

HTTP API на Go: услуги, специалисты, загрузка фото (MinIO).

## Структура

```
backend/
├── cmd/
│   ├── server/          # точка входа API
│   └── resetdb/         # полный сброс БД без HTTP
├── internal/
│   ├── catalog/         # направления и разделы
│   ├── prices/          # услуги (строки прайса)
│   ├── specialists/     # специалисты
│   ├── sitesettings/    # настройки сайта
│   ├── storage/         # MinIO
│   ├── db/              # подключение и миграции
│   ├── models/          # типы данных
│   └── httputil/        # JSON, CORS, ошибки
├── swagger.yml
└── Dockerfile
```

## Запуск

```bash
# из корня репозитория
make docker-infra-up
make dev-backend
```

Или вручную:

```bash
export DATABASE_URL=postgres://marka:marka@localhost:5432/marka?sslmode=disable
export MINIO_ENDPOINT=localhost:9000
cd backend && go run ./cmd/server
```

OpenAPI: `swagger.yml`

## Схема Postgres

| Таблица | Описание |
|---------|----------|
| `main_services` | Направления (hair, nails, …) |
| `sections` | Разделы внутри направления |
| `services` | Услуги (строки прайса), FK `section_id` |
| `specialists` | Специалисты |
| `site_settings` | Настройки сайта (marquee, portfolio, gift certificate) |

## Миграции

Миграции выполняются **автоматически** при старте `cmd/server` — отдельный migrate-runner не нужен. Код: `internal/db/`.

### Обычный запуск

1. Создаются недостающие таблицы (`CREATE TABLE IF NOT EXISTS`).
2. Сиды каталога и `site_settings` вставляются с `ON CONFLICT DO NOTHING` — существующие данные не перезаписываются.

### Полный сброс

Удаляет **все** таблицы приложения, создаёт схему заново и заполняет хардкод-сидами:

- 5 направлений (`main_services`)
- 5 разделов для hair (`sections`)
- прайс strizhka / ukladka / okrashivanie (`services`)
- дефолтные `site_settings`

Специалисты после сброса — пустая таблица.

**Способы запуска:**

```bash
# из корня — только миграция, без HTTP
make db-reset

# полный сброс при следующем старте API
DB_RESET=true make dev-backend

# в Docker (осторожно: сотрёт прод-данные)
docker compose run --rm -e DB_RESET=true backend
```

### Автомиграция со старой схемы

Если в БД ещё есть таблицы `service_types` или `sub_services`, при старте API выполняется полный сброс (как `DB_RESET`) и переход на `sections` / `services`.

### Что попадает в сиды

| Данные | Источник |
|--------|----------|
| Направления, разделы hair, прайс | `internal/db/catalog.go` |
| Marquee, portfolio, gift certificate | `internal/sitesettings/store.go` → `Seed()` |

## Переменные окружения

| Переменная | Обязательна | По умолчанию | Описание |
|------------|-------------|--------------|----------|
| `DATABASE_URL` | нет | `postgres://marka:marka@localhost:5432/marka?sslmode=disable` | Строка подключения Postgres |
| `PORT` | нет | `3001` | Порт HTTP-сервера |
| `DB_RESET` | нет | — | `1`, `true` или `yes` — полный сброс БД перед стартом |
| `CORS_ALLOWED_ORIGINS` | нет | `http://localhost:5173,http://127.0.0.1:5173` | Разрешённые Origin через запятую |
| `MINIO_ENDPOINT` | нет | `localhost:9000` | Хост:порт MinIO |
| `MINIO_ACCESS_KEY` | нет | `minioadmin` | Access key |
| `MINIO_SECRET_KEY` | нет | `minioadmin_password` | Secret key |
| `MINIO_BUCKET` | нет | `marka` | Имя бакета |
| `MINIO_USE_SSL` | нет | `false` | `true` — HTTPS к MinIO |
| `MINIO_PUBLIC_URL` | нет | `/{MINIO_BUCKET}` | Базовый URL для ответов upload (без завершающего `/`) |

Пример `.env` для локальной разработки — в корне репозитория: [`.env.example`](../.env.example).

В Docker значения задаются в `docker-compose.yml` (сервис `backend`).
