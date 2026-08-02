package seo

import "marka-backend/internal/catalog"

type GroupID string

const (
	GroupMenu       GroupID = "menu"
	GroupDirections GroupID = "directions"
	GroupSections   GroupID = "sections"
)

type PageDef struct {
	Key         string
	Path        string
	Label       string
	GroupID     GroupID
	GroupLabel  string
	ParentLabel string
}

func AllPageDefs() []PageDef {
	out := []PageDef{
		{Key: "home", Path: "/", Label: "Главная", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "services", Path: "/services", Label: "Услуги", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "specialists", Path: "/specialists", Label: "Специалисты", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "certificates", Path: "/certificates", Label: "Сертификаты", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "news", Path: "/news", Label: "Новости", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "vacancies", Path: "/vacancies", Label: "Вакансии", GroupID: GroupMenu, GroupLabel: "Меню"},
		{Key: "contacts", Path: "/contacts", Label: "Контакты", GroupID: GroupMenu, GroupLabel: "Меню"},
	}

	for _, main := range catalog.MainServices() {
		out = append(out, PageDef{
			Key:        "direction:" + main.Slug,
			Path:       "/services/" + main.Slug,
			Label:      main.Name,
			GroupID:    GroupDirections,
			GroupLabel: "Направления услуг",
		})
	}

	for _, section := range catalog.AllSections() {
		mainName := section.MainSlug
		for _, main := range catalog.MainServices() {
			if main.Slug == section.MainSlug {
				mainName = main.Name
				break
			}
		}
		out = append(out, PageDef{
			Key:         "section:" + section.MainSlug + ":" + section.Slug,
			Path:        "/services/" + section.MainSlug + "/" + section.Slug,
			Label:       section.Name,
			GroupID:     GroupSections,
			GroupLabel:  "Разделы услуг",
			ParentLabel: mainName,
		})
	}

	return out
}

func PageDefByKey(key string) (PageDef, bool) {
	for _, page := range AllPageDefs() {
		if page.Key == key {
			return page, true
		}
	}
	return PageDef{}, false
}

func PageDefByPath(path string) (PageDef, bool) {
	for _, page := range AllPageDefs() {
		if page.Path == path {
			return page, true
		}
	}
	return PageDef{}, false
}
