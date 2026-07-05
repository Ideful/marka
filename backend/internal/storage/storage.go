package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"marka-backend/internal/httputil"
)

const (
	specialistPhotoPrefix = "specialists/"
	sitePhotoPrefix       = "site/"
)

var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

type Storage struct {
	client     *minio.Client
	bucket     string
	publicBase string
}

type uploadPhotoResponse struct {
	URL string `json:"url"`
	Key string `json:"key"`
}

func New(ctx context.Context) (*Storage, error) {
	endpoint := envOr("MINIO_ENDPOINT", "localhost:9000")
	accessKey := envOr("MINIO_ACCESS_KEY", "minioadmin")
	secretKey := envOr("MINIO_SECRET_KEY", "minioadmin_password")
	bucket := envOr("MINIO_BUCKET", "marka")
	useSSL := envOr("MINIO_USE_SSL", "false") == "true"
	publicBase := strings.TrimRight(envOr("MINIO_PUBLIC_URL", "/"+bucket), "/")

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("minio client: %w", err)
	}

	s := &Storage{
		client:     client,
		bucket:     bucket,
		publicBase: publicBase,
	}

	if err := s.ensureBucket(ctx); err != nil {
		return nil, err
	}

	log.Printf("minio: bucket %q, public base %s", bucket, publicBase)
	return s, nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func (s *Storage) ensureBucket(ctx context.Context) error {
	exists, err := waitBucketExists(ctx, s.client, s.bucket)
	if err != nil {
		return fmt.Errorf("bucket exists: %w", err)
	}

	if !exists {
		if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("make bucket: %w", err)
		}
		log.Printf("minio: created bucket %q", s.bucket)
	}

	if err := s.ensurePublicReadPolicy(ctx); err != nil {
		log.Printf("minio: warning: bucket policy not set (%v); public URLs may not work", err)
	}
	return nil
}

func (s *Storage) ensurePublicReadPolicy(ctx context.Context) error {
	policy := publicReadPolicyMulti(s.bucket, specialistPhotoPrefix, sitePhotoPrefix)
	return setBucketPolicyWithRetry(ctx, s.client, s.bucket, policy)
}

func waitBucketExists(ctx context.Context, client *minio.Client, bucket string) (bool, error) {
	var last error
	for attempt := range 12 {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return false, ctx.Err()
			case <-time.After(time.Duration(attempt) * 300 * time.Millisecond):
			}
		}
		exists, err := client.BucketExists(ctx, bucket)
		if err == nil {
			return exists, nil
		}
		last = err
	}
	return false, last
}

func publicReadPolicyMulti(bucket string, prefixes ...string) string {
	resources := make([]string, len(prefixes))
	for i, prefix := range prefixes {
		resources[i] = fmt.Sprintf(`"arn:aws:s3:::%s/%s*"`, bucket, prefix)
	}
	return fmt.Sprintf(`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": ["*"]},
    "Action": ["s3:GetObject"],
    "Resource": [%s]
  }]
}`, strings.Join(resources, ", "))
}

func setBucketPolicyWithRetry(ctx context.Context, client *minio.Client, bucket, policy string) error {
	var last error
	for attempt := range 5 {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(time.Duration(attempt) * 500 * time.Millisecond):
			}
		}
		if err := client.SetBucketPolicy(ctx, bucket, policy); err != nil {
			last = err
			if strings.Contains(err.Error(), "reduce your request rate") ||
				strings.Contains(err.Error(), "unreadable") {
				continue
			}
			return err
		}
		return nil
	}
	return last
}

func (s *Storage) publicURL(objectKey string) string {
	return s.publicBase + "/" + objectKey
}

func (s *Storage) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /uploads/specialist-photo", s.handleUploadSpecialistPhoto)
	mux.HandleFunc("POST /uploads/site-photo", s.handleUploadSitePhoto)
}

func (s *Storage) handleUploadSpecialistPhoto(w http.ResponseWriter, r *http.Request) {
	s.handleUploadPhoto(w, r, specialistPhotoPrefix)
}

func (s *Storage) handleUploadSitePhoto(w http.ResponseWriter, r *http.Request) {
	s.handleUploadPhoto(w, r, sitePhotoPrefix)
}

func (s *Storage) handleUploadPhoto(w http.ResponseWriter, r *http.Request, prefix string) {
	const maxSize = 6 << 20
	if err := r.ParseMultipartForm(maxSize); err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "field file is required")
		return
	}
	defer file.Close()

	if header.Header.Get("Content-Type") == "" {
		header.Header.Set("Content-Type", mime.TypeByExtension(filepath.Ext(header.Filename)))
	}

	sniff := make([]byte, 512)
	n, readErr := io.ReadFull(file, sniff)
	if readErr != nil && readErr != io.ErrUnexpectedEOF && readErr != io.EOF {
		httputil.WriteAPIError(w, http.StatusBadRequest, "cannot read file")
		return
	}
	sniff = sniff[:n]
	detected := http.DetectContentType(sniff)
	if !allowedImageTypes[detected] {
		httputil.WriteAPIError(w, http.StatusBadRequest, "allowed types: jpeg, png, webp, gif")
		return
	}

	objectKey := prefix + uuid.New().String() + extForMIME(detected)
	rest, err := io.ReadAll(io.LimitReader(file, maxSize-int64(len(sniff))+1))
	if err != nil {
		httputil.WriteAPIError(w, http.StatusBadRequest, "cannot read file")
		return
	}
	payload := append(append([]byte(nil), sniff...), rest...)

	var putErr error
	for attempt := range 5 {
		if attempt > 0 {
			time.Sleep(time.Duration(attempt) * 400 * time.Millisecond)
		}
		_, putErr = s.client.PutObject(
			r.Context(),
			s.bucket,
			objectKey,
			bytes.NewReader(payload),
			int64(len(payload)),
			minio.PutObjectOptions{ContentType: detected},
		)
		if putErr == nil {
			break
		}
		if !strings.Contains(putErr.Error(), "reduce your request rate") &&
			!strings.Contains(putErr.Error(), "unwritable") &&
			!strings.Contains(putErr.Error(), "unreadable") {
			break
		}
	}
	if putErr != nil {
		log.Printf("minio put: %v", putErr)
		httputil.WriteAPIError(w, http.StatusInternalServerError, "upload failed")
		return
	}

	httputil.WriteJSON(w, http.StatusCreated, uploadPhotoResponse{
		URL: s.publicURL(objectKey),
		Key: objectKey,
	})
}

func extForMIME(mimeType string) string {
	switch mimeType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	case "image/gif":
		return ".gif"
	default:
		return ".bin"
	}
}
