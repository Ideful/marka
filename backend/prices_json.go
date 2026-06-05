package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var nonDigitPrice = regexp.MustCompile(`[^\d]`)

func parsePricesJSON(raw []byte) GenderedPrices {
	if len(raw) == 0 {
		return GenderedPrices{}
	}

	var flexible struct {
		Female map[string]json.RawMessage `json:"female"`
		Male   map[string]json.RawMessage `json:"male"`
	}
	if err := json.Unmarshal(raw, &flexible); err != nil {
		return GenderedPrices{}
	}

	return GenderedPrices{
		Female: parseTierPricesMap(flexible.Female),
		Male:   parseTierPricesMap(flexible.Male),
	}
}

func parseTierPricesMap(raw map[string]json.RawMessage) TierPrices {
	keys := map[string]*int{
		"master":       nil,
		"top_master":   nil,
		"stylist":      nil,
		"top_stylist":  nil,
		"art_director": nil,
	}
	for key := range keys {
		v := 0
		keys[key] = &v
	}

	if raw == nil {
		return tierPricesFromMap(keys)
	}

	for key, ptr := range keys {
		msg, ok := raw[key]
		if !ok || len(msg) == 0 {
			continue
		}
		*ptr = parsePriceValue(msg)
	}

	return tierPricesFromMap(keys)
}

func tierPricesFromMap(keys map[string]*int) TierPrices {
	return TierPrices{
		Master:      *keys["master"],
		TopMaster:   *keys["top_master"],
		Stylist:     *keys["stylist"],
		TopStylist:  *keys["top_stylist"],
		ArtDirector: *keys["art_director"],
	}
}

func parsePriceValue(raw json.RawMessage) int {
	var asInt int
	if err := json.Unmarshal(raw, &asInt); err == nil {
		if asInt < 0 {
			return 0
		}
		return asInt
	}

	var asFloat float64
	if err := json.Unmarshal(raw, &asFloat); err == nil {
		if asFloat < 0 {
			return 0
		}
		return int(asFloat)
	}

	var asString string
	if err := json.Unmarshal(raw, &asString); err == nil {
		return parsePriceString(asString)
	}

	return 0
}

func parsePriceString(value string) int {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return 0
	}
	digits := nonDigitPrice.ReplaceAllString(trimmed, "")
	if digits == "" {
		return 0
	}
	n, err := strconv.Atoi(digits)
	if err != nil || n < 0 {
		return 0
	}
	return n
}

func marshalPrices(prices GenderedPrices) ([]byte, error) {
	return json.Marshal(normalizePrices(prices))
}

func normalizePrices(prices GenderedPrices) GenderedPrices {
	return GenderedPrices{
		Female: normalizeTierPrices(prices.Female),
		Male:   normalizeTierPrices(prices.Male),
	}
}

func normalizeTierPrices(t TierPrices) TierPrices {
	return TierPrices{
		Master:      maxInt(t.Master, 0),
		TopMaster:   maxInt(t.TopMaster, 0),
		Stylist:     maxInt(t.Stylist, 0),
		TopStylist:  maxInt(t.TopStylist, 0),
		ArtDirector: maxInt(t.ArtDirector, 0),
	}
}

func maxInt(v, min int) int {
	if v < min {
		return min
	}
	return v
}

func validatePrices(prices GenderedPrices) error {
	if err := validateTierPrices(prices.Female, "female"); err != nil {
		return err
	}
	return validateTierPrices(prices.Male, "male")
}

func validateTierPrices(t TierPrices, label string) error {
	check := func(field string, value int) error {
		if value < 0 {
			return fmt.Errorf("%s.%s must be a non-negative integer", label, field)
		}
		return nil
	}
	if err := check("master", t.Master); err != nil {
		return err
	}
	if err := check("top_master", t.TopMaster); err != nil {
		return err
	}
	if err := check("stylist", t.Stylist); err != nil {
		return err
	}
	if err := check("top_stylist", t.TopStylist); err != nil {
		return err
	}
	if err := check("art_director", t.ArtDirector); err != nil {
		return err
	}
	return nil
}

func pricesHasValue(prices GenderedPrices) bool {
	return tierHasValue(prices.Female) || tierHasValue(prices.Male)
}

func tierHasValue(t TierPrices) bool {
	return t.Master > 0 || t.TopMaster > 0 || t.Stylist > 0 || t.TopStylist > 0 || t.ArtDirector > 0
}
