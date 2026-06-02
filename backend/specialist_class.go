package main

import (
	"fmt"
	"strings"
)

// Уровни специалиста (совпадают с frontend/data/price-tiers.ts).
var validSpecialistClasses = map[string]struct{}{
	"master":       {},
	"top_master":   {},
	"stylist":      {},
	"top_stylist":  {},
	"art_director": {},
}

func normalizeSpecialistClass(raw string) (string, error) {
	c := strings.TrimSpace(raw)
	if c == "" {
		return "master", nil
	}
	if _, ok := validSpecialistClasses[c]; !ok {
		return "", fmt.Errorf("class must be one of: master, top_master, stylist, top_stylist, art_director")
	}
	return c, nil
}
