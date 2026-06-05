package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func migrateServicesCatalog(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS main_services (
			id SERIAL PRIMARY KEY,
			slug TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS service_types (
			id SERIAL PRIMARY KEY,
			main_service_id INT NOT NULL REFERENCES main_services(id) ON DELETE CASCADE,
			slug TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			sort_order INT NOT NULL DEFAULT 0,
			UNIQUE(main_service_id, slug)
		);

		CREATE TABLE IF NOT EXISTS sub_services (
			id SERIAL PRIMARY KEY,
			service_type_id INT NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			prices JSONB NOT NULL DEFAULT '{}',
			sort_order INT NOT NULL DEFAULT 0
		);
	`)
	if err != nil {
		return fmt.Errorf("migrate services tables: %w", err)
	}

	return seedServicesCatalog(ctx, pool)
}

func seedServicesCatalog(ctx context.Context, pool *pgxpool.Pool) error {
	mainServices := []struct {
		slug  string
		name  string
		order int
	}{
		{"hair", "Парикмахерские услуги", 1},
		{"nails", "Ногтевой сервис", 2},
		{"brows-lashes", "Брови и ресницы", 3},
		{"cosmetology", "Косметология", 4},
		{"makeup", "Макияж", 5},
	}

	for _, ms := range mainServices {
		_, err := pool.Exec(ctx, `
			INSERT INTO main_services (slug, name, sort_order)
			VALUES ($1, $2, $3)
			ON CONFLICT (slug) DO NOTHING
		`, ms.slug, ms.name, ms.order)
		if err != nil {
			return fmt.Errorf("seed main_service %q: %w", ms.slug, err)
		}
	}

	hairServices := []struct {
		slug        string
		name        string
		description string
		order       int
	}{
		{"strizhka", "Стрижка", "", 1},
		{"ukladka", "Укладка", "", 2},
		{"okrashivanie", "Окрашивание", "", 3},
		{"barber", "Барбер", "", 4},
		{"uhod-volos", "Уход для волос", "", 5},
		{"transform", "Трансформация структуры", "", 6},
	}

	var hairID int
	if err := pool.QueryRow(ctx, `SELECT id FROM main_services WHERE slug = 'hair'`).Scan(&hairID); err != nil {
		return fmt.Errorf("resolve hair main_service: %w", err)
	}

	for _, st := range hairServices {
		_, err := pool.Exec(ctx, `
			INSERT INTO service_types (main_service_id, slug, name, description, sort_order)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (main_service_id, slug) DO NOTHING
		`, hairID, st.slug, st.name, st.description, st.order)
		if err != nil {
			return fmt.Errorf("seed service_type %q: %w", st.slug, err)
		}
	}

	return seedHairSubServices(ctx, pool, hairID)
}

func seedHairSubServices(ctx context.Context, pool *pgxpool.Pool, hairID int) error {
	type seedRow struct {
		serviceSlug string
		name        string
		description string
		prices      GenderedPrices
		order       int
	}

	rows := []seedRow{
		{
			serviceSlug: "strizhka",
			name:        "Стрижка (пример)",
			description: "Модельная стрижка по длине и типу волос; точную стоимость уточняйте у мастера.",
			order:       1,
			prices: GenderedPrices{
				Female: TierPrices{
					Master: 2000, TopMaster: 2500, Stylist: 3000,
					TopStylist: 3500, ArtDirector: 4500,
				},
				Male: TierPrices{
					Master: 1500, TopMaster: 1900, Stylist: 2300,
					TopStylist: 2700, ArtDirector: 3500,
				},
			},
		},
		{
			serviceSlug: "strizhka",
			name:        "Стрижка + укладка",
			description: "Стрижка и укладка феном или диффузором.",
			order:       2,
			prices: GenderedPrices{
				Female: TierPrices{
					Master: 3500, TopMaster: 4000, Stylist: 4500,
					TopStylist: 5000, ArtDirector: 6000,
				},
				Male: TierPrices{
					Master: 2800, TopMaster: 3200, Stylist: 3600,
					TopStylist: 4000, ArtDirector: 5000,
				},
			},
		},
		{
			serviceSlug: "okrashivanie",
			name:        "Тонирование",
			description: "",
			order:       1,
			prices:      GenderedPrices{},
		},
	}

	for _, row := range rows {
		var serviceTypeID int
		err := pool.QueryRow(ctx, `
			SELECT id FROM service_types
			WHERE main_service_id = $1 AND slug = $2
		`, hairID, row.serviceSlug).Scan(&serviceTypeID)
		if err != nil {
			return fmt.Errorf("resolve service_type %q: %w", row.serviceSlug, err)
		}

		var exists bool
		if err := pool.QueryRow(ctx, `
			SELECT EXISTS(
				SELECT 1 FROM sub_services
				WHERE service_type_id = $1 AND name = $2
			)
		`, serviceTypeID, row.name).Scan(&exists); err != nil {
			return err
		}
		if exists {
			continue
		}

		pricesRaw, err := marshalPrices(row.prices)
		if err != nil {
			return err
		}

		_, err = pool.Exec(ctx, `
			INSERT INTO sub_services (service_type_id, name, description, prices, sort_order)
			VALUES ($1, $2, $3, $4::jsonb, $5)
		`, serviceTypeID, row.name, row.description, pricesRaw, row.order)
		if err != nil {
			return fmt.Errorf("seed sub_service %q: %w", row.name, err)
		}
	}

	return nil
}
