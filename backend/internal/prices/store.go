package prices

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/httputil"
	"marka-backend/internal/models"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /prices", s.handleList)
	mux.HandleFunc("POST /prices", s.handleCreate)
	mux.HandleFunc("GET /prices/{id}", s.handleGet)
	mux.HandleFunc("PUT /prices/{id}", s.handleUpdate)
	mux.HandleFunc("DELETE /prices/{id}", s.handleDelete)
}

func (s *Store) list(ctx context.Context, sectionID int) ([]models.Service, error) {
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
		item, err := ScanService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) get(ctx context.Context, id int) (models.Service, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, name, description, prices, sort_order
		FROM services WHERE id = $1
	`, id)
	item, err := ScanService(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Service{}, httputil.ErrNotFound
	}
	return item, err
}

func (s *Store) create(ctx context.Context, sectionID int, in models.Service) (models.Service, error) {
	pricesRaw, err := MarshalServicePrices(in.Prices, in.LengthPrices, in.SpecialistPrices)
	if err != nil {
		return models.Service{}, err
	}
	var id int
	err = s.pool.QueryRow(ctx, `
		INSERT INTO services (section_id, name, description, prices, sort_order)
		VALUES ($1, $2, $3, $4::jsonb, $5)
		RETURNING id
	`, sectionID, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description), pricesRaw, in.SortOrder).Scan(&id)
	if err != nil {
		return models.Service{}, err
	}
	return s.get(ctx, id)
}

func (s *Store) update(ctx context.Context, id int, in models.Service) (models.Service, error) {
	pricesRaw, err := MarshalServicePrices(in.Prices, in.LengthPrices, in.SpecialistPrices)
	if err != nil {
		return models.Service{}, err
	}
	tag, err := s.pool.Exec(ctx, `
		UPDATE services
		SET name = $1, description = $2, prices = $3::jsonb, sort_order = $4
		WHERE id = $5
	`, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description), pricesRaw, in.SortOrder, id)
	if err != nil {
		return models.Service{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Service{}, httputil.ErrNotFound
	}
	return s.get(ctx, id)
}

func (s *Store) delete(ctx context.Context, id int) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM services WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return httputil.ErrNotFound
	}
	return nil
}

type serviceInput struct {
	SectionID        int                      `json:"section_id"`
	Name             string                   `json:"name"`
	Description      string                   `json:"description"`
	Prices           *models.GenderedPrices   `json:"prices,omitempty"`
	LengthPrices     *models.LengthPrices     `json:"length_prices,omitempty"`
	SpecialistPrices *models.SpecialistPrices `json:"specialist_prices,omitempty"`
	SortOrder        int                      `json:"sort_order"`
}

type rowScanner interface {
	Scan(dest ...any) error
}

func ScanService(row rowScanner) (models.Service, error) {
	var item models.Service
	var pricesRaw []byte
	if err := row.Scan(&item.ID, &item.Name, &item.Description, &pricesRaw, &item.SortOrder); err != nil {
		return models.Service{}, err
	}
	item.Prices, item.LengthPrices, item.SpecialistPrices = ParseServicePricesJSON(pricesRaw)
	return item, nil
}

func sectionIDFromQuery(r *http.Request) (int, error) {
	raw := r.URL.Query().Get("section_id")
	if raw == "" {
		return 0, errors.New("section_id query param is required")
	}
	id, err := strconv.Atoi(raw)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid section id")
	}
	return id, nil
}

func validateServiceInput(body serviceInput) error {
	if strings.TrimSpace(body.Name) == "" {
		return errors.New("name is required")
	}

	hasLength := body.LengthPrices != nil
	hasTier := body.Prices != nil && PricesHasValue(NormalizePrices(*body.Prices))
	hasSpecialist := body.SpecialistPrices != nil && specialistHasValue(NormalizeSpecialistPrices(*body.SpecialistPrices))

	modes := 0
	if hasLength {
		modes++
	}
	if hasTier {
		modes++
	}
	if hasSpecialist {
		modes++
	}
	if modes > 1 {
		return errors.New("only one price mode is allowed")
	}

	if hasLength {
		normalized := NormalizeLengthPrices(*body.LengthPrices)
		if err := ValidateLengthPrices(normalized); err != nil {
			return err
		}
		return nil
	}

	if hasSpecialist {
		normalized := NormalizeSpecialistPrices(*body.SpecialistPrices)
		if err := ValidateSpecialistPrices(normalized); err != nil {
			return err
		}
		return nil
	}

	if hasTier {
		normalized := NormalizePrices(*body.Prices)
		if err := ValidatePrices(normalized); err != nil {
			return err
		}
		return nil
	}

	return errors.New("prices, length_prices or specialist_prices is required")
}

func serviceFromInput(body serviceInput) models.Service {
	item := models.Service{
		Name:        body.Name,
		Description: body.Description,
		SortOrder:   body.SortOrder,
	}

	if body.LengthPrices != nil {
		normalized := NormalizeLengthPrices(*body.LengthPrices)
		item.LengthPrices = &normalized
		return item
	}

	if body.SpecialistPrices != nil {
		normalized := NormalizeSpecialistPrices(*body.SpecialistPrices)
		item.SpecialistPrices = &normalized
		return item
	}

	if body.Prices != nil {
		normalized := NormalizePrices(*body.Prices)
		item.Prices = &normalized
	}

	return item
}

func (s *Store) handleList(w http.ResponseWriter, r *http.Request) {
	sectionID, err := sectionIDFromQuery(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	list, err := s.list(r.Context(), sectionID)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []models.Service{}
	}
	httputil.WriteJSON(w, http.StatusOK, list)
}

func (s *Store) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	item, err := s.get(r.Context(), id)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "service not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, item)
}

func (s *Store) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body serviceInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.SectionID <= 0 {
		httputil.WriteAPIError(w, http.StatusBadRequest, "section_id is required")
		return
	}
	if strings.TrimSpace(body.Name) == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	if err := validateServiceInput(body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	item, err := s.create(r.Context(), body.SectionID, serviceFromInput(body))
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusCreated, item)
}

func (s *Store) handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body serviceInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(body.Name) == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	if err := validateServiceInput(body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	item, err := s.update(r.Context(), id, serviceFromInput(body))
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "service not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, item)
}

func (s *Store) handleDelete(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := s.delete(r.Context(), id); errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "service not found")
		return
	} else if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
