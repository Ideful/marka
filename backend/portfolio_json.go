package main

import (
	"encoding/json"
	"strings"
)

func parsePortfolioJSON(raw []byte) []Portfolio {
	if len(raw) == 0 {
		return []Portfolio{}
	}
	var list []Portfolio
	if err := json.Unmarshal(raw, &list); err != nil {
		return []Portfolio{}
	}
	return normalizePortfolio(list)
}

func marshalPortfolio(list []Portfolio) ([]byte, error) {
	return json.Marshal(normalizePortfolio(list))
}

func normalizePortfolio(list []Portfolio) []Portfolio {
	if list == nil {
		return []Portfolio{}
	}
	out := make([]Portfolio, 0, len(list))
	for _, item := range list {
		photoURL := strings.TrimSpace(item.PhotoURL)
		description := strings.TrimSpace(item.Description)
		if photoURL == "" && description == "" {
			continue
		}
		out = append(out, Portfolio{
			PhotoURL:    photoURL,
			Description: description,
		})
	}
	return out
}
