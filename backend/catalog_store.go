package main

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type catalogStore struct {
	pool *pgxpool.Pool
}

func (s *catalogStore) listMainServices(ctx context.Context) ([]MainService, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, slug, name
		FROM main_services
		ORDER BY sort_order, id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []MainService
	for rows.Next() {
		var ms MainService
		if err := rows.Scan(&ms.ID, &ms.Slug, &ms.Name); err != nil {
			return nil, err
		}
		ms.Services = []ServiceType{}
		out = append(out, ms)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for i := range out {
		services, err := s.listServiceTypes(ctx, out[i].ID, false)
		if err != nil {
			return nil, err
		}
		out[i].Services = services
	}

	return out, nil
}

func (s *catalogStore) getMainServiceBySlug(ctx context.Context, slug string) (MainService, error) {
	var ms MainService
	err := s.pool.QueryRow(ctx, `
		SELECT id, slug, name
		FROM main_services
		WHERE slug = $1
	`, slug).Scan(&ms.ID, &ms.Slug, &ms.Name)
	if err != nil {
		return MainService{}, err
	}

	services, err := s.listServiceTypes(ctx, ms.ID, true)
	if err != nil {
		return MainService{}, err
	}
	ms.Services = services
	return ms, nil
}

func (s *catalogStore) listServiceTypes(ctx context.Context, mainServiceID int, withSubServices bool) ([]ServiceType, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, slug, name, description
		FROM service_types
		WHERE main_service_id = $1
		ORDER BY sort_order, id
	`, mainServiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []ServiceType
	for rows.Next() {
		var st ServiceType
		if err := rows.Scan(&st.ID, &st.Slug, &st.Name, &st.Description); err != nil {
			return nil, err
		}
		st.SubServices = []SubService{}
		out = append(out, st)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if withSubServices {
		for i := range out {
			subs, err := s.listSubServicesByType(ctx, out[i].ID)
			if err != nil {
				return nil, err
			}
			out[i].SubServices = subs
		}
	}

	return out, nil
}

func (s *catalogStore) getServiceType(ctx context.Context, mainSlug, serviceSlug string) (MainService, ServiceType, error) {
	ms, err := s.getMainServiceBySlug(ctx, mainSlug)
	if err != nil {
		return MainService{}, ServiceType{}, err
	}

	var st ServiceType
	err = s.pool.QueryRow(ctx, `
		SELECT st.id, st.slug, st.name, st.description
		FROM service_types st
		JOIN main_services ms ON ms.id = st.main_service_id
		WHERE ms.slug = $1 AND st.slug = $2
	`, mainSlug, serviceSlug).Scan(&st.ID, &st.Slug, &st.Name, &st.Description)
	if err != nil {
		return MainService{}, ServiceType{}, err
	}

	subs, err := s.listSubServicesByType(ctx, st.ID)
	if err != nil {
		return MainService{}, ServiceType{}, err
	}
	st.SubServices = subs
	return ms, st, nil
}

func (s *catalogStore) listSubServicesByType(ctx context.Context, serviceTypeID int) ([]SubService, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, description, prices, sort_order
		FROM sub_services
		WHERE service_type_id = $1
		ORDER BY sort_order, id
	`, serviceTypeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []SubService
	for rows.Next() {
		sub, err := scanSubService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, sub)
	}
	return out, rows.Err()
}
