package models

import "encoding/json"

// MainService — направление салона (верхний уровень каталога).
type MainService struct {
	ID       int       `json:"id"`
	Slug     string    `json:"slug"`
	Name     string    `json:"name"`
	Sections []Section `json:"services"`
}

// Section — раздел внутри направления (например «Стрижка»).
type Section struct {
	ID              int             `json:"id"`
	Slug            string          `json:"slug"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	TableTemplate   string          `json:"table_template,omitempty"`
	TemplateVersion int             `json:"template_version,omitempty"`
	Payload         json.RawMessage `json:"payload,omitempty"`
	Portfolio       []Portfolio     `json:"portfolio,omitempty"`
	Services        []Service       `json:"services,omitempty"`
}

// TierPrices — цена по типу специалиста (рубли, целое число; 0 = не указано).
type TierPrices struct {
	Master      int `json:"master"`
	TopMaster   int `json:"top_master"`
	Stylist     int `json:"stylist"`
	TopStylist  int `json:"top_stylist"`
	ArtDirector int `json:"art_director"`
}

// GenderedPrices — цены для женщин и мужчин.
type GenderedPrices struct {
	Female TierPrices `json:"female"`
	Male   TierPrices `json:"male"`
}

// LengthPrices — цены по длине волос (рубли; 0 = не указано).
type LengthPrices struct {
	Short  int `json:"short"`
	Medium int `json:"medium"`
	Long   int `json:"long"`
}

// SpecialistPrices — цена по типу специалиста (для service_single_price_by_specialist).
type SpecialistPrices struct {
	TopStylist int `json:"top_stylist"`
	Stylist    int `json:"stylist"`
	TopMaster  int `json:"top_master"`
	Master     int `json:"master"`
}

// Service — услуга (строка прайса с матрицей цен).
type Service struct {
	ID                int               `json:"id"`
	Name              string            `json:"name"`
	Description       string            `json:"description"`
	Prices            *GenderedPrices   `json:"prices,omitempty"`
	LengthPrices      *LengthPrices     `json:"length_prices,omitempty"`
	SpecialistPrices  *SpecialistPrices `json:"specialist_prices,omitempty"`
	SortOrder         int               `json:"sort_order"`
}

type DescriptionSection struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Portfolio struct {
	PhotoURL    string `json:"photo_url"`
	Description string `json:"description"`
}

type Specialist struct {
	ID          int                  `json:"id"`
	Name        string               `json:"name"`
	Class       string               `json:"class"`
	Description []DescriptionSection `json:"description"`
	Portfolio   []Portfolio          `json:"portfolio"`
	PhotoURL    string               `json:"photo_url"`
}
