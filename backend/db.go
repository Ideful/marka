package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func openDB(ctx context.Context) (*pgxpool.Pool, error) {
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

func migrate(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS specialists (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			description JSONB NOT NULL DEFAULT '[]',
			portfolio JSONB NOT NULL DEFAULT '[]',
			photo_url TEXT NOT NULL DEFAULT '',
			class TEXT NOT NULL DEFAULT 'master'
		);
	`)
	if err != nil {
		return fmt.Errorf("migrate specialists: %w", err)
	}
	_, err = pool.Exec(ctx, `
		ALTER TABLE specialists
		ADD COLUMN IF NOT EXISTS class TEXT NOT NULL DEFAULT 'master';
	`)
	if err != nil {
		return fmt.Errorf("migrate specialists class: %w", err)
	}
	_, err = pool.Exec(ctx, `
		ALTER TABLE specialists
		ADD COLUMN IF NOT EXISTS portfolio JSONB NOT NULL DEFAULT '[]';
	`)
	if err != nil {
		return fmt.Errorf("migrate specialists portfolio: %w", err)
	}
	if err := migrateServicesCatalog(ctx, pool); err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS site_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL DEFAULT ''
		);
	`)
	if err != nil {
		return fmt.Errorf("migrate site_settings: %w", err)
	}
	if err := seedSiteSettings(ctx, pool); err != nil {
		return fmt.Errorf("seed site_settings: %w", err)
	}
	return nil
}
