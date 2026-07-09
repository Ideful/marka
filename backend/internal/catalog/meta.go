package catalog

// TableTemplate — тип таблицы прайса для раздела.
type TableTemplate string

const (
	TemplateRankGenderMatrix               TableTemplate = "rank_gender_matrix"
	TemplateRankVariantMatrix              TableTemplate = "rank_variant_matrix"
	TemplateServiceLengthMatrix            TableTemplate = "service_length_matrix"
	TemplateServiceSinglePriceBySpecialist TableTemplate = "service_single_price_by_specialist"
	TemplateServiceRankMatrixGrouped       TableTemplate = "service_rank_matrix_grouped"
	TemplateServiceSingleRankMatrix        TableTemplate = "service_single_rank_matrix"
)

const TemplateVersion = 1

type SectionMeta struct {
	MainSlug      string
	Slug          string
	Name          string
	SortOrder     int
	TableTemplate TableTemplate
}

type MainServiceMeta struct {
	Slug      string
	Name      string
	SortOrder int
}

var catalogSections = []SectionMeta{
	{"hair", "strizhka", "Стрижки", 1, TemplateRankGenderMatrix},
	{"hair", "okrashivanie", "Окрашивания", 2, TemplateServiceLengthMatrix},
	{"hair", "ukladka", "Укладки", 3, TemplateRankVariantMatrix},
	{"hair", "uhod-volos", "Уходы для волос", 4, TemplateServiceSinglePriceBySpecialist},

	{"nails", "manicure", "Маникюр", 1, TemplateServiceSinglePriceBySpecialist},
	{"nails", "pedicure", "Педикюр", 2, TemplateServiceSinglePriceBySpecialist},
	{"nails", "nail-extension", "Наращивание ногтей", 3, TemplateServiceSinglePriceBySpecialist},

	{"brows-lashes", "brows-and-lashes", "Брови и ресницы", 1, TemplateServiceRankMatrixGrouped},
	{"brows-lashes", "lash-extension", "Наращивание ресниц", 2, TemplateServiceSingleRankMatrix},
	{"brows-lashes", "makeup", "Макияж", 3, TemplateServiceSingleRankMatrix},

	{"cosmetology", "hydra-touch", "Гидропилинг HYDRA TOUCH H2", 1, TemplateServiceSinglePriceBySpecialist},
	{"cosmetology", "ultraceuticals", "Уходы ULTRACEUTICALS", 2, TemplateServiceSinglePriceBySpecialist},
	{"cosmetology", "face-massage", "Массаж лица", 3, TemplateServiceSinglePriceBySpecialist},
}

var mainServices = []MainServiceMeta{
	{"hair", "Парикмахерские услуги", 1},
	{"nails", "Ногтевой сервис", 2},
	{"brows-lashes", "Брови и ресницы", 3},
	{"cosmetology", "Косметология", 4},
}

func AllSections() []SectionMeta {
	out := make([]SectionMeta, len(catalogSections))
	copy(out, catalogSections)
	return out
}

func MainServices() []MainServiceMeta {
	out := make([]MainServiceMeta, len(mainServices))
	copy(out, mainServices)
	return out
}

func SectionMetaBySlug(mainSlug, sectionSlug string) (SectionMeta, bool) {
	for _, s := range catalogSections {
		if s.MainSlug == mainSlug && s.Slug == sectionSlug {
			return s, true
		}
	}
	return SectionMeta{}, false
}

func UsesServiceRows(t TableTemplate) bool {
	return t == TemplateServiceSinglePriceBySpecialist
}

func UsesSectionPayload(t TableTemplate) bool {
	return !UsesServiceRows(t)
}
