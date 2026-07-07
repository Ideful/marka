package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func migrateCatalog(ctx context.Context, pool *pgxpool.Pool) error {
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
