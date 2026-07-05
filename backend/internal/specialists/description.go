package specialists

import (
	"encoding/json"
	"strings"

	"marka-backend/internal/models"
)

func parseDescriptionJSON(raw []byte) []models.DescriptionSection {
	if len(raw) == 0 {
		return []models.DescriptionSection{}
	}

	var sections []models.DescriptionSection
	if err := json.Unmarshal(raw, &sections); err == nil {
		return normalizeSections(sections)
	}

	var legacy map[string]string
	if err := json.Unmarshal(raw, &legacy); err == nil {
		out := make([]models.DescriptionSection, 0, len(legacy))
		for title, body := range legacy {
			out = append(out, models.DescriptionSection{Title: title, Description: body})
		}
		return normalizeSections(out)
	}

	return []models.DescriptionSection{}
}

func marshalDescription(sections []models.DescriptionSection) ([]byte, error) {
	return json.Marshal(normalizeSections(sections))
}

func normalizeSections(sections []models.DescriptionSection) []models.DescriptionSection {
	if sections == nil {
		return []models.DescriptionSection{}
	}
	out := make([]models.DescriptionSection, 0, len(sections))
	for _, s := range sections {
		title := strings.TrimSpace(s.Title)
		body := strings.TrimSpace(s.Description)
		if title == "" && body == "" {
			continue
		}
		out = append(out, models.DescriptionSection{Title: title, Description: body})
	}
	return out
}
