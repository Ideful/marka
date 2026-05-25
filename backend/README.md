# backend

HTTP API на Go: услуги, специалисты, загрузка фото (MinIO).

```bash
# из корня репозитория
make docker-infra-up
make dev-backend
```

Или вручную:

```bash
export DATABASE_URL=postgres://marka:marka@localhost:5432/marka?sslmode=disable
export MINIO_ENDPOINT=localhost:9000
go run .
```

Спецификация: `swagger.yml`, данные прайса: `services.json`.
