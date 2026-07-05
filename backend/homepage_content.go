package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	homepagePortfolioKey = "homepage_portfolio"
	giftCertificateKey   = "gift_certificate"
)

type homepagePortfolioSettings struct {
	Items []Portfolio `json:"items"`
}

type GiftCertificateSettings struct {
	PhotoURL   string `json:"photo_url"`
	TeaserText string `json:"teaser_text"`
	PageText   string `json:"page_text"`
}

func (s *siteSettingsStore) getSettingJSON(ctx context.Context, key string, dest any) error {
	var raw string
	err := s.pool.QueryRow(ctx, `
		SELECT value FROM site_settings WHERE key = $1
	`, key).Scan(&raw)
	if err != nil {
		return err
	}
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	return json.Unmarshal([]byte(raw), dest)
}

func (s *siteSettingsStore) setSettingJSON(ctx context.Context, key string, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	_, err = s.pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`, key, string(payload))
	return err
}

func (s *siteSettingsStore) getHomepagePortfolio(ctx context.Context) (homepagePortfolioSettings, error) {
	var settings homepagePortfolioSettings
	settings.Items = []Portfolio{}
	if err := s.getSettingJSON(ctx, homepagePortfolioKey, &settings); err != nil {
		return homepagePortfolioSettings{}, err
	}
	settings.Items = normalizePortfolio(settings.Items)
	return settings, nil
}

func (s *siteSettingsStore) setHomepagePortfolio(ctx context.Context, items []Portfolio) (homepagePortfolioSettings, error) {
	normalized := normalizePortfolio(items)
	if err := s.setSettingJSON(ctx, homepagePortfolioKey, homepagePortfolioSettings{Items: normalized}); err != nil {
		return homepagePortfolioSettings{}, err
	}
	return homepagePortfolioSettings{Items: normalized}, nil
}

func normalizeGiftCertificate(in GiftCertificateSettings) GiftCertificateSettings {
	return GiftCertificateSettings{
		PhotoURL:   strings.TrimSpace(in.PhotoURL),
		TeaserText: strings.TrimSpace(in.TeaserText),
		PageText:   strings.TrimSpace(in.PageText),
	}
}

func (s *siteSettingsStore) getGiftCertificate(ctx context.Context) (GiftCertificateSettings, error) {
	var settings GiftCertificateSettings
	if err := s.getSettingJSON(ctx, giftCertificateKey, &settings); err != nil {
		return GiftCertificateSettings{}, err
	}
	return normalizeGiftCertificate(settings), nil
}

func (s *siteSettingsStore) setGiftCertificate(ctx context.Context, body GiftCertificateSettings) (GiftCertificateSettings, error) {
	normalized := normalizeGiftCertificate(body)
	if err := s.setSettingJSON(ctx, giftCertificateKey, normalized); err != nil {
		return GiftCertificateSettings{}, err
	}
	return normalized, nil
}

func (s *siteSettingsStore) handleGetHomepagePortfolio(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getHomepagePortfolio(r.Context())
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s *siteSettingsStore) handlePutHomepagePortfolio(w http.ResponseWriter, r *http.Request) {
	var body homepagePortfolioSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setHomepagePortfolio(r.Context(), body.Items)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s *siteSettingsStore) handleGetGiftCertificate(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getGiftCertificate(r.Context())
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (s *siteSettingsStore) handlePutGiftCertificate(w http.ResponseWriter, r *http.Request) {
	var body GiftCertificateSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setGiftCertificate(r.Context(), body)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func seedHomepageContent(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO NOTHING
	`, homepagePortfolioKey, `{"items":[]}`)
	if err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO NOTHING
	`, giftCertificateKey, `{}`)
	return err
}
