package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

const marqueeSettingKey = "marquee_text"

type siteSettingsStore struct {
	pool *pgxpool.Pool
}

type marqueeSettings struct {
	Text string `json:"text"`
}

func (s *siteSettingsStore) getMarquee(ctx context.Context) (marqueeSettings, error) {
	var text string
	err := s.pool.QueryRow(ctx, `
		SELECT value FROM site_settings WHERE key = $1
	`, marqueeSettingKey).Scan(&text)
	if err != nil {
		return marqueeSettings{}, err
	}
	return marqueeSettings{Text: text}, nil
}

func (s *siteSettingsStore) setMarquee(ctx context.Context, text string) (marqueeSettings, error) {
	text = strings.TrimSpace(text)
	_, err := s.pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`, marqueeSettingKey, text)
	if err != nil {
		return marqueeSettings{}, err
	}
	return marqueeSettings{Text: text}, nil
}

func registerSiteSettingsRoutes(mux *http.ServeMux, store *siteSettingsStore) {
	mux.HandleFunc("GET /site-settings/marquee", store.handleGetMarquee)
	mux.HandleFunc("PUT /site-settings/marquee", store.handlePutMarquee)
	mux.HandleFunc("GET /site-settings/homepage-portfolio", store.handleGetHomepagePortfolio)
	mux.HandleFunc("PUT /site-settings/homepage-portfolio", store.handlePutHomepagePortfolio)
	mux.HandleFunc("GET /site-settings/gift-certificate", store.handleGetGiftCertificate)
	mux.HandleFunc("PUT /site-settings/gift-certificate", store.handlePutGiftCertificate)
}

func (s *siteSettingsStore) handleGetMarquee(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getMarquee(r.Context())
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s *siteSettingsStore) handlePutMarquee(w http.ResponseWriter, r *http.Request) {
	var body marqueeSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setMarquee(r.Context(), body.Text)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func seedSiteSettings(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO NOTHING
	`, marqueeSettingKey, "Салон красоты Марка Арена · Балашиха")
	return err
}
