package main

// MainService — верхний уровень каталога (5 направлений салона).
type MainService struct {
	ID       int           `json:"id"`
	Slug     string        `json:"slug"`
	Name     string        `json:"name"`
	Services []ServiceType `json:"services"`
}

// ServiceType — тип услуг внутри направления (например «Стрижка» в парикмахерских).
type ServiceType struct {
	ID          int          `json:"id"`
	Slug        string       `json:"slug"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	SubServices []SubService `json:"sub_services"`
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

// SubService — одна строка прайса с матрицей цен.
type SubService struct {
	ID          int            `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Prices      GenderedPrices `json:"prices"`
	SortOrder   int            `json:"sort_order"`
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
