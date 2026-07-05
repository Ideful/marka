package prices

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"marka-backend/internal/models"
)

var nonDigitPrice = regexp.MustCompile(`[^\d]`)

func parsePricesJSON(raw []byte) models.GenderedPrices {
	if len(raw) == 0 {
		return models.GenderedPrices{}
	}

	var flexible struct {
		Female map[string]json.RawMessage `json:"female"`
		Male   map[string]json.RawMessage `json:"male"`
	}
	if err := json.Unmarshal(raw, &flexible); err != nil {
		return models.GenderedPrices{}
	}

	return models.GenderedPrices{
		Female: parseTierPricesMap(flexible.Female),
		Male:   parseTierPricesMap(flexible.Male),
	}
}

func parseTierPricesMap(raw map[string]json.RawMessage) models.TierPrices {
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

func tierPricesFromMap(keys map[string]*int) models.TierPrices {
	return models.TierPrices{
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

func NormalizePrices(prices models.GenderedPrices) models.GenderedPrices {
	return models.GenderedPrices{
		Female: normalizeTierPrices(prices.Female),
		Male:   normalizeTierPrices(prices.Male),
	}
}

func normalizeTierPrices(t models.TierPrices) models.TierPrices {
	return models.TierPrices{
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

func ValidatePrices(prices models.GenderedPrices) error {
	if err := validateTierPrices(prices.Female, "female"); err != nil {
		return err
	}
	return validateTierPrices(prices.Male, "male")
}

func validateTierPrices(t models.TierPrices, label string) error {
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

func PricesHasValue(prices models.GenderedPrices) bool {
	return tierHasValue(prices.Female) || tierHasValue(prices.Male)
}

func tierHasValue(t models.TierPrices) bool {
	return t.Master > 0 || t.TopMaster > 0 || t.Stylist > 0 || t.TopStylist > 0 || t.ArtDirector > 0
}

func NormalizeLengthPrices(prices models.LengthPrices) models.LengthPrices {
	return models.LengthPrices{
		Short:  maxInt(prices.Short, 0),
		Medium: maxInt(prices.Medium, 0),
		Long:   maxInt(prices.Long, 0),
	}
}

func ValidateLengthPrices(prices models.LengthPrices) error {
	check := func(field string, value int) error {
		if value < 0 {
			return fmt.Errorf("length_prices.%s must be a non-negative integer", field)
		}
		return nil
	}
	if err := check("short", prices.Short); err != nil {
		return err
	}
	if err := check("medium", prices.Medium); err != nil {
		return err
	}
	if err := check("long", prices.Long); err != nil {
		return err
	}
	return nil
}

func MarshalServicePrices(gendered *models.GenderedPrices, length *models.LengthPrices) ([]byte, error) {
	if length != nil {
		normalized := NormalizeLengthPrices(*length)
		return json.Marshal(struct {
			Mode   string `json:"mode"`
			Short  int    `json:"short"`
			Medium int    `json:"medium"`
			Long   int    `json:"long"`
		}{
			Mode:   "length",
			Short:  normalized.Short,
			Medium: normalized.Medium,
			Long:   normalized.Long,
		})
	}

	prices := models.GenderedPrices{}
	if gendered != nil {
		prices = NormalizePrices(*gendered)
	}
	return json.Marshal(struct {
		Mode   string           `json:"mode"`
		Female models.TierPrices `json:"female"`
		Male   models.TierPrices `json:"male"`
	}{
		Mode:   "tier",
		Female: prices.Female,
		Male:   prices.Male,
	})
}

func parseServicePricesJSON(raw []byte) (*models.GenderedPrices, *models.LengthPrices) {
	if len(raw) == 0 {
		return nil, nil
	}

	var envelope struct {
		Mode   string                     `json:"mode"`
		Short  int                        `json:"short"`
		Medium int                        `json:"medium"`
		Long   int                        `json:"long"`
		Female map[string]json.RawMessage `json:"female"`
		Male   map[string]json.RawMessage `json:"male"`
	}
	if err := json.Unmarshal(raw, &envelope); err != nil {
		return nil, nil
	}

	if envelope.Mode == "length" {
		length := NormalizeLengthPrices(models.LengthPrices{
			Short:  envelope.Short,
			Medium: envelope.Medium,
			Long:   envelope.Long,
		})
		return nil, &length
	}

	if envelope.Female == nil && envelope.Male == nil &&
		(envelope.Short > 0 || envelope.Medium > 0 || envelope.Long > 0) {
		length := NormalizeLengthPrices(models.LengthPrices{
			Short:  envelope.Short,
			Medium: envelope.Medium,
			Long:   envelope.Long,
		})
		return nil, &length
	}

	prices := parsePricesJSON(raw)
	if !PricesHasValue(prices) {
		return nil, nil
	}
	return &prices, nil
}
