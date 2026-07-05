package specialists

import (
	"fmt"
	"strings"
)

var validClasses = map[string]struct{}{
	"master":       {},
	"top_master":   {},
	"stylist":      {},
	"top_stylist":  {},
	"art_director": {},
}

func normalizeClass(raw string) (string, error) {
	c := strings.TrimSpace(raw)
	if c == "" {
		return "master", nil
	}
	if _, ok := validClasses[c]; !ok {
		return "", fmt.Errorf("class must be one of: master, top_master, stylist, top_stylist, art_director")
	}
	return c, nil
}
