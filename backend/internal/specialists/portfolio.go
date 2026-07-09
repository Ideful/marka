package specialists

import (
	"encoding/json"
	"strings"

	"marka-backend/internal/models"
)

func ParsePortfolioJSON(raw []byte) []models.Portfolio {
	return parsePortfolioJSON(raw)
}

func MarshalPortfolio(list []models.Portfolio) ([]byte, error) {
	return marshalPortfolio(list)
}

func parsePortfolioJSON(raw []byte) []models.Portfolio {
	if len(raw) == 0 {
		return []models.Portfolio{}
	}
	var list []models.Portfolio
	if err := json.Unmarshal(raw, &list); err != nil {
		return []models.Portfolio{}
	}
	return NormalizePortfolio(list)
}

func marshalPortfolio(list []models.Portfolio) ([]byte, error) {
	return json.Marshal(NormalizePortfolio(list))
}

func NormalizePortfolio(list []models.Portfolio) []models.Portfolio {
	if list == nil {
		return []models.Portfolio{}
	}
	out := make([]models.Portfolio, 0, len(list))
	for _, item := range list {
		photoURL := strings.TrimSpace(item.PhotoURL)
		description := strings.TrimSpace(item.Description)
		if photoURL == "" && description == "" {
			continue
		}
		out = append(out, models.Portfolio{
			PhotoURL:    photoURL,
			Description: description,
		})
	}
	return out
}
