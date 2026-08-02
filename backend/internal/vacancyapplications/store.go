package vacancyapplications

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"unicode/utf8"

	"marka-backend/internal/httputil"
)

var experienceLabels = map[string]string{
	"none":   "Без опыта",
	"less1":  "До 1 года",
	"1to3":   "1-3 года",
	"more3":  "Более 3 лет",
}

type applicationInput struct {
	VacancyTitle string `json:"vacancy_title"`
	VacancySlug  string `json:"vacancy_slug"`
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Experience   string `json:"experience"`
}

type Store struct{}

func New() *Store {
	return &Store{}
}

func (s *Store) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /vacancy-applications", s.handleCreate)
}

func (s *Store) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body applicationInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "invalid json")
		return
	}

	body.VacancyTitle = strings.TrimSpace(body.VacancyTitle)
	body.VacancySlug = strings.TrimSpace(body.VacancySlug)
	body.Name = strings.TrimSpace(body.Name)
	body.Phone = strings.TrimSpace(body.Phone)
	body.Experience = strings.TrimSpace(body.Experience)

	if body.VacancyTitle == "" {
		httputil.WriteAPIError(w, http.StatusBadRequest, "vacancy_title is required")
		return
	}
	if utf8.RuneCountInString(body.Name) < 2 {
		httputil.WriteAPIError(w, http.StatusBadRequest, "name is required")
		return
	}
	if digitsOnly(body.Phone) < 10 {
		httputil.WriteAPIError(w, http.StatusBadRequest, "phone is required")
		return
	}
	if body.Experience != "" {
		if _, ok := experienceLabels[body.Experience]; !ok {
			httputil.WriteAPIError(w, http.StatusBadRequest, "invalid experience")
			return
		}
	}

	cfg, err := vacancySMTPConfig()
	if err != nil {
		httputil.WriteAPIError(w, http.StatusServiceUnavailable, "email is not configured")
		return
	}

	expLabel := experienceLabels[body.Experience]
	if expLabel == "" {
		expLabel = "Не указан"
	}

	subject := fmt.Sprintf("Отклик на вакансию: %s", body.VacancyTitle)
	mailBody := fmt.Sprintf(
		"Новый отклик на вакансию\n\nВакансия: %s\nSlug: %s\nИмя: %s\nТелефон: %s\nОпыт: %s\n",
		body.VacancyTitle,
		body.VacancySlug,
		body.Name,
		body.Phone,
		expLabel,
	)

	if err := sendApplicationEmail(cfg, subject, mailBody); err != nil {
		httputil.WriteAPIError(w, http.StatusBadGateway, "failed to send email")
		return
	}

	httputil.WriteJSON(w, http.StatusCreated, map[string]bool{"ok": true})
}

func digitsOnly(phone string) int {
	count := 0
	for _, r := range phone {
		if r >= '0' && r <= '9' {
			count++
		}
	}
	return count
}
