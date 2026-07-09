package httputil

import (
	"log/slog"
	"net/http"
	"time"
)

type statusResponseWriter struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (w *statusResponseWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *statusResponseWriter) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	n, err := w.ResponseWriter.Write(b)
	w.bytes += n
	return n, err
}

func requestPath(r *http.Request) string {
	if r.URL.RawQuery == "" {
		return r.URL.Path
	}
	return r.URL.Path + "?" + r.URL.RawQuery
}

// WithRequestLogging logs every HTTP request (method, path, status, duration).
func WithRequestLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusResponseWriter{ResponseWriter: w}

		next.ServeHTTP(sw, r)

		status := sw.status
		if status == 0 {
			status = http.StatusOK
		}

		attrs := []any{
			slog.String("method", r.Method),
			slog.String("path", requestPath(r)),
			slog.Int("status", status),
			slog.Duration("duration", time.Since(start)),
			slog.String("remote", r.RemoteAddr),
		}

		switch {
		case status >= 500:
			slog.Error("http request", attrs...)
		case status >= 400:
			slog.Warn("http request", attrs...)
		default:
			slog.Info("http request", attrs...)
		}
	})
}
