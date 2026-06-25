package main

import (
	"context"
	"log"
	"net/http"
	"os"
)

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)
}

type healthResponse struct {
	OK      bool   `json:"ok"`
	Service string `json:"service"`
	Path    string `json:"path"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	ctx := context.Background()
	pool, err := openDB(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleHealth)

	storage, err := newObjectStorage(ctx)
	if err != nil {
		log.Fatalf("minio: %v", err)
	}
	storage.registerRoutes(mux)

	specialists := &specialistStore{pool: pool}
	registerSpecialistRoutes(mux, specialists)

	catalog := &catalogStore{pool: pool}
	registerCatalogRoutes(mux, catalog)

	subServices := &subServiceStore{pool: pool}
	registerSubServiceRoutes(mux, subServices)

	siteSettings := &siteSettingsStore{pool: pool}
	registerSiteSettingsRoutes(mux, siteSettings)

	addr := "0.0.0.0:" + port
	log.Printf("marka-backend listening on http://%s", addr)
	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	writeJSON(w, http.StatusOK, healthResponse{
		OK:      true,
		Service: "marka-backend",
		Path:    r.URL.Path,
	})
}
