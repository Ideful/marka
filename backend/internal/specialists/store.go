package specialists

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

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
	mux.HandleFunc("GET /specialists", s.handleList)
	mux.HandleFunc("POST /specialists", s.handleCreate)
	mux.HandleFunc("GET /specialists/{id}", s.handleGet)
	mux.HandleFunc("PUT /specialists/{id}", s.handleUpdate)
	mux.HandleFunc("DELETE /specialists/{id}", s.handleDelete)
}

func (s *Store) list(ctx context.Context) ([]models.Specialist, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, class, description, portfolio, photo_url
		FROM specialists
		ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Specialist
	for rows.Next() {
		sp, err := scanSpecialist(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, sp)
	}
	return out, rows.Err()
}

func (s *Store) get(ctx context.Context, id int) (models.Specialist, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, name, class, description, portfolio, photo_url
		FROM specialists WHERE id = $1
	`, id)
	sp, err := scanSpecialist(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Specialist{}, httputil.ErrNotFound
	}
	return sp, err
}

func (s *Store) create(ctx context.Context, in models.Specialist) (models.Specialist, error) {
	desc, err := marshalDescription(in.Description)
	if err != nil {
		return models.Specialist{}, err
	}
	portfolio, err := marshalPortfolio(in.Portfolio)
	if err != nil {
		return models.Specialist{}, err
	}
	var id int
	err = s.pool.QueryRow(ctx, `
		INSERT INTO specialists (name, class, description, portfolio, photo_url)
		VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
		RETURNING id
	`, in.Name, in.Class, desc, portfolio, in.PhotoURL).Scan(&id)
	if err != nil {
		return models.Specialist{}, err
	}
	return s.get(ctx, id)
}

func (s *Store) update(ctx context.Context, id int, in models.Specialist) (models.Specialist, error) {
	desc, err := marshalDescription(in.Description)
	if err != nil {
		return models.Specialist{}, err
	}
	portfolio, err := marshalPortfolio(in.Portfolio)
	if err != nil {
		return models.Specialist{}, err
	}
	tag, err := s.pool.Exec(ctx, `
		UPDATE specialists
		SET name = $1, class = $2, description = $3::jsonb, portfolio = $4::jsonb, photo_url = $5
		WHERE id = $6
	`, in.Name, in.Class, desc, portfolio, in.PhotoURL, id)
	if err != nil {
		return models.Specialist{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Specialist{}, httputil.ErrNotFound
	}
	return s.get(ctx, id)
}

func (s *Store) delete(ctx context.Context, id int) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM specialists WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return httputil.ErrNotFound
	}
	return nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanSpecialist(row rowScanner) (models.Specialist, error) {
	var sp models.Specialist
	var descRaw []byte
	var portfolioRaw []byte
	if err := row.Scan(&sp.ID, &sp.Name, &sp.Class, &descRaw, &portfolioRaw, &sp.PhotoURL); err != nil {
		return models.Specialist{}, err
	}
	sp.Description = parseDescriptionJSON(descRaw)
	sp.Portfolio = parsePortfolioJSON(portfolioRaw)
	return sp, nil
}

func (s *Store) handleList(w http.ResponseWriter, r *http.Request) {
	list, err := s.list(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []models.Specialist{}
	}
	httputil.WriteJSON(w, http.StatusOK, list)
}

func (s *Store) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	sp, err := s.get(r.Context(), id)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "specialist not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, sp)
}

func (s *Store) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body models.Specialist
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Name == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	class, err := normalizeClass(body.Class)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.Class = class
	sp, err := s.create(r.Context(), body)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusCreated, sp)
}

func (s *Store) handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body models.Specialist
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Name == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	class, err := normalizeClass(body.Class)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.Class = class
	sp, err := s.update(r.Context(), id, body)
	if errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "specialist not found")
		return
	}
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, sp)
}

func (s *Store) handleDelete(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.PathID(r)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := s.delete(r.Context(), id); errors.Is(err, httputil.ErrNotFound) {
		httputil.WriteAPIError(w, http.StatusNotFound, "specialist not found")
		return
	} else if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
