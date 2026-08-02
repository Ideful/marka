package seo

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/httputil"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /seo/pages", s.handleList)
	mux.HandleFunc("GET /seo/pages/{key}", s.handleGet)
	mux.HandleFunc("PUT /seo/pages/{key}", s.handlePut)
	mux.HandleFunc("GET /seo/by-path", s.handleGetByPath)
}

type PageMeta struct {
	Key             string `json:"key"`
	Path            string `json:"path"`
	Label           string `json:"label"`
	ParentLabel     string `json:"parent_label,omitempty"`
	MetaTitle       string `json:"meta_title"`
	MetaDescription string `json:"meta_description"`
	HasCustom       bool   `json:"has_custom"`
}

type Group struct {
	ID    string     `json:"id"`
	Label string     `json:"label"`
	Pages []PageMeta `json:"pages"`
}

type ListResponse struct {
	Groups []Group `json:"groups"`
}

type putInput struct {
	MetaTitle       string `json:"meta_title"`
	MetaDescription string `json:"meta_description"`
}

func (s *Store) handleList(w http.ResponseWriter, r *http.Request) {
	saved, err := s.loadAll(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}

	groupsByID := map[GroupID]*Group{}
	var order []GroupID

	for _, def := range AllPageDefs() {
		g, ok := groupsByID[def.GroupID]
		if !ok {
			g = &Group{ID: string(def.GroupID), Label: def.GroupLabel, Pages: []PageMeta{}}
			groupsByID[def.GroupID] = g
			order = append(order, def.GroupID)
		}
		meta := saved[def.Key]
		g.Pages = append(g.Pages, PageMeta{
			Key:             def.Key,
			Path:            def.Path,
			Label:           def.Label,
			ParentLabel:     def.ParentLabel,
			MetaTitle:       meta.MetaTitle,
			MetaDescription: meta.MetaDescription,
			HasCustom:       meta.MetaTitle != "" || meta.MetaDescription != "",
		})
	}

	out := ListResponse{Groups: make([]Group, 0, len(order))}
	for _, id := range order {
		out.Groups = append(out.Groups, *groupsByID[id])
	}
	httputil.WriteJSON(w, http.StatusOK, out)
}

func (s *Store) handleGet(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	def, ok := PageDefByKey(key)
	if !ok {
		httputil.WriteAPIError(w, http.StatusNotFound, "seo page not found")
		return
	}
	meta, err := s.getByKey(r.Context(), key)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, PageMeta{
		Key:             def.Key,
		Path:            def.Path,
		Label:           def.Label,
		ParentLabel:     def.ParentLabel,
		MetaTitle:       meta.MetaTitle,
		MetaDescription: meta.MetaDescription,
		HasCustom:       meta.MetaTitle != "" || meta.MetaDescription != "",
	})
}

func (s *Store) handleGetByPath(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimSpace(r.URL.Query().Get("path"))
	if path == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "path is required")
		return
	}
	def, ok := PageDefByPath(path)
	if !ok {
		httputil.WriteAPIError(w, http.StatusNotFound, "seo page not found")
		return
	}
	meta, err := s.getByKey(r.Context(), def.Key)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, PageMeta{
		Key:             def.Key,
		Path:            def.Path,
		Label:           def.Label,
		ParentLabel:     def.ParentLabel,
		MetaTitle:       meta.MetaTitle,
		MetaDescription: meta.MetaDescription,
		HasCustom:       meta.MetaTitle != "" || meta.MetaDescription != "",
	})
}

func (s *Store) handlePut(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	def, ok := PageDefByKey(key)
	if !ok {
		httputil.WriteAPIError(w, http.StatusNotFound, "seo page not found")
		return
	}

	var body putInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}

	title := strings.TrimSpace(body.MetaTitle)
	desc := strings.TrimSpace(body.MetaDescription)

	if title == "" && desc == "" {
		_, err := s.pool.Exec(r.Context(), `DELETE FROM seo_pages WHERE page_key = $1`, key)
		if err != nil {
			httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else {
		_, err := s.pool.Exec(r.Context(), `
			INSERT INTO seo_pages (page_key, path, meta_title, meta_description)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (page_key) DO UPDATE SET
				path = EXCLUDED.path,
				meta_title = EXCLUDED.meta_title,
				meta_description = EXCLUDED.meta_description,
				updated_at = NOW()
		`, key, def.Path, title, desc)
		if err != nil {
			httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	httputil.WriteJSON(w, http.StatusOK, PageMeta{
		Key:             def.Key,
		Path:            def.Path,
		Label:           def.Label,
		ParentLabel:     def.ParentLabel,
		MetaTitle:       title,
		MetaDescription: desc,
		HasCustom:       title != "" || desc != "",
	})
}

type storedMeta struct {
	MetaTitle       string
	MetaDescription string
}

func (s *Store) loadAll(ctx context.Context) (map[string]storedMeta, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT page_key, meta_title, meta_description
		FROM seo_pages
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := map[string]storedMeta{}
	for rows.Next() {
		var key string
		var meta storedMeta
		if err := rows.Scan(&key, &meta.MetaTitle, &meta.MetaDescription); err != nil {
			return nil, err
		}
		out[key] = meta
	}
	return out, rows.Err()
}

func (s *Store) getByKey(ctx context.Context, key string) (storedMeta, error) {
	var meta storedMeta
	err := s.pool.QueryRow(ctx, `
		SELECT meta_title, meta_description
		FROM seo_pages
		WHERE page_key = $1
	`, key).Scan(&meta.MetaTitle, &meta.MetaDescription)
	if errors.Is(err, pgx.ErrNoRows) {
		return storedMeta{}, nil
	}
	return meta, err
}
