# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o marka-api ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates \
  && addgroup -S app \
  && adduser -S app -G app

WORKDIR /app
COPY --from=builder /app/marka-api .
USER app

ENV PORT=3001
EXPOSE 3001
CMD ["./marka-api"]
