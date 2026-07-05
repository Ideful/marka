# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS builder
WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o marka-api ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /app/marka-api .

ENV PORT=3001
EXPOSE 3001

CMD ["./marka-api"]
