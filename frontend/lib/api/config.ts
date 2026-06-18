/** Базовый URL Go API (без завершающего слэша). */
export function getApiBaseUrl(): string {
  const url =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  return url.replace(/\/$/, "");
}

/** Абсолютный URL для фото (путь API или внешняя ссылка). */
export function resolvePhotoUrl(photoUrl: string, apiBase: string): string {
  if (!photoUrl) return "";
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }
  if (photoUrl.startsWith("/")) {
    // Фото MinIO: /marka/... — тот же хост, что и сайт/админка
    if (photoUrl.startsWith("/marka/")) {
      return photoUrl;
    }
    return `${apiBase}${photoUrl}`;
  }
  return photoUrl;
}
