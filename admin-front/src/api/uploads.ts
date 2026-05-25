import { ApiClientError } from "./client";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type UploadPhotoResponse = {
  url: string;
  key: string;
};

export async function uploadSpecialistPhoto(file: File): Promise<UploadPhotoResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/uploads/specialist-photo`, {
    method: "POST",
    body: form,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof body?.error === "string" ? body.error : `HTTP ${res.status}`;
    throw new ApiClientError(res.status, msg);
  }
  return body as UploadPhotoResponse;
}
