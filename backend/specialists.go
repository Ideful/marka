package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type specialistStore struct {
	pool *pgxpool.Pool
}

func (s *specialistStore) list(ctx context.Context) ([]Specialist, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, class, description, portfolio, photo_url
		FROM specialists
		ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Specialist
	for rows.Next() {
		sp, err := scanSpecialist(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, sp)
	}
	return out, rows.Err()
}

func (s *specialistStore) get(ctx context.Context, id int) (Specialist, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, name, class, description, portfolio, photo_url
		FROM specialists WHERE id = $1
	`, id)
	sp, err := scanSpecialist(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return Specialist{}, errNotFound
	}
	return sp, err
}

func (s *specialistStore) create(ctx context.Context, in Specialist) (Specialist, error) {
	desc, err := marshalDescription(in.Description)
	if err != nil {
		return Specialist{}, err
	}
	portfolio, err := marshalPortfolio(in.Portfolio)
	if err != nil {
		return Specialist{}, err
	}
	var id int
	err = s.pool.QueryRow(ctx, `
		INSERT INTO specialists (name, class, description, portfolio, photo_url)
		VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
		RETURNING id
	`, in.Name, in.Class, desc, portfolio, in.PhotoURL).Scan(&id)
	if err != nil {
		return Specialist{}, err
	}
	return s.get(ctx, id)
}

func (s *specialistStore) update(ctx context.Context, id int, in Specialist) (Specialist, error) {
	desc, err := marshalDescription(in.Description)
	if err != nil {
		return Specialist{}, err
	}
	portfolio, err := marshalPortfolio(in.Portfolio)
	if err != nil {
		return Specialist{}, err
	}
	tag, err := s.pool.Exec(ctx, `
		UPDATE specialists
		SET name = $1, class = $2, description = $3::jsonb, portfolio = $4::jsonb, photo_url = $5
		WHERE id = $6
	`, in.Name, in.Class, desc, portfolio, in.PhotoURL, id)
	if err != nil {
		return Specialist{}, err
	}
	if tag.RowsAffected() == 0 {
		return Specialist{}, errNotFound
	}
	return s.get(ctx, id)
}

func (s *specialistStore) delete(ctx context.Context, id int) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM specialists WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errNotFound
	}
	return nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanSpecialist(row rowScanner) (Specialist, error) {
	var sp Specialist
	var descRaw []byte
	var portfolioRaw []byte
	if err := row.Scan(&sp.ID, &sp.Name, &sp.Class, &descRaw, &portfolioRaw, &sp.PhotoURL); err != nil {
		return Specialist{}, err
	}
	sp.Description = parseDescriptionJSON(descRaw)
	sp.Portfolio = parsePortfolioJSON(portfolioRaw)
	return sp, nil
}

var errNotFound = errors.New("not found")

func registerSpecialistRoutes(mux *http.ServeMux, store *specialistStore) {
	mux.HandleFunc("GET /specialists", store.handleList)
	mux.HandleFunc("POST /specialists", store.handleCreate)
	mux.HandleFunc("GET /specialists/{id}", store.handleGet)
	mux.HandleFunc("PUT /specialists/{id}", store.handleUpdate)
	mux.HandleFunc("DELETE /specialists/{id}", store.handleDelete)
}

func (s *specialistStore) handleList(w http.ResponseWriter, r *http.Request) {
	list, err := s.list(r.Context())
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []Specialist{}
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *specialistStore) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	sp, err := s.get(r.Context(), id)
	if errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "specialist not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, sp)
}

func (s *specialistStore) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body Specialist
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Name == "" {
		writeAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	class, err := normalizeSpecialistClass(body.Class)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.Class = class
	sp, err := s.create(r.Context(), body)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, sp)
}

func (s *specialistStore) handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body Specialist
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Name == "" {
		writeAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	class, err := normalizeSpecialistClass(body.Class)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.Class = class
	sp, err := s.update(r.Context(), id, body)
	if errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "specialist not found")
		return
	}
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, sp)
}

func (s *specialistStore) handleDelete(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := s.delete(r.Context(), id); errors.Is(err, errNotFound) {
		writeAPIError(w, http.StatusNotFound, "specialist not found")
		return
	} else if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func pathID(r *http.Request) (int, error) {
	return strconv.Atoi(r.PathValue("id"))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeAPIError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
