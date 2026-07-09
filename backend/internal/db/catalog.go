package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/catalog"
)

func seedCatalog(ctx context.Context, pool *pgxpool.Pool) error {
	for _, ms := range catalog.MainServices() {
		_, err := pool.Exec(ctx, `
			INSERT INTO main_services (slug, name, sort_order)
			VALUES ($1, $2, $3)
			ON CONFLICT (slug) DO UPDATE
			SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order
		`, ms.Slug, ms.Name, ms.SortOrder)
		if err != nil {
			return fmt.Errorf("seed main_service %q: %w", ms.Slug, err)
		}
	}

	_, err := pool.Exec(ctx, `DELETE FROM main_services WHERE slug = 'makeup'`)
	if err != nil {
		return fmt.Errorf("remove legacy makeup main_service: %w", err)
	}

	for _, section := range catalog.AllSections() {
		var mainID int
		if err := pool.QueryRow(ctx, `
			SELECT id FROM main_services WHERE slug = $1
		`, section.MainSlug).Scan(&mainID); err != nil {
			return fmt.Errorf("resolve main_service %q: %w", section.MainSlug, err)
		}

		defaultPayload, err := catalog.DefaultPayload(section.MainSlug, section.Slug)
		if err != nil {
			return err
		}

		_, err = pool.Exec(ctx, `
			INSERT INTO sections (
				main_service_id, slug, name, description,
				table_template, payload, template_version, sort_order
			)
			VALUES ($1, $2, $3, '', $4, $5::jsonb, $6, $7)
			ON CONFLICT (main_service_id, slug) DO UPDATE
			SET name = EXCLUDED.name,
			    table_template = EXCLUDED.table_template,
			    sort_order = EXCLUDED.sort_order
		`, mainID, section.Slug, section.Name, string(section.TableTemplate),
			defaultPayload, catalog.TemplateVersion, section.SortOrder)
		if err != nil {
			return fmt.Errorf("seed section %q: %w", section.Slug, err)
		}
	}

	return nil
}
