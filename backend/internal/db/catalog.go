package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/models"
	"marka-backend/internal/prices"
)

func seedCatalog(ctx context.Context, pool *pgxpool.Pool) error {
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

	hairSections := []struct {
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

	for _, section := range hairSections {
		_, err := pool.Exec(ctx, `
			INSERT INTO sections (main_service_id, slug, name, description, sort_order)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (main_service_id, slug) DO NOTHING
		`, hairID, section.slug, section.name, section.description, section.order)
		if err != nil {
			return fmt.Errorf("seed section %q: %w", section.slug, err)
		}
	}

	return seedHairServices(ctx, pool, hairID)
}

func seedHairServices(ctx context.Context, pool *pgxpool.Pool, hairID int) error {
	ptrTierPrices := func(p models.GenderedPrices) *models.GenderedPrices {
		if prices.PricesHasValue(p) {
			return &p
		}
		return nil
	}

	type seedRow struct {
		sectionSlug  string
		name         string
		description  string
		order        int
		tierPrices   models.GenderedPrices
		lengthPrices *models.LengthPrices
	}

	rows := []seedRow{
		{
			sectionSlug: "strizhka",
			name:        "Стрижка (пример)",
			description: "Модельная стрижка по длине и типу волос; точную стоимость уточняйте у мастера.",
			order:       1,
			tierPrices: models.GenderedPrices{
				Female: models.TierPrices{
					Master: 2000, TopMaster: 2500, Stylist: 3000,
					TopStylist: 3500, ArtDirector: 4500,
				},
				Male: models.TierPrices{
					Master: 1500, TopMaster: 1900, Stylist: 2300,
					TopStylist: 2700, ArtDirector: 3500,
				},
			},
		},
		{
			sectionSlug: "strizhka",
			name:        "Стрижка + укладка",
			description: "Стрижка и укладка феном или диффузором.",
			order:       2,
			tierPrices: models.GenderedPrices{
				Female: models.TierPrices{
					Master: 3500, TopMaster: 4000, Stylist: 4500,
					TopStylist: 5000, ArtDirector: 6000,
				},
				Male: models.TierPrices{
					Master: 2800, TopMaster: 3200, Stylist: 3600,
					TopStylist: 4000, ArtDirector: 5000,
				},
			},
		},
	}

	ukladkaPrices := models.GenderedPrices{
		Female: models.TierPrices{
			Master: 1700, TopMaster: 2200, Stylist: 2800,
			TopStylist: 3300, ArtDirector: 3900,
		},
		Male: models.TierPrices{
			Master: 1700, TopMaster: 2200, Stylist: 2800,
			TopStylist: 3300, ArtDirector: 3900,
		},
	}

	ukladkaRows := []seedRow{
		{
			sectionSlug: "ukladka",
			name:        "Укладка Дневная",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка щёткой с использованием профессиональных средств.",
			order:       1,
			tierPrices:  ukladkaPrices,
		},
		{
			sectionSlug: "ukladka",
			name:        "Укладка Коктейльная",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка с использованием горячих инструментов (плойка/стайлер) для создания локонов.",
			order:       2,
			tierPrices:  ukladkaPrices,
		},
		{
			sectionSlug: "ukladka",
			name:        "Укладка Вечерняя",
			description: "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка с использованием горячих инструментов (плойка/стайлер) для создания локонов.",
			order:       3,
			tierPrices: models.GenderedPrices{
				Female: models.TierPrices{TopStylist: 3300},
				Male:   models.TierPrices{TopStylist: 3300},
			},
		},
	}

	okrashivanieLength := func(short, medium, long int) *models.LengthPrices {
		return &models.LengthPrices{Short: short, Medium: medium, Long: long}
	}

	okrashivanieRows := []seedRow{
		{
			sectionSlug: "okrashivanie",
			name:        "Окрашивание",
			description: "В стоимость процедуры входит: консультация, подбор красителя (бренды Aveda, Original Mineral, Loreal), мытьё головы профессиональным шампунем, защитный уход.",
			order:       1,
			lengthPrices: okrashivanieLength(6000, 4000, 8000),
		},
		{
			sectionSlug: "okrashivanie",
			name:        "Тонирование",
			description: "Кислотные красители без аммиака (бренды Aveda, Original Mineral, Loreal).",
			order:       2,
			lengthPrices: okrashivanieLength(5500, 3800, 7500),
		},
		{
			sectionSlug: "okrashivanie",
			name:        "Блондирование",
			description: "Обесцвечивание (порошок/крем), тонирование, восстанавливающий уход. Обязательна консультация перед процедурой.",
			order:       3,
			lengthPrices: okrashivanieLength(7000, 5000, 9000),
		},
		{
			sectionSlug: "okrashivanie",
			name:        "Сложное окрашивание",
			description: "Стоимость зависит от длины и густоты волос. Техники: шатуш, балаяж, babyblonde и др. В итоговую цену входит расход материалов и сложность работы. Перед процедурой необходима консультация.",
			order:       4,
			lengthPrices: &models.LengthPrices{},
		},
	}

	rows = append(rows, ukladkaRows...)
	rows = append(rows, okrashivanieRows...)

	for _, row := range rows {
		var sectionID int
		err := pool.QueryRow(ctx, `
			SELECT id FROM sections
			WHERE main_service_id = $1 AND slug = $2
		`, hairID, row.sectionSlug).Scan(&sectionID)
		if err != nil {
			return fmt.Errorf("resolve section %q: %w", row.sectionSlug, err)
		}

		var exists bool
		if err := pool.QueryRow(ctx, `
			SELECT EXISTS(
				SELECT 1 FROM services
				WHERE section_id = $1 AND name = $2
			)
		`, sectionID, row.name).Scan(&exists); err != nil {
			return err
		}
		if exists {
			continue
		}

		pricesRaw, err := prices.MarshalServicePrices(ptrTierPrices(row.tierPrices), row.lengthPrices)
		if err != nil {
			return err
		}

		_, err = pool.Exec(ctx, `
			INSERT INTO services (section_id, name, description, prices, sort_order)
			VALUES ($1, $2, $3, $4::jsonb, $5)
		`, sectionID, row.name, row.description, pricesRaw, row.order)
		if err != nil {
			return fmt.Errorf("seed service %q: %w", row.name, err)
		}
	}

	return nil
}
