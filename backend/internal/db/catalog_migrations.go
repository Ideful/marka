package db

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/catalog"
	"marka-backend/internal/models"
	"marka-backend/internal/prices"
)

func migrateCatalog(ctx context.Context, pool *pgxpool.Pool) error {
	if err := removeBarberSection(ctx, pool); err != nil {
		return err
	}
	if err := backfillSectionTemplates(ctx, pool); err != nil {
		return err
	}
	if err := migrateHairPayloads(ctx, pool); err != nil {
		return err
	}
	if err := cleanupMatrixSectionServices(ctx, pool); err != nil {
		return err
	}
	return nil
}

func removeBarberSection(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		DELETE FROM sections
		WHERE slug = 'barber'
		  AND main_service_id = (SELECT id FROM main_services WHERE slug = 'hair' LIMIT 1);
	`)
	if err != nil {
		return fmt.Errorf("remove barber section: %w", err)
	}
	return nil
}

func backfillSectionTemplates(ctx context.Context, pool *pgxpool.Pool) error {
	for _, section := range catalog.AllSections() {
		defaultPayload, err := catalog.DefaultPayload(section.MainSlug, section.Slug)
		if err != nil {
			return err
		}

		_, err = pool.Exec(ctx, `
			UPDATE sections st
			SET table_template = $3,
			    template_version = $4,
			    payload = CASE
			        WHEN st.payload IS NULL OR st.payload = '{}'::jsonb THEN $5::jsonb
			        ELSE st.payload
			    END,
			    name = $6,
			    sort_order = $7
			FROM main_services ms
			WHERE st.main_service_id = ms.id
			  AND ms.slug = $1
			  AND st.slug = $2
		`, section.MainSlug, section.Slug, string(section.TableTemplate),
			catalog.TemplateVersion, defaultPayload, section.Name, section.SortOrder)
		if err != nil {
			return fmt.Errorf("backfill section %s/%s: %w", section.MainSlug, section.Slug, err)
		}
	}
	return nil
}

func migrateHairPayloads(ctx context.Context, pool *pgxpool.Pool) error {
	if err := migrateStrizhkaPayload(ctx, pool); err != nil {
		return err
	}
	if err := migrateUkladkaPayload(ctx, pool); err != nil {
		return err
	}
	if err := migrateOkrashivaniePayload(ctx, pool); err != nil {
		return err
	}
	return nil
}

func sectionPayloadIsDefault(ctx context.Context, pool *pgxpool.Pool, mainSlug, sectionSlug string) (bool, json.RawMessage, error) {
	var payload []byte
	err := pool.QueryRow(ctx, `
		SELECT st.payload
		FROM sections st
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = $1 AND st.slug = $2
	`, mainSlug, sectionSlug).Scan(&payload)
	if err != nil {
		return false, nil, err
	}

	defaultPayload, err := catalog.DefaultPayload(mainSlug, sectionSlug)
	if err != nil {
		return false, nil, err
	}

	return jsonEqual(payload, defaultPayload), payload, nil
}

func jsonEqual(a, b []byte) bool {
	var ja, jb any
	if err := json.Unmarshal(a, &ja); err != nil {
		return false
	}
	if err := json.Unmarshal(b, &jb); err != nil {
		return false
	}
	ab, _ := json.Marshal(ja)
	bb, _ := json.Marshal(jb)
	return string(ab) == string(bb)
}

func migrateStrizhkaPayload(ctx context.Context, pool *pgxpool.Pool) error {
	isDefault, _, err := sectionPayloadIsDefault(ctx, pool, "hair", "strizhka")
	if err != nil || !isDefault {
		return err
	}

	rows, err := pool.Query(ctx, `
		SELECT s.prices
		FROM services s
		JOIN sections st ON st.id = s.section_id
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = 'hair' AND st.slug = 'strizhka'
		ORDER BY s.sort_order, s.id
		LIMIT 1
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil
	}

	var pricesRaw []byte
	if err := rows.Scan(&pricesRaw); err != nil {
		return err
	}

	gendered, _, _ := prices.ParseServicePricesJSON(pricesRaw)
	if gendered == nil {
		return nil
	}

	payload, err := catalog.DefaultPayload("hair", "strizhka")
	if err != nil {
		return err
	}

	var data catalog.RankGenderPayload
	if err := json.Unmarshal(payload, &data); err != nil {
		return err
	}

	rankMap := map[string]struct {
		female int
		male   int
	}{
		"art_director": {gendered.Female.ArtDirector, gendered.Male.ArtDirector},
		"top_stylist":  {gendered.Female.TopStylist, gendered.Male.TopStylist},
		"stylist":      {gendered.Female.Stylist, gendered.Male.Stylist},
		"top_master":   {gendered.Female.TopMaster, gendered.Male.TopMaster},
		"master":       {gendered.Female.Master, gendered.Male.Master},
	}

	for i, row := range data.Rows {
		if prices, ok := rankMap[row.Rank]; ok {
			if row.Rank != "barber" {
				data.Rows[i].Prices.Female = catalog.NullableInt{Value: intPtr(prices.female)}
			}
			data.Rows[i].Prices.Male = catalog.NullableInt{Value: intPtr(prices.male)}
		}
	}

	return saveSectionPayload(ctx, pool, "hair", "strizhka", data)
}

func migrateUkladkaPayload(ctx context.Context, pool *pgxpool.Pool) error {
	isDefault, _, err := sectionPayloadIsDefault(ctx, pool, "hair", "ukladka")
	if err != nil || !isDefault {
		return err
	}

	rows, err := pool.Query(ctx, `
		SELECT s.name, s.prices
		FROM services s
		JOIN sections st ON st.id = s.section_id
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = 'hair' AND st.slug = 'ukladka'
		ORDER BY s.sort_order, s.id
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	payload, err := catalog.DefaultPayload("hair", "ukladka")
	if err != nil {
		return err
	}

	var data catalog.RankVariantPayload
	if err := json.Unmarshal(payload, &data); err != nil {
		return err
	}

	for rows.Next() {
		var name string
		var pricesRaw []byte
		if err := rows.Scan(&name, &pricesRaw); err != nil {
			return err
		}
		gendered, _, _ := prices.ParseServicePricesJSON(pricesRaw)
		if gendered == nil {
			continue
		}
		variant := ukladkaVariantKey(name)
		if variant == "" {
			continue
		}

		for i, row := range data.Rows {
			price := rankPriceFromGendered(*gendered, row.Rank)
			data.Rows[i].Prices[variant] = catalog.NullableInt{Value: intPtr(price)}
		}
	}

	return saveSectionPayload(ctx, pool, "hair", "ukladka", data)
}

func rankPriceFromGendered(gendered models.GenderedPrices, rank string) int {
	f := gendered.Female
	switch rank {
	case "art_director":
		return f.ArtDirector
	case "top_stylist":
		return f.TopStylist
	case "stylist":
		return f.Stylist
	case "top_master":
		return f.TopMaster
	case "master":
		return f.Master
	case "barber":
		return gendered.Male.Master
	default:
		return 0
	}
}

func ukladkaVariantKey(name string) string {
	lower := strings.ToLower(name)
	switch {
	case strings.Contains(lower, "днев"):
		return "day"
	case strings.Contains(lower, "вечер"), strings.Contains(lower, "коктейль"):
		return "evening"
	default:
		return ""
	}
}

func migrateOkrashivaniePayload(ctx context.Context, pool *pgxpool.Pool) error {
	isDefault, _, err := sectionPayloadIsDefault(ctx, pool, "hair", "okrashivanie")
	if err != nil || !isDefault {
		return err
	}

	rows, err := pool.Query(ctx, `
		SELECT s.name, s.prices
		FROM services s
		JOIN sections st ON st.id = s.section_id
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = 'hair' AND st.slug = 'okrashivanie'
		ORDER BY s.sort_order, s.id
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	payload, err := catalog.DefaultPayload("hair", "okrashivanie")
	if err != nil {
		return err
	}

	var data catalog.ServiceLengthPayload
	if err := json.Unmarshal(payload, &data); err != nil {
		return err
	}

	nameToSlug := map[string]string{
		"окрашивание":          "okrashivanie",
		"тонирование":          "tonirovanie",
		"блондирование":        "blondirovanie",
		"выход из черного":     "vyhod-iz-chernogo",
		"сложное окрашивание":  "slozhnoe-okrashivanie",
	}

	for rows.Next() {
		var name string
		var pricesRaw []byte
		if err := rows.Scan(&name, &pricesRaw); err != nil {
			return err
		}
		_, length, _ := prices.ParseServicePricesJSON(pricesRaw)
		if length == nil {
			continue
		}
		slug := nameToSlug[strings.ToLower(strings.TrimSpace(name))]
		if slug == "" {
			continue
		}
		for i, row := range data.Rows {
			if row.ServiceSlug != slug {
				continue
			}
			data.Rows[i].Prices.Short = catalog.NullableInt{Value: intPtr(length.Short)}
			data.Rows[i].Prices.Medium = catalog.NullableInt{Value: intPtr(length.Medium)}
			data.Rows[i].Prices.Long = catalog.NullableInt{Value: intPtr(length.Long)}
		}
	}

	return saveSectionPayload(ctx, pool, "hair", "okrashivanie", data)
}

func saveSectionPayload(ctx context.Context, pool *pgxpool.Pool, mainSlug, sectionSlug string, payload any) error {
	raw, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	if err := catalog.ValidatePayload(mainSlug, sectionSlug, raw); err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `
		UPDATE sections st
		SET payload = $3::jsonb
		FROM main_services ms
		WHERE st.main_service_id = ms.id
		  AND ms.slug = $1
		  AND st.slug = $2
	`, mainSlug, sectionSlug, raw)
	return err
}

func cleanupMatrixSectionServices(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		DELETE FROM services s
		USING sections st, main_services ms
		WHERE s.section_id = st.id
		  AND st.main_service_id = ms.id
		  AND st.table_template IN (
		    'rank_gender_matrix',
		    'rank_variant_matrix',
		    'service_length_matrix',
		    'service_rank_matrix_grouped',
		    'service_single_rank_matrix'
		  )
	`)
	if err != nil {
		return fmt.Errorf("cleanup matrix section services: %w", err)
	}
	return nil
}

func intPtr(v int) *int { return &v }
