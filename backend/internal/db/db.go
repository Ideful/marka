package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/sitesettings"
)

func Open(ctx context.Context) (*pgxpool.Pool, error) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "postgres://marka:marka@localhost:5432/marka?sslmode=disable"
	}
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	if resetRequested() {
		return Reset(ctx, pool)
	}

	legacy, err := legacyCatalogTablesExist(ctx, pool)
	if err != nil {
		return fmt.Errorf("check legacy tables: %w", err)
	}
	if legacy {
		log.Println("migrate: legacy tables (service_types/sub_services) found — full reset")
		return Reset(ctx, pool)
	}

	if err := createSchema(ctx, pool); err != nil {
		return err
	}
	if err := migrateCatalog(ctx, pool); err != nil {
		return err
	}
	if err := seedCatalog(ctx, pool); err != nil {
		return fmt.Errorf("seed catalog: %w", err)
	}
	if err := sitesettings.Seed(ctx, pool); err != nil {
		return fmt.Errorf("seed site_settings: %w", err)
	}
	return nil
}

func resetRequested() bool {
	v := os.Getenv("DB_RESET")
	return v == "1" || v == "true" || v == "yes"
}
