package catalog

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/httputil"
	"marka-backend/internal/models"
	"marka-backend/internal/prices"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /main-services", s.handleListMainServices)
	mux.HandleFunc("GET /main-services/{slug}", s.handleGetMainService)
	mux.HandleFunc("GET /main-services/{slug}/sections/{sectionSlug}", s.handleGetSection)
}

func (s *Store) listMainServices(ctx context.Context) ([]models.MainService, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, slug, name
		FROM main_services
		ORDER BY sort_order, id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.MainService
	for rows.Next() {
		var ms models.MainService
		if err := rows.Scan(&ms.ID, &ms.Slug, &ms.Name); err != nil {
			return nil, err
		}
		ms.Sections = []models.Section{}
		out = append(out, ms)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for i := range out {
		sections, err := s.listSections(ctx, out[i].ID, false)
		if err != nil {
			return nil, err
		}
		out[i].Sections = sections
	}

	return out, nil
}

func (s *Store) getMainServiceBySlug(ctx context.Context, slug string) (models.MainService, error) {
	var ms models.MainService
	err := s.pool.QueryRow(ctx, `
		SELECT id, slug, name
		FROM main_services
		WHERE slug = $1
	`, slug).Scan(&ms.ID, &ms.Slug, &ms.Name)
	if err != nil {
		return models.MainService{}, err
	}

	sections, err := s.listSections(ctx, ms.ID, true)
	if err != nil {
		return models.MainService{}, err
	}
	ms.Sections = sections
	return ms, nil
}

func (s *Store) listSections(ctx context.Context, mainServiceID int, withServices bool) ([]models.Section, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, slug, name, description
		FROM sections
		WHERE main_service_id = $1
		ORDER BY sort_order, id
	`, mainServiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Section
	for rows.Next() {
		var section models.Section
		if err := rows.Scan(&section.ID, &section.Slug, &section.Name, &section.Description); err != nil {
			return nil, err
		}
		section.Services = []models.Service{}
		out = append(out, section)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if withServices {
		for i := range out {
			services, err := s.listServicesBySection(ctx, out[i].ID)
			if err != nil {
				return nil, err
			}
			out[i].Services = services
		}
	}

	if out == nil {
		out = []models.Section{}
	}
	return out, nil
}

func (s *Store) getSection(ctx context.Context, mainSlug, sectionSlug string) (models.MainService, models.Section, error) {
	ms, err := s.getMainServiceBySlug(ctx, mainSlug)
	if err != nil {
		return models.MainService{}, models.Section{}, err
	}

	var section models.Section
	err = s.pool.QueryRow(ctx, `
		SELECT st.id, st.slug, st.name, st.description
		FROM sections st
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = $1 AND st.slug = $2
	`, mainSlug, sectionSlug).Scan(&section.ID, &section.Slug, &section.Name, &section.Description)
	if err != nil {
		return models.MainService{}, models.Section{}, err
	}

	services, err := s.listServicesBySection(ctx, section.ID)
	if err != nil {
		return models.MainService{}, models.Section{}, err
	}
	section.Services = services
	return ms, section, nil
}

func (s *Store) listServicesBySection(ctx context.Context, sectionID int) ([]models.Service, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, description, prices, sort_order
		FROM services
		WHERE section_id = $1
		ORDER BY sort_order, id
	`, sectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Service
	for rows.Next() {
		item, err := prices.ScanService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) handleListMainServices(w http.ResponseWriter, r *http.Request) {
	list, err := s.listMainServices(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []models.MainService{}
	}
	httputil.WriteJSON(w, http.StatusOK, list)
}

func (s *Store) handleGetMainService(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	ms, err := s.getMainServiceBySlug(r.Context(), slug)
	if errors.Is(err, pgx.ErrNoRows) {
		httputil.WriteAPIError(w, http.StatusNotFound, "main service not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, ms)
}

func (s *Store) handleGetSection(w http.ResponseWriter, r *http.Request) {
	mainSlug := r.PathValue("slug")
	sectionSlug := r.PathValue("sectionSlug")
	_, section, err := s.getSection(r.Context(), mainSlug, sectionSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		httputil.WriteAPIError(w, http.StatusNotFound, "section not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, section)
}
