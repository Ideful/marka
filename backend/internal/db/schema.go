package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func createSchema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS main_services (
			id SERIAL PRIMARY KEY,
			slug TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS sections (
			id SERIAL PRIMARY KEY,
			main_service_id INT NOT NULL REFERENCES main_services(id) ON DELETE CASCADE,
			slug TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			sort_order INT NOT NULL DEFAULT 0,
			UNIQUE(main_service_id, slug)
		);

		CREATE TABLE IF NOT EXISTS services (
			id SERIAL PRIMARY KEY,
			section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			prices JSONB NOT NULL DEFAULT '{}',
			sort_order INT NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS specialists (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			description JSONB NOT NULL DEFAULT '[]',
			portfolio JSONB NOT NULL DEFAULT '[]',
			photo_url TEXT NOT NULL DEFAULT '',
			class TEXT NOT NULL DEFAULT 'master'
		);

		CREATE TABLE IF NOT EXISTS site_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL DEFAULT ''
		);
	`)
	if err != nil {
		return fmt.Errorf("create schema: %w", err)
	}

	_, err = pool.Exec(ctx, `
		ALTER TABLE specialists
		ADD COLUMN IF NOT EXISTS class TEXT NOT NULL DEFAULT 'master';
	`)
	if err != nil {
		return fmt.Errorf("alter specialists.class: %w", err)
	}

	_, err = pool.Exec(ctx, `
		ALTER TABLE specialists
		ADD COLUMN IF NOT EXISTS portfolio JSONB NOT NULL DEFAULT '[]';
	`)
	if err != nil {
		return fmt.Errorf("alter specialists.portfolio: %w", err)
	}

	return nil
}

func createSchemaFresh(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE main_services (
			id SERIAL PRIMARY KEY,
			slug TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0
		);

		CREATE TABLE sections (
			id SERIAL PRIMARY KEY,
			main_service_id INT NOT NULL REFERENCES main_services(id) ON DELETE CASCADE,
			slug TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			sort_order INT NOT NULL DEFAULT 0,
			UNIQUE(main_service_id, slug)
		);

		CREATE TABLE services (
			id SERIAL PRIMARY KEY,
			section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			prices JSONB NOT NULL DEFAULT '{}',
			sort_order INT NOT NULL DEFAULT 0
		);

		CREATE TABLE specialists (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			description JSONB NOT NULL DEFAULT '[]',
			portfolio JSONB NOT NULL DEFAULT '[]',
			photo_url TEXT NOT NULL DEFAULT '',
			class TEXT NOT NULL DEFAULT 'master'
		);

		CREATE TABLE site_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL DEFAULT ''
		);
	`)
	if err != nil {
		return fmt.Errorf("create fresh schema: %w", err)
	}
	return nil
}
