package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/httputil"
	"marka-backend/internal/models"
	"marka-backend/internal/prices"
	"marka-backend/internal/specialists"
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
	mux.HandleFunc("PUT /main-services/{slug}/sections/{sectionSlug}/payload", s.handlePutSectionPayload)
	mux.HandleFunc("PUT /main-services/{slug}/sections/{sectionSlug}/portfolio", s.handlePutSectionPortfolio)
	mux.HandleFunc("PUT /main-services/{slug}/sections/{sectionSlug}/description", s.handlePutSectionDescription)
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
		SELECT id, slug, name, description, table_template, payload, template_version, portfolio
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
		section, err := scanSectionRow(rows)
		if err != nil {
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
			if UsesServiceRows(TableTemplate(out[i].TableTemplate)) {
				services, err := s.listServicesBySection(ctx, out[i].ID)
				if err != nil {
					return nil, err
				}
				out[i].Services = services
			}
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
	var payload []byte
	var portfolioRaw []byte
	err = s.pool.QueryRow(ctx, `
		SELECT st.id, st.slug, st.name, st.description, st.table_template, st.payload, st.template_version, st.portfolio
		FROM sections st
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = $1 AND st.slug = $2
	`, mainSlug, sectionSlug).Scan(
		&section.ID, &section.Slug, &section.Name, &section.Description,
		&section.TableTemplate, &payload, &section.TemplateVersion, &portfolioRaw,
	)
	if err != nil {
		return models.MainService{}, models.Section{}, err
	}
	section.Payload = json.RawMessage(payload)
	section.Portfolio = specialists.ParsePortfolioJSON(portfolioRaw)

	if UsesServiceRows(TableTemplate(section.TableTemplate)) {
		services, err := s.listServicesBySection(ctx, section.ID)
		if err != nil {
			return models.MainService{}, models.Section{}, err
		}
		section.Services = services
	} else {
		section.Services = []models.Service{}
	}

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

type rowScanner interface {
	Scan(dest ...any) error
}

func scanSectionRow(row rowScanner) (models.Section, error) {
	var section models.Section
	var payload []byte
	var portfolioRaw []byte
	if err := row.Scan(
		&section.ID, &section.Slug, &section.Name, &section.Description,
		&section.TableTemplate, &payload, &section.TemplateVersion, &portfolioRaw,
	); err != nil {
		return models.Section{}, err
	}
	section.Payload = json.RawMessage(payload)
	section.Portfolio = specialists.ParsePortfolioJSON(portfolioRaw)
	return section, nil
}

func (s *Store) updateSectionPayload(ctx context.Context, mainSlug, sectionSlug string, payload json.RawMessage) (models.Section, error) {
	meta, ok := SectionMetaBySlug(mainSlug, sectionSlug)
	if !ok {
		return models.Section{}, httputil.ErrNotFound
	}
	if UsesServiceRows(meta.TableTemplate) {
		return models.Section{}, errors.New("this section uses service rows, not payload")
	}
	if err := ValidatePayload(mainSlug, sectionSlug, payload); err != nil {
		return models.Section{}, err
	}

	tag, err := s.pool.Exec(ctx, `
		UPDATE sections st
		SET payload = $3::jsonb, template_version = $4
		FROM main_services ms
		WHERE st.main_service_id = ms.id
		  AND ms.slug = $1
		  AND st.slug = $2
	`, mainSlug, sectionSlug, payload, TemplateVersion)
	if err != nil {
		return models.Section{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Section{}, httputil.ErrNotFound
	}

	_, section, err := s.getSection(ctx, mainSlug, sectionSlug)
	return section, err
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

type payloadInput struct {
	Payload json.RawMessage `json:"payload"`
}

func (s *Store) handlePutSectionPayload(w http.ResponseWriter, r *http.Request) {
	mainSlug := r.PathValue("slug")
	sectionSlug := r.PathValue("sectionSlug")

	var body payloadInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if len(body.Payload) == 0 {
		httputil.WriteAPIError(w, http.StatusBadRequest, "payload is required")
		return
	}

	section, err := s.updateSectionPayload(r.Context(), mainSlug, sectionSlug, body.Payload)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "section not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, section)
}

type portfolioInput struct {
	Portfolio []models.Portfolio `json:"portfolio"`
}

func (s *Store) updateSectionPortfolio(ctx context.Context, mainSlug, sectionSlug string, portfolio []models.Portfolio) (models.Section, error) {
	if _, ok := SectionMetaBySlug(mainSlug, sectionSlug); !ok {
		return models.Section{}, httputil.ErrNotFound
	}

	raw, err := specialists.MarshalPortfolio(portfolio)
	if err != nil {
		return models.Section{}, err
	}

	tag, err := s.pool.Exec(ctx, `
		UPDATE sections st
		SET portfolio = $3::jsonb
		FROM main_services ms
		WHERE st.main_service_id = ms.id
		  AND ms.slug = $1
		  AND st.slug = $2
	`, mainSlug, sectionSlug, raw)
	if err != nil {
		return models.Section{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Section{}, httputil.ErrNotFound
	}

	_, section, err := s.getSection(ctx, mainSlug, sectionSlug)
	return section, err
}

func (s *Store) handlePutSectionPortfolio(w http.ResponseWriter, r *http.Request) {
	mainSlug := r.PathValue("slug")
	sectionSlug := r.PathValue("sectionSlug")

	var body portfolioInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Portfolio == nil {
		body.Portfolio = []models.Portfolio{}
	}

	section, err := s.updateSectionPortfolio(r.Context(), mainSlug, sectionSlug, body.Portfolio)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "section not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, section)
}

type descriptionInput struct {
	Description string `json:"description"`
}

func (s *Store) updateSectionDescription(ctx context.Context, mainSlug, sectionSlug, description string) (models.Section, error) {
	if _, ok := SectionMetaBySlug(mainSlug, sectionSlug); !ok {
		return models.Section{}, httputil.ErrNotFound
	}

	tag, err := s.pool.Exec(ctx, `
		UPDATE sections st
		SET description = $3
		FROM main_services ms
		WHERE st.main_service_id = ms.id
		  AND ms.slug = $1
		  AND st.slug = $2
	`, mainSlug, sectionSlug, description)
	if err != nil {
		return models.Section{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Section{}, httputil.ErrNotFound
	}

	_, section, err := s.getSection(ctx, mainSlug, sectionSlug)
	return section, err
}

func (s *Store) handlePutSectionDescription(w http.ResponseWriter, r *http.Request) {
	mainSlug := r.PathValue("slug")
	sectionSlug := r.PathValue("sectionSlug")

	var body descriptionInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}

	section, err := s.updateSectionDescription(r.Context(), mainSlug, sectionSlug, body.Description)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "section not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, section)
}
