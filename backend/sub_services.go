package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type subServiceStore struct {
	pool *pgxpool.Pool
}

func (s *catalogStore) handleListMainServices(w http.ResponseWriter, r *http.Request) {
	list, err := s.listMainServices(r.Context())
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []MainService{}
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *catalogStore) handleGetMainService(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	ms, err := s.getMainServiceBySlug(r.Context(), slug)
	if errors.Is(err, pgx.ErrNoRows) {
		writeAPIError(w, http.StatusNotFound, "main service not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, ms)
}

func (s *catalogStore) handleGetServiceType(w http.ResponseWriter, r *http.Request) {
	mainSlug := r.PathValue("slug")
	serviceSlug := r.PathValue("serviceSlug")
	_, st, err := s.getServiceType(r.Context(), mainSlug, serviceSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		writeAPIError(w, http.StatusNotFound, "service not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, st)
}

func (s *subServiceStore) list(ctx context.Context, serviceTypeID int) ([]SubService, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, description, prices, sort_order
		FROM sub_services
		WHERE service_type_id = $1
		ORDER BY sort_order, id
	`, serviceTypeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []SubService
	for rows.Next() {
		sub, err := scanSubService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, sub)
	}
	return out, rows.Err()
}

func (s *subServiceStore) get(ctx context.Context, id int) (SubService, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, name, description, prices, sort_order
		FROM sub_services WHERE id = $1
	`, id)
	sub, err := scanSubService(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return SubService{}, errNotFound
	}
	return sub, err
}

func (s *subServiceStore) create(ctx context.Context, serviceTypeID int, in SubService) (SubService, error) {
	prices, err := marshalSubServicePrices(in.Prices, in.LengthPrices)
	if err != nil {
		return SubService{}, err
	}
	var id int
	err = s.pool.QueryRow(ctx, `
		INSERT INTO sub_services (service_type_id, name, description, prices, sort_order)
		VALUES ($1, $2, $3, $4::jsonb, $5)
		RETURNING id
	`, serviceTypeID, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description), prices, in.SortOrder).Scan(&id)
	if err != nil {
		return SubService{}, err
	}
	return s.get(ctx, id)
}

func (s *subServiceStore) update(ctx context.Context, id int, in SubService) (SubService, error) {
	prices, err := marshalSubServicePrices(in.Prices, in.LengthPrices)
	if err != nil {
		return SubService{}, err
	}
	tag, err := s.pool.Exec(ctx, `
		UPDATE sub_services
		SET name = $1, description = $2, prices = $3::jsonb, sort_order = $4
		WHERE id = $5
	`, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description), prices, in.SortOrder, id)
	if err != nil {
		return SubService{}, err
	}
	if tag.RowsAffected() == 0 {
		return SubService{}, errNotFound
	}
	return s.get(ctx, id)
}

func (s *subServiceStore) delete(ctx context.Context, id int) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM sub_services WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errNotFound
	}
	return nil
}

type subServiceInput struct {
	ServiceTypeID int             `json:"service_type_id"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	Prices        *GenderedPrices `json:"prices,omitempty"`
	LengthPrices  *LengthPrices   `json:"length_prices,omitempty"`
	SortOrder     int             `json:"sort_order"`
}

type subServiceRowScanner interface {
	Scan(dest ...any) error
}

func scanSubService(row subServiceRowScanner) (SubService, error) {
	var sub SubService
	var pricesRaw []byte
	if err := row.Scan(&sub.ID, &sub.Name, &sub.Description, &pricesRaw, &sub.SortOrder); err != nil {
		return SubService{}, err
	}
	sub.Prices, sub.LengthPrices = parseSubServicePricesJSON(pricesRaw)
	return sub, nil
}

func validateSubServiceInput(body subServiceInput) error {
	if strings.TrimSpace(body.Name) == "" {
		return errors.New("name is required")
	}

	hasLength := body.LengthPrices != nil
	hasTier := body.Prices != nil && pricesHasValue(normalizePrices(*body.Prices))

	if hasLength {
		normalized := normalizeLengthPrices(*body.LengthPrices)
		if err := validateLengthPrices(normalized); err != nil {
			return err
		}
		return nil
	}

	if hasTier {
		normalized := normalizePrices(*body.Prices)
		if err := validatePrices(normalized); err != nil {
			return err
		}
		return nil
	}

	return errors.New("prices or length_prices is required")
}

func subServiceFromInput(body subServiceInput) SubService {
	sub := SubService{
		Name:        body.Name,
		Description: body.Description,
		SortOrder:   body.SortOrder,
	}

	if body.LengthPrices != nil {
		normalized := normalizeLengthPrices(*body.LengthPrices)
		sub.LengthPrices = &normalized
		return sub
	}

	if body.Prices != nil {
		normalized := normalizePrices(*body.Prices)
		sub.Prices = &normalized
	}

	return sub
}

func registerSubServiceRoutes(mux *http.ServeMux, store *subServiceStore) {
	mux.HandleFunc("GET /sub-services", store.handleList)
	mux.HandleFunc("POST /sub-services", store.handleCreate)
	mux.HandleFunc("GET /sub-services/{id}", store.handleGet)
	mux.HandleFunc("PUT /sub-services/{id}", store.handleUpdate)
	mux.HandleFunc("DELETE /sub-services/{id}", store.handleDelete)
}

func registerCatalogRoutes(mux *http.ServeMux, store *catalogStore) {
	mux.HandleFunc("GET /main-services", store.handleListMainServices)
	mux.HandleFunc("GET /main-services/{slug}", store.handleGetMainService)
	mux.HandleFunc("GET /main-services/{slug}/services/{serviceSlug}", store.handleGetServiceType)
}

func (s *subServiceStore) handleList(w http.ResponseWriter, r *http.Request) {
	serviceTypeID, err := strconv.Atoi(r.URL.Query().Get("service_type_id"))
	if err != nil || serviceTypeID <= 0 {
		writeAPIError(w, http.StatusBadRequest, "service_type_id query param is required")
		return
	}
	list, err := s.list(r.Context(), serviceTypeID)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []SubService{}
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *subServiceStore) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	sub, err := s.get(r.Context(), id)
	if errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "sub service not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, sub)
}

func (s *subServiceStore) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body subServiceInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.ServiceTypeID <= 0 {
		writeAPIError(w, http.StatusBadRequest, "service_type_id is required")
		return
	}
	if strings.TrimSpace(body.Name) == "" {
		writeAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	if err := validateSubServiceInput(body); err != nil {
		writeAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	sub, err := s.create(r.Context(), body.ServiceTypeID, subServiceFromInput(body))
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, sub)
}

func (s *subServiceStore) handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body subServiceInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(body.Name) == "" {
		writeAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	if err := validateSubServiceInput(body); err != nil {
		writeAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	sub, err := s.update(r.Context(), id, subServiceFromInput(body))
	if errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "sub service not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, sub)
}

func (s *subServiceStore) handleDelete(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := s.delete(r.Context(), id); errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "sub service not found")
		return
	} else if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
