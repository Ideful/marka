package main

// Service — категория услуг; в JSON поле items — массив SubService (строки прайса).
type Service struct {
	ID          int          `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Items       []SubService `json:"items"`
}

// TierPrices — цена по типу специалиста.
type TierPrices struct {
	Master      string `json:"master"`
	TopMaster   string `json:"top_master"`
	Stylist     string `json:"stylist"`
	TopStylist  string `json:"top_stylist"`
	ArtDirector string `json:"art_director"`
}

// GenderedPrices — цены для женщин и мужчин.
type GenderedPrices struct {
	Female TierPrices `json:"female"`
	Male   TierPrices `json:"male"`
}

// SubService — одна строка прайса с матрицей цен.
type SubService struct {
	ID          int            `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Prices      GenderedPrices `json:"prices"`
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
