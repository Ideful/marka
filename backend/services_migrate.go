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

	if err := migrateRemoveTransformServiceType(ctx, pool); err != nil {
		return err
	}

	return seedServicesCatalog(ctx, pool)
}

// migrateRemoveTransformServiceType удаляет устаревший тип услуги «Трансформация структуры».
func migrateRemoveTransformServiceType(ctx context.Context, pool *pgxpool.Pool) error {
	tag, err := pool.Exec(ctx, `
		DELETE FROM service_types
		WHERE main_service_id = (SELECT id FROM main_services WHERE slug = 'hair')
		  AND (slug = 'transform' OR name ILIKE 'трансформация структуры')
	`)
	if err != nil {
		return fmt.Errorf("migrate remove transform service_type: %w", err)
	}
	if tag.RowsAffected() > 0 {
		fmt.Printf("migrate: removed %d transform service_type row(s)\n", tag.RowsAffected())
	}
	return nil
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
	ptrTierPrices := func(prices GenderedPrices) *GenderedPrices {
		if pricesHasValue(prices) {
			return &prices
		}
		return nil
	}

	type seedRow struct {
		serviceSlug  string
		name         string
		description  string
		order        int
		tierPrices   GenderedPrices
		lengthPrices *LengthPrices
	}

	rows := []seedRow{
		{
			serviceSlug: "strizhka",
			name:        "Стрижка (пример)",
			description: "Модельная стрижка по длине и типу волос; точную стоимость уточняйте у мастера.",
			order:       1,
			tierPrices: GenderedPrices{
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
			tierPrices: GenderedPrices{
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
	}

	ukladkaPrices := GenderedPrices{
		Female: TierPrices{
			Master: 1700, TopMaster: 2200, Stylist: 2800,
			TopStylist: 3300, ArtDirector: 3900,
		},
		Male: TierPrices{
			Master: 1700, TopMaster: 2200, Stylist: 2800,
			TopStylist: 3300, ArtDirector: 3900,
		},
	}

	ukladkaRows := []seedRow{
		{
			serviceSlug: "ukladka",
			name:        "Укладка Дневная",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка щёткой с использованием профессиональных средств.",
			order:       1,
			tierPrices:  ukladkaPrices,
		},
		{
			serviceSlug: "ukladka",
			name:        "Укладка Коктейльная",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка с использованием горячих инструментов (плойка/стайлер) для создания локонов.",
			order:       2,
			tierPrices:  ukladkaPrices,
		},
		{
			serviceSlug: "ukladka",
			name:        "Укладка Вечерняя",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка с использованием горячих инструментов (плойка/стайлер) для создания локонов.",
			order:       3,
			tierPrices: GenderedPrices{
				Female: TierPrices{TopStylist: 3300},
				Male:   TierPrices{TopStylist: 3300},
			},
		},
	}

	okrashivanieLength := func(short, medium, long int) *LengthPrices {
		return &LengthPrices{Short: short, Medium: medium, Long: long}
	}

	okrashivanieRows := []seedRow{
		{
			serviceSlug: "okrashivanie",
			name:        "Окрашивание",
			description: "В стоимость процедуры входит: консультация, подбор красителя (бренды Aveda, Original Mineral, Loreal), мытьё головы профессиональным шампунем, защитный уход.",
			order:       1,
			lengthPrices: okrashivanieLength(6000, 4000, 8000),
		},
		{
			serviceSlug: "okrashivanie",
			name:        "Тонирование",
			description: "Кислотные красители без аммиака (бренды Aveda, Original Mineral, Loreal).",
			order:       2,
			lengthPrices: okrashivanieLength(5500, 3800, 7500),
		},
		{
			serviceSlug: "okrashivanie",
			name:        "Блондирование",
			description: "Обесцвечивание (порошок/крем), тонирование, восстанавливающий уход. Обязательна консультация перед процедурой.",
			order:       3,
			lengthPrices: okrashivanieLength(7000, 5000, 9000),
		},
		{
			serviceSlug: "okrashivanie",
			name:        "Сложное окрашивание",
			description: "Стоимость зависит от длины и густоты волос. Техники: шатуш, балаяж, babyblonde и др. В итоговую цену входит расход материалов и сложность работы. Перед процедурой необходима консультация.",
			order:       4,
			lengthPrices: &LengthPrices{},
		},
	}

	rows = append(rows, ukladkaRows...)
	rows = append(rows, okrashivanieRows...)

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

		pricesRaw, err := marshalSubServicePrices(ptrTierPrices(row.tierPrices), row.lengthPrices)
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
