package db

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/sitesettings"
)

func dropAllTables(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		DROP TABLE IF EXISTS services CASCADE;
		DROP TABLE IF EXISTS sub_services CASCADE;
		DROP TABLE IF EXISTS sections CASCADE;
		DROP TABLE IF EXISTS service_types CASCADE;
		DROP TABLE IF EXISTS main_services CASCADE;
		DROP TABLE IF EXISTS specialists CASCADE;
		DROP TABLE IF EXISTS site_settings CASCADE;
	`)
	if err != nil {
		return fmt.Errorf("drop tables: %w", err)
	}
	return nil
}

func legacyCatalogTablesExist(ctx context.Context, pool *pgxpool.Pool) (bool, error) {
	var count int
	err := pool.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM information_schema.tables
		WHERE table_schema = 'public'
		  AND table_name IN ('service_types', 'sub_services')
	`).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Reset удаляет все таблицы приложения, создаёт схему заново и заполняет хардкод-сидами.
func Reset(ctx context.Context, pool *pgxpool.Pool) error {
	log.Println("db reset: dropping all application tables")
	if err := dropAllTables(ctx, pool); err != nil {
		return err
	}

	log.Println("db reset: creating schema")
	if err := createSchemaFresh(ctx, pool); err != nil {
		return err
	}

	log.Println("db reset: seeding catalog")
	if err := seedCatalog(ctx, pool); err != nil {
		return fmt.Errorf("seed catalog: %w", err)
	}

	log.Println("db reset: seeding site settings")
	if err := sitesettings.Seed(ctx, pool); err != nil {
		return fmt.Errorf("seed site_settings: %w", err)
	}

	log.Println("db reset: done")
	return nil
}
