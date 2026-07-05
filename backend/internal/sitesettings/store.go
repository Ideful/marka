package sitesettings

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"marka-backend/internal/httputil"
	"marka-backend/internal/models"
	"marka-backend/internal/specialists"
)

const (
	marqueeSettingKey      = "marquee_text"
	homepagePortfolioKey   = "homepage_portfolio"
	giftCertificateKey     = "gift_certificate"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /site-settings/marquee", s.handleGetMarquee)
	mux.HandleFunc("PUT /site-settings/marquee", s.handlePutMarquee)
	mux.HandleFunc("GET /site-settings/homepage-portfolio", s.handleGetHomepagePortfolio)
	mux.HandleFunc("PUT /site-settings/homepage-portfolio", s.handlePutHomepagePortfolio)
	mux.HandleFunc("GET /site-settings/gift-certificate", s.handleGetGiftCertificate)
	mux.HandleFunc("PUT /site-settings/gift-certificate", s.handlePutGiftCertificate)
}

type marqueeSettings struct {
	Text string `json:"text"`
}

type HomepagePortfolioSettings struct {
	Items []models.Portfolio `json:"items"`
}

type GiftCertificateSettings struct {
	PhotoURL   string `json:"photo_url"`
	TeaserText string `json:"teaser_text"`
	PageText   string `json:"page_text"`
}

func (s *Store) getMarquee(ctx context.Context) (marqueeSettings, error) {
	var text string
	err := s.pool.QueryRow(ctx, `
		SELECT value FROM site_settings WHERE key = $1
	`, marqueeSettingKey).Scan(&text)
	if err != nil {
		return marqueeSettings{}, err
	}
	return marqueeSettings{Text: text}, nil
}

func (s *Store) setMarquee(ctx context.Context, text string) (marqueeSettings, error) {
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

func (s *Store) getSettingJSON(ctx context.Context, key string, dest any) error {
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

func (s *Store) setSettingJSON(ctx context.Context, key string, value any) error {
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

func (s *Store) getHomepagePortfolio(ctx context.Context) (HomepagePortfolioSettings, error) {
	var settings HomepagePortfolioSettings
	settings.Items = []models.Portfolio{}
	if err := s.getSettingJSON(ctx, homepagePortfolioKey, &settings); err != nil {
		return HomepagePortfolioSettings{}, err
	}
	settings.Items = specialists.NormalizePortfolio(settings.Items)
	return settings, nil
}

func (s *Store) setHomepagePortfolio(ctx context.Context, items []models.Portfolio) (HomepagePortfolioSettings, error) {
	normalized := specialists.NormalizePortfolio(items)
	if err := s.setSettingJSON(ctx, homepagePortfolioKey, HomepagePortfolioSettings{Items: normalized}); err != nil {
		return HomepagePortfolioSettings{}, err
	}
	return HomepagePortfolioSettings{Items: normalized}, nil
}

func normalizeGiftCertificate(in GiftCertificateSettings) GiftCertificateSettings {
	return GiftCertificateSettings{
		PhotoURL:   strings.TrimSpace(in.PhotoURL),
		TeaserText: strings.TrimSpace(in.TeaserText),
		PageText:   strings.TrimSpace(in.PageText),
	}
}

func (s *Store) getGiftCertificate(ctx context.Context) (GiftCertificateSettings, error) {
	var settings GiftCertificateSettings
	if err := s.getSettingJSON(ctx, giftCertificateKey, &settings); err != nil {
		return GiftCertificateSettings{}, err
	}
	return normalizeGiftCertificate(settings), nil
}

func (s *Store) setGiftCertificate(ctx context.Context, body GiftCertificateSettings) (GiftCertificateSettings, error) {
	normalized := normalizeGiftCertificate(body)
	if err := s.setSettingJSON(ctx, giftCertificateKey, normalized); err != nil {
		return GiftCertificateSettings{}, err
	}
	return normalized, nil
}

func (s *Store) handleGetMarquee(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getMarquee(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func (s *Store) handlePutMarquee(w http.ResponseWriter, r *http.Request) {
	var body marqueeSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setMarquee(r.Context(), body.Text)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func (s *Store) handleGetHomepagePortfolio(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getHomepagePortfolio(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func (s *Store) handlePutHomepagePortfolio(w http.ResponseWriter, r *http.Request) {
	var body HomepagePortfolioSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setHomepagePortfolio(r.Context(), body.Items)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func (s *Store) handleGetGiftCertificate(w http.ResponseWriter, r *http.Request) {
	settings, err := s.getGiftCertificate(r.Context())
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func (s *Store) handlePutGiftCertificate(w http.ResponseWriter, r *http.Request) {
	var body GiftCertificateSettings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}
	settings, err := s.setGiftCertificate(r.Context(), body)
	if err != nil {
		httputil.WriteAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.WriteJSON(w, http.StatusOK, settings)
}

func Seed(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO site_settings (key, value)
		VALUES ($1, $2)
		ON CONFLICT (key) DO NOTHING
	`, marqueeSettingKey, "Салон красоты Марка Арена · Балашиха")
	if err != nil {
		return err
	}

	_, err = pool.Exec(ctx, `
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
