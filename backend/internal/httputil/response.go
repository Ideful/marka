package httputil

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
)

var ErrNotFound = errors.New("not found")

func PathID(r *http.Request) (int, error) {
	return strconv.Atoi(r.PathValue("id"))
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func WriteAPIError(w http.ResponseWriter, status int, msg string) {
	WriteJSON(w, status, map[string]string{"error": msg})
}
