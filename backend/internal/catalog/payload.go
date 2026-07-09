package catalog

import (
	"encoding/json"
	"errors"
	"fmt"
)

// Nullable price: non-negative integer or null.
type NullableInt struct {
	Value *int
}

func (n *NullableInt) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		n.Value = nil
		return nil
	}
	var v int
	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}
	if v < 0 {
		return errors.New("price must be non-negative")
	}
	n.Value = &v
	return nil
}

func (n NullableInt) MarshalJSON() ([]byte, error) {
	if n.Value == nil {
		return []byte("null"), nil
	}
	return json.Marshal(*n.Value)
}

func intPtr(v int) *int { return &v }

// --- rank_gender_matrix ---

type RankGenderRow struct {
	Rank   string `json:"rank"`
	Prices struct {
		Female NullableInt `json:"female"`
		Male   NullableInt `json:"male"`
	} `json:"prices"`
}

type RankGenderPayload struct {
	Rows []RankGenderRow `json:"rows"`
}

// --- rank_variant_matrix ---

type RankVariantRow struct {
	Rank   string         `json:"rank"`
	Prices map[string]NullableInt `json:"prices"`
}

type RankVariantPayload struct {
	Variants []string         `json:"variants"`
	Rows     []RankVariantRow `json:"rows"`
}

// --- service_length_matrix ---

type ServiceLengthRow struct {
	ServiceSlug string `json:"service_slug"`
	ServiceName string `json:"service_name"`
	Prices      struct {
		Short  NullableInt `json:"short"`
		Medium NullableInt `json:"medium"`
		Long   NullableInt `json:"long"`
	} `json:"prices"`
}

type ServiceLengthPayload struct {
	Rows []ServiceLengthRow `json:"rows"`
}

// --- service_rank_matrix_grouped ---

type GroupedRankRow struct {
	ServiceSlug string                 `json:"service_slug"`
	ServiceName string                 `json:"service_name"`
	Prices      map[string]NullableInt `json:"prices"`
}

type RankMatrixGroup struct {
	GroupSlug  string           `json:"group_slug"`
	GroupTitle string           `json:"group_title"`
	Columns    []string         `json:"columns"`
	Rows       []GroupedRankRow `json:"rows"`
}

type ServiceRankMatrixGroupedPayload struct {
	Groups []RankMatrixGroup `json:"groups"`
}

// --- service_single_rank_matrix ---

type SingleRankColumn struct {
	Key   string `json:"key"`
	Label string `json:"label"`
}

type SingleRankRow struct {
	ServiceSlug string                 `json:"service_slug"`
	ServiceName string                 `json:"service_name"`
	Prices      map[string]NullableInt `json:"prices"`
}

type ServiceSingleRankPayload struct {
	Columns []SingleRankColumn `json:"columns"`
	Rows    []SingleRankRow    `json:"rows"`
}

var strizhkaRanks = []string{
	"art_director", "top_stylist", "stylist", "top_master", "master", "barber",
}

var ukladkaRanks = []string{
	"top_stylist", "stylist", "top_master", "master", "barber",
}

var specialistToggleOptions = []string{
	"top_stylist", "stylist", "top_master", "master",
}

func DefaultPayload(mainSlug, sectionSlug string) (json.RawMessage, error) {
	meta, ok := SectionMetaBySlug(mainSlug, sectionSlug)
	if !ok {
		return nil, fmt.Errorf("unknown section %s/%s", mainSlug, sectionSlug)
	}

	switch meta.TableTemplate {
	case TemplateRankGenderMatrix:
		return marshalDefaultRankGender()
	case TemplateRankVariantMatrix:
		return marshalDefaultRankVariant()
	case TemplateServiceLengthMatrix:
		return marshalDefaultServiceLength()
	case TemplateServiceRankMatrixGrouped:
		return marshalDefaultGrouped()
	case TemplateServiceSingleRankMatrix:
		return marshalDefaultSingleRank(sectionSlug)
	default:
		return json.RawMessage(`{}`), nil
	}
}

func marshalDefaultRankGender() (json.RawMessage, error) {
	rows := make([]RankGenderRow, 0, len(strizhkaRanks))
	for _, rank := range strizhkaRanks {
		row := RankGenderRow{Rank: rank}
		if rank != "barber" {
			row.Prices.Female = NullableInt{Value: intPtr(0)}
		}
		row.Prices.Male = NullableInt{Value: intPtr(0)}
		rows = append(rows, row)
	}
	return json.Marshal(RankGenderPayload{Rows: rows})
}

func marshalDefaultRankVariant() (json.RawMessage, error) {
	variants := []string{"day", "evening"}
	rows := make([]RankVariantRow, 0, len(ukladkaRanks))
	for _, rank := range ukladkaRanks {
		prices := map[string]NullableInt{
			"day":     {Value: intPtr(0)},
			"evening": {Value: intPtr(0)},
		}
		rows = append(rows, RankVariantRow{Rank: rank, Prices: prices})
	}
	return json.Marshal(RankVariantPayload{Variants: variants, Rows: rows})
}

func marshalDefaultServiceLength() (json.RawMessage, error) {
	services := []struct {
		slug string
		name string
	}{
		{"okrashivanie", "Окрашивание"},
		{"tonirovanie", "Тонирование"},
		{"blondirovanie", "Блондирование"},
		{"vyhod-iz-chernogo", "Выход из черного"},
		{"slozhnoe-okrashivanie", "Сложное окрашивание"},
	}
	rows := make([]ServiceLengthRow, 0, len(services))
	for _, s := range services {
		row := ServiceLengthRow{ServiceSlug: s.slug, ServiceName: s.name}
		row.Prices.Short = NullableInt{Value: intPtr(0)}
		row.Prices.Medium = NullableInt{Value: intPtr(0)}
		row.Prices.Long = NullableInt{Value: intPtr(0)}
		rows = append(rows, row)
	}
	return json.Marshal(ServiceLengthPayload{Rows: rows})
}

func marshalDefaultGrouped() (json.RawMessage, error) {
	browsServices := []struct{ slug, name string }{
		{"korrekciya-zhenskaya", "Коррекция женская"},
		{"korrekciya-muzhskaya", "Коррекция мужская"},
		{"okrashivanie", "Окрашивание"},
		{"arkhitektura", "Архитектура"},
		{"laminirovanie-kompleks", "Ламинирование, окрашивание, коррекция и ботокс"},
	}
	lashServices := []struct{ slug, name string }{
		{"okrashivanie", "Окрашивание"},
		{"laminirovanie", "Ламинирование"},
	}
	cols := []string{"master", "top_master"}

	makeRows := func(items []struct{ slug, name string }) []GroupedRankRow {
		out := make([]GroupedRankRow, 0, len(items))
		for _, item := range items {
			out = append(out, GroupedRankRow{
				ServiceSlug: item.slug,
				ServiceName: item.name,
				Prices: map[string]NullableInt{
					"master":     {Value: intPtr(0)},
					"top_master": {Value: intPtr(0)},
				},
			})
		}
		return out
	}

	payload := ServiceRankMatrixGroupedPayload{
		Groups: []RankMatrixGroup{
			{GroupSlug: "brows", GroupTitle: "Брови", Columns: cols, Rows: makeRows(browsServices)},
			{GroupSlug: "lashes", GroupTitle: "Ресницы", Columns: cols, Rows: makeRows(lashServices)},
		},
	}
	return json.Marshal(payload)
}

func marshalDefaultSingleRank(sectionSlug string) (json.RawMessage, error) {
	if sectionSlug == "lash-extension" {
		services := []struct{ slug, name string }{
			{"narashchivanie-1-1-5d", "Наращивание 1-1,5D"},
			{"narashchivanie-2-2-5d", "Наращивание 2-2,5D"},
			{"narashchivanie-3-3-5d", "Наращивание 3-3,5D"},
			{"korrekciya", "Коррекция наращивания"},
			{"snyatie", "Снятие наращивания"},
		}
		rows := make([]SingleRankRow, 0, len(services))
		for _, s := range services {
			rows = append(rows, SingleRankRow{
				ServiceSlug: s.slug,
				ServiceName: s.name,
				Prices:      map[string]NullableInt{"master": {Value: intPtr(0)}},
			})
		}
		return json.Marshal(ServiceSingleRankPayload{
			Columns: []SingleRankColumn{{Key: "master", Label: "Мастер"}},
			Rows:    rows,
		})
	}

	// makeup
	services := []struct{ slug, name string }{
		{"express", "Экспресс"},
		{"day", "Дневной"},
		{"evening", "Вечерний"},
		{"lesson", "Урок макияжа"},
	}
	rows := make([]SingleRankRow, 0, len(services))
	for _, s := range services {
		rows = append(rows, SingleRankRow{
			ServiceSlug: s.slug,
			ServiceName: s.name,
			Prices: map[string]NullableInt{
				"makeup_artist":     {Value: intPtr(0)},
				"top_makeup_artist": {Value: intPtr(0)},
			},
		})
	}
	return json.Marshal(ServiceSingleRankPayload{
		Columns: []SingleRankColumn{
			{Key: "makeup_artist", Label: "Визажист"},
			{Key: "top_makeup_artist", Label: "Топ-визажист"},
		},
		Rows: rows,
	})
}

func ValidatePayload(mainSlug, sectionSlug string, raw json.RawMessage) error {
	meta, ok := SectionMetaBySlug(mainSlug, sectionSlug)
	if !ok {
		return fmt.Errorf("unknown section %s/%s", mainSlug, sectionSlug)
	}
	if len(raw) == 0 {
		return errors.New("payload is required")
	}

	switch meta.TableTemplate {
	case TemplateRankGenderMatrix:
		var p RankGenderPayload
		if err := json.Unmarshal(raw, &p); err != nil {
			return err
		}
		if len(p.Rows) == 0 {
			return errors.New("rows are required")
		}
	case TemplateRankVariantMatrix:
		var p RankVariantPayload
		if err := json.Unmarshal(raw, &p); err != nil {
			return err
		}
		if len(p.Variants) == 0 || len(p.Rows) == 0 {
			return errors.New("variants and rows are required")
		}
	case TemplateServiceLengthMatrix:
		var p ServiceLengthPayload
		if err := json.Unmarshal(raw, &p); err != nil {
			return err
		}
		if len(p.Rows) == 0 {
			return errors.New("rows are required")
		}
	case TemplateServiceRankMatrixGrouped:
		var p ServiceRankMatrixGroupedPayload
		if err := json.Unmarshal(raw, &p); err != nil {
			return err
		}
		if len(p.Groups) == 0 {
			return errors.New("groups are required")
		}
	case TemplateServiceSingleRankMatrix:
		var p ServiceSingleRankPayload
		if err := json.Unmarshal(raw, &p); err != nil {
			return err
		}
		if len(p.Columns) == 0 || len(p.Rows) == 0 {
			return errors.New("columns and rows are required")
		}
	case TemplateServiceSinglePriceBySpecialist:
		return nil
	default:
		return fmt.Errorf("unknown template %q", meta.TableTemplate)
	}
	return nil
}

func SpecialistToggleOptions() []string {
	out := make([]string, len(specialistToggleOptions))
	copy(out, specialistToggleOptions)
	return out
}
