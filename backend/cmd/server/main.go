package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"

	"marka-backend/internal/catalog"
	"marka-backend/internal/db"
	"marka-backend/internal/httputil"
	"marka-backend/internal/prices"
	"marka-backend/internal/sitesettings"
	"marka-backend/internal/specialists"
	"marka-backend/internal/storage"
)

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})))
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
	pool, err := db.Open(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleHealth)

	objectStorage, err := storage.New(ctx)
	if err != nil {
		log.Fatalf("minio: %v", err)
	}
	objectStorage.RegisterRoutes(mux)

	specialists.New(pool).RegisterRoutes(mux)
	catalog.New(pool).RegisterRoutes(mux)
	prices.New(pool).RegisterRoutes(mux)
	sitesettings.New(pool).RegisterRoutes(mux)

	addr := "0.0.0.0:" + port
	handler := httputil.WithRequestLogging(httputil.WithCORS(mux))
	slog.Info("server listening", slog.String("addr", "http://"+addr))
	if err := http.ListenAndServe(addr, handler); err != nil {
		slog.Error("server stopped", slog.Any("err", err))
		os.Exit(1)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, healthResponse{
		OK:      true,
		Service: "marka-backend",
		Path:    r.URL.Path,
	})
}
