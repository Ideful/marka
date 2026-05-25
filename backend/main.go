package main

import (
	"context"
	"encoding/json"
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

var servicesCatalog []Service

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

	if err := loadServicesFromJSON("services.json"); err != nil {
		log.Fatalf("services.json: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /services", handleListServices)
	mux.HandleFunc("GET /", handleHealth)

	storage, err := newObjectStorage(ctx)
	if err != nil {
		log.Fatalf("minio: %v", err)
	}
	storage.registerRoutes(mux)


	specialists := &specialistStore{pool: pool}
	registerSpecialistRoutes(mux, specialists)

	addr := "0.0.0.0:" + port
	log.Printf("marka-backend listening on http://%s", addr)
	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func loadServicesFromJSON(path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var list []Service
	if err := json.Unmarshal(b, &list); err != nil {
		return err
	}
	servicesCatalog = list
	return nil
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

func handleListServices(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, servicesCatalog)
}
