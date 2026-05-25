package main

import (
	"encoding/json"
	"strings"
)

func parseDescriptionJSON(raw []byte) []DescriptionSection {
	if len(raw) == 0 {
		return []DescriptionSection{}
	}

	var sections []DescriptionSection
	if err := json.Unmarshal(raw, &sections); err == nil {
		return normalizeSections(sections)
	}

	var legacy map[string]string
	if err := json.Unmarshal(raw, &legacy); err == nil {
		out := make([]DescriptionSection, 0, len(legacy))
		for title, body := range legacy {
			out = append(out, DescriptionSection{Title: title, Description: body})
		}
		return normalizeSections(out)
	}

	return []DescriptionSection{}
}

func marshalDescription(sections []DescriptionSection) ([]byte, error) {
	return json.Marshal(normalizeSections(sections))
}

func normalizeSections(sections []DescriptionSection) []DescriptionSection {
	if sections == nil {
		return []DescriptionSection{}
	}
	out := make([]DescriptionSection, 0, len(sections))
	for _, s := range sections {
		title := strings.TrimSpace(s.Title)
		body := strings.TrimSpace(s.Description)
		if title == "" && body == "" {
			continue
		}
		out = append(out, DescriptionSection{Title: title, Description: body})
	}
	return out
}
